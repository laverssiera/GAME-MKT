/**
 * EPIC 6 - Score de Lead Inteligente
 * Lead scoring baseado em comportamento fuzzy
 */

import {
  calcularLeadScore,
  calcularLeadScoreLote,
  filtrarLeadScoresPorStatus,
  rankingLeadScores,
  type LeadScore,
  type LeadScoringInput,
  type LeadStatus,
} from '../brain_lib/lead-scoring'

export type { LeadStatus, LeadScoringInput, LeadScore }

export class LeadScorer {
  /**
   * Calcula score de lead (0-100) baseado em comportamento
   */
  static calcular(lead_id: string, input: LeadScoringInput): LeadScore {
    return calcularLeadScore(lead_id, input)
  }

  /**
   * Lote: calcula scores de múltiplos leads
   */
  static calcularLote(
    leads: Array<{
      lead_id: string
      input: LeadScoringInput
    }>
  ): LeadScore[] {
    return calcularLeadScoreLote(leads)
  }

  /**
   * Ranking de leads por score
   */
  static ranking(scores: LeadScore[], top: number = 10): LeadScore[] {
    return rankingLeadScores(scores, top)
  }

  /**
   * Filtra leads por status
   */
  static filtrarPorStatus(scores: LeadScore[], status: LeadStatus): LeadScore[] {
    return filtrarLeadScoresPorStatus(scores, status)
  }
}
