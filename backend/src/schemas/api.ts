import { z } from 'zod'

const anyObject = z.object({}).passthrough()

export const authTokenSchema = z.object({
  user_id: z.string().min(1).default('system'),
  role: z.string().min(1).default('admin'),
  api_key: z.string().optional(),
})

export const kpiCalculateSchema = z.object({
  tipo: z.enum(['CAC', 'LTV', 'CTR', 'conversao', 'ticket_medio', 'ROI', 'engajamento']),
  custo_campanha: z.coerce.number().finite().optional(),
  leads_gerados: z.coerce.number().finite().optional(),
  clientes_convertidos: z.coerce.number().finite().optional(),
  receita_cliente: z.coerce.number().finite().optional(),
  valor_medio_ticket: z.coerce.number().finite().optional(),
  cliques: z.coerce.number().finite().optional(),
  impressoes: z.coerce.number().finite().optional(),
  roi_investimento: z.coerce.number().finite().optional(),
  receita_total: z.coerce.number().finite().optional(),
})

export const fuzzyPesosSchema = z
  .object({
    retorno_site: z.coerce.number().min(0).max(1).optional(),
    tempo_navegacao: z.coerce.number().min(0).max(1).optional(),
    clique_proposta: z.coerce.number().min(0).max(1).optional(),
    compartilhamento: z.coerce.number().min(0).max(1).optional(),
    interacao_chat: z.coerce.number().min(0).max(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    error: 'Informe ao menos um peso para atualização.',
  })

export const johnMessageSchema = z.object({
  tipo: z.string().min(1),
  valor: z.coerce.number().finite(),
  unidade: z.string().default(''),
  tendencia: z.string().optional(),
})

export const trackingEventoSchema = z.object({
  tipo: z.string().min(1),
  empresa_id: z.string().min(1),
  user_id: z.string().min(1),
  lead_id: z.string().optional(),
  session_id: z.string().optional(),
  url: z.string().optional(),
  metadata: anyObject.optional(),
  duracao_ms: z.coerce.number().finite().optional(),
})

export const trackingBatchSchema = z.object({
  eventos: z.array(anyObject).min(1).max(100),
})

export const leadsRankingSchema = z.object({
  leads: z.array(anyObject).min(1).max(200),
  top: z.coerce.number().int().min(1).max(200).default(10),
})

export const insightsAnomaliaSchema = z.object({
  metrica: z.string().min(1),
  valor_atual: z.coerce.number().finite(),
  historico: z.array(z.coerce.number().finite()),
})

export const editorialCreateSchema = z.object({
  empresa_id: z.string().optional(),
  titulo: z.string().min(1),
  subtitulo: z.string().optional(),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  nivel: z.string().optional(),
  autores: z.array(z.string()).optional(),
  revisores: z.array(z.string()).optional(),
  formatos_publicacao: z.array(z.string()).optional(),
  inteligencia_origem_id: z.string().optional(),
})

export const johnJourneySchema = z.object({
  type: z.enum(['editorial_view', 'campaign_interaction', 'lead_detected']),
  topic: z.string().optional(),
  time: z.coerce.number().min(0).optional(),
  scroll: z.coerce.number().min(0).max(100).optional(),
  clicks: z.coerce.number().min(0).optional(),
  engagement: z.coerce.number().min(0).max(100).optional(),
  lead_id: z.string().optional(),
  needs_mae_decision: z.boolean().optional(),
  budget_impact: z.coerce.number().min(0).optional(),
  strategy_change: z.boolean().optional(),
  lead_prioritization: z.boolean().optional(),
  cross_ecossistema: z.boolean().optional(),
  mae_reason: z.string().optional(),
})

export const johnEditorialAnalyzeSchema = z.object({
  topic: z.string().min(1),
  time: z.coerce.number().min(0),
  scroll: z.coerce.number().min(0).max(100),
  clicks: z.coerce.number().min(0),
})

export const johnEditorialRecommendSchema = z.object({
  topic: z.string().min(1),
  interest_score: z.coerce.number().min(0).optional(),
})

export const johnCampaignTriggerSchema = z.object({
  engagement: z.coerce.number().min(0).max(100),
  topic: z.string().optional(),
})

export const johnCampaignOptimizeSchema = z.object({
  cpc: z.coerce.number().min(0).optional(),
  ctr: z.coerce.number().min(0).optional(),
  conversao: z.coerce.number().min(0).optional(),
})

export const johnCrmCreateLeadSchema = z.object({
  topic: z.string().min(1),
  source: z.string().min(1).default('editorial'),
  interest_score: z.coerce.number().min(0).optional(),
  user_id: z.string().optional(),
})

export const johnCrmNurtureSchema = z.object({
  lead_id: z.string().min(1),
  topic: z.string().optional(),
})

export const johnCrmPromoteSchema = z.object({
  lead_id: z.string().min(1),
  engagement: z.coerce.number().min(0).max(100).optional(),
  score: z.coerce.number().min(0).max(100).optional(),
})

export const maeDecisionSchema = z.object({
  monolito: z.string().min(1),
  area: z.string().min(1),
  context: z.object({
    kpi: z.string().min(1),
    valor: z.coerce.number().finite(),
    meta: z.coerce.number().finite(),
  }),
})

export const maeJourneySchema = z.object({
  monolito: z.string().min(1),
  tipo: z.string().min(1),
  topic: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
  lead_id: z.string().min(1),
})

export const maeLeadSchema = z.object({
  lead_id: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
  origem: z.string().min(1),
  interesse: z.string().min(1),
})

export const maeKpisSchema = z.object({
  campanha: z.string().min(1),
  cac: z.coerce.number().finite(),
  ltv: z.coerce.number().finite(),
  editorial_engagement: z.coerce.number().min(0).max(100),
})

export const maeJourneyContextSchema = z.object({
  lead_id: z.string().min(1),
  etapa: z.string().min(1),
  conteudos_consumidos: z.coerce.number().int().min(0),
  score: z.coerce.number().min(0).max(100),
})

export const fromMaeDecisionSchema = z.object({
  action: z.string().min(1),
  target: z.string().min(1),
  budget: z.coerce.number().min(0),
})

export const fromMaeEditorialSchema = z.object({
  action: z.string().min(1),
  tema: z.string().min(1),
  prioridade: z.enum(['baixa', 'media', 'alta']),
})

export const fromMaeLeadRoutingSchema = z.object({
  lead_id: z.string().min(1),
  destino: z.string().min(1),
})

export const fromMaeCampaignSchema = z.object({
  action: z.string().min(1),
  campanha: z.string().min(1),
  percentual: z.coerce.number().finite(),
})
