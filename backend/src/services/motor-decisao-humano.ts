/**
 * EPIC - Marketing de Ecossistema Sustentável
 * Issue #8-9: Decision Tree e sugestões de ação humanas
 */

import { SuggestaoAcao, EquilibrioStatus, ActorTipo } from '../types/wellbeing'

export interface ContextoDecisao {
  actor_id: string
  actor_tipo: ActorTipo
  carga_trabalho: number // 0-100
  equilibrio_score: number // 0-100
  produtividade: number // 0-100 (se caindo, problema)
  tempo_offline: number // horas/semana
  prazos_apertados: number
  tarefas_abertas: number
  horas_extras: number
  tendencia: 'melhorando' | 'estavel' | 'piorando'
}

export class MotorDecisaoHumano {
  /**
   * Decision tree: analisa contexto e sugere ações
   */
  static decidir(contexto: ContextoDecisao): SuggestaoAcao[] {
    const sugestoes: SuggestaoAcao[] = []

    // REGRA 1: Se sobrecargado E produtividade caindo
    if (contexto.carga_trabalho > 80 && contexto.produtividade < 40 && contexto.tendencia === 'piorando') {
      sugestoes.push({
        id: `sug_${Date.now()}_1`,
        tipo: 'redistribuir',
        condicoes: [
          `Carga: ${contexto.carga_trabalho}% (> 80%)`,
          `Produtividade: ${contexto.produtividade}% (< 40%)`,
          'Tendência: piorando',
        ],
        acao: `Redistribuir ${Math.ceil(contexto.tarefas_abertas * 0.3)} tarefas para a equipe`,
        impacto_esperado: 'Reduzir carga em ~30%, melhorar produtividade',
        prioridade: 'alta',
        timestamp: new Date(),
      })
    }

    // REGRA 2: Se muitas horas extras E pouco tempo offline
    if (contexto.horas_extras > 15 && contexto.tempo_offline < 30) {
      sugestoes.push({
        id: `sug_${Date.now()}_2`,
        tipo: 'pausar',
        condicoes: [
          `Horas extras: ${contexto.horas_extras}/semana (> 15)`,
          `Tempo offline: ${contexto.tempo_offline}h (< 30h)`,
        ],
        acao: 'Pausar novas tarefas até que equilíbrio se normalize',
        impacto_esperado: 'Permitir recuperação, melhorar bem-estar',
        prioridade: 'alta',
        timestamp: new Date(),
      })
    }

    // REGRA 3: Se prazos muito apertados
    if (contexto.prazos_apertados > 5) {
      sugestoes.push({
        id: `sug_${Date.now()}_3`,
        tipo: 'ampliar_prazo',
        condicoes: [`Prazos apertados: ${contexto.prazos_apertados} (> 5)`],
        acao: `Ampliar prazos em 15-20% para ${contexto.prazos_apertados} projetos`,
        impacto_esperado: 'Reduzir pressão, melhorar qualidade',
        prioridade: 'media',
        timestamp: new Date(),
      })
    }

    // REGRA 4: Se equilíbrio crítico (< 30)
    if (contexto.equilibrio_score < 30) {
      sugestoes.push({
        id: `sug_${Date.now()}_4`,
        tipo: 'aumentar_recursos',
        condicoes: [`Equilíbrio: ${contexto.equilibrio_score}% (crítico)`],
        acao: 'Alocar recursos adicionais ou temporários',
        impacto_esperado: 'Restabelecer equilíbrio saudável',
        prioridade: 'alta',
        timestamp: new Date(),
      })
    }

    // REGRA 5: Se tendência melhorando, manter
    if (contexto.tendencia === 'melhorando' && contexto.equilibrio_score > 50) {
      sugestoes.push({
        id: `sug_${Date.now()}_5`,
        tipo: 'pausar', // "pausar" ações corretivas
        condicoes: ['Tendência: melhorando', 'Situação estável'],
        acao: 'Manter estratégia atual, continuar monitorando',
        impacto_esperado: 'Consolidar ganhos',
        prioridade: 'baixa',
        timestamp: new Date(),
      })
    }

    return sugestoes
  }

  /**
   * Avalia impacto de uma ação sugerida
   */
  static avaliarImpacto(
    acao: string,
    contexto_atual: ContextoDecisao
  ): {
    carga_reducao_estimada: number
    equilibrio_melhoria_estimada: number
    produtividade_melhoria_estimada: number
    confianca: number // 0-1
  } {
    let carga_reducao = 0
    let equilibrio_melhoria = 0
    let produtividade_melhoria = 0
    let confianca = 0.5

    if (acao.includes('redistribuir')) {
      carga_reducao = Math.min(contexto_atual.carga_trabalho * 0.3, 30) // máximo 30%
      equilibrio_melhoria = 15
      produtividade_melhoria = 10
      confianca = 0.8
    } else if (acao.includes('pausar')) {
      carga_reducao = 0
      equilibrio_melhoria = 20
      produtividade_melhoria = 0
      confianca = 0.7
    } else if (acao.includes('ampliar')) {
      carga_reducao = 10
      equilibrio_melhoria = 10
      produtividade_melhoria = 5
      confianca = 0.65
    } else if (acao.includes('recursos')) {
      carga_reducao = 20
      equilibrio_melhoria = 25
      produtividade_melhoria = 15
      confianca = 0.75
    }

    return {
      carga_reducao_estimada: carga_reducao,
      equilibrio_melhoria_estimada: equilibrio_melhoria,
      produtividade_melhoria_estimada: produtividade_melhoria,
      confianca,
    }
  }

  /**
   * Sugere prioridade de ação (qual agir primeiro)
   */
  static priorizarAcoes(acoes: SuggestaoAcao[]): SuggestaoAcao[] {
    const ordem_prioridade = { critica: 0, alta: 1, media: 2, baixa: 3 }

    return acoes.sort((a, b) => ordem_prioridade[a.prioridade] - ordem_prioridade[b.prioridade])
  }

  /**
   * Verifica se múltiplas ações podem ser executadas simultaneamente
   */
  static podeExecutarSimultaneo(acoes: SuggestaoAcao[]): boolean {
    // Não fazer múltiplas ações ao mesmo tempo se forem muitos recursos
    const tipos_unicos = new Set(acoes.map((a) => a.tipo)).size
    return tipos_unicos <= 2 // máximo 2 tipos diferentes
  }

  /**
   * Prediz resultado se ação for executada
   */
  static preverResultado(acao: SuggestaoAcao, contexto: ContextoDecisao): ContextoDecisao {
    const novo_contexto = { ...contexto }

    if (acao.tipo === 'redistribuir') {
      novo_contexto.carga_trabalho = Math.max(0, contexto.carga_trabalho - 25)
      novo_contexto.tarefas_abertas = Math.max(0, contexto.tarefas_abertas - 3)
      novo_contexto.produtividade = Math.min(100, contexto.produtividade + 15)
    } else if (acao.tipo === 'pausar') {
      novo_contexto.tempo_offline = contexto.tempo_offline + 10
      novo_contexto.equilibrio_score = Math.min(100, contexto.equilibrio_score + 20)
    } else if (acao.tipo === 'ampliar_prazo') {
      novo_contexto.carga_trabalho = Math.max(0, contexto.carga_trabalho - 15)
      novo_contexto.prazos_apertados = Math.max(0, contexto.prazos_apertados - 3)
    } else if (acao.tipo === 'aumentar_recursos') {
      novo_contexto.carga_trabalho = Math.max(0, contexto.carga_trabalho - 30)
      novo_contexto.equilibrio_score = Math.min(100, contexto.equilibrio_score + 30)
      novo_contexto.produtividade = Math.min(100, contexto.produtividade + 20)
    }

    return novo_contexto
  }
}
