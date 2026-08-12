/**
 * ISSUE 5 — Publicar eventos obrigatórios do Game MKT
 * ISSUE 6 — Consumir eventos do ecossistema
 * ISSUE 7 — Attribution Loop: CAC → Receita
 *
 * Abstração NATS para publicação e consumo de eventos.
 * Produção: conectar ao cliente NATS real (ex.: nats.ws / nats.io).
 */

// ─── Tipos de eventos publicados pelo Game MKT (ISSUE 5) ─────────────────────

export type GameMktPublishedEvent =
  | 'marketing.lead.generated'
  | 'marketing.campaign.started'
  | 'marketing.campaign.optimized'
  | 'marketing.lead.converted'
  | 'marketing.attribution.updated'
  | 'marketing.campaign.cost'
  | 'marketing.lead.qualified'
  | 'marketing.lead.consent'
  | 'sla.lead.at_risk'

// ─── Tipos de eventos consumidos pelo Game MKT (ISSUE 6) ─────────────────────

export type EcosystemConsumedEvent =
  | 'archimedes.deal.closed'
  | 'kanban.task.moved'
  | 'john.decision.made'
  | 'hub.budget.approved'
  | 'hub.budget.limit'
  | 'archimedes.lead.converted'

// ─── Attribution Loop payload (ISSUE 7) ──────────────────────────────────────

export interface AttributionUpdatedPayload {
  lead_id: string
  revenue: number
  roi: number
  campaign_id?: string
  channel?: string
}

// ─── Event Bus (abstração in-process, pronta para plug NATS) ─────────────────

type EventHandler<T = unknown> = (payload: T) => void | Promise<void>

class NatsEventBus {
  private handlers = new Map<string, EventHandler[]>()
  private publishLog: Array<{ subject: string; payload: unknown; timestamp: string }> = []

  /** ISSUE 5 — Publicar evento */
  publish<T>(subject: GameMktPublishedEvent, payload: T): void {
    const entry = { subject, payload, timestamp: new Date().toISOString() }
    this.publishLog.push(entry)

    const subs = this.handlers.get(subject) ?? []
    for (const handler of subs) {
      try {
        handler(payload)
      } catch (_) {
        // handler isolado; não propaga
      }
    }
  }

  /** ISSUE 6 — Subscrever evento do ecossistema */
  subscribe<T>(subject: EcosystemConsumedEvent | GameMktPublishedEvent, handler: EventHandler<T>): void {
    const existing = this.handlers.get(subject) ?? []
    this.handlers.set(subject, [...existing, handler as EventHandler])
  }

  /** ISSUE 7 — Emitir attribution loop */
  publishAttribution(payload: AttributionUpdatedPayload): void {
    this.publish('marketing.attribution.updated', {
      event: 'marketing.attribution.updated',
      data: payload,
    })
  }

  /** Retorna log de eventos publicados (para audit / dashboard) */
  getPublishLog() {
    return [...this.publishLog]
  }
}

export const natsEventBus = new NatsEventBus()
