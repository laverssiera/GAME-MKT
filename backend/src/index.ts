/**
 * GAME MKT Intelligence Engine - Server Principal
 * APIs para todos os 10 EPICs
 */

import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticateJWT, issueAccessToken, requireRoles } from './middlewares/auth'
import { validateBody } from './middlewares/validate'

// Importar serviços
import { KPICalculator } from './services/kpi-calculator'
import { FuzzyMotor } from './services/fuzzy-motor'
import { DicionarioMetricas } from './services/dicionario-metricas'
import { MotorMensagensJohn } from './services/motor-mensagens-john'
import { ColesorEventos, EventoTipo } from './services/colesor-eventos'
import { LeadScorer } from './services/lead-scorer'
import { emitLeadCreatedEvent } from './brain_lib/core-dna-events'
import { MotorInsights } from './services/motor-insights'
import { HumanKPICalculator } from './services/human-kpi-calculator'
import { MotorDecisaoHumano } from './services/motor-decisao-humano'
import { MotorAlertasHumanos } from './services/motor-alertas-humanos'
import { GamificacaoSaudavel } from './services/gamificacao-saudavel'
import { MotorSaudeEcossistema } from './services/motor-saude-ecossistema'
import { EditorialEngine } from './services/editorial-engine'
import { JohnGameMkt } from './john/john-game-mkt'
import { EquilibrioStatus } from './types/wellbeing'
import {
  CategoriaEducacional,
  NivelComplexidade,
  OrigemColaboracaoGlobal,
  PipelineEditorialStatus,
} from './types/editorial'
import {
  authTokenSchema,
  editorialCreateSchema,
  fromMaeCampaignSchema,
  fromMaeDecisionSchema,
  fromMaeEditorialSchema,
  fromMaeLeadRoutingSchema,
  fuzzyPesosSchema,
  insightsAnomaliaSchema,
  johnCampaignOptimizeSchema,
  johnCampaignTriggerSchema,
  johnCrmCreateLeadSchema,
  johnCrmNurtureSchema,
  johnCrmPromoteSchema,
  johnEditorialAnalyzeSchema,
  johnEditorialRecommendSchema,
  johnJourneySchema,
  johnMessageSchema,
  kpiCalculateSchema,
  leadsRankingSchema,
  maeDecisionSchema,
  maeJourneySchema,
  maeJourneyContextSchema,
  maeKpisSchema,
  maeLeadSchema,
  trackingBatchSchema,
  trackingEventoSchema,
} from './schemas/api'
import { RateLimitService } from './services/rate-limit-service'

// ── Novos serviços (Issues 1-26) ──────────────────────────────────────────────
import { getGameMktIdentity, GAME_MKT_CORE_DNA } from './services/game-mkt-role'
import { leadToKanbanTask, applyLeadBehaviorToTask } from './services/kanban-bridge'
import { natsEventBus } from './services/nats-event-bus'
import { applyCefeidaIntelligence, applyJohnDecision } from './services/cefeida-intelligence'
import { applyHubBudgetApproved, applyHubBudgetLimit, registerCampaignCost, getBudgetState } from './services/hub-budget'
import { checkCampaignCompliance, buildLeadConsentEvent } from './services/juridico-compliance'
import { qualifyLead, calcDynamicScore } from './services/archimedes-bridge'
import { trackLeadForSla, markLeadContacted, checkSlaRisk, findColdLeadsForReactivation } from './services/sla-engine'
import { scoreCampaign, rankChannels, rankCreatives } from './services/campaign-gamification'
import { recordTradingEvent, getTradingDeskSnapshot, calcKanbanPipelineImpact } from './services/trading-desk'
import { assertAllowed, getGameMktManifest } from './services/hard-rules'
import { emitGameMktRegistered, emitAttributionUpdated } from './brain_lib/core-dna-events'
import { federation } from './federation/federation'
import { RevenueSubjects } from './runtime/revenue.events'
import { registerLeadRelationship } from './graph/revenue.graph'
import { buildUnifiedLeadIdentity } from './runtime/identity.runtime'
import { InterplanetaryMarketEngine } from './runtime/interplanetary.market'
import { HolographicSalesRuntime } from './holographic/holographic.runtime'
import { CampaignAgent } from './agents/campaign.agent'
import { RevenueWarRoom } from './warroom/revenue.warroom'
import { CausalRuntime } from './runtime/causal.runtime'
import { CollectiveAgiHooks } from './collective/collective.hooks'
import { getSchema, validateSchema } from './schemas/schema.registry'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001
const MAX_JSON_BODY = process.env.MAX_JSON_BODY || '200kb'
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120)
const RATE_LIMIT_EXCLUDED_PATHS = new Set(['/health'])
const rateLimitService = new RateLimitService({
  redisUrl: process.env.REDIS_URL,
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: RATE_LIMIT_MAX_REQUESTS,
})

const normalizarEquilibrioStatus = (status: string): EquilibrioStatus => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'saudavel' || normalized === 'saudável') return EquilibrioStatus.SAUDAVEL
  if (normalized === 'atencao' || normalized === 'atenção') return EquilibrioStatus.ATENCAO
  return EquilibrioStatus.SOBRECARGA
}

// Middleware
app.use(cors())
app.use(express.json({ limit: MAX_JSON_BODY }))

// Cabeçalhos simples de hardening sem alterar contratos de API
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  next()
})

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isFiniteNumber = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string' && value.trim() !== '') return Number.isFinite(Number(value))
  return false
}

const validarCamposNumericos = (body: Record<string, unknown>, campos: string[]): string[] => {
  return campos.filter((campo) => body[campo] !== undefined && !isFiniteNumber(body[campo]))
}

const validarBodyObjeto = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload JSON inválido. Envie um objeto JSON.' })
  }

  next()
}

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (RATE_LIMIT_EXCLUDED_PATHS.has(req.path)) {
    return next()
  }

  const forwarded = req.headers['x-forwarded-for']
  const ipRaw = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || 'unknown'
  const ip = String(ipRaw).split(',')[0].trim() || 'unknown'
  const key = `${ip}:${req.path}`

  try {
    const result = await rateLimitService.consume(key)

    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
    res.setHeader('X-RateLimit-Remaining', String(result.remaining))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

    if (!result.allowed) {
      return res.status(429).json({
        erro: 'Muitas requisições. Tente novamente em instantes.',
        retry_after_ms: Math.max(0, result.resetAt - Date.now()),
      })
    }

    return next()
  } catch {
    return res.status(503).json({ erro: 'Serviço de rate limit indisponível no momento.' })
  }
}

const validarKpiCalculate = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido' })
  }

  const { tipo } = req.body
  if (typeof tipo !== 'string' || tipo.trim() === '') {
    return res.status(400).json({ erro: 'Campo "tipo" é obrigatório.' })
  }

  const invalidos = validarCamposNumericos(req.body, [
    'custo_campanha',
    'leads_gerados',
    'clientes_convertidos',
    'receita_cliente',
    'valor_medio_ticket',
    'cliques',
    'impressoes',
    'roi_investimento',
    'receita_total',
  ])

  if (invalidos.length > 0) {
    return res.status(400).json({ erro: `Campos numéricos inválidos: ${invalidos.join(', ')}` })
  }

  next()
}

const validarTrackingEvento = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido' })
  }

  const { tipo, empresa_id, user_id } = req.body
  if (typeof tipo !== 'string' || tipo.trim() === '') {
    return res.status(400).json({ erro: 'Campo "tipo" é obrigatório.' })
  }
  if (typeof empresa_id !== 'string' || empresa_id.trim() === '') {
    return res.status(400).json({ erro: 'Campo "empresa_id" é obrigatório.' })
  }
  if (typeof user_id !== 'string' || user_id.trim() === '') {
    return res.status(400).json({ erro: 'Campo "user_id" é obrigatório.' })
  }

  next()
}

const validarTrackingBatch = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido' })
  }

  const { eventos } = req.body
  if (!Array.isArray(eventos) || eventos.length === 0) {
    return res.status(400).json({ erro: 'Campo "eventos" deve ser um array não vazio.' })
  }
  if (eventos.length > 100) {
    return res.status(400).json({ erro: 'Limite de 100 eventos por batch.' })
  }

  next()
}

const validarLeadsRanking = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido' })
  }

  const { leads } = req.body
  if (!Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ erro: 'Campo "leads" deve ser um array não vazio.' })
  }
  if (leads.length > 200) {
    return res.status(400).json({ erro: 'Limite de 200 leads por requisição.' })
  }

  next()
}

const validarInsightsAnomalia = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido' })
  }

  const { metrica, valor_atual, historico } = req.body
  if (typeof metrica !== 'string' || metrica.trim() === '') {
    return res.status(400).json({ erro: 'Campo "metrica" é obrigatório.' })
  }
  if (!isFiniteNumber(valor_atual)) {
    return res.status(400).json({ erro: 'Campo "valor_atual" deve ser numérico.' })
  }
  if (!Array.isArray(historico)) {
    return res.status(400).json({ erro: 'Campo "historico" deve ser um array.' })
  }

  next()
}

const validarEditorialObra = (req: Request, res: Response, next: NextFunction) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido' })
  }

  if (typeof req.body.titulo !== 'string' || req.body.titulo.trim() === '') {
    return res.status(400).json({ erro: 'Campo "titulo" é obrigatório para criar obra.' })
  }

  next()
}

app.use(rateLimiter)

// Instâncias dos serviços
const colesor = new ColesorEventos()
const interplanetaryMarket = new InterplanetaryMarketEngine()
const holographicSales = new HolographicSalesRuntime()
const campaignAgent = new CampaignAgent()
const revenueWarRoom = new RevenueWarRoom()
const causalRuntime = new CausalRuntime()
const collectiveHooks = new CollectiveAgiHooks()

// ==================== AUTH BASE ====================

/**
 * POST /api/auth/token
 * Gera token JWT para chamadas protegidas.
 */
app.post('/api/auth/token', validateBody(authTokenSchema), (req: Request, res: Response) => {
  const { user_id, role, api_key } = req.body as {
    user_id: string
    role: string
    api_key?: string
  }

  const requiredApiKey = process.env.ADMIN_API_KEY
  if (requiredApiKey && api_key !== requiredApiKey) {
    return res.status(401).json({ erro: 'Credencial inválida para emissão de token.' })
  }

  const token = issueAccessToken({ sub: user_id, role })

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: process.env.JWT_EXPIRES_IN || '8h',
  })
})

/**
 * GET /api/auth/verify
 * Verifica se token atual é válido.
 */
app.get('/api/auth/verify', authenticateJWT, (req: Request, res: Response) => {
  res.json({
    autenticado: true,
    usuario: (req as Request & { auth?: { sub: string; role: string } }).auth,
  })
})

// ==================== EPIC 1 & 2: KPIs ====================

/**
 * POST /api/kpis/calculate
 * Calcula KPIs baseado em inputs
 */
app.post('/api/kpis/calculate', validateBody(kpiCalculateSchema), (req: Request, res: Response) => {
  const {
    tipo,
    custo_campanha,
    leads_gerados,
    clientes_convertidos,
    receita_cliente,
    valor_medio_ticket,
    cliques,
    impressoes,
    roi_investimento,
    receita_total,
  } = req.body

  try {
    let resultado
    switch (tipo) {
      case 'CAC':
        resultado = KPICalculator.calcularCAC(custo_campanha, clientes_convertidos)
        break
      case 'LTV':
        resultado = KPICalculator.calcularLTV(receita_total, clientes_convertidos)
        break
      case 'CTR':
        resultado = KPICalculator.calcularCTR(cliques, impressoes)
        break
      case 'conversao':
        resultado = KPICalculator.calcularConversao(clientes_convertidos, leads_gerados)
        break
      case 'ticket_medio':
        resultado = KPICalculator.calcularTicketMedio(receita_total, clientes_convertidos)
        break
      case 'ROI':
        resultado = KPICalculator.calcularROI(receita_total, custo_campanha)
        break
      case 'engajamento':
        resultado = KPICalculator.calcularEngajamento(cliques / impressoes, 0.1, 5)
        break
      default:
        return res.status(400).json({ erro: 'Tipo de KPI inválido' })
    }

    res.json(resultado)
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
})

/**
 * GET /api/kpis/multi
 * Calcula múltiplos KPIs em um único request
 */
app.get('/api/kpis/multi', (req: Request, res: Response) => {
  const {
    custo_campanha = 5000,
    leads_gerados = 250,
    clientes_convertidos = 20,
    receita_total = 120000,
    cliques = 750,
    impressoes = 25000,
  } = req.query as Record<string, string>

  const kpis = [
    KPICalculator.calcularCAC(Number(custo_campanha), Number(clientes_convertidos)),
    KPICalculator.calcularLTV(Number(receita_total), Number(clientes_convertidos)),
    KPICalculator.calcularCTR(Number(cliques), Number(impressoes)),
    KPICalculator.calcularConversao(Number(clientes_convertidos), Number(leads_gerados)),
    KPICalculator.calcularTicketMedio(Number(receita_total), Number(clientes_convertidos)),
    KPICalculator.calcularROI(Number(receita_total), Number(custo_campanha)),
  ]

  res.json({
    kpis,
    timestamp: new Date(),
  })
})

// ==================== EPIC 2: Fuzzy ====================

/**
 * POST /api/fuzzy/satisfacao
 * Calcula score de satisfação fuzzy
 */
app.post('/api/fuzzy/satisfacao', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    retorno_site = true,
    tempo_navegacao = 300,
    clique_proposta = true,
    compartilhamento = false,
    interacao_chat = 5,
  } = req.body

  const comportamento = {
    retorno_site,
    tempo_navegacao,
    clique_proposta,
    compartilhamento,
    interacao_chat,
    propostas_visualizadas: 0,
    dias_sem_visita: 0,
  }

  const resultado = FuzzyMotor.calcularSatisfacao(comportamento)
  res.json(resultado)
})

/**
 * PUT /api/fuzzy/pesos
 * Atualiza pesos do modelo fuzzy
 */
app.put(
  '/api/fuzzy/pesos',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validateBody(fuzzyPesosSchema),
  (req: Request, res: Response) => {
  const pesos = req.body

  try {
    const validado = FuzzyMotor.validarPesos(pesos)
    res.json({
      message: 'Pesos validados e normalizados',
      pesos: validado,
    })
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
  }
)

// ==================== EPIC 3: Dicionário ====================

/**
 * GET /api/metricas/{tipo}/human
 * Traduz métrica para linguagem humana
 */
app.get('/api/metricas/:tipo/human', (req: Request, res: Response) => {
  const { tipo } = req.params
  const metrica = DicionarioMetricas.traduzir(tipo.toUpperCase())

  if (!metrica) {
    return res.status(404).json({ erro: 'Métrica não encontrada' })
  }

  res.json(metrica)
})

/**
 * GET /api/metricas
 * Lista todas as métricas humanizadas
 */
app.get('/api/metricas', (req: Request, res: Response) => {
  const { categoria } = req.query

  if (categoria) {
    const metricas = DicionarioMetricas.porCategoria(String(categoria))
    return res.json(metricas)
  }

  res.json(DicionarioMetricas.listarTodas())
})

// ==================== EPIC 4: John ====================

/**
 * POST /api/john/gerar-mensagem
 * Gera mensagem do John baseada em contexto de métrica
 */
app.post('/api/john/gerar-mensagem', validateBody(johnMessageSchema), (req: Request, res: Response) => {
  const { tipo, valor, unidade, tendencia } = req.body

  const contexto = {
    tipo,
    valor: Number(valor),
    unidade,
    tendencia,
  }

  const mensagem = MotorMensagensJohn.gerar(contexto)
  res.json(mensagem)
})

/**
 * GET /api/john/template
 * Renderiza template parametrizado
 */
app.get('/api/john/template', (req: Request, res: Response) => {
  const { template, leads = 15, percentual = 25, valor = 3500 } = req.query

  if (!template) {
    return res.json({
      templates: MotorMensagensJohn.TEMPLATES,
      exemplo: 'Use ?template=LEADS_QUENTES&leads=20',
    })
  }

  try {
    const valores = { leads, percentual, valor }
    const resultado = MotorMensagensJohn.template(String(template), valores as any)
    res.json({ resultado })
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
})

// ==================== JOHN GAME MKT: JORNADA UNIFICADA ====================

/**
 * POST /john/game-mkt/journey
 * Orquestra jornada unificada entre editorial, campanha e CRM.
 */
app.post('/john/game-mkt/journey', validateBody(johnJourneySchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.runJourney(req.body)
  res.json(result)
})

/**
 * POST /john/game-mkt/editorial/analyze
 * Analisa interesse editorial e define próxima ação.
 */
app.post(
  '/john/game-mkt/editorial/analyze',
  validateBody(johnEditorialAnalyzeSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.analyzeEditorial(req.body)
    res.json(result)
  }
)

/**
 * POST /john/game-mkt/editorial/recommend
 * Recomenda nutrição editorial personalizada.
 */
app.post(
  '/john/game-mkt/editorial/recommend',
  validateBody(johnEditorialRecommendSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.recommendEditorial(req.body)
    res.json(result)
  }
)

/**
 * POST /john/game-mkt/campaign/trigger
 * Executa lógica operacional de campanha.
 */
app.post(
  '/john/game-mkt/campaign/trigger',
  validateBody(johnCampaignTriggerSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.triggerCampaign(req.body)
    res.json(result)
  }
)

/**
 * POST /john/game-mkt/campaign/optimize
 * Gera recomendações de otimização de campanha.
 */
app.post(
  '/john/game-mkt/campaign/optimize',
  validateBody(johnCampaignOptimizeSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.optimizeCampaign(req.body)
    res.json(result)
  }
)

/**
 * POST /john/game-mkt/crm/create-lead
 * Cria lead operacional no CRM do John.
 */
app.post(
  '/john/game-mkt/crm/create-lead',
  validateBody(johnCrmCreateLeadSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.createLead(req.body)

    const scoreInicial = typeof result.lead.interest_score === 'number' ? result.lead.interest_score : 0
    const statusInicial = scoreInicial >= 70 ? 'quente' : scoreInicial >= 40 ? 'morno' : 'frio'

    const coreDnaEvent = emitLeadCreatedEvent({
      lead_id: result.lead.id,
      origem: result.lead.source,
      score: scoreInicial,
      status: statusInicial,
      confianca: 0.4,
      metadata: {
        topic: result.lead.topic,
        source: result.lead.source,
      },
    })

    const johnHandoff = JohnGameMkt.runJourney({
      type: 'lead_detected',
      lead_id: result.lead.id,
      topic: result.lead.topic,
      lead_prioritization: statusInicial === 'quente',
    })

    res.status(201).json({
      ...result,
      core_dna_event: coreDnaEvent,
      john_handoff: johnHandoff,
    })
  }
)

/**
 * POST /john/game-mkt/crm/nurture
 * Inicia ou continua nutrição editorial automática.
 */
app.post('/john/game-mkt/crm/nurture', validateBody(johnCrmNurtureSchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.nurtureLead(req.body)
  res.json(result)
})

/**
 * POST /john/game-mkt/crm/promote
 * Promove lead para etapa quente quando elegível.
 */
app.post('/john/game-mkt/crm/promote', validateBody(johnCrmPromoteSchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.promoteLead(req.body)
  res.json(result)
})

/**
 * POST /integration/mae/journey
 * Envia evento de jornada editorial para cognição da Mãe.
 */
app.post('/integration/mae/journey', validateBody(maeJourneySchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.maeJourney(req.body)
  res.json(result)
})

/**
 * POST /integration/mae/decision
 * Envia decisão estratégica para a Mãe.
 */
app.post('/integration/mae/decision', validateBody(maeDecisionSchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.maeDecision(req.body)
  res.json(result)
})

/**
 * POST /integration/mae/lead
 * Envia lead qualificado para a Mãe.
 */
app.post('/integration/mae/lead', validateBody(maeLeadSchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.maeLead(req.body)
  res.json(result)
})

/**
 * POST /integration/mae/kpis
 * Envia KPIs de marketing e editorial para a Mãe.
 */
app.post('/integration/mae/kpis', validateBody(maeKpisSchema), (req: Request, res: Response) => {
  const result = JohnGameMkt.maeKpis(req.body)
  res.json(result)
})

/**
 * POST /integration/mae/journey-context
 * Compartilha contexto consolidado da jornada com a Mãe.
 */
app.post(
  '/integration/mae/journey-context',
  validateBody(maeJourneyContextSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.maeJourneyContext(req.body)
    res.json(result)
  }
)

/**
 * POST /integration/from-mae/decision
 * Recebe decisão estratégica da Mãe para execução local.
 */
app.post(
  '/integration/from-mae/decision',
  validateBody(fromMaeDecisionSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.fromMaeDecision(req.body)
    res.json(result)
  }
)

/**
 * POST /integration/from-mae/editorial
 * Recebe estratégia editorial da Mãe.
 */
app.post(
  '/integration/from-mae/editorial',
  validateBody(fromMaeEditorialSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.fromMaeEditorial(req.body)
    res.json(result)
  }
)

/**
 * POST /integration/from-mae/lead-routing
 * Recebe instruções de roteamento de lead da Mãe.
 */
app.post(
  '/integration/from-mae/lead-routing',
  validateBody(fromMaeLeadRoutingSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.fromMaeLeadRouting(req.body)
    res.json(result)
  }
)

/**
 * POST /integration/from-mae/campaign
 * Recebe otimização de campanha definida pela Mãe.
 */
app.post(
  '/integration/from-mae/campaign',
  validateBody(fromMaeCampaignSchema),
  (req: Request, res: Response) => {
    const result = JohnGameMkt.fromMaeCampaign(req.body)
    res.json(result)
  }
)

// ==================== EPIC 5: Tracking ====================

/**
 * POST /api/tracking/evento
 * Registra um evento de comportamento
 */
app.post('/api/tracking/evento', validateBody(trackingEventoSchema), (req: Request, res: Response) => {
  const {
    tipo,
    empresa_id,
    user_id,
    lead_id,
    session_id = `sess_${Date.now()}`,
    url,
    metadata = {},
    duracao_ms,
  } = req.body

  const evento = colesor.registrar({
    tipo: tipo as EventoTipo,
    empresa_id,
    user_id,
    lead_id,
    session_id,
    url,
    metadata,
    duracao_ms,
    timestamp: new Date(),
  })

  res.json({
    success: true,
    evento,
  })
})

/**
 * POST /api/tracking/batch
 * Registra múltiplos eventos
 */
app.post('/api/tracking/batch', validateBody(trackingBatchSchema), (req: Request, res: Response) => {
  const { eventos } = req.body

  const registrados = colesor.registrarBatch(eventos)
  res.json({
    success: true,
    total: registrados.length,
    eventos: registrados,
  })
})

/**
 * GET /api/tracking/resumo/:user_id
 * Retorna resumo comportamental de um usuário
 */
app.get('/api/tracking/resumo/:user_id', (req: Request, res: Response) => {
  const { user_id } = req.params
  const resumo = colesor.gerarResumo(user_id)
  res.json(resumo)
})

// ==================== EPIC 6: Lead Scoring ====================

/**
 * POST /api/leads/score
 * Calcula score de um lead
 */
app.post('/api/leads/score', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    lead_id,
    total_interacoes = 5,
    tempo_navegacao = 180,
    origem = 'anuncio',
    engajamento_porcento = 50,
    dias_ultima_atividade = 2,
    clique_proposta = false,
    compartilhamento = false,
    interacao_chat = 3,
  } = req.body

  const resolvedLeadId = typeof lead_id === 'string' && lead_id.trim() ? lead_id : `lead_${Date.now()}`

  const score = LeadScorer.calcular(resolvedLeadId, {
    total_interacoes,
    tempo_navegacao,
    origem,
    engajamento_porcento,
    dias_ultima_atividade,
    clique_proposta,
    compartilhamento,
    interacao_chat,
  })

  const coreDnaEvent = emitLeadCreatedEvent({
    lead_id: resolvedLeadId,
    origem,
    score: score.score,
    status: score.status,
    confianca: score.confianca,
    metadata: {
      total_interacoes,
      tempo_navegacao,
      engajamento_porcento,
      dias_ultima_atividade,
      clique_proposta,
      compartilhamento,
      interacao_chat,
    },
  })

  const johnHandoff = JohnGameMkt.runJourney({
    type: 'lead_detected',
    lead_id: resolvedLeadId,
    topic: 'lead_scoring',
    lead_prioritization: score.status === 'quente',
  })

  res.json({
    ...score,
    core_dna_event: coreDnaEvent,
    john_handoff: johnHandoff,
  })
})

/**
 * POST /api/leads/ranking
 * Retorna ranking de leads por score
 */
app.post('/api/leads/ranking', validateBody(leadsRankingSchema), (req: Request, res: Response) => {
  const { leads, top = 10 } = req.body

  const scores = leads.map((l: any) =>
    LeadScorer.calcular(l.lead_id, {
      total_interacoes: l.total_interacoes || 0,
      tempo_navegacao: l.tempo_navegacao || 0,
      origem: l.origem || 'unknown',
      engajamento_porcento: l.engajamento_porcento || 0,
      dias_ultima_atividade: l.dias_ultima_atividade || 30,
      clique_proposta: l.clique_proposta || false,
      compartilhamento: l.compartilhamento || false,
      interacao_chat: l.interacao_chat || 0,
    })
  )

  const ranking = LeadScorer.ranking(scores, top)
  res.json({
    total_leads: leads.length,
    ranking,
    top_lead: ranking[0],
  })
})

// ==================== EPIC 8: Insights ====================

/**
 * POST /api/insights/analisar
 * Analisa portfólio de KPIs e gera insights
 */
app.post('/api/insights/analisar', validarBodyObjeto, (req: Request, res: Response) => {
  const { kpis, historicosPorTipo } = req.body

  try {
    const insights = MotorInsights.analisarPortfolio(kpis, historicosPorTipo || {})
    res.json({
      total_insights: insights.length,
      criticos: insights.filter((i) => i.nivel === 'critico').length,
      insights,
    })
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
})

/**
 * POST /api/insights/anomalia
 * Detecta anomalias em uma métrica
 */
app.post('/api/insights/anomalia', validateBody(insightsAnomaliaSchema), (req: Request, res: Response) => {
  const { metrica, valor_atual, historico } = req.body

  const anomalia = MotorInsights.detectarAnomalia(metrica, valor_atual, historico)
  const insight = anomalia.eh_anomalia ? MotorInsights.criarInsightAnomalia(anomalia) : null

  res.json({
    anomalia,
    insight,
  })
})

// ==================== EPIC 10-15: ECOSSISTEMA SUSTENTÁVEL ====================

/**
 * POST /api/wellbeing/human-kpi
 * Calcula KPI de bem-estar humano
 */
app.post('/api/wellbeing/human-kpi', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    tarefas_abertas = 5,
    prazos_apertados = 2,
    tempo_resposta_medio = 30,
    horas_trabalho_dia = 8,
    dias_trabalhados_semana = 5,
  } = req.body

  const carga = HumanKPICalculator.calcularCargaTrabalho({
    tarefas_abertas,
    prazos_apertados,
    tempo_resposta_medio,
    horas_trabalho_dia,
    dias_trabalhados_semana,
  })

  res.json({ carga_trabalho: carga, timestamp: new Date() })
})

/**
 * POST /api/wellbeing/equilibrio
 * Calcula score de equilíbrio vida/trabalho
 */
app.post('/api/wellbeing/equilibrio', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    carga_trabalho = 50,
    tempo_offline = 60,
    pausas_realizadas = 50,
    engajamento = 60,
    horas_extras = 5,
  } = req.body

  const equilibrio = HumanKPICalculator.calcularEquilibrio(
    carga_trabalho,
    tempo_offline,
    pausas_realizadas,
    engajamento,
    horas_extras
  )

  res.json(equilibrio)
})

/**
 * POST /api/wellbeing/bem-estar
 * Calcula score consolidado de bem-estar
 */
app.post('/api/wellbeing/bem-estar', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    equilibrio = 70,
    carga = 40,
    pausas = 60,
    saude_mental = 50,
    satisfacao = 60,
  } = req.body

  const bem_estar = HumanKPICalculator.calcularBemEstar(equilibrio, carga, pausas, saude_mental, satisfacao)

  res.json({ score_bem_estar: bem_estar, timestamp: new Date() })
})

/**
 * POST /api/wellbeing/alertas
 * Gera alertas de bem-estar humanizados
 */
app.post('/api/wellbeing/alertas', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    actor_id,
    actor_tipo,
    equilibrio_status = 'atencao',
    carga_trabalho = 60,
    produtividade = 50,
    tempo_offline = 30,
    horas_extras = 10,
    tendencia = 'estavel',
  } = req.body

  const alertas = MotorAlertasHumanos.gerar({
    actor_id,
    actor_tipo,
    equilibrio_status: normalizarEquilibrioStatus(equilibrio_status),
    carga_trabalho,
    produtividade,
    tempo_offline,
    horas_extras,
    tendencia,
  })

  res.json({ alertas, total: alertas.length })
})

/**
 * POST /api/wellbeing/decisoes
 * Sugere ações de decision tree
 */
app.post('/api/wellbeing/decisoes', validarBodyObjeto, (req: Request, res: Response) => {
  const contexto = {
    actor_id: req.body.actor_id || 'default',
    actor_tipo: req.body.actor_tipo || 'colaborador',
    carga_trabalho: req.body.carga_trabalho || 50,
    equilibrio_score: req.body.equilibrio_score || 50,
    produtividade: req.body.produtividade || 50,
    tempo_offline: req.body.tempo_offline || 40,
    prazos_apertados: req.body.prazos_apertados || 2,
    tarefas_abertas: req.body.tarefas_abertas || 5,
    horas_extras: req.body.horas_extras || 5,
    tendencia: req.body.tendencia || 'estavel',
  }

  const sugestoes = MotorDecisaoHumano.decidir(contexto)
  const priorizadas = MotorDecisaoHumano.priorizarAcoes(sugestoes)

  res.json({
    sugestoes: priorizadas,
    total: priorizadas.length,
    pode_simultaneas: MotorDecisaoHumano.podeExecutarSimultaneo(priorizadas),
  })
})

/**
 * POST /api/wellbeing/medalhas
 * Verifica conquistas de medalhas
 */
app.post('/api/wellbeing/medalhas', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    usuario_id,
    actor_tipo,
    metricas = {
      equilibrio: 75,
      tempo_resposta: 24,
      qualidade: 95,
      satisfacao_parceiros: 90,
      projetos_no_prazo: 5,
      score_colaboracao: 80,
      score_comunicacao: 75,
    },
  } = req.body

  const conquistadas = GamificacaoSaudavel.verificarConquista(usuario_id, actor_tipo, metricas)

  res.json({
    medalhas_conquistadas: conquistadas,
    total: conquistadas.length,
    timestamp: new Date(),
  })
})

/**
 * POST /api/wellbeing/ranking
 * Gera ranking saudável (não competitivo)
 */
app.post('/api/wellbeing/ranking', validarBodyObjeto, (req: Request, res: Response) => {
  const { usuarios, categoria } = req.body

  const ranking = GamificacaoSaudavel.gerarRankingSaudavel(usuarios, categoria)

  res.json({
    ranking,
    total: ranking.length,
    categoria: categoria || 'todos',
  })
})

/**
 * POST /api/wellbeing/saude-ecossistema
 * Calcula saúde geral do ecossistema
 */
app.post('/api/wellbeing/saude-ecossistema', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    equipe = 70,
    fornecedores = 65,
    parceiros = 68,
    clientes = 72,
  } = req.body

  const saude = MotorSaudeEcossistema.calcularSaudeEcossistema({
    equipe,
    fornecedores,
    parceiros,
    clientes,
  })

  res.json(saude)
})

/**
 * POST /api/wellbeing/integra-portais
 * Unifica dados de múltiplos portais
 */
app.post('/api/wellbeing/integra-portais', validarBodyObjeto, (req: Request, res: Response) => {
  const {
    dados_portal_tarefas,
    dados_portal_marketing,
    dados_portal_obras,
    dados_portal_suprimentos,
  } = req.body

  try {
    const resultado = MotorSaudeEcossistema.unificarDadosMultiPortal(
      dados_portal_tarefas || {},
      dados_portal_marketing || {},
      dados_portal_obras || {},
      dados_portal_suprimentos || {}
    )

    res.json({
      status: 'sucesso',
      kpis_consolidadas: resultado.kpis_consolidadas.length,
      health_score: resultado.health_score_consolidado,
      alertas: resultado.alertas_consolidadas,
    })
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
})

// ==================== EPIC 16: EDITORA LICEU 6.0 ====================

/**
 * POST /api/editorial/inteligencia/capturar
 * Captura inteligência operacional do GAME MKT para uso editorial.
 */
app.post(
  '/api/editorial/inteligencia/capturar',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  try {
    const inteligencia = await EditorialEngine.capturarInteligencia(req.body)
    res.json(inteligencia)
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
  }
)

/**
 * POST /api/editorial/obras
 * Cria obra editorial no pipeline.
 */
app.post(
  '/api/editorial/obras',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validateBody(editorialCreateSchema),
  async (req: Request, res: Response) => {
  try {
    const obra = await EditorialEngine.criarObra({
      empresa_id: req.body.empresa_id || 'default',
      titulo: req.body.titulo,
      subtitulo: req.body.subtitulo,
      descricao: req.body.descricao || 'Sem descrição',
      categoria: (req.body.categoria || 'tecnico_construcao_civil') as CategoriaEducacional,
      nivel: (req.body.nivel || 'intermediario') as NivelComplexidade,
      autores: req.body.autores || [],
      revisores: req.body.revisores || [],
      formatos_publicacao: req.body.formatos_publicacao || ['pdf', 'web'],
      inteligencia_origem_id: req.body.inteligencia_origem_id,
    })

    res.status(201).json(obra)
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
  }
)

/**
 * GET /api/editorial/obras
 * Lista obras com filtros por status, categoria e nível.
 */
app.get('/api/editorial/obras', async (req: Request, res: Response) => {
  const { status, categoria, nivel } = req.query

  const obras = await EditorialEngine.listarObras({
    status: status as PipelineEditorialStatus | undefined,
    categoria: categoria as CategoriaEducacional | undefined,
    nivel: nivel as NivelComplexidade | undefined,
  })

  res.json({ total: obras.length, obras })
})

/**
 * GET /api/editorial/obras/:obra_id
 * Busca detalhes de uma obra específica.
 */
app.get('/api/editorial/obras/:obra_id', async (req: Request, res: Response) => {
  const { obra_id } = req.params
  const obra = await EditorialEngine.buscarObra(obra_id)

  if (!obra) {
    return res.status(404).json({ erro: 'Obra não encontrada' })
  }

  res.json(obra)
})

/**
 * PUT /api/editorial/obras/:obra_id/pipeline
 * Atualiza status do pipeline editorial.
 */
app.put(
  '/api/editorial/obras/:obra_id/pipeline',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const { obra_id } = req.params
  const { status } = req.body

  try {
    const obra = await EditorialEngine.atualizarStatusPipeline(
      obra_id,
      status as PipelineEditorialStatus
    )
    if (!obra) {
      return res.status(404).json({ erro: 'Obra não encontrada' })
    }

    res.json(obra)
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
  }
)

/**
 * POST /api/editorial/obras/:obra_id/ia-john/estruturar
 * IA John estrutura automaticamente capítulos e narrativa pedagógica.
 */
app.post(
  '/api/editorial/obras/:obra_id/ia-john/estruturar',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const { obra_id } = req.params

  const conteudo = await EditorialEngine.estruturarComIA({
    obra_id,
    perfil_publico: (req.body.perfil_publico || 'tecnico_construcao_civil') as CategoriaEducacional,
    nivel_linguagem: (req.body.nivel_linguagem || 'intermediario') as NivelComplexidade,
    foco: req.body.foco || ['didatica', 'rigor_tecnico', 'gamificacao'],
    quantidade_capitulos: req.body.quantidade_capitulos,
  })

  if (!conteudo) {
    return res.status(404).json({ erro: 'Obra não encontrada para estruturação IA' })
  }

  res.json(conteudo)
  }
)

/**
 * POST /api/editorial/obras/:obra_id/colaboracao-global
 * Registra colaboração global por país/origem.
 */
app.post(
  '/api/editorial/obras/:obra_id/colaboracao-global',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const { obra_id } = req.params
  const { origem } = req.body

  const obra = await EditorialEngine.adicionarColaboracaoGlobal(
    obra_id,
    origem as OrigemColaboracaoGlobal
  )
  if (!obra) {
    return res.status(404).json({ erro: 'Obra não encontrada' })
  }

  res.json(obra)
  }
)

/**
 * POST /api/editorial/obras/:obra_id/colaboracao-global/lote
 * Registra multiplas colaboracoes globais em uma unica operacao.
 */
app.post(
  '/api/editorial/obras/:obra_id/colaboracao-global/lote',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const { obra_id } = req.params
  const origens = (req.body.origens || []) as OrigemColaboracaoGlobal[]

  if (!Array.isArray(origens) || origens.length === 0) {
    return res.status(400).json({ erro: 'Informe ao menos uma origem de colaboracao global.' })
  }

  const obra = await EditorialEngine.adicionarColaboracaoGlobalLote(obra_id, origens)
  if (!obra) {
    return res.status(404).json({ erro: 'Obra nao encontrada' })
  }

  res.json(obra)
  }
)

/**
 * POST /api/editorial/trilhas/gerar
 * Gera trilha educacional estruturada e certificável.
 */
app.post(
  '/api/editorial/trilhas/gerar',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const trilha = await EditorialEngine.gerarTrilha(
    req.body.nome || 'Trilha LICEU 6.0',
    (req.body.categoria || 'gestao_de_obras') as CategoriaEducacional,
    req.body.publico_alvo || 'profissionais em formação',
    (req.body.nivel || 'intermediario') as NivelComplexidade
  )

  res.status(201).json(trilha)
  }
)

/**
 * POST /api/editorial/obras/:obra_id/publicar
 * Publica obra após diagramação, incrementando versão.
 */
app.post(
  '/api/editorial/obras/:obra_id/publicar',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const { obra_id } = req.params

  try {
    const obra = await EditorialEngine.publicarObra(obra_id)
    if (!obra) {
      return res.status(404).json({ erro: 'Obra não encontrada' })
    }

    res.json(obra)
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
  }
)

/**
 * POST /api/editorial/obras/:obra_id/distribuicao/exportar
 * Gera artefatos de distribuicao digital para a Academia do Saber.
 */
app.post(
  '/api/editorial/obras/:obra_id/distribuicao/exportar',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const { obra_id } = req.params

  try {
    const exportacao = await EditorialEngine.exportarObra(obra_id, req.body.formatos)
    if (!exportacao) {
      return res.status(404).json({ erro: 'Obra nao encontrada' })
    }

    res.json(exportacao)
  } catch (error) {
    res.status(400).json({ erro: String(error) })
  }
  }
)

/**
 * GET /api/editorial/academia/biblioteca
 * Lista catalogo digital de obras publicadas.
 */
app.get('/api/editorial/academia/biblioteca', async (req: Request, res: Response) => {
  const itens = await EditorialEngine.listarBibliotecaDigital()
  res.json({ total: itens.length, itens })
})

/**
 * POST /api/editorial/analytics/aprendizado
 * Consolida analytics educacional para Academia do Saber.
 */
app.post(
  '/api/editorial/analytics/aprendizado',
  authenticateJWT,
  requireRoles(['admin', 'editor']),
  validarBodyObjeto,
  async (req: Request, res: Response) => {
  const analytics = await EditorialEngine.analyticsAprendizado(req.body || {})
  res.json(analytics)
  }
)

/**
 * GET /api/editorial/resumo
 * Resumo operacional do ecossistema editorial.
 */
app.get('/api/editorial/resumo', async (req: Request, res: Response) => {
  const resumo = await EditorialEngine.resumoSistema()
  res.json(resumo)
})

// ==================== HEALTH CHECK ====================

/**
 * GET /health
 * Health check do servidor
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    version: '1.2.0',
    epics: [
      'Motor de Indicadores',
      'Sistema Fuzzy',
      'Tradução de Siglas',
      'John Brasileiro',
      'Tracking',
      'Lead Scoring',
      'Insights',
      'Human KPIs',
      'Equilíbrio Vida/Trabalho',
      'Decision Tree',
      'Alertas Humanizados',
      'Gamificação Saudável',
      'Saúde Ecossistema',
      'Integração Multi-Portal',
      'Editorial Engine LICEU 6.0',
    ],
  })
})

// ==================== GAME MKT ACQUISITION ENGINE (Issues 1-26) ====================

/**
 * GET /api/game-mkt/identity
 * Issue 1 & 24 — Papel oficial e registro Core DNA
 */
app.get('/api/game-mkt/identity', (_req: Request, res: Response) => {
  const registration = emitGameMktRegistered({ ...GAME_MKT_CORE_DNA, capabilities: [...GAME_MKT_CORE_DNA.capabilities] })
  res.json({ identity: getGameMktIdentity(), core_dna_event: registration })
})

/**
 * GET /api/game-mkt/manifest
 * Issues 25 & 26 — Hard rules + responsabilidade única
 */
app.get('/api/game-mkt/manifest', (_req: Request, res: Response) => {
  res.json(getGameMktManifest())
})

/**
 * POST /api/game-mkt/manifest/assert
 * Issue 25 — Validar se ação é permitida
 */
app.post('/api/game-mkt/manifest/assert', validarBodyObjeto, (req: Request, res: Response) => {
  const { action } = req.body as { action?: string }
  if (typeof action !== 'string' || action.trim() === '') {
    return res.status(400).json({ erro: 'Campo "action" é obrigatório.' })
  }
  try {
    assertAllowed(action)
    res.json({ allowed: true, action })
  } catch (e) {
    res.status(403).json({ allowed: false, motivo: String(e) })
  }
})

/**
 * POST /api/game-mkt/kanban/lead-to-task
 * Issue 2 — Lead vira Task automaticamente
 */
app.post('/api/game-mkt/kanban/lead-to-task', validarBodyObjeto, (req: Request, res: Response) => {
  const { event, data } = req.body as { event?: string; data?: Record<string, unknown> }
  if (event !== 'marketing.lead.generated' || !data) {
    return res.status(400).json({ erro: 'Payload de evento "marketing.lead.generated" esperado.' })
  }
  const task = leadToKanbanTask({ event: 'marketing.lead.generated', data: data as any })
  trackLeadForSla(task.lead_id, task.task_id)
  natsEventBus.publish('marketing.lead.generated', { event, data })
  recordTradingEvent('lead')
  res.status(201).json({ task })
})

/**
 * POST /api/game-mkt/kanban/behavior
 * Issue 4 — Atualizar task com comportamento do usuário
 */
app.post('/api/game-mkt/kanban/behavior', validarBodyObjeto, (req: Request, res: Response) => {
  const { task, update } = req.body as Record<string, any>
  if (!task || !update) {
    return res.status(400).json({ erro: 'Campos "task" e "update" são obrigatórios.' })
  }
  const updated = applyLeadBehaviorToTask(task, update)
  res.json({ task: updated })
})

/**
 * POST /api/game-mkt/events/publish
 * Issue 5 — Publicar evento obrigatório do Game MKT
 */
app.post('/api/game-mkt/events/publish', validarBodyObjeto, (req: Request, res: Response) => {
  const { subject, payload } = req.body as { subject?: string; payload?: unknown }
  if (!subject || !payload) {
    return res.status(400).json({ erro: 'Campos "subject" e "payload" são obrigatórios.' })
  }
  natsEventBus.publish(subject as any, payload)
  res.json({ published: true, subject })
})

/**
 * GET /api/game-mkt/events/log
 * Audit log de eventos publicados
 */
app.get('/api/game-mkt/events/log', (_req: Request, res: Response) => {
  res.json({ events: natsEventBus.getPublishLog() })
})

/**
 * POST /api/game-mkt/attribution
 * Issue 7 — Attribution Loop: CAC → Receita
 */
app.post('/api/game-mkt/attribution', validarBodyObjeto, (req: Request, res: Response) => {
  const { lead_id, revenue, roi, campaign_id, channel } = req.body as Record<string, any>
  if (!lead_id || revenue === undefined || roi === undefined) {
    return res.status(400).json({ erro: 'Campos "lead_id", "revenue" e "roi" são obrigatórios.' })
  }
  const evt = emitAttributionUpdated({ lead_id, revenue, roi, campaign_id, channel })
  natsEventBus.publishAttribution({ lead_id, revenue, roi, campaign_id, channel })
  res.json({ attribution_event: evt })
})

/**
 * POST /api/game-mkt/cefeida/apply
 * Issue 8 — Aplicar inteligência CEFEIDA à campanha
 */
app.post('/api/game-mkt/cefeida/apply', validarBodyObjeto, (req: Request, res: Response) => {
  const { campaign, cefeida } = req.body as Record<string, any>
  if (!campaign || !cefeida) {
    return res.status(400).json({ erro: 'Campos "campaign" e "cefeida" são obrigatórios.' })
  }
  const result = applyCefeidaIntelligence(campaign, cefeida)
  res.json(result)
})

/**
 * POST /api/game-mkt/john/decision
 * Issue 9 — John otimiza campanha via john.marketing.decision
 */
app.post('/api/game-mkt/john/decision', validarBodyObjeto, (req: Request, res: Response) => {
  const decision = req.body as any
  if (!decision.event || decision.event !== 'john.marketing.decision') {
    return res.status(400).json({ erro: 'Evento "john.marketing.decision" esperado.' })
  }
  const result = applyJohnDecision(decision)
  res.json(result)
})

/**
 * POST /api/game-mkt/budget/approved
 * Issue 10 — Registrar orçamento aprovado pelo Hub
 */
app.post('/api/game-mkt/budget/approved', validarBodyObjeto, (req: Request, res: Response) => {
  applyHubBudgetApproved(req.body as any)
  res.json({ ok: true, campaign_id: req.body.campaign_id })
})

/**
 * POST /api/game-mkt/budget/limit
 * Issue 10 — Registrar limite de orçamento do Hub
 */
app.post('/api/game-mkt/budget/limit', validarBodyObjeto, (req: Request, res: Response) => {
  applyHubBudgetLimit(req.body as any)
  res.json({ ok: true, campaign_id: req.body.campaign_id })
})

/**
 * POST /api/game-mkt/budget/cost
 * Issue 11 — Registrar custo de campanha
 */
app.post('/api/game-mkt/budget/cost', validarBodyObjeto, (req: Request, res: Response) => {
  const { campaign_id, channel, cost } = req.body as Record<string, any>
  if (!campaign_id || !channel || cost === undefined) {
    return res.status(400).json({ erro: 'Campos "campaign_id", "channel" e "cost" são obrigatórios.' })
  }
  const payload = registerCampaignCost(campaign_id, channel, Number(cost))
  natsEventBus.publish('marketing.campaign.cost', payload)
  recordTradingEvent('cost', Number(cost))
  res.json({ payload, budget_state: getBudgetState(campaign_id) })
})

/**
 * GET /api/game-mkt/budget/:campaign_id
 * Issue 10 — Estado do orçamento de uma campanha
 */
app.get('/api/game-mkt/budget/:campaign_id', (req: Request, res: Response) => {
  const state = getBudgetState(req.params.campaign_id)
  if (!state) return res.status(404).json({ erro: 'Campanha não encontrada no budget store.' })
  res.json(state)
})

/**
 * POST /api/game-mkt/compliance/check
 * Issue 12 — Verificar compliance LGPD da campanha
 */
app.post('/api/game-mkt/compliance/check', validarBodyObjeto, (req: Request, res: Response) => {
  const result = checkCampaignCompliance(req.body as any)
  const status = result.approved ? 200 : 422
  res.status(status).json(result)
})

/**
 * POST /api/game-mkt/compliance/consent
 * Issue 13 — Registrar consentimento LGPD do lead
 */
app.post('/api/game-mkt/compliance/consent', validarBodyObjeto, (req: Request, res: Response) => {
  const { lead_id, channel, accepts_marketing, accepts_data_processing, consent_version } = req.body as Record<string, any>
  if (!lead_id || !channel) {
    return res.status(400).json({ erro: 'Campos "lead_id" e "channel" são obrigatórios.' })
  }
  const evt = buildLeadConsentEvent(lead_id, channel, { accepts_marketing, accepts_data_processing, consent_version })
  natsEventBus.publish('marketing.lead.consent', evt)
  res.status(201).json(evt)
})

/**
 * POST /api/game-mkt/archimedes/qualify
 * Issue 14 — Qualificar lead para Archimedes
 */
app.post('/api/game-mkt/archimedes/qualify', validarBodyObjeto, (req: Request, res: Response) => {
  const result = qualifyLead(req.body as any)
  if (!result) {
    return res.status(422).json({ qualified: false, motivo: 'Score abaixo do threshold de qualificação.' })
  }
  natsEventBus.publish('marketing.lead.qualified', result)
  res.json({ qualified: true, event: result })
})

/**
 * POST /api/game-mkt/archimedes/dynamic-score
 * Issue 16 — Score dinâmico de lead
 */
app.post('/api/game-mkt/archimedes/dynamic-score', validarBodyObjeto, (req: Request, res: Response) => {
  const newScore = calcDynamicScore(req.body as any)
  res.json({ score: newScore })
})

/**
 * POST /api/game-mkt/sla/track
 * Issue 17 — Registrar lead no SLA
 */
app.post('/api/game-mkt/sla/track', validarBodyObjeto, (req: Request, res: Response) => {
  const { lead_id, task_id } = req.body as Record<string, string>
  if (!lead_id || !task_id) {
    return res.status(400).json({ erro: 'Campos "lead_id" e "task_id" são obrigatórios.' })
  }
  trackLeadForSla(lead_id, task_id)
  res.json({ tracked: true, lead_id, task_id })
})

/**
 * POST /api/game-mkt/sla/contacted
 * Issue 17 — Marcar lead como contactado
 */
app.post('/api/game-mkt/sla/contacted', validarBodyObjeto, (req: Request, res: Response) => {
  const { lead_id } = req.body as { lead_id?: string }
  if (!lead_id) return res.status(400).json({ erro: 'Campo "lead_id" é obrigatório.' })
  markLeadContacted(lead_id)
  res.json({ contacted: true, lead_id })
})

/**
 * GET /api/game-mkt/sla/risk
 * Issue 17 — Listar leads em risco de SLA
 */
app.get('/api/game-mkt/sla/risk', (_req: Request, res: Response) => {
  const atRisk = checkSlaRisk()
  for (const r of atRisk) natsEventBus.publish('sla.lead.at_risk', r)
  res.json({ at_risk: atRisk, total: atRisk.length })
})

/**
 * POST /api/game-mkt/sla/reactivate
 * Issue 18 — Reativar leads frios automaticamente
 */
app.post('/api/game-mkt/sla/reactivate', validarBodyObjeto, (req: Request, res: Response) => {
  const { leads } = req.body as { leads?: any[] }
  if (!Array.isArray(leads)) return res.status(400).json({ erro: 'Campo "leads" deve ser um array.' })
  const reactivated = findColdLeadsForReactivation(leads)
  for (const r of reactivated) natsEventBus.publish('marketing.lead.generated', r)
  res.json({ reactivated, total: reactivated.length })
})

/**
 * POST /api/game-mkt/gamification/score-campaign
 * Issue 19 — Score de campanha
 */
app.post('/api/game-mkt/gamification/score-campaign', validarBodyObjeto, (req: Request, res: Response) => {
  const result = scoreCampaign(req.body as any)
  res.json(result)
})

/**
 * POST /api/game-mkt/gamification/rank-channels
 * Issue 20 — Ranking de canais
 */
app.post('/api/game-mkt/gamification/rank-channels', validarBodyObjeto, (req: Request, res: Response) => {
  const { stats } = req.body as { stats?: any[] }
  if (!Array.isArray(stats)) return res.status(400).json({ erro: 'Campo "stats" deve ser um array.' })
  res.json({ ranking: rankChannels(stats) })
})

/**
 * POST /api/game-mkt/gamification/rank-creatives
 * Issue 21 — Ranking de criativos
 */
app.post('/api/game-mkt/gamification/rank-creatives', validarBodyObjeto, (req: Request, res: Response) => {
  const { stats } = req.body as { stats?: any[] }
  if (!Array.isArray(stats)) return res.status(400).json({ erro: 'Campo "stats" deve ser um array.' })
  res.json({ ranking: rankCreatives(stats) })
})

/**
 * POST /api/game-mkt/trading-desk/record
 * Issue 22 — Registrar evento para o dashboard em tempo real
 */
app.post('/api/game-mkt/trading-desk/record', validarBodyObjeto, (req: Request, res: Response) => {
  const { type, value } = req.body as { type?: string; value?: number }
  if (!type) return res.status(400).json({ erro: 'Campo "type" é obrigatório.' })
  recordTradingEvent(type as any, value)
  res.json({ ok: true })
})

/**
 * GET /api/game-mkt/trading-desk/snapshot
 * Issue 22 — Snapshot do painel em tempo real
 */
app.get('/api/game-mkt/trading-desk/snapshot', (req: Request, res: Response) => {
  const active = Number(req.query.active_campaigns ?? 0)
  const pipeline = Number(req.query.pipeline_value ?? 0)
  res.json(getTradingDeskSnapshot(active, pipeline))
})

/**
 * POST /api/game-mkt/trading-desk/pipeline-impact
 * Issue 23 — Impacto no Kanban visual
 */
app.post('/api/game-mkt/trading-desk/pipeline-impact', validarBodyObjeto, (req: Request, res: Response) => {
  const { tasks } = req.body as { tasks?: any[] }
  if (!Array.isArray(tasks)) return res.status(400).json({ erro: 'Campo "tasks" deve ser um array.' })
  res.json(calcKanbanPipelineImpact(tasks))
})

// ==================== FEDERATED REVENUE CIVILIZATION RUNTIME ====================

/**
 * GET /api/game-mkt/revenue/subjects
 * Lista os subjects oficiais do runtime coletivo de revenue.
 */
app.get('/api/game-mkt/revenue/subjects', (_req: Request, res: Response) => {
  res.json({ subjects: RevenueSubjects })
})

/**
 * POST /api/game-mkt/runtime/identity
 * Constrói identidade unificada de lead para federação.
 */
app.post('/api/game-mkt/runtime/identity', validarBodyObjeto, (req: Request, res: Response) => {
  const identity = buildUnifiedLeadIdentity(req.body as { email?: string; phone?: string; document?: string; company?: string })
  res.json(identity)
})

/**
 * POST /api/game-mkt/graph/lead-relationship
 * Registra relacionamento de lead no grafo comercial.
 */
app.post('/api/game-mkt/graph/lead-relationship', validarBodyObjeto, async (req: Request, res: Response) => {
  const { lead_id, company, market } = req.body as { lead_id?: string; company?: string; market?: string }
  if (!lead_id || !company || !market) {
    return res.status(400).json({ erro: 'Campos "lead_id", "company" e "market" são obrigatórios.' })
  }

  await registerLeadRelationship(lead_id, company, market)
  res.status(201).json({ registered: true, lead_id, company, market })
})

/**
 * GET /api/game-mkt/runtime/interplanetary-market
 * Retorna inteligência de mercado interplanetário.
 */
app.get('/api/game-mkt/runtime/interplanetary-market', async (_req: Request, res: Response) => {
  const analysis = await interplanetaryMarket.analyze()
  res.json(analysis)
})

/**
 * GET /api/game-mkt/runtime/holographic-experience
 * Gera pacote de experiência holográfica comercial.
 */
app.get('/api/game-mkt/runtime/holographic-experience', async (_req: Request, res: Response) => {
  const experience = await holographicSales.createExperience()
  res.json(experience)
})

/**
 * POST /api/game-mkt/runtime/campaign-agent/execute
 * Executa runtime autônomo de campanhas.
 */
app.post('/api/game-mkt/runtime/campaign-agent/execute', async (_req: Request, res: Response) => {
  const result = await campaignAgent.execute()
  res.json(result)
})

/**
 * GET /api/game-mkt/runtime/warroom
 * Constrói painel executivo de War Room comercial.
 */
app.get('/api/game-mkt/runtime/warroom', async (_req: Request, res: Response) => {
  if (process.env.WARROOM_ENABLED !== 'true') {
    return res.status(503).json({ erro: 'War Room desabilitado por configuração.' })
  }

  const warroom = await revenueWarRoom.build()
  res.json(warroom)
})

/**
 * POST /api/game-mkt/runtime/causal/infer
 * Calcula drivers causais de fechamento.
 */
app.post('/api/game-mkt/runtime/causal/infer', validarBodyObjeto, (req: Request, res: Response) => {
  const { signals } = req.body as { signals?: Array<{ factor: string; impact: number }> }
  if (!Array.isArray(signals)) {
    return res.status(400).json({ erro: 'Campo "signals" deve ser um array.' })
  }

  const result = causalRuntime.inferClosingDrivers(signals)
  res.json(result)
})

/**
 * POST /api/game-mkt/runtime/collective/hooks
 * Emite sinal para runtime coletivo de AGI.
 */
app.post('/api/game-mkt/runtime/collective/hooks', validarBodyObjeto, async (req: Request, res: Response) => {
  const { source, objective, payload } = req.body as {
    source?: string
    objective?: string
    payload?: Record<string, unknown>
  }

  if (!source || !objective || !payload) {
    return res.status(400).json({ erro: 'Campos "source", "objective" e "payload" são obrigatórios.' })
  }

  const ack = await collectiveHooks.emit({ source, objective, payload })
  res.status(202).json(ack)
})

/**
 * POST /api/game-mkt/runtime/schema/validate
 * Valida payload com Schema Registry interno.
 */
app.post('/api/game-mkt/runtime/schema/validate', validarBodyObjeto, (req: Request, res: Response) => {
  const { subject, payload } = req.body as { subject?: string; payload?: unknown }
  if (!subject) {
    return res.status(400).json({ erro: 'Campo "subject" é obrigatório.' })
  }

  const schemaMeta = getSchema(subject)
  if (!schemaMeta) {
    return res.status(404).json({ erro: `Schema não encontrado para ${subject}.` })
  }

  const result = validateSchema(subject, payload)
  res.json({
    subject,
    version: schemaMeta.version,
    ...result,
  })
})

/**
 * POST /api/game-mkt/federation/publish
 * Publica evento no Federation SDK (NATS).
 */
app.post('/api/game-mkt/federation/publish', validarBodyObjeto, async (req: Request, res: Response) => {
  if (process.env.FEDERATION_ENABLED !== 'true') {
    return res.status(503).json({ erro: 'Federation runtime desabilitado por configuração.' })
  }

  const { subject, payload } = req.body as { subject?: string; payload?: unknown }
  if (!subject || payload === undefined) {
    return res.status(400).json({ erro: 'Campos "subject" e "payload" são obrigatórios.' })
  }

  try {
    await federation.publish(subject, payload)
    return res.status(202).json({ published: true, subject })
  } catch (error) {
    return res.status(503).json({
      published: false,
      subject,
      erro: 'Federation broker indisponível no momento.',
      detalhe: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
})

// ==================== ERROR HANDLING ====================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    erro: 'Endpoint não encontrado',
    path: req.path,
  })
})

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ erro: 'JSON malformado na requisição.' })
  }

  return next(err)
})

// ==================== START ====================

app.listen(PORT, () => {
  console.log(`🚀 GAME MKT Intelligence Engine rodando em http://localhost:${PORT}`)
  console.log(`📊 /health - Status do servidor`)
  console.log(`📈 /api/kpis/* - Motor de KPIs`)
  console.log(`🧠 /api/fuzzy/* - Sistema Fuzzy`)
  console.log(`📝 /api/metricas/* - Dicionário`)
  console.log(`🤖 /api/john/* - John Brasileiro`)
  console.log(`📍 /api/tracking/* - Tracking`)
  console.log(`⭐ /api/leads/* - Lead Scoring`)
  console.log(`💡 /api/insights/* - Insights`)
  console.log(`❤️ /api/wellbeing/* - Bem-Estar do Ecossistema`)
  console.log(`📚 /api/editorial/* - Editora LICEU 6.0`)
  console.log(`🎯 /api/game-mkt/* - Acquisition Engine (Issues 1-26)`)
  console.log(`🌳 Versão 2.0.0 - Motor de Aquisição completo`)
})

export default app
