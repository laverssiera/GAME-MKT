export interface CoreDnaEvent<TPayload extends object> {
  id: string
  event_type: string
  version: 'core-dna.v1'
  source: string
  occurred_at: string
  trace_id: string
  payload: TPayload
}

export interface LeadCreatedPayload {
  lead_id: string
  origem: string
  score: number
  status: 'frio' | 'morno' | 'quente'
  confianca: number
  metadata?: Record<string, unknown>
}

const randomId = (): string => {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${Date.now().toString(36)}_${rand}`
}

const buildCoreDnaEvent = <TPayload extends object>(
  event_type: string,
  payload: TPayload,
  source: string = 'game-mkt.backend'
): CoreDnaEvent<TPayload> => {
  return {
    id: `evt_${randomId()}`,
    event_type,
    version: 'core-dna.v1',
    source,
    occurred_at: new Date().toISOString(),
    trace_id: `trace_${randomId()}`,
    payload,
  }
}

export const emitLeadCreatedEvent = (payload: LeadCreatedPayload): CoreDnaEvent<LeadCreatedPayload> => {
  return buildCoreDnaEvent('lead.created', payload)
}

// ─── Game MKT Core DNA Registration (ISSUE 24) ───────────────────────────────

export interface GameMktRegistrationPayload {
  monolith: 'game_mkt'
  capabilities: string[]
  role: string
}

export const emitGameMktRegistered = (
  payload: GameMktRegistrationPayload
): CoreDnaEvent<GameMktRegistrationPayload> => {
  return buildCoreDnaEvent('core_dna.monolith_registered', payload)
}

// ─── Attribution Loop (ISSUE 7) ──────────────────────────────────────────────

export interface AttributionPayload {
  lead_id: string
  revenue: number
  roi: number
  campaign_id?: string
  channel?: string
}

export const emitAttributionUpdated = (
  payload: AttributionPayload
): CoreDnaEvent<AttributionPayload> => {
  return buildCoreDnaEvent('marketing.attribution.updated', payload)
}
