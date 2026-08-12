/**
 * ISSUE 25 — Proibições: o que o Game MKT NÃO pode fazer
 * ISSUE 26 — Responsabilidade única do Game MKT
 */

// ─── Fronteiras imutáveis do monolito ────────────────────────────────────────

export const GAME_MKT_FORBIDDEN = [
  'fechar_venda',
  'alterar_contrato',
  'calcular_roi_final',
] as const

export type ForbiddenAction = (typeof GAME_MKT_FORBIDDEN)[number]

export const GAME_MKT_RESPONSIBILITIES = [
  'gerar_demanda',
  'qualificar_lead',
  'alimentar_ecossistema',
] as const

export type Responsibility = (typeof GAME_MKT_RESPONSIBILITIES)[number]

// ─── Guard — lança erro se ação proibida for solicitada ──────────────────────

export class ForbiddenActionError extends Error {
  constructor(action: string) {
    super(
      `[GAME MKT] Ação '${action}' é proibida para este monolito. ` +
        `Game MKT é exclusivamente um motor de aquisição.`
    )
    this.name = 'ForbiddenActionError'
  }
}

export function assertAllowed(action: string): void {
  if ((GAME_MKT_FORBIDDEN as readonly string[]).includes(action)) {
    throw new ForbiddenActionError(action)
  }
}

/** Retorna manifesto de responsabilidade do monolito */
export function getGameMktManifest() {
  return {
    monolith: 'game_mkt',
    allowed: [...GAME_MKT_RESPONSIBILITIES],
    forbidden: [...GAME_MKT_FORBIDDEN],
    boundary: 'acquisition_only',
  }
}
