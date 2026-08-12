/**
 * ISSUE 1 + ISSUE 24 — Papel oficial do Game MKT + Registro Core DNA
 *
 * Game MKT é o motor de aquisição do ecossistema.
 * Responsabilidade única: gerar demanda, qualificar lead, alimentar ecossistema.
 */

export const GAME_MKT_ROLE = {
  monolith: 'game_mkt',
  role: 'acquisition_engine',
  outputs: ['lead', 'intent', 'traffic', 'campaign'],
} as const

export type GameMktOutput = (typeof GAME_MKT_ROLE.outputs)[number]

// ISSUE 24 — Registro no Core DNA
export const GAME_MKT_CORE_DNA = {
  monolith: 'game_mkt',
  capabilities: ['lead_generation', 'campaign', 'traffic'],
  role: GAME_MKT_ROLE.role,
  registered_at: new Date().toISOString(),
} as const

/** Retorna a identidade oficial do monolito para uso em headers/eventos */
export function getGameMktIdentity() {
  return {
    source: GAME_MKT_ROLE.monolith,
    role: GAME_MKT_ROLE.role,
    capabilities: [...GAME_MKT_CORE_DNA.capabilities],
  }
}
