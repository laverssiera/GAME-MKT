/**
 * EPIC 1 & 2 - Cálculos de KPIs Padrão
 * CAC, LTV, CTR, Conversão, Ticket Médio, ROI
 */

import { KPIResult, MetricCategory } from '../types/metric'

export interface KPIInputs {
  custo_campanha?: number
  leads_gerados?: number
  clientes_convertidos?: number
  receita_cliente?: number
  valor_medio_ticket?: number
  cliques?: number
  impressoes?: number
  roi_investimento?: number
  tempo_medio_navegacao?: number
  taxa_engajamento?: number
}

export class KPICalculator {
  /**
   * CAC = Custo de Aquisição de Cliente
   * Fórmula: Custo da Campanha / Clientes Convertidos
   */
  static calcularCAC(custo_campanha: number, clientes_convertidos: number): KPIResult {
    return {
      tipo: 'CAC',
      valor: clientes_convertidos > 0 ? custo_campanha / clientes_convertidos : 0,
      unidade: 'R$',
      categoria: MetricCategory.AQUISICAO,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * LTV = Life Time Value
   * Fórmula: (Valor Médio Ticket × Frequência de Compra × Tempo de Relacionamento) / Taxa de Churn
   * Simplificado: Receita Total / Clientes Únicos
   */
  static calcularLTV(receita_total: number, clientes_unicos: number, tempo_meses: number = 12): KPIResult {
    const ltv = clientes_unicos > 0 ? (receita_total / clientes_unicos) * tempo_meses : 0
    return {
      tipo: 'LTV',
      valor: ltv,
      unidade: 'R$',
      categoria: MetricCategory.VALOR,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * CTR = Click Through Rate
   * Fórmula: (Cliques / Impressões) × 100
   */
  static calcularCTR(cliques: number, impressoes: number): KPIResult {
    const ctr = impressoes > 0 ? (cliques / impressoes) * 100 : 0
    return {
      tipo: 'CTR',
      valor: ctr,
      unidade: '%',
      categoria: MetricCategory.ENGAJAMENTO,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * Taxa de Conversão
   * Fórmula: (Leads Convertidos / Leads Totais) × 100
   */
  static calcularConversao(convertidos: number, total_leads: number): KPIResult {
    const taxa = total_leads > 0 ? (convertidos / total_leads) * 100 : 0
    return {
      tipo: 'conversao',
      valor: taxa,
      unidade: '%',
      categoria: MetricCategory.CONVERSAO,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * Ticket Médio
   * Fórmula: Receita Total / Número de Vendas
   */
  static calcularTicketMedio(receita_total: number, num_vendas: number): KPIResult {
    const ticket = num_vendas > 0 ? receita_total / num_vendas : 0
    return {
      tipo: 'ticket_medio',
      valor: ticket,
      unidade: 'R$',
      categoria: MetricCategory.VALOR,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * ROI = Return on Investment
   * Fórmula: ((Ganho - Investimento) / Investimento) × 100
   */
  static calcularROI(ganho: number, investimento: number): KPIResult {
    const roi = investimento > 0 ? ((ganho - investimento) / investimento) * 100 : 0
    return {
      tipo: 'ROI',
      valor: roi,
      unidade: '%',
      categoria: MetricCategory.VALOR,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * Relação LTV/CAC
   * Ideal: > 3 (quanto mais alto, melhor)
   */
  static calcularRatioLTVvsCAC(ltv: number, cac: number): KPIResult {
    const ratio = cac > 0 ? ltv / cac : 0
    return {
      tipo: 'ltv_cac_ratio',
      valor: ratio,
      unidade: 'x',
      categoria: MetricCategory.VALOR,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }

  /**
   * Engajamento Geral (0-100)
   * Média: CTR + Taxa de Retorno + Interações
   */
  static calcularEngajamento(
    ctr: number,
    taxa_retorno: number,
    interacoes: number,
    max_interacoes: number = 100
  ): KPIResult {
    const engajamento_normalizado = Math.min(100, ((ctr / 100) * 40 + (taxa_retorno / 100) * 30 + (interacoes / max_interacoes) * 30))
    return {
      tipo: 'engajamento_geral',
      valor: engajamento_normalizado,
      unidade: '%',
      categoria: MetricCategory.ENGAJAMENTO,
      timestamp: new Date(),
      empresa_id: 'default',
    }
  }
}
