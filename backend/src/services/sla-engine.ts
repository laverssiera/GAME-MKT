/**
 * ISSUE 17 — SLA de contato: lead deve ser contactado em até 1h
 * ISSUE 18 — Reativação automática de leads frios
 */

// ─── ISSUE 17 — SLA Engine ───────────────────────────────────────────────────

export const SLA_CONTACT_LIMIT_MS = 60 * 60 * 1000 // 1 hora

export interface SlaLeadAtRiskPayload {
  event: 'sla.lead.at_risk'
  lead_id: string
  task_id: string
  generated_at: string
  elapsed_ms: number
  limit_ms: number
}

export interface TrackedLead {
  lead_id: string
  task_id: string
  generated_at: string
  contacted: boolean
  contacted_at?: string
}

const trackedLeads = new Map<string, TrackedLead>()

export function trackLeadForSla(lead_id: string, task_id: string): void {
  trackedLeads.set(lead_id, {
    lead_id,
    task_id,
    generated_at: new Date().toISOString(),
    contacted: false,
  })
}

export function markLeadContacted(lead_id: string): void {
  const lead = trackedLeads.get(lead_id)
  if (lead) {
    lead.contacted = true
    lead.contacted_at = new Date().toISOString()
    trackedLeads.set(lead_id, lead)
  }
}

/** Verifica leads em risco de SLA (não contactados em mais de 1h) */
export function checkSlaRisk(): SlaLeadAtRiskPayload[] {
  const now = Date.now()
  const atRisk: SlaLeadAtRiskPayload[] = []

  for (const lead of trackedLeads.values()) {
    if (lead.contacted) continue
    const elapsed = now - new Date(lead.generated_at).getTime()
    if (elapsed >= SLA_CONTACT_LIMIT_MS) {
      atRisk.push({
        event: 'sla.lead.at_risk',
        lead_id: lead.lead_id,
        task_id: lead.task_id,
        generated_at: lead.generated_at,
        elapsed_ms: elapsed,
        limit_ms: SLA_CONTACT_LIMIT_MS,
      })
    }
  }

  return atRisk
}

// ─── ISSUE 18 — Reativação automática ────────────────────────────────────────

export interface ColdLeadReactivationPayload {
  event: 'marketing.lead.reactivated'
  lead_id: string
  campaign_id: string
  reactivated_at: string
  reason: 'sla_timeout' | 'manual' | 'auto_drip'
}

const COLD_THRESHOLD_DAYS = 30

/**
 * Retorna leads frios que devem ser reativados e enviados de volta a campanhas
 */
export function findColdLeadsForReactivation(
  leads: Array<{ lead_id: string; campaign_id: string; last_activity: string }>
): ColdLeadReactivationPayload[] {
  const now = Date.now()
  return leads
    .filter((l) => {
      const daysSince = (now - new Date(l.last_activity).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince >= COLD_THRESHOLD_DAYS
    })
    .map((l) => ({
      event: 'marketing.lead.reactivated' as const,
      lead_id: l.lead_id,
      campaign_id: l.campaign_id,
      reactivated_at: new Date().toISOString(),
      reason: 'auto_drip' as const,
    }))
}
