import {
  calculateInterest,
  handleEditorial,
  recommendEditorialContent,
} from './editorial-engine'
import { handleCampaign, optimizeCampaign } from './campaign-engine'
import { createLead, nurtureLead, promoteLead } from './crm-engine'
import {
  receiveCampaignFromMae,
  receiveDecisionFromMae,
  receiveEditorialFromMae,
  receiveLeadRoutingFromMae,
  sendJourneyContextToMae,
  sendJourneyToMae,
  sendKpisToMae,
  sendLeadToMae,
  sendToMae,
} from './cognition-bridge'
import { orchestrateJourney, type JourneyEvent } from './journey-orchestrator'
import { shouldEscalateToMae, type MaeEscalationContext } from './autonomy-rules'

export interface JourneyInput extends JourneyEvent, MaeEscalationContext {
  mae_reason?: string
}

export class JohnGameMkt {
  static runJourney(input: JourneyInput) {
    const decision = orchestrateJourney(input)

    if (shouldEscalateToMae(input)) {
      return {
        decision,
        escalation: sendToMae({
          decision_type: input.mae_reason || 'journey_strategic_decision',
          context: { type: input.type, topic: input.topic },
          payload: { input, decision },
        }),
      }
    }

    return { decision, escalation: null }
  }

  static analyzeEditorial(input: { topic: string; time: number; scroll: number; clicks: number }) {
    return handleEditorial(input)
  }

  static recommendEditorial(input: { topic: string; interest_score?: number }) {
    const interestScore =
      input.interest_score ??
      calculateInterest({ topic: input.topic, time: 60, scroll: 50, clicks: 1 })

    return {
      action: 'recommend_content',
      topic: input.topic,
      recommendations: recommendEditorialContent(input.topic, interestScore),
      interest_score: interestScore,
    }
  }

  static triggerCampaign(input: { engagement: number; topic?: string }) {
    return handleCampaign(input)
  }

  static optimizeCampaign(input: { cpc?: number; ctr?: number; conversao?: number }) {
    return optimizeCampaign(input)
  }

  static createLead(input: {
    topic: string
    source: string
    interest_score?: number
    user_id?: string
  }) {
    return createLead(input)
  }

  static nurtureLead(input: { lead_id: string; topic?: string }) {
    return nurtureLead(input.lead_id, input.topic)
  }

  static promoteLead(input: { lead_id: string; engagement?: number; score?: number }) {
    return promoteLead(input.lead_id, input.engagement ?? 0, input.score ?? 0)
  }

  static maeDecision(input: {
    monolito: string
    area: string
    context?: Record<string, unknown>
  }) {
    return sendToMae(input)
  }

  static maeJourney(input: {
    monolito: string
    tipo: string
    topic: string
    score: number
    lead_id: string
  }) {
    return sendJourneyToMae(input)
  }

  static maeLead(input: {
    lead_id: string
    score: number
    origem: string
    interesse: string
  }) {
    return sendLeadToMae(input)
  }

  static maeKpis(input: {
    campanha: string
    cac: number
    ltv: number
    editorial_engagement: number
  }) {
    return sendKpisToMae(input)
  }

  static maeJourneyContext(input: Record<string, unknown>) {
    return sendJourneyContextToMae(input)
  }

  static fromMaeDecision(input: Record<string, unknown>) {
    return receiveDecisionFromMae(input)
  }

  static fromMaeEditorial(input: Record<string, unknown>) {
    return receiveEditorialFromMae(input)
  }

  static fromMaeLeadRouting(input: Record<string, unknown>) {
    return receiveLeadRoutingFromMae(input)
  }

  static fromMaeCampaign(input: Record<string, unknown>) {
    return receiveCampaignFromMae(input)
  }
}
