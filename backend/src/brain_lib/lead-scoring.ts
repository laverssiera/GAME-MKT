export type LeadStatus = 'frio' | 'morno' | 'quente'

export interface LeadScoringInput {
  total_interacoes: number
  tempo_navegacao: number
  origem: string
  engajamento_porcento: number
  dias_ultima_atividade: number
  clique_proposta: boolean
  compartilhamento: boolean
  interacao_chat: number
}

export interface LeadScore {
  lead_id: string
  score: number
  status: LeadStatus
  confianca: number
  timestamp: Date
  justificativa: string
  proxima_acao?: string
}

export interface WeightedFactors {
  interacoes: number
  tempo: number
  origem: number
  engajamento: number
  recencia: number
  qualidade: number
}

const LEAD_SCORE_WEIGHTS: WeightedFactors = {
  interacoes: 0.15,
  tempo: 0.15,
  origem: 0.1,
  engajamento: 0.25,
  recencia: 0.2,
  qualidade: 0.15,
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

const fuzzyTempo = (segundos: number): number => {
  if (segundos < 30) return 0.2
  if (segundos < 120) return 0.5
  if (segundos < 300) return 0.8
  if (segundos < 600) return 0.95
  return 1
}

const fuzzyOrigem = (origem: string): number => {
  const qualidade: Record<string, number> = {
    organico: 1,
    referral: 0.9,
    anuncio_retarget: 0.7,
    anuncio_cold: 0.6,
    anuncio: 0.6,
    direta: 0.5,
    unknown: 0.3,
  }

  return qualidade[(origem || 'unknown').toLowerCase()] ?? 0.3
}

const fuzzyRecencia = (dias: number): number => {
  if (dias <= 1) return 1
  if (dias <= 3) return 0.9
  if (dias <= 7) return 0.7
  if (dias <= 15) return 0.4
  if (dias <= 30) return 0.2
  return 0.05
}

const classificarStatus = (score: number): LeadStatus => {
  if (score >= 70) return 'quente'
  if (score >= 40) return 'morno'
  return 'frio'
}

const gerarJustificativa = (input: LeadScoringInput): string => {
  const fatores: string[] = []

  if (input.total_interacoes > 20) fatores.push('Muitas interações')
  if (input.tempo_navegacao > 300) fatores.push('Tempo longo de navegação')
  if (input.origem === 'organico') fatores.push('Lead orgânico (qualidade alta)')
  if (input.engajamento_porcento > 70) fatores.push('Engajamento alto')
  if (input.dias_ultima_atividade <= 2) fatores.push('Atividade recente')
  if (input.clique_proposta) fatores.push('Clicou na proposta')
  if (input.compartilhamento) fatores.push('Compartilhou o conteúdo')
  if (input.interacao_chat > 5) fatores.push('Interagiu bastante no chat')

  if (fatores.length === 0) {
    return 'Lead com poucas sinais de interesse'
  }

  return fatores.join(', ')
}

const sugerirAcao = (status: LeadStatus): string => {
  switch (status) {
    case 'quente':
      return 'Prospeccionar agora via ligação ou Whatsapp'
    case 'morno':
      return 'Enviar email educativo, nutrir com conteúdo'
    case 'frio':
      return 'Nutrir com campanha automática, reengajar em 14 dias'
  }
}

const calcularFatores = (input: LeadScoringInput): WeightedFactors => {
  const fator_interacoes = clamp01(input.total_interacoes / 50)
  const fator_tempo = fuzzyTempo(input.tempo_navegacao)
  const fator_origem = fuzzyOrigem(input.origem)
  const fator_engajamento = clamp01(input.engajamento_porcento / 100)
  const fator_recencia = fuzzyRecencia(input.dias_ultima_atividade)
  const fator_qualidade = clamp01(
    (input.clique_proposta ? 0.4 : 0) + (input.compartilhamento ? 0.3 : 0) + (input.interacao_chat / 10) * 0.3
  )

  return {
    interacoes: fator_interacoes,
    tempo: fator_tempo,
    origem: fator_origem,
    engajamento: fator_engajamento,
    recencia: fator_recencia,
    qualidade: fator_qualidade,
  }
}

const calcularConfianca = (input: LeadScoringInput): number => {
  const confianca = (input.total_interacoes + input.tempo_navegacao / 60 + (input.interacao_chat ? 1 : 0)) / 20
  return clamp01(confianca)
}

export const calcularLeadScore = (lead_id: string, input: LeadScoringInput, timestamp: Date = new Date()): LeadScore => {
  const fatores = calcularFatores(input)

  const scoreBruto =
    fatores.interacoes * LEAD_SCORE_WEIGHTS.interacoes +
    fatores.tempo * LEAD_SCORE_WEIGHTS.tempo +
    fatores.origem * LEAD_SCORE_WEIGHTS.origem +
    fatores.engajamento * LEAD_SCORE_WEIGHTS.engajamento +
    fatores.recencia * LEAD_SCORE_WEIGHTS.recencia +
    fatores.qualidade * LEAD_SCORE_WEIGHTS.qualidade

  const score = Math.round(clamp01(scoreBruto) * 100)
  const status = classificarStatus(score)

  return {
    lead_id,
    score,
    status,
    confianca: calcularConfianca(input),
    timestamp,
    justificativa: gerarJustificativa(input),
    proxima_acao: sugerirAcao(status),
  }
}

export const calcularLeadScoreLote = (
  leads: Array<{
    lead_id: string
    input: LeadScoringInput
  }>
): LeadScore[] => {
  return leads.map(({ lead_id, input }) => calcularLeadScore(lead_id, input))
}

export const rankingLeadScores = (scores: LeadScore[], top: number = 10): LeadScore[] => {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, top)
}

export const filtrarLeadScoresPorStatus = (scores: LeadScore[], status: LeadStatus): LeadScore[] => {
  return scores.filter((score) => score.status === status)
}
