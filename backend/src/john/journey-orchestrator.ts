import { handleEditorial } from './editorial-engine'
import { handleCampaign } from './campaign-engine'
import { handleCRM } from './crm-engine'

export type JourneyEventType = 'editorial_view' | 'campaign_interaction' | 'lead_detected'

export interface JourneyEvent {
  type: JourneyEventType
  topic?: string
  time?: number
  scroll?: number
  clicks?: number
  engagement?: number
  lead_id?: string
}

export function orchestrateJourney(event: JourneyEvent) {
  switch (event.type) {
    case 'editorial_view':
      return handleEditorial({
        topic: event.topic || 'geral',
        time: event.time ?? 0,
        scroll: event.scroll ?? 0,
        clicks: event.clicks ?? 0,
      })

    case 'campaign_interaction':
      return handleCampaign({
        engagement: event.engagement ?? 0,
        topic: event.topic,
      })

    case 'lead_detected':
      return handleCRM({
        lead_id: event.lead_id,
        topic: event.topic,
      })

    default:
      return { action: 'noop' as const }
  }
}
