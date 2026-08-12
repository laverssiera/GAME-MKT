export const DEFAULT_LEAD_JOURNEY_STEPS = [
  'enviar_artigo',
  'enviar_case',
  'enviar_convite',
  'oferta',
] as const

export type LeadJourneyStep = (typeof DEFAULT_LEAD_JOURNEY_STEPS)[number]

export const buildLeadJourney = (tema?: string): LeadJourneyStep[] => {
  if (!tema) {
    return [...DEFAULT_LEAD_JOURNEY_STEPS]
  }

  return [...DEFAULT_LEAD_JOURNEY_STEPS]
}
