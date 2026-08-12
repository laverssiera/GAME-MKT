/**
 * ISSUE 12 — Compliance de campanhas: LGPD, uso de dados, termos obrigatórios
 * ISSUE 13 — Consentimento do lead: marketing.lead.consent
 */

// ─── ISSUE 12 — Compliance ───────────────────────────────────────────────────

export interface ComplianceCheck {
  campaign_id: string
  lgpd_ok: boolean
  data_usage_ok: boolean
  required_terms_ok: boolean
  issues: string[]
  approved: boolean
}

export interface CampaignComplianceInput {
  campaign_id: string
  has_lgpd_disclaimer: boolean
  data_usage_declared: boolean
  required_terms_included: string[]
}

const REQUIRED_TERMS = ['politica_privacidade', 'termo_uso', 'opt_out']

/** Valida campanha antes de publicar — LGPD + termos obrigatórios */
export function checkCampaignCompliance(input: CampaignComplianceInput): ComplianceCheck {
  const issues: string[] = []

  if (!input.has_lgpd_disclaimer) issues.push('Disclaimer LGPD ausente na campanha.')
  if (!input.data_usage_declared) issues.push('Declaração de uso de dados não informada.')

  const missingTerms = REQUIRED_TERMS.filter((t) => !input.required_terms_included.includes(t))
  if (missingTerms.length > 0) {
    issues.push(`Termos obrigatórios faltando: ${missingTerms.join(', ')}.`)
  }

  return {
    campaign_id: input.campaign_id,
    lgpd_ok: input.has_lgpd_disclaimer,
    data_usage_ok: input.data_usage_declared,
    required_terms_ok: missingTerms.length === 0,
    issues,
    approved: issues.length === 0,
  }
}

// ─── ISSUE 13 — Consentimento do lead ────────────────────────────────────────

export interface LeadConsentPayload {
  event: 'marketing.lead.consent'
  lead_id: string
  channel: string
  consented_at: string
  consent_version: string
  accepts_marketing: boolean
  accepts_data_processing: boolean
}

/** Gera evento de consentimento LGPD do lead */
export function buildLeadConsentEvent(
  lead_id: string,
  channel: string,
  opts: { accepts_marketing: boolean; accepts_data_processing: boolean; consent_version?: string }
): LeadConsentPayload {
  return {
    event: 'marketing.lead.consent',
    lead_id,
    channel,
    consented_at: new Date().toISOString(),
    consent_version: opts.consent_version ?? 'v1',
    accepts_marketing: opts.accepts_marketing,
    accepts_data_processing: opts.accepts_data_processing,
  }
}
