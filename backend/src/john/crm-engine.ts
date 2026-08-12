import { buildLeadJourney } from './lead-journey'

export interface LeadDetectedEvent {
  lead_id?: string
  topic?: string
}

export function handleCRM(event: LeadDetectedEvent) {
  return {
    action: 'start_journey' as const,
    lead_id: event.lead_id,
    steps: buildLeadJourney(event.topic),
  }
}

export interface CreateLeadPayload {
  topic: string
  source: string
  interest_score?: number
  user_id?: string
}

export function createLead(payload: CreateLeadPayload) {
  return {
    action: 'lead_created' as const,
    lead: {
      id: payload.user_id ? `lead_${payload.user_id}` : `lead_${Date.now()}`,
      topic: payload.topic,
      source: payload.source,
      interest_score: payload.interest_score ?? 0,
      status: 'novo',
    },
  }
}

export function nurtureLead(leadId: string, topic?: string) {
  return {
    action: 'nurture' as const,
    lead_id: leadId,
    steps: buildLeadJourney(topic),
  }
}

export function promoteLead(leadId: string, engagement: number, score: number) {
  const isHot = engagement > 80 || score > 75

  return {
    action: 'promote' as const,
    lead_id: leadId,
    level: isHot ? 'quente' : 'morno',
    destination: isHot ? 'Archimedes / CEA' : 'nutricao_editorial',
  }
}
