/**
 * ISSUE 22 — Painel tempo real: leads/min, custo/min, conversão
 * ISSUE 23 — Integração com Kanban visual: impacto direto no pipeline
 */

// ─── ISSUE 22 — Trading Desk em tempo real ───────────────────────────────────

export interface TradingDeskSnapshot {
  timestamp: string
  leads_per_minute: number
  cost_per_minute: number
  conversion_rate: number
  active_campaigns: number
  pipeline_value: number
}

const eventWindow: Array<{ type: 'lead' | 'cost' | 'conversion'; value: number; ts: number }> = []
const WINDOW_MS = 60_000 // janela de 1 minuto

function pruneWindow(): void {
  const cutoff = Date.now() - WINDOW_MS
  let i = 0
  while (i < eventWindow.length && eventWindow[i].ts < cutoff) i++
  eventWindow.splice(0, i)
}

export function recordTradingEvent(type: 'lead' | 'cost' | 'conversion', value = 1): void {
  eventWindow.push({ type, value, ts: Date.now() })
}

export function getTradingDeskSnapshot(active_campaigns: number, pipeline_value: number): TradingDeskSnapshot {
  pruneWindow()

  const leads = eventWindow.filter((e) => e.type === 'lead').length
  const cost = eventWindow.filter((e) => e.type === 'cost').reduce((s, e) => s + e.value, 0)
  const conversions = eventWindow.filter((e) => e.type === 'conversion').length

  return {
    timestamp: new Date().toISOString(),
    leads_per_minute: leads,
    cost_per_minute: Number(cost.toFixed(2)),
    conversion_rate: leads > 0 ? Number(((conversions / leads) * 100).toFixed(2)) : 0,
    active_campaigns,
    pipeline_value,
  }
}

// ─── ISSUE 23 — Kanban visual pipeline ───────────────────────────────────────

export interface KanbanPipelineImpact {
  total_leads: number
  em_contato: number
  negociando: number
  convertidos: number
  perdidos: number
  taxa_conversao_pipeline: number
}

export function calcKanbanPipelineImpact(
  tasks: Array<{ status: string }>
): KanbanPipelineImpact {
  const total = tasks.length
  const em_contato = tasks.filter((t) => t.status === 'em_contato').length
  const negociando = tasks.filter((t) => t.status === 'negociando').length
  const convertidos = tasks.filter((t) => t.status === 'convertido').length
  const perdidos = tasks.filter((t) => t.status === 'perdido').length

  return {
    total_leads: total,
    em_contato,
    negociando,
    convertidos,
    perdidos,
    taxa_conversao_pipeline: total > 0 ? Number(((convertidos / total) * 100).toFixed(2)) : 0,
  }
}
