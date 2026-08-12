export interface MaePayload {
  monolito?: string
  area?: string
  decision_type?: string
  context?: Record<string, unknown>
  payload?: Record<string, unknown>
}

export function sendToMae(payload: MaePayload) {
  return {
    action: 'sent_to_mae' as const,
    status: 'queued' as const,
    channel: 'mae-cognition-gateway',
    payload,
    timestamp: new Date().toISOString(),
  }
}

export function sendJourneyContextToMae(context: Record<string, unknown>) {
  return {
    action: 'journey_context_sent' as const,
    status: 'queued' as const,
    channel: 'mae-cognition-gateway',
    context,
    timestamp: new Date().toISOString(),
  }
}

export interface MaeJourneyPayload {
  monolito: string
  tipo: string
  topic: string
  score: number
  lead_id: string
}

export function sendJourneyToMae(payload: MaeJourneyPayload) {
  return {
    action: 'journey_sent' as const,
    status: 'queued' as const,
    channel: 'mae-cognition-gateway',
    payload,
    timestamp: new Date().toISOString(),
  }
}

export interface MaeLeadPayload {
  lead_id: string
  score: number
  origem: string
  interesse: string
}

export function sendLeadToMae(payload: MaeLeadPayload) {
  return {
    action: 'lead_sent' as const,
    status: 'queued' as const,
    channel: 'mae-cognition-gateway',
    payload,
    timestamp: new Date().toISOString(),
  }
}

export interface MaeKpisPayload {
  campanha: string
  cac: number
  ltv: number
  editorial_engagement: number
}

export function sendKpisToMae(payload: MaeKpisPayload) {
  return {
    action: 'kpis_sent' as const,
    status: 'queued' as const,
    channel: 'mae-cognition-gateway',
    payload,
    timestamp: new Date().toISOString(),
  }
}

export function receiveDecisionFromMae(payload: Record<string, unknown>) {
  return {
    action: 'decision_received' as const,
    source: 'mae-cognition',
    status: 'accepted' as const,
    payload,
    timestamp: new Date().toISOString(),
  }
}

export function receiveEditorialFromMae(payload: Record<string, unknown>) {
  return {
    action: 'editorial_received' as const,
    source: 'mae-cognition',
    status: 'accepted' as const,
    payload,
    timestamp: new Date().toISOString(),
  }
}

export function receiveLeadRoutingFromMae(payload: Record<string, unknown>) {
  return {
    action: 'lead_routing_received' as const,
    source: 'mae-cognition',
    status: 'accepted' as const,
    payload,
    timestamp: new Date().toISOString(),
  }
}

export function receiveCampaignFromMae(payload: Record<string, unknown>) {
  return {
    action: 'campaign_received' as const,
    source: 'mae-cognition',
    status: 'accepted' as const,
    payload,
    timestamp: new Date().toISOString(),
  }
}
