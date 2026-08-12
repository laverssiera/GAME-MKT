import crypto from 'crypto'

interface UnifiedIdentityInput {
  email?: string
  phone?: string
  document?: string
  company?: string
}

export function buildUnifiedLeadIdentity(data: UnifiedIdentityInput) {
  const hash = crypto
    .createHash('sha256')
    .update(`${data.email || ''}:${data.phone || ''}:${data.document || ''}`)
    .digest('hex')

  return {
    federation_id: hash,
    trust_score: calculateTrust(data),
    source_runtime: 'game-mkt',
  }
}

function calculateTrust(data: UnifiedIdentityInput): number {
  let score = 50

  if (data.email) score += 10
  if (data.phone) score += 10
  if (data.document) score += 20
  if (data.company) score += 10

  return Math.min(score, 100)
}
