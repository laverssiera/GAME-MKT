/**
 * EPIC 8 - Insights Automáticos
 * Motor de geração de alertas e insights inteligentes
 */

import { KPIResult } from '../types/metric'

export type NivelImportancia = 'critico' | 'atenção' | 'oportunidade'

export interface Insight {
  id: string
  titulo: string
  descricao: string
  tipo: string // anomalia, tendencia, oportunidade, alerta
  nivel: NivelImportancia
  metricas_envolvidas: string[]
  valor_esperado?: number
  valor_atual: number
  recomendacao: string
  acao_john?: string
  timestamp: Date
}

export interface AnomaliaDeteccao {
  metrica: string
  valor_atual: number
  valor_medio: number
  desvio_padrao: number
  z_score: number // quantos desvios padrão longe da média
  eh_anomalia: boolean
}

export class MotorInsights {
  /**
   * Detecta anomalias em métrica (baseado em Z-score)
   */
  static detectarAnomalia(
    metrica: string,
    valor_atual: number,
    historico: number[],
    threshold_z: number = 2.5
  ): AnomaliaDeteccao {
    const media = historico.reduce((a, b) => a + b, 0) / historico.length
    const variancia = historico.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / historico.length
    const desvio_padrao = Math.sqrt(variancia)

    const z_score = desvio_padrao > 0 ? (valor_atual - media) / desvio_padrao : 0

    return {
      metrica,
      valor_atual,
      valor_medio: media,
      desvio_padrao,
      z_score,
      eh_anomalia: Math.abs(z_score) > threshold_z,
    }
  }

  /**
   * Gera insight de anomalia
   */
  static criarInsightAnomalia(anomalia: AnomaliaDeteccao): Insight {
    const direcao = anomalia.z_score > 0 ? 'SUBIU' : 'CAIU'
    const percentual = Math.abs(((anomalia.valor_atual - anomalia.valor_medio) / anomalia.valor_medio) * 100).toFixed(1)

    let nivel: NivelImportancia = 'atenção'
    if (Math.abs(anomalia.z_score) > 4) nivel = 'critico'
    if (Math.abs(anomalia.z_score) > 5) nivel = 'critico'

    return {
      id: `insight_${Date.now()}`,
      titulo: `${anomalia.metrica} ${direcao} ${percentual}%`,
      descricao: `A métrica ${anomalia.metrica} saiu do padrão. Valor atual: ${anomalia.valor_atual.toFixed(2)}, Média histórica: ${anomalia.valor_medio.toFixed(2)}`,
      tipo: 'anomalia',
      nivel,
      metricas_envolvidas: [anomalia.metrica],
      valor_esperado: anomalia.valor_medio,
      valor_atual: anomalia.valor_atual,
      recomendacao: this.recomendarAnomalia(anomalia.metrica, anomalia.z_score > 0),
      acao_john: this.acaoJohnAnomalia(anomalia.metrica, anomalia.z_score > 0),
      timestamp: new Date(),
    }
  }

  /**
   * Detecta padrões e correlações entre métricas
   */
  static detectarCorrelacao(
    metrica1: { tipo: string; valor: number; historico: number[] },
    metrica2: { tipo: string; valor: number; historico: number[] }
  ): {
    correlacao: number
    insight?: string
  } {
    // Correlação de Pearson simplificada
    const n = Math.min(metrica1.historico.length, metrica2.historico.length)
    if (n < 2) return { correlacao: 0 }

    const h1 = metrica1.historico.slice(-n)
    const h2 = metrica2.historico.slice(-n)

    const media1 = h1.reduce((a, b) => a + b, 0) / n
    const media2 = h2.reduce((a, b) => a + b, 0) / n

    const cov = h1.reduce((acc, val1, i) => acc + (val1 - media1) * (h2[i] - media2), 0) / n

    const var1 = h1.reduce((acc, val) => acc + Math.pow(val - media1, 2), 0) / n
    const var2 = h2.reduce((acc, val) => acc + Math.pow(val - media2, 2), 0) / n

    const correlacao = Math.sqrt(var1) * Math.sqrt(var2) > 0 ? cov / (Math.sqrt(var1) * Math.sqrt(var2)) : 0

    // Detecta padrões conhecidos
    let insight: string | undefined
    if (correlacao > 0.7 && metrica1.tipo === 'CTR' && metrica2.tipo === 'conversao') {
      insight = 'CTR e Conversão estão correlacionadas positivamente - bom sinal!'
    }
    if (correlacao < -0.6 && metrica1.tipo === 'CAC' && metrica2.tipo === 'conversao') {
      insight = 'CAC subindo enquanto conversão cai - algo está errado!'
    }

    return { correlacao, insight }
  }

  /**
   * Analisa portfólio de métricas e gera insights consolidados
   */
  static analisarPortfolio(
    kpis: KPIResult[],
    historicosPorTipo: Record<string, number[]>
  ): Insight[] {
    const insights: Insight[] = []

    // 1. Detecta anomalias
    for (const kpi of kpis) {
      const historico = historicosPorTipo[kpi.tipo] || [kpi.valor]
      const anomalia = this.detectarAnomalia(kpi.tipo, kpi.valor, historico)

      if (anomalia.eh_anomalia) {
        insights.push(this.criarInsightAnomalia(anomalia))
      }
    }

    // 2. Detecta padrões conhecidos
    const cac = kpis.find((k) => k.tipo === 'CAC')
    const conversao = kpis.find((k) => k.tipo === 'conversao')
    const roi = kpis.find((k) => k.tipo === 'ROI')
    const ltv = kpis.find((k) => k.tipo === 'LTV')

    // Padrão: CAC alto + Conversão baixa = problema no funil
    if (cac && conversao && cac.valor > 300 && conversao.valor < 3) {
      insights.push({
        id: `insight_${Date.now()}`,
        titulo: 'Funil de Vendas Comprometido',
        descricao: 'CAC alto com conversão baixa indica problema no funil de vendas',
        tipo: 'alerta',
        nivel: 'critico',
        metricas_envolvidas: ['CAC', 'conversao'],
        valor_atual: cac.valor,
        valor_esperado: 200,
        recomendacao: 'Revisa landing page, copy, call-to-action e timing do pitch',
        acao_john: 'Ó, seu funil tá entupido meu amigo! CAC alto + conversão baixa = problema sério.',
        timestamp: new Date(),
      })
    }

    // Padrão: ROI negativo
    if (roi && roi.valor < 0) {
      insights.push({
        id: `insight_${Date.now()}`,
        titulo: 'ROI Negativo - Campanha em Prejuízo',
        descricao: `Campanha gerando prejuízo. ROI: ${roi.valor.toFixed(2)}%`,
        tipo: 'alerta',
        nivel: 'critico',
        metricas_envolvidas: ['ROI'],
        valor_atual: roi.valor,
        recomendacao: 'Pausa campanhas de baixo ROI imediatamente',
        acao_john: 'Meu deus, tá perdendo dinheiro! Pausa isso agora mesmo!',
        timestamp: new Date(),
      })
    }

    // Padrão: LTV/CAC ratio ruim
    if (ltv && cac && ltv.valor > 0 && cac.valor > 0) {
      const ratio = ltv.valor / cac.valor
      if (ratio < 2) {
        insights.push({
          id: `insight_${Date.now()}`,
          titulo: 'Relação LTV/CAC Insuficiente',
          descricao: `Relação LTV/CAC = ${ratio.toFixed(1)}x. Ideal é > 3x`,
          tipo: 'atenção',
          nivel: 'atenção',
          metricas_envolvidas: ['LTV', 'CAC'],
          valor_atual: ratio,
          valor_esperado: 3,
          recomendacao: 'Foca em retenção para aumentar LTV ou reduz CAC',
          acao_john: 'Cliente não tá valendo o suficiente comparado com o custo. Bora aumentar retenção.',
          timestamp: new Date(),
        })
      }
    }

    // 3. Oportunidades
    if (conversao && conversao.valor > 10) {
      insights.push({
        id: `insight_${Date.now()}`,
        titulo: 'Oportunidade: Conversão Acima da Média',
        descricao: `Conversão em ${conversao.valor.toFixed(2)}% - acima da média do mercado (5-8%)`,
        tipo: 'oportunidade',
        nivel: 'oportunidade',
        metricas_envolvidas: ['conversao'],
        valor_atual: conversao.valor,
        recomendacao: 'Documenta essa estratégia e replica em outras campanhas. Scale gastos!',
        acao_john: 'Tá fechando bonito! Essa estratégia tá funcionando de verdade.',
        timestamp: new Date(),
      })
    }

    // Ordena por importância
    return insights.sort((a, b) => {
      const ordem = { critico: 0, atenção: 1, oportunidade: 2 }
      return ordem[a.nivel] - ordem[b.nivel]
    })
  }

  private static recomendarAnomalia(metrica: string, subiu: boolean): string {
    if (subiu) {
      return `${metrica} subiu mais que o normal. Investi gra, vê se o resultado corresponde.`
    }
    return `${metrica} caiu mais que o normal. Vê o que mudou nas últimas operações.`
  }

  private static acaoJohnAnomalia(metrica: string, subiu: boolean): string {
    if (subiu) {
      return `Ó, ${metrica} disparou! Algo mudou lá. Bora analisar?`
    }
    return `${metrica} caiu demais, colega. Tá estranho isso aí.`
  }
}
