import { createClient, RedisClientType } from 'redis'

type RateLimitEntry = {
  count: number
  resetAt: number
}

export type ConsumeResult = {
  allowed: boolean
  count: number
  remaining: number
  resetAt: number
}

type RateLimitServiceConfig = {
  redisUrl?: string
  windowMs: number
  maxRequests: number
}

export class RateLimitService {
  private readonly memoryStore = new Map<string, RateLimitEntry>()
  private readonly redisClient: RedisClientType | null
  private readonly windowMs: number
  private readonly maxRequests: number
  private redisEnabled = false

  constructor(config: RateLimitServiceConfig) {
    this.windowMs = config.windowMs
    this.maxRequests = config.maxRequests

    if (config.redisUrl) {
      this.redisClient = createClient({ url: config.redisUrl })

      this.redisClient.on('ready', () => {
        this.redisEnabled = true
      })

      this.redisClient.on('error', () => {
        this.redisEnabled = false
      })

      this.redisClient.connect().catch(() => {
        this.redisEnabled = false
      })
    } else {
      this.redisClient = null
    }
  }

  async consume(key: string): Promise<ConsumeResult> {
    if (this.redisClient && this.redisEnabled) {
      return this.consumeRedis(key)
    }

    return this.consumeMemory(key)
  }

  private async consumeRedis(key: string): Promise<ConsumeResult> {
    const redisKey = `ratelimit:${key}`
    const count = await this.redisClient!.incr(redisKey)

    let ttlMs = await this.redisClient!.pTTL(redisKey)
    if (ttlMs <= 0) {
      await this.redisClient!.pExpire(redisKey, this.windowMs)
      ttlMs = this.windowMs
    }

    const resetAt = Date.now() + ttlMs
    const remaining = Math.max(0, this.maxRequests - count)

    return {
      allowed: count <= this.maxRequests,
      count,
      remaining,
      resetAt,
    }
  }

  private consumeMemory(key: string): ConsumeResult {
    const now = Date.now()
    const current = this.memoryStore.get(key)

    if (!current || now >= current.resetAt) {
      this.memoryStore.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      })
    } else {
      current.count += 1
      this.memoryStore.set(key, current)
    }

    for (const [entryKey, entry] of this.memoryStore.entries()) {
      if (now >= entry.resetAt) {
        this.memoryStore.delete(entryKey)
      }
    }

    const entry = this.memoryStore.get(key) as RateLimitEntry
    const remaining = Math.max(0, this.maxRequests - entry.count)

    return {
      allowed: entry.count <= this.maxRequests,
      count: entry.count,
      remaining,
      resetAt: entry.resetAt,
    }
  }
}
