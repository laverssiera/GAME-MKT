/**
 * EPIC - Marketing de Ecossistema Sustentável
 * Issue #10-11: Dashboard e Saúde do Ecossistema
 * Issue #15: Integração com múltiplos portais
 */

import { EcossistemaSaude, SaúdeEcossistema, ActorTipo, HumanKPI } from '../types/wellbeing'

export interface ComponenteSaude {
  [key: string]: number
}

export class MotorSaudeEcossistema {
  /**
   * Calcula índice geral de saúde do ecossistema
   */
  static calcularSaudeEcossistema(componentes: any): EcossistemaSaude {
    // Normalizar nomes de propriedades
    const equipe = componentes.equipe || componentes.equipe_saude || 70
    const fornecedores = componentes.fornecedores || componentes.fornecedores_saude || 65
    const parceiros = componentes.parceiros || componentes.parceiros_saude || 70
    const clientes = componentes.clientes || componentes.clientes_satisfacao || 75

    // Ponderação: equipe (35%), fornecedores (25%), parceiros (25%), clientes (15%)
    const health_score = equipe * 0.35 + fornecedores * 0.25 + parceiros * 0.25 + clientes * 0.15

    let status: SaúdeEcossistema
    if (health_score >= 80) status = SaúdeEcossistema.EXCELENTE
    else if (health_score >= 65) status = SaúdeEcossistema.BOM
    else if (health_score >= 50) status = SaúdeEcossistema.ATENCAO
    else status = SaúdeEcossistema.CRITICO

    const alertas = this.gerarAlertasEcossistema({ equipe, fornecedores, parceiros, clientes }, health_score)
    const recomendacoes = this.gerarRecomendacoes({ equipe, fornecedores, parceiros, clientes }, status)

    return {
      health_score: Math.round(health_score),
      status,
      timestamp: new Date(),
      componentes: { equipe, fornecedores, parceiros, clientes },
      alertas,
      recomendacoes,
    }
  }

  /**
   * Gera alertas do ecossistema
   */
  private static gerarAlertasEcossistema(componentes: any, score_geral: number): string[] {
    const alertas: string[] = []

    if (componentes.equipe < 40) alertas.push('🚨 Equipe em risco - equilíbrio crítico')
    if (componentes.fornecedores < 50) alertas.push('⚠️ Fornecedores pressionados')
    if (componentes.parceiros < 45) alertas.push('⚠️ Parceiros com sobrecarga')
    if (componentes.clientes < 50) alertas.push('😞 Satisfação cliente caindo')

    if (score_geral < 50 && alertas.length > 2) alertas.unshift('🔴 CRÍTICO: Ecossistema em desequilíbrio')

    return alertas
  }

  /**
   * Gera recomendações estratégicas
   */
  private static gerarRecomendacoes(componentes: any, status: SaúdeEcossistema): string[] {
    const recomendacoes: string[] = []

    if (status === SaúdeEcossistema.EXCELENTE) {
      recomendacoes.push('Manter práticas atuais - ecossistema saudável')
      recomendacoes.push('Documentar e compartilhar práticas de bem-estar')
      return recomendacoes
    }

    if (componentes.equipe < 60) recomendacoes.push('Prioridade 1: Melhorar bem-estar da equipe interna')
    if (componentes.fornecedores < 60) recomendacoes.push('Prioridade 2: Revisar prazos e volume com fornecedores')
    if (componentes.parceiros < 60) recomendacoes.push('Prioridade 3: Equilibrar carga de parceiros')
    if (componentes.clientes < 60) recomendacoes.push('Prioridade 4: Aumentar qualidade de serviço')

    if (status === SaúdeEcossistema.CRITICO) {
      recomendacoes.unshift('AÇÃO URGENTE: Fazer auditoria de bem-estar em toda cadeia')
      recomendacoes.push('Considerar pausar novos projetos temporariamente')
    }

    return recomendacoes
  }

  /**
   * Análise de tendências (semana/mês anterior)
   */
  static analisarTendencias(
    saude_atual: EcossistemaSaude,
    saude_anterior: EcossistemaSaude | null
  ): {
    mudanca_geral: number // -100 a +100
    componentes_melhores: string[]
    componentes_piores: string[]
    velocidade_mudanca: 'rapida' | 'moderada' | 'lenta'
  } {
    if (!saude_anterior) {
      return {
        mudanca_geral: 0,
        componentes_melhores: [],
        componentes_piores: [],
        velocidade_mudanca: 'lenta',
      }
    }

    const mudanca_geral = saude_atual.health_score - saude_anterior.health_score
    const componentes_melhores: string[] = []
    const componentes_piores: string[] = []

    // Comparar cada componente
    Object.keys(saude_atual.componentes).forEach((key) => {
      const atual = (saude_atual.componentes as any)[key]
      const anterior = (saude_anterior.componentes as any)[key]
      if (atual !== undefined && anterior !== undefined) {
        const mudanca = atual - anterior
        if (mudanca > 5) componentes_melhores.push(`${key} (+${mudanca})`)
        if (mudanca < -5) componentes_piores.push(`${key} (${mudanca})`)
      }
    })

    // Velocidade de mudança
    let velocidade: 'rapida' | 'moderada' | 'lenta'
    if (Math.abs(mudanca_geral) > 15) velocidade = 'rapida'
    else if (Math.abs(mudanca_geral) > 5) velocidade = 'moderada'
    else velocidade = 'lenta'

    return {
      mudanca_geral,
      componentes_melhores,
      componentes_piores,
      velocidade_mudanca: velocidade,
    }
  }

  /**
   * Simula impacto de uma ação no ecossistema
   */
  static simularImpacto(
    acao: string,
    saude_atual: EcossistemaSaude
  ): {
    saude_prevista: EcossistemaSaude
    impacto_estimado: number
    prazo_semanas: number
  } {
    const novo_componentes: any = { ...saude_atual.componentes }

    let impacto = 0
    let prazo = 4

    if (acao.includes('redistribuir tarefas')) {
      novo_componentes.equipe = Math.min(100, novo_componentes.equipe + 15)
      impacto = 15
      prazo = 1
    } else if (acao.includes('ampliar prazos')) {
      novo_componentes.fornecedores = Math.min(100, novo_componentes.fornecedores + 20)
      novo_componentes.equipe = Math.min(100, novo_componentes.equipe + 10)
      impacto = 12
      prazo = 2
    } else if (acao.includes('aumentar comunicação')) {
      novo_componentes.parceiros = Math.min(100, novo_componentes.parceiros + 15)
      novo_componentes.fornecedores = Math.min(100, novo_componentes.fornecedores + 10)
      impacto = 10
      prazo = 3
    } else if (acao.includes('pausar projetos')) {
      novo_componentes.equipe = Math.min(100, novo_componentes.equipe + 25)
      novo_componentes.fornecedores = Math.min(100, novo_componentes.fornecedores + 20)
      impacto = 20
      prazo = 1
    }

    const saude_prevista = this.calcularSaudeEcossistema(novo_componentes)

    return {
      saude_prevista,
      impacto_estimado: impacto,
      prazo_semanas: prazo,
    }
  }

  /**
   * Dashboard dados agregados por portal/ator
   */
  static agRegarPorAtor(
    kpis: HumanKPI[]
  ): Record<
    string,
    {
      count: number
      equilibrio_medio: number
      bem_estar_medio: number
      carga_media: number
      tendencias: { melhorando: number; estavel: number; piorando: number }
    }
  > {
    const agregado: Record<
      string,
      {
        count: number
        equilibrio_total: number
        bem_estar_total: number
        carga_total: number
        tendencias: { melhorando: number; estavel: number; piorando: number }
      }
    > = {}

    // Agrupar por tipo de ator
    kpis.forEach((kpi) => {
      const tipo = kpi.actor_tipo
      if (!agregado[tipo]) {
        agregado[tipo] = {
          count: 0,
          equilibrio_total: 0,
          bem_estar_total: 0,
          carga_total: 0,
          tendencias: { melhorando: 0, estavel: 0, piorando: 0 },
        }
      }

      agregado[tipo].count++
      agregado[tipo].equilibrio_total += kpi.equilibrio
      agregado[tipo].bem_estar_total += kpi.score_bem_estar
      agregado[tipo].carga_total += kpi.carga_trabalho
      agregado[tipo].tendencias[kpi.tendencia]++
    })

    // Converter para médias
    const resultado: Record<string, any> = {}
    Object.entries(agregado).forEach(([tipo, dados]) => {
      resultado[tipo] = {
        count: dados.count,
        equilibrio_medio: Math.round(dados.equilibrio_total / dados.count),
        bem_estar_medio: Math.round(dados.bem_estar_total / dados.count),
        carga_media: Math.round(dados.carga_total / dados.count),
        tendencias: {
          melhorando: dados.tendencias.melhorando,
          estavel: dados.tendencias.estavel,
          piorando: dados.tendencias.piorando,
        },
      }
    })

    return resultado
  }

  /**
   * Coleta dados de múltiplos portais e unifica
   */
  static unificarDadosMultiPortal(
    dados_portal_tarefas: any,
    dados_portal_marketing: any,
    dados_portal_obras: any,
    dados_portal_suprimentos: any
  ): {
    kpis_consolidadas: HumanKPI[]
    alertas_consolidadas: string[]
    health_score_consolidado: number
  } {
    const kpis_consolidadas: HumanKPI[] = []

    // Mapear dados de cada portal para formato padronizado
    if (dados_portal_tarefas?.colaboradores) {
      dados_portal_tarefas.colaboradores.forEach((col: any) => {
        kpis_consolidadas.push({
          id: `collab_${col.id}`,
          actor_id: col.id,
          actor_tipo: ActorTipo.COLABORADOR,
          empresa_id: col.empresa_id,
          carga_trabalho: col.tarefas_abertas ? Math.min(100, (col.tarefas_abertas / 5) * 20) : 0,
          tarefas_abertas: col.tarefas_abertas || 0,
          prazos_apertados: col.prazos_apertados || 0,
          tempo_resposta_medio: col.tempo_resposta_medio || 30,
          tempo_offline: col.tempo_offline || 40,
          pausas_realizadas: col.pausas_realizadas || 50,
          engajamento_voluntario: col.engajamento || 50,
          horas_extras_estimadas: col.horas_extras || 0,
          equilibrio: col.equilibrio || 50,
          score_bem_estar: col.bem_estar || 50,
          tendencia: 'estavel',
          created_at: new Date(),
        })
      })
    }

    if (dados_portal_suprimentos?.fornecedores) {
      dados_portal_suprimentos.fornecedores.forEach((forn: any) => {
        kpis_consolidadas.push({
          id: `forn_${forn.id}`,
          actor_id: forn.id,
          actor_tipo: ActorTipo.FORNECEDOR,
          empresa_id: forn.empresa_id,
          carga_trabalho: Math.min(100, (forn.volume_excessivo || 0) * 0.8),
          tarefas_abertas: forn.pedidos_pendentes || 0,
          prazos_apertados: forn.prazos_apertados || 0,
          tempo_resposta_medio: forn.tempo_resposta || 48,
          tempo_offline: forn.tempo_descanso || 20,
          pausas_realizadas: 0,
          engajamento_voluntario: 50,
          horas_extras_estimadas: 0,
          equilibrio: forn.equilibrio_score || 50,
          score_bem_estar: forn.bem_estar || 50,
          tendencia: 'estavel',
          created_at: new Date(),
        })
      })
    }

    // Calcular health score consolidado
    const health_componentes = {
      equipe: kpis_consolidadas
        .filter((k) => k.actor_tipo === ActorTipo.COLABORADOR)
        .reduce((acc, k) => acc + k.equilibrio, 0) / Math.max(1, kpis_consolidadas.filter((k) => k.actor_tipo === ActorTipo.COLABORADOR).length),
      fornecedores: kpis_consolidadas
        .filter((k) => k.actor_tipo === ActorTipo.FORNECEDOR)
        .reduce((acc, k) => acc + k.equilibrio, 0) / Math.max(1, kpis_consolidadas.filter((k) => k.actor_tipo === ActorTipo.FORNECEDOR).length),
      parceiros: 70, // Placeholder
      clientes: 75, // Placeholder
    }

    const saude = this.calcularSaudeEcossistema(health_componentes)

    return {
      kpis_consolidadas,
      alertas_consolidadas: saude.alertas,
      health_score_consolidado: saude.health_score,
    }
  }
}
