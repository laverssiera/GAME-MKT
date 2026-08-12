const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export interface KpiItem {
  tipo: string
  valor: number
  unidade: string
}

export interface LeadScoreResult {
  lead_id: string
  score: number
  status: 'frio' | 'morno' | 'quente'
  confianca: number
  justificativa: string
}

export interface InsightItem {
  id: string
  titulo: string
  descricao: string
  nivel: 'critico' | 'atenção' | 'oportunidade'
  recomendacao: string
}

export interface HumanizedMetric {
  tecnico: string
  descricao: string
  categoria: string
}

export interface WellbeingAlert {
  id: string
  tipo: 'sobrecarga' | 'cansaco' | 'pressao' | 'desbalanceio'
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  mensagem: string
  acao_sugerida: string
}

export interface Medalha {
  id: string
  nome: string
  categoria: string
  descricao: string
}

export interface TrackingSummary {
  user_id: string
  total_eventos: number
  tempo_total_navegacao: number
  taxa_retorno: number
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.erro || `Falha na requisicao: ${path}`)
  }

  return data as T
}

export function useGameMktApi() {
  const getMultiKpis = () => request<{ kpis: KpiItem[]; timestamp: string }>('/api/kpis/multi')

  const calculateLeadScore = (payload: {
    lead_id: string
    total_interacoes: number
    tempo_navegacao: number
    origem: string
    engajamento_porcento: number
    dias_ultima_atividade: number
    clique_proposta: boolean
    compartilhamento: boolean
    interacao_chat: number
  }) => request<LeadScoreResult>('/api/leads/score', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const analyzeInsights = (payload: {
    kpis: KpiItem[]
    historicosPorTipo: Record<string, number[]>
  }) => request<{ total_insights: number; insights: InsightItem[] }>('/api/insights/analisar', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const getHumanizedMetrics = async () => {
    const data = await request<Record<string, HumanizedMetric>>('/api/metricas')
    return Object.values(data)
  }

  const getWellbeingAlerts = (payload: {
    actor_id: string
    actor_tipo: 'colaborador' | 'fornecedor' | 'parceiro' | 'cliente'
    equilibrio_status: 'saudavel' | 'saudável' | 'atencao' | 'atenção' | 'sobrecarga'
    carga_trabalho: number
    produtividade: number
    tempo_offline: number
    horas_extras: number
    tendencia: 'melhorando' | 'estavel' | 'piorando'
  }) => request<{ alertas: WellbeingAlert[]; total: number }>('/api/wellbeing/alertas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const getMedalhas = (payload: {
    usuario_id: string
    actor_tipo: 'colaborador' | 'fornecedor' | 'parceiro' | 'cliente'
    metricas: Record<string, number>
  }) => request<{ medalhas_conquistadas: Medalha[]; total: number }>('/api/wellbeing/medalhas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const trackEvent = (payload: {
    tipo: string
    empresa_id: string
    user_id?: string
    lead_id?: string
    session_id?: string
    url?: string
    metadata?: Record<string, unknown>
    duracao_ms?: number
  }) => request<{ success: boolean }>('/api/tracking/evento', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const getTrackingSummary = (userId: string) =>
    request<TrackingSummary>(`/api/tracking/resumo/${encodeURIComponent(userId)}`)

  return {
    getMultiKpis,
    calculateLeadScore,
    analyzeInsights,
    getHumanizedMetrics,
    getWellbeingAlerts,
    getMedalhas,
    trackEvent,
    getTrackingSummary,
  }
}
