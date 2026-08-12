/**
 * ISSUE 14 — Enviar leads qualificados para Archimedes: marketing.lead.qualified
 * ISSUE 15 — Receber feedback de conversão: archimedes.lead.converted / archimedes.deal.closed
 * ISSUE 16 — Score dinâmico de lead (comportamento + resposta + tempo)
 */

// ─── ISSUE 14 — Leads qualificados → Archimedes ──────────────────────────────

export interface LeadQualifiedPayload {
  event: 'marketing.lead.qualified'
  lead_id: string
  campaign_id: string
  channel: string
  score: number
  perfil: string
  qualified_at: string
}

const QUALIFICATION_THRESHOLD = 0.65

export function qualifyLead(lead: {
  lead_id: string
  campaign_id: string
  channel: string
  score: number
  perfil?: string
}): LeadQualifiedPayload | null {
  if (lead.score < QUALIFICATION_THRESHOLD) return null

  return {
    event: 'marketing.lead.qualified',
    lead_id: lead.lead_id,
    campaign_id: lead.campaign_id,
    channel: lead.channel,
    score: lead.score,
    perfil: lead.perfil ?? 'indefinido',
    qualified_at: new Date().toISOString(),
  }
}

// ─── ISSUE 15 — Feedback de conversão do Archimedes ─────────────────────────

export interface ArchimedesLeadConverted {
  event: 'archimedes.lead.converted'
  lead_id: string
  deal_id: string
  valor: number
  converted_at: string
}

export interface ArchimededsDealClosed {
  event: 'archimedes.deal.closed'
  deal_id: string
  lead_id: string
  receita: number
  closed_at: string
}

// ─── ISSUE 16 — Score dinâmico ────────────────────────────────────────────────

export interface DynamicScoreInput {
  score_atual: number
  engajamento_recente: boolean // abriu email, clicou
  respondeu: boolean
  dias_desde_ultimo_contato: number
}

/**
 * Ajusta score dinamicamente com base em comportamento + resposta + tempo.
 * Retorna novo score clampado em [0, 1].
 */
export function calcDynamicScore(input: DynamicScoreInput): number {
  let delta = 0

  if (input.engajamento_recente) delta += 0.1
  if (input.respondeu) delta += 0.15

  // Decaimento por tempo sem contato
  if (input.dias_desde_ultimo_contato > 30) delta -= 0.2
  else if (input.dias_desde_ultimo_contato > 14) delta -= 0.1
  else if (input.dias_desde_ultimo_contato > 7) delta -= 0.05

  return Math.max(0, Math.min(1, input.score_atual + delta))
}
