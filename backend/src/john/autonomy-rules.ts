export interface MaeEscalationContext {
  needs_mae_decision?: boolean
  budget_impact?: number
  strategy_change?: boolean
  lead_prioritization?: boolean
  cross_ecossistema?: boolean
}

export function shouldEscalateToMae(context: MaeEscalationContext): boolean {
  if (context.needs_mae_decision) return true
  if ((context.budget_impact ?? 0) > 10000) return true
  if (context.strategy_change) return true
  if (context.lead_prioritization) return true
  if (context.cross_ecossistema) return true
  return false
}
