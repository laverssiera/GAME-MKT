/**
 * ISSUE 19 — Score de campanha (CTR, conversão, ROI)
 * ISSUE 20 — Ranking de canais (Meta vs Google vs LinkedIn)
 * ISSUE 21 — Ranking de criativos (qual anúncio vende mais)
 */

// ─── ISSUE 19 — Score de campanha ────────────────────────────────────────────

export interface CampaignKpis {
  campaign_id: string
  ctr: number         // Click-through rate (%)
  conversao: number   // Taxa de conversão (%)
  roi: number         // Return on investment
}

export interface CampaignScore {
  campaign_id: string
  score: number       // 0..100
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  breakdown: { ctr: number; conversao: number; roi: number }
}

/** Calcula score ponderado da campanha */
export function scoreCampaign(kpis: CampaignKpis): CampaignScore {
  // Normalização simples: CTR peso 30%, conversão 40%, ROI 30%
  const ctrNorm = Math.min(kpis.ctr / 5, 1) * 100     // ref: 5% = máx
  const convNorm = Math.min(kpis.conversao / 10, 1) * 100 // ref: 10% = máx
  const roiNorm = Math.min(kpis.roi / 20, 1) * 100     // ref: 20x = máx

  const score = Math.round(ctrNorm * 0.3 + convNorm * 0.4 + roiNorm * 0.3)

  const grade =
    score >= 85 ? 'S'
    : score >= 70 ? 'A'
    : score >= 55 ? 'B'
    : score >= 40 ? 'C'
    : 'D'

  return { campaign_id: kpis.campaign_id, score, grade, breakdown: { ctr: ctrNorm, conversao: convNorm, roi: roiNorm } }
}

// ─── ISSUE 20 — Ranking de canais ────────────────────────────────────────────

export type Channel = 'meta_ads' | 'google_ads' | 'linkedin_ads' | string

export interface ChannelStats {
  channel: Channel
  leads: number
  conversoes: number
  custo_total: number
  receita_total: number
}

export interface ChannelRanking {
  position: number
  channel: Channel
  cac: number
  roi: number
  leads: number
}

export function rankChannels(stats: ChannelStats[]): ChannelRanking[] {
  return stats
    .map((s) => ({
      position: 0,
      channel: s.channel,
      cac: s.leads > 0 ? s.custo_total / s.leads : Infinity,
      roi: s.custo_total > 0 ? (s.receita_total - s.custo_total) / s.custo_total : 0,
      leads: s.leads,
    }))
    .sort((a, b) => b.roi - a.roi)
    .map((item, i) => ({ ...item, position: i + 1 }))
}

// ─── ISSUE 21 — Ranking de criativos ─────────────────────────────────────────

export interface CreativeStats {
  creative_id: string
  impressions: number
  clicks: number
  conversoes: number
  receita: number
}

export interface CreativeRanking {
  position: number
  creative_id: string
  ctr: number
  conversion_rate: number
  revenue_per_click: number
}

export function rankCreatives(stats: CreativeStats[]): CreativeRanking[] {
  return stats
    .map((c) => ({
      position: 0,
      creative_id: c.creative_id,
      ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
      conversion_rate: c.clicks > 0 ? (c.conversoes / c.clicks) * 100 : 0,
      revenue_per_click: c.clicks > 0 ? c.receita / c.clicks : 0,
    }))
    .sort((a, b) => b.revenue_per_click - a.revenue_per_click)
    .map((item, i) => ({ ...item, position: i + 1 }))
}
