/**
 * EPIC 1 - Motor de Indicadores de Marketing
 * Schema unificado para métricas do ecossistema
 */

export enum MetricCategory {
  AQUISICAO = 'aquisicao',
  ENGAJAMENTO = 'engajamento',
  CONVERSAO = 'conversao',
  VALOR = 'valor',
  SATISFACAO = 'satisfacao',
}

export interface Metric {
  id: string
  empresa_id: string
  portal_id?: string
  tipo: string // CAC, LTV, CTR, conversao, ticket_medio, roi, etc
  categoria: MetricCategory
  valor: number
  origem: string // sistema que originou (portal_cliente, api_externa, calculo, etc)
  metadata?: Record<string, any>
  created_at: Date
  updated_at?: Date
}

export interface KPIResult {
  tipo: string
  valor: number
  unidade: string
  categoria: MetricCategory
  timestamp: Date
  empresa_id: string
}

export interface MetricaHistorico {
  metrica_id: string
  valores: { timestamp: Date; valor: number }[]
  tendencia: 'subindo' | 'descendo' | 'estavel'
}
