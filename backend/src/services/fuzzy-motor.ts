/**
 * EPIC 2 - Sistema de Satisfação Fuzzy
 * Calcula satisfação sem pedir avaliação direta
 */

export interface BehaviorMetrics {
  retorno_site: boolean
  tempo_navegacao: number // segundos
  clique_proposta: boolean
  compartilhamento: boolean
  interacao_chat: number // 0-10 escala
  propostas_visualizadas: number
  dias_sem_visita: number
}

export interface FuzzyWeights {
  retorno_site: number // 0-1
  tempo_navegacao: number // 0-1
  clique_proposta: number // 0-1
  compartilhamento: number // 0-1
  interacao_chat: number // 0-1
}

export type SatisfacaoClassificacao = 'baixa' | 'media' | 'alta'

export interface SatisfacaoResult {
  score_satisfacao: number // 0.0 - 1.0
  classificacao: SatisfacaoClassificacao
  timestamp: Date
  empresa_id: string
  lead_id?: string
}

export class FuzzyMotor {
  /**
   * Pesos padrão para cálculo de satisfação fuzzy
   */
  private static DEFAULT_WEIGHTS: FuzzyWeights = {
    retorno_site: 0.15,
    tempo_navegacao: 0.2,
    clique_proposta: 0.25,
    compartilhamento: 0.2,
    interacao_chat: 0.2,
  }

  /**
   * Função de pertinência fuzzy para tempo de navegação
   * Quanto mais tempo (até 15 min), melhor
   */
  private static fuzzyTempoNavegacao(segundos: number): number {
    if (segundos < 30) return 0.1
    if (segundos < 60) return 0.3
    if (segundos < 300) return 0.6
    if (segundos < 900) return 0.9
    return 1.0
  }

  /**
   * Função de pertinência fuzzy para dias sem visita
   * Quanto menos tempo sem visitar, melhor
   */
  private static fuzzyDiasSemVisita(dias: number): number {
    if (dias <= 1) return 1.0
    if (dias <= 7) return 0.8
    if (dias <= 14) return 0.5
    if (dias <= 30) return 0.2
    return 0.0
  }

  /**
   * Calcula score de satisfação (0-1) baseado em comportamento
   */
  static calcularSatisfacao(
    comportamento: BehaviorMetrics,
    pesos?: FuzzyWeights
  ): SatisfacaoResult {
    const w = pesos || this.DEFAULT_WEIGHTS

    // Normaliza cada fator de 0-1
    const fator_retorno = comportamento.retorno_site ? 1.0 : 0.3
    const fator_tempo = this.fuzzyTempoNavegacao(comportamento.tempo_navegacao)
    const fator_proposta = comportamento.clique_proposta ? 1.0 : 0.4
    const fator_compartilhamento = comportamento.compartilhamento ? 1.0 : 0.2
    const fator_chat = Math.min(1.0, comportamento.interacao_chat / 10)

    // Aplica pesos (AND fuzzy = multiplicação)
    const score =
      fator_retorno * w.retorno_site +
      fator_tempo * w.tempo_navegacao +
      fator_proposta * w.clique_proposta +
      fator_compartilhamento * w.compartilhamento +
      fator_chat * w.interacao_chat

    const score_normalizado = Math.min(1.0, Math.max(0.0, score))

    return {
      score_satisfacao: score_normalizado,
      classificacao: this.classificarSatisfacao(score_normalizado),
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * Classifica score fuzzy em categoria discreta
   */
  private static classificarSatisfacao(score: number): SatisfacaoClassificacao {
    if (score < 0.35) return 'baixa'
    if (score < 0.65) return 'media'
    return 'alta'
  }

  /**
   * Valida e retorna pesos atualizados
   */
  static validarPesos(pesos: Partial<FuzzyWeights>): FuzzyWeights {
    const merged = { ...this.DEFAULT_WEIGHTS, ...pesos }

    // Normaliza para que soma = 1.0
    const soma = Object.values(merged).reduce((a, b) => a + b, 0)
    const normalizado = Object.entries(merged).reduce(
      (acc, [key, value]) => {
        acc[key as keyof FuzzyWeights] = value / soma
        return acc
      },
      {} as FuzzyWeights
    )

    return normalizado
  }
}
