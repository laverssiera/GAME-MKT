/**
 * ISSUE 2 — Lead vira Task automaticamente no Kanban Global
 * ISSUE 3 — Tasks com contexto de marketing
 * ISSUE 4 — Atualizar task com comportamento do usuário
 *
 * Flow: Campanha → Lead → Evento → Kanban Task
 */

export interface KanbanTaskMarketing {
  task_id: string
  title: string
  status: 'backlog' | 'em_contato' | 'negociando' | 'convertido' | 'perdido'
  // Campos adicionais de marketing (ISSUE 3)
  source: 'game_mkt'
  campaign_id: string
  channel: string
  cac: number
  lead_id: string
  score: number
  created_at: string
  updated_at: string
}

export interface LeadGeneratedEvent {
  event: 'marketing.lead.generated'
  data: {
    lead_id: string
    channel: string
    campaign: string
    score: number
  }
}

// ISSUE 4 — Eventos de comportamento do usuário
export type LeadBehaviorEvent =
  | 'marketing.lead.engaged'
  | 'marketing.lead.silent'
  | 'marketing.lead.reactivated'

export interface LeadBehaviorUpdate {
  event: LeadBehaviorEvent
  data: {
    lead_id: string
    task_id: string
    detail?: string
    timestamp: string
  }
}

const randomId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

/**
 * ISSUE 2 — Converte lead gerado em KanbanTask automaticamente
 */
export function leadToKanbanTask(event: LeadGeneratedEvent): KanbanTaskMarketing {
  return {
    task_id: `ktask_${randomId()}`,
    title: `Lead ${event.data.channel} • ${event.data.campaign}`,
    status: 'backlog',
    source: 'game_mkt',
    campaign_id: event.data.campaign,
    channel: event.data.channel,
    cac: 0, // calculado depois via hub.budget
    lead_id: event.data.lead_id,
    score: event.data.score,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * ISSUE 4 — Enriquece a task com comportamento do usuário
 */
export function applyLeadBehaviorToTask(
  task: KanbanTaskMarketing,
  update: LeadBehaviorUpdate
): KanbanTaskMarketing {
  const statusMap: Record<LeadBehaviorEvent, KanbanTaskMarketing['status']> = {
    'marketing.lead.engaged': 'em_contato',
    'marketing.lead.silent': 'backlog',
    'marketing.lead.reactivated': 'em_contato',
  }

  return {
    ...task,
    status: statusMap[update.event],
    updated_at: update.data.timestamp,
  }
}
