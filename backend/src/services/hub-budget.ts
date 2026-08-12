/**
 * ISSUE 10 — Controle de orçamento via Hub (Game MKT NÃO decide sozinho)
 * ISSUE 11 — Enviar custo por campanha: marketing.campaign.cost
 */

// ─── ISSUE 10 — Budget consumido do Hub ──────────────────────────────────────

export interface HubBudgetApproved {
  event: 'hub.budget.approved'
  campaign_id: string
  amount: number
  currency: 'BRL'
  valid_until: string
}

export interface HubBudgetLimit {
  event: 'hub.budget.limit'
  campaign_id: string
  max_daily: number
  max_total: number
}

export interface CampaignBudgetState {
  campaign_id: string
  approved: number
  spent: number
  limit_daily: number
  limit_total: number
  can_spend: boolean
}

const budgetStore = new Map<string, CampaignBudgetState>()

/** Registra orçamento aprovado pelo Hub */
export function applyHubBudgetApproved(event: HubBudgetApproved): void {
  const current = budgetStore.get(event.campaign_id) ?? {
    campaign_id: event.campaign_id,
    approved: 0,
    spent: 0,
    limit_daily: Infinity,
    limit_total: Infinity,
    can_spend: true,
  }
  budgetStore.set(event.campaign_id, {
    ...current,
    approved: current.approved + event.amount,
    can_spend: true,
  })
}

/** Registra limite imposto pelo Hub */
export function applyHubBudgetLimit(event: HubBudgetLimit): void {
  const current = budgetStore.get(event.campaign_id) ?? {
    campaign_id: event.campaign_id,
    approved: 0,
    spent: 0,
    limit_daily: Infinity,
    limit_total: Infinity,
    can_spend: true,
  }
  budgetStore.set(event.campaign_id, {
    ...current,
    limit_daily: event.max_daily,
    limit_total: event.max_total,
    can_spend: current.spent < event.max_total,
  })
}

/** Verifica se campanha pode gastar mais */
export function canSpend(campaign_id: string, amount: number): boolean {
  const state = budgetStore.get(campaign_id)
  if (!state) return false
  return state.can_spend && state.spent + amount <= Math.min(state.approved, state.limit_total)
}

// ─── ISSUE 11 — Enviar custo por campanha ────────────────────────────────────

export interface CampaignCostPayload {
  event: 'marketing.campaign.cost'
  campaign_id: string
  channel: string
  cost: number
  period: string // ISO date
  currency: 'BRL'
}

/** Registra gasto e retorna payload de evento para publicação */
export function registerCampaignCost(
  campaign_id: string,
  channel: string,
  cost: number
): CampaignCostPayload {
  const state = budgetStore.get(campaign_id)
  if (state) {
    state.spent += cost
    state.can_spend = state.spent < Math.min(state.approved, state.limit_total)
    budgetStore.set(campaign_id, state)
  }

  return {
    event: 'marketing.campaign.cost',
    campaign_id,
    channel,
    cost,
    period: new Date().toISOString().slice(0, 10),
    currency: 'BRL',
  }
}

export function getBudgetState(campaign_id: string): CampaignBudgetState | undefined {
  return budgetStore.get(campaign_id)
}
