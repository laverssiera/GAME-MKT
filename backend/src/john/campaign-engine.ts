export interface CampaignInteractionEvent {
  engagement: number
  topic?: string
}

export interface CampaignAction {
  action: 'promote_lead' | 'nurture'
  level?: 'quente'
  content?: 'editorial'
}

export function handleCampaign(event: CampaignInteractionEvent): CampaignAction {
  if (event.engagement > 80) {
    return {
      action: 'promote_lead',
      level: 'quente',
    }
  }

  return {
    action: 'nurture',
    content: 'editorial',
  }
}

export interface CampaignOptimizationPayload {
  cpc?: number
  ctr?: number
  conversao?: number
}

export function optimizeCampaign(payload: CampaignOptimizationPayload) {
  const recommendations: string[] = []

  if (payload.cpc !== undefined && payload.cpc > 8) {
    recommendations.push('Ajustar segmentação para reduzir CPC.')
  }
  if (payload.ctr !== undefined && payload.ctr < 1.5) {
    recommendations.push('Testar novos criativos e chamadas para aumentar CTR.')
  }
  if (payload.conversao !== undefined && payload.conversao < 2) {
    recommendations.push('Revisar landing page e reforçar prova social para elevar conversão.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Campanha saudável. Manter monitoramento contínuo.')
  }

  return {
    action: 'optimize_campaign' as const,
    recommendations,
  }
}
