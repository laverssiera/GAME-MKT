/**
 * EPIC - Marketing de Ecossistema Sustentável
 * Issue #1-5: Coleta e cálculo de Human KPIs
 */

import { HumanKPI, ActorTipo, EquilibrioStatus, EquilibrioScore } from '../types/wellbeing'

export interface WorkloadInput {
  tarefas_abertas: number
  prazos_apertados: number
  tempo_resposta_medio: number // minutos
  horas_trabalho_dia: number
  dias_trabalhados_semana: number
}

export class HumanKPICalculator {
  /**
   * Calcula carga de trabalho (0-100%)
   * Baseado em tarefas abertas, prazos e tempo resposta
   */
  static calcularCargaTrabalho(input: WorkloadInput): number {
    // Factor 1: Tarefas abertas vs capacidade (ex: 5 tarefas = 20%, 10 = 40%, 20 = 100%)
    const fator_tarefas = Math.min(100, (input.tarefas_abertas / 5) * 20)

    // Factor 2: Prazos apertados (quanto mais apertados, mais carga)
    const fator_prazos = Math.min(100, input.prazos_apertados * 10)

    // Factor 3: Tempo resposta (quanto mais rápido, mais pressão - tempo resposta < 5min = muita pressão)
    const fator_tempo = Math.max(0, 100 - (input.tempo_resposta_medio / 60) * 10)

    // Factor 4: Horas trabalhadas por dia
    const fator_horas = (input.horas_trabalho_dia / 8) * 40

    // Factor 5: Dias sem descanso
    const fator_dias = ((input.dias_trabalhados_semana / 7) * 100) * 0.2

    // Carga final: média ponderada
    const carga = (fator_tarefas * 0.2 + fator_prazos * 0.2 + fator_tempo * 0.2 + fator_horas * 0.2 + fator_dias * 0.2) / 100

    return Math.round(Math.min(100, carga * 100))
  }

  /**
   * Calcula equilíbrio vida/trabalho (0-100)
   * Combina carga, tempo offline, pausas e engajamento
   */
  static calcularEquilibrio(
    carga_trabalho: number,
    tempo_offline: number, // horas/semana
    pausas_realizadas: number,
    engajamento: number,
    horas_extras: number
  ): EquilibrioScore {
    // Idealização: 40h/semana trabalho, 128h/semana offline (24/7 - 40 trabalho)
    const tempo_offline_ideal = 128

    // Factor 1: Carga inversa (quanto menos carga, melhor equilíbrio)
    const fator_carga = 100 - carga_trabalho

    // Factor 2: Tempo offline (quanto mais, melhor)
    const fator_offline = Math.min(100, (tempo_offline / tempo_offline_ideal) * 100)

    // Factor 3: Qualidade de pausas (0-100)
    const fator_pausas = pausas_realizadas

    // Factor 4: Engajamento voluntário (energia, não obrigação)
    const fator_engajamento = engajamento * 0.8 // menos peso que outros

    // Factor 5: Horas extras (penalidade)
    const penalidade_extras = Math.min(100, horas_extras * 10)

    // Score final
    const score = (fator_carga * 0.3 + fator_offline * 0.3 + fator_pausas * 0.2 + fator_engajamento * 0.1 - penalidade_extras * 0.1) / 100

    const equilibrio_score = Math.round(Math.max(0, Math.min(100, score * 100)))

    // Classificação
    let status: EquilibrioStatus
    if (equilibrio_score >= 70) {
      status = EquilibrioStatus.SAUDAVEL
    } else if (equilibrio_score >= 40) {
      status = EquilibrioStatus.ATENCAO
    } else {
      status = EquilibrioStatus.SOBRECARGA
    }

    return {
      score_equilibrio: equilibrio_score,
      status,
      justificativa: this.gerarJustificativa(equilibrio_score, carga_trabalho, tempo_offline, horas_extras),
      timestamp: new Date(),
      actor_id: 'default',
      actor_tipo: ActorTipo.COLABORADOR,
    }
  }

  /**
   * Calcula score bem-estar consolidado
   */
  static calcularBemEstar(
    equilibrio: number,
    carga: number,
    pausas: number,
    saude_mental: number = 50,
    satisfacao: number = 50
  ): number {
    // Consolidação de múltiplos fatores
    const bem_estar = (equilibrio * 0.35 + (100 - carga) * 0.25 + pausas * 0.15 + saude_mental * 0.15 + satisfacao * 0.1) / 100

    return Math.round(bem_estar * 100)
  }

  /**
   * Detecta tendência (melhora/estável/piora)
   */
  static detectarTendencia(
    scores_anteriores: number[],
    score_atual: number
  ): 'melhorando' | 'estavel' | 'piorando' {
    if (scores_anteriores.length < 2) return 'estavel'

    const media_anterior = scores_anteriores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores_anteriores.length)
    const diferenca = score_atual - media_anterior

    if (diferenca > 5) return 'melhorando'
    if (diferenca < -5) return 'piorando'
    return 'estavel'
  }

  /**
   * Gera justificativa textual do score
   */
  private static gerarJustificativa(
    equilibrio: number,
    carga: number,
    tempo_offline: number,
    horas_extras: number
  ): string {
    const fatores: string[] = []

    if (carga > 80) fatores.push('Carga muito alta')
    else if (carga > 60) fatores.push('Carga moderada')

    if (tempo_offline < 40) fatores.push('Pouco tempo offline')
    else if (tempo_offline > 100) fatores.push('Bastante tempo livre')

    if (horas_extras > 10) fatores.push('Muitas horas extras')

    if (equilibrio >= 70) {
      if (fatores.length === 0) return 'Equilíbrio saudável mantido!'
      return `Equilíbrio mantido apesar de: ${fatores.join(', ')}`
    }

    if (fatores.length === 0) fatores.push('Geral desbalanceado')
    return fatores.join(', ')
  }

  /**
   * Compara score com benchmark de bem-estar
   */
  static compararComBenchmark(score: number, actor_tipo: ActorTipo): string {
    // Benchmarks por tipo de ator
    const benchmarks = {
      [ActorTipo.COLABORADOR]: 75,
      [ActorTipo.FORNECEDOR]: 65,
      [ActorTipo.PARCEIRO]: 70,
      [ActorTipo.CLIENTE]: 70,
    }

    const benchmark = benchmarks[actor_tipo] || 70
    const diferenca = score - benchmark

    if (diferenca > 10) return `${diferenca}% acima da média para ${actor_tipo}`
    if (diferenca < -10) return `${Math.abs(diferenca)}% abaixo da média para ${actor_tipo}`
    return `Na média para ${actor_tipo}`
  }
}
