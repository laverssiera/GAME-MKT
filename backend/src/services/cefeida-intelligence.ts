/**
 * ISSUE 8 — Consumir inteligência do CEFEIDA (regiões, perfil, timing)
 * ISSUE 9 — John otimiza campanhas via john.marketing.decision
 */

// ─── ISSUE 8 — CEFEIDA Intelligence ─────────────────────────────────────────

export interface CefeidaRegionInsight {
  regiao: string
  demanda_score: number // 0..1
  perfil_comprador: string
  timing_ideal: 'manha' | 'tarde' | 'noite' | 'fim_de_semana'
}

export interface CefeidaIntelligencePayload {
  regioes_alta_demanda: CefeidaRegionInsight[]
  perfil_dominante: string
  timing_recomendado: CefeidaRegionInsight['timing_ideal']
  gerado_em: string
}

/** Aplica inteligência CEFEIDA à configuração de campanha */
export function applyCefeidaIntelligence(
  campaign: { regiao?: string; budget?: number },
  cefeida: CefeidaIntelligencePayload
): { regiao_recomendada: string; timing: string; ajuste_budget: number } {
  const top = cefeida.regioes_alta_demanda.sort((a, b) => b.demanda_score - a.demanda_score)[0]

  const multiplicador = top ? 1 + top.demanda_score * 0.5 : 1

  return {
    regiao_recomendada: top?.regiao ?? campaign.regiao ?? 'geral',
    timing: cefeida.timing_recomendado,
    ajuste_budget: Math.round((campaign.budget ?? 1000) * multiplicador),
  }
}

// ─── ISSUE 9 — John.marketing.decision ───────────────────────────────────────

export type JohnMarketingDecisionType =
  | 'aumentar_budget'
  | 'pausar_campanha'
  | 'mudar_criativo'

export interface JohnMarketingDecision {
  event: 'john.marketing.decision'
  campaign_id: string
  decision: JohnMarketingDecisionType
  reason: string
  confidence: number // 0..1
  issued_at: string
}

/** Interpreta a decisão do John e retorna ação de campanha */
export function applyJohnDecision(decision: JohnMarketingDecision): {
  action: JohnMarketingDecisionType
  campaign_id: string
  instruction: string
} {
  const instructions: Record<JohnMarketingDecisionType, string> = {
    aumentar_budget: `Aumentar budget da campanha ${decision.campaign_id} com base em performance positiva.`,
    pausar_campanha: `Pausar campanha ${decision.campaign_id}: ${decision.reason}.`,
    mudar_criativo: `Trocar criativo da campanha ${decision.campaign_id}: ${decision.reason}.`,
  }

  return {
    action: decision.decision,
    campaign_id: decision.campaign_id,
    instruction: instructions[decision.decision],
  }
}
