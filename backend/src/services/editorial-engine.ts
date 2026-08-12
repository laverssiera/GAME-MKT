/**
 * GAME MKT Editorial Engine - LICEU 6.0
 * Converte inteligência operacional em conhecimento educacional estruturado.
 */

import { randomUUID } from 'crypto'
import {
  AnalyticsAprendizado,
  BibliotecaDigitalItem,
  CategoriaEducacional,
  ConteudoEstruturadoIA,
  ExportacaoObra,
  InteligenciaEditorial,
  InteligenciaOperacionalInput,
  NivelComplexidade,
  ObraEditorial,
  OrigemColaboracaoGlobal,
  PipelineEditorialStatus,
  SolicitacaoEstruturacaoIA,
  TrilhaEducacional,
} from '../types/editorial'
import { createEditorialStore } from './editorial-store'

interface CriarObraPayload {
  empresa_id: string
  titulo: string
  subtitulo?: string
  descricao: string
  categoria: CategoriaEducacional
  nivel: NivelComplexidade
  autores?: string[]
  revisores?: string[]
  formatos_publicacao?: Array<'pdf' | 'epub' | 'web' | 'impressao_sob_demanda'>
  inteligencia_origem_id?: string
}

export interface FiltroObra {
  status?: PipelineEditorialStatus
  categoria?: CategoriaEducacional
  nivel?: NivelComplexidade
}

export class EditorialEngine {
  private static readonly store = createEditorialStore()

  private static readonly PIPELINE_ORDER: PipelineEditorialStatus[] = [
    'proposta',
    'rascunho',
    'revisao_tecnica',
    'revisao_pedagogica',
    'diagramacao',
    'publicacao',
  ]

  static async capturarInteligencia(input: InteligenciaOperacionalInput): Promise<InteligenciaEditorial> {
    const kpis = input.kpis_marketing || {}
    const obras = input.metricas_obras || {}
    const comportamento = input.comportamento_usuarios || {}

    const scoreBruto =
      (kpis.conversao || 0) * 0.22 +
      (kpis.roi || 0) * 0.14 +
      (comportamento.retencao || 0) * 0.2 +
      (comportamento.engajamento_medio || 0) * 0.2 +
      (obras.produtividade || 0) * 0.24

    const scorePrioridade = Math.max(0, Math.min(100, Number(scoreBruto.toFixed(2))))

    const inteligencia: InteligenciaEditorial = {
      id: `intel_${randomUUID()}`,
      empresa_id: input.empresa_id,
      projeto_id: input.projeto_id,
      periodo_referencia: input.periodo_referencia,
      tema_principal: this.definirTemaPrincipal(input),
      objetivos_aprendizagem: this.gerarObjetivosAprendizagem(input),
      publico_recomendado: this.recomendarPublico(input),
      nivel_complexidade: this.definirNivelComplexidade(input),
      score_prioridade: scorePrioridade,
      origem: 'game_mkt',
      created_at: new Date(),
    }

    await this.store.salvarInteligencia(inteligencia)
    return inteligencia
  }

  static async criarObra(payload: CriarObraPayload): Promise<ObraEditorial> {
    const obra: ObraEditorial = {
      id: `obra_${randomUUID()}`,
      empresa_id: payload.empresa_id,
      titulo: payload.titulo,
      subtitulo: payload.subtitulo,
      descricao: payload.descricao,
      categoria: payload.categoria,
      nivel: payload.nivel,
      status_pipeline: 'proposta',
      autores: payload.autores || [],
      revisores: payload.revisores || [],
      versao: '1.0.0',
      inteligencia_origem_id: payload.inteligencia_origem_id,
      capitulos: [],
      colaboradores_globais: ['ia_john'],
      formatos_publicacao: payload.formatos_publicacao || ['pdf', 'web'],
      created_at: new Date(),
    }

    await this.store.salvarObra(obra)
    return obra
  }

  static async listarObras(filtro: FiltroObra = {}): Promise<ObraEditorial[]> {
    return this.store.listarObras(filtro)
  }

  static async buscarObra(obraId: string): Promise<ObraEditorial | undefined> {
    return this.store.buscarObra(obraId)
  }

  static async atualizarStatusPipeline(
    obraId: string,
    status: PipelineEditorialStatus
  ): Promise<ObraEditorial | undefined> {
    const obra = await this.buscarObra(obraId)
    if (!obra) return undefined

    if (!this.transicaoPermitida(obra.status_pipeline, status)) {
      throw new Error(`Transição inválida: ${obra.status_pipeline} -> ${status}`)
    }

    obra.status_pipeline = status
    obra.updated_at = new Date()
    await this.store.salvarObra(obra)
    return obra
  }

  static async adicionarColaboracaoGlobal(
    obraId: string,
    origem: OrigemColaboracaoGlobal
  ): Promise<ObraEditorial | undefined> {
    const obra = await this.buscarObra(obraId)
    if (!obra) return undefined

    if (!obra.colaboradores_globais.includes(origem)) {
      obra.colaboradores_globais.push(origem)
    }

    obra.updated_at = new Date()
    await this.store.salvarObra(obra)
    return obra
  }

  static async adicionarColaboracaoGlobalLote(
    obraId: string,
    origens: OrigemColaboracaoGlobal[]
  ): Promise<ObraEditorial | undefined> {
    const obra = await this.buscarObra(obraId)
    if (!obra) return undefined

    for (const origem of origens) {
      if (!obra.colaboradores_globais.includes(origem)) {
        obra.colaboradores_globais.push(origem)
      }
    }

    obra.updated_at = new Date()
    await this.store.salvarObra(obra)
    return obra
  }

  static async estruturarComIA(
    solicitacao: SolicitacaoEstruturacaoIA
  ): Promise<ConteudoEstruturadoIA | undefined> {
    const obra = await this.buscarObra(solicitacao.obra_id)
    if (!obra) return undefined

    const totalCapitulos = solicitacao.quantidade_capitulos || 6
    const capitulos = Array.from({ length: totalCapitulos }).map((_, index) => {
      const ordem = index + 1
      return {
        ordem,
        titulo: `Capítulo ${ordem} - ${this.tituloCapituloPorCategoria(obra.categoria, ordem)}`,
        objetivos: this.objetivosPorCapitulo(obra.categoria, ordem),
        topicos: this.topicosPorFoco(solicitacao.foco, ordem),
        atividade_pratica: `Desafio prático ${ordem}: aplicar o conteúdo em cenário real de ${obra.categoria}`,
        quiz: {
          pergunta: `Qual é o principal resultado esperado do capítulo ${ordem}?`,
          opcoes: [
            'Aumentar retrabalho',
            'Melhorar processo e aprendizado aplicado',
            'Reduzir colaboração entre equipes',
            'Eliminar indicadores de desempenho',
          ],
          resposta_correta: 1,
        },
      }
    })

    obra.capitulos = capitulos
    if (obra.status_pipeline === 'proposta') {
      obra.status_pipeline = 'rascunho'
    }
    obra.updated_at = new Date()
    await this.store.salvarObra(obra)

    const conteudo: ConteudoEstruturadoIA = {
      obra_id: obra.id,
      narrador: 'john_brasileiro',
      narrativa_pedagogica: this.narrativaPorPublico(solicitacao.perfil_publico, solicitacao.nivel_linguagem),
      capitulos,
      recomendacoes_revisao: [
        'Validar aderência técnica com especialista de engenharia.',
        'Executar revisão pedagógica por nível de ensino.',
        'Conectar capítulos com trilhas e certificação digital.',
      ],
      timestamp: new Date(),
    }

    return conteudo
  }

  static async gerarTrilha(
    nome: string,
    categoria: CategoriaEducacional,
    publico_alvo: string,
    nivel: NivelComplexidade
  ): Promise<TrilhaEducacional> {
    const trilha: TrilhaEducacional = {
      id: `trilha_${randomUUID()}`,
      nome,
      categoria,
      publico_alvo,
      nivel,
      modulos: [
        { ordem: 1, titulo: 'Fundamentos', tipo: 'apostila', carga_horaria_horas: 8 },
        { ordem: 2, titulo: 'Aplicação em Campo', tipo: 'simulacao', carga_horaria_horas: 12 },
        { ordem: 3, titulo: 'Desafios Práticos', tipo: 'desafio', carga_horaria_horas: 10 },
        { ordem: 4, titulo: 'Consolidação Técnica', tipo: 'curso', carga_horaria_horas: 14 },
        { ordem: 5, titulo: 'Livro de Referência', tipo: 'livro', carga_horaria_horas: 6 },
      ],
      certificacao_digital: true,
      progressao_estruturada: true,
      created_at: new Date(),
    }

    await this.store.salvarTrilha(trilha)
    return trilha
  }

  static async publicarObra(obraId: string): Promise<ObraEditorial | undefined> {
    const obra = await this.buscarObra(obraId)
    if (!obra) return undefined

    if (obra.status_pipeline !== 'diagramacao') {
      throw new Error('A obra precisa estar em diagramação para publicar')
    }

    const [major, minor, patch] = obra.versao.split('.').map((chunk) => Number(chunk) || 0)
    obra.versao = `${major}.${minor}.${patch + 1}`
    obra.status_pipeline = 'publicacao'
    obra.updated_at = new Date()

    await this.store.salvarObra(obra)
    return obra
  }

  static async exportarObra(
    obraId: string,
    formatos?: Array<'pdf' | 'epub' | 'web' | 'impressao_sob_demanda'>
  ): Promise<ExportacaoObra | undefined> {
    const obra = await this.buscarObra(obraId)
    if (!obra) return undefined

    if (obra.status_pipeline !== 'publicacao') {
      throw new Error('A obra precisa estar publicada para gerar distribuição')
    }

    const formatosFinais = formatos && formatos.length > 0 ? formatos : obra.formatos_publicacao
    const now = new Date()

    const artefatos = formatosFinais.map((formato) => ({
      formato,
      url: `/storage/editorial/${obra.id}/v${obra.versao}/${formato}`,
      checksum: randomUUID().replace(/-/g, '').slice(0, 16),
      gerado_em: now,
    }))

    return {
      obra_id: obra.id,
      titulo: obra.titulo,
      versao: obra.versao,
      artefatos,
      publicado_em: now,
    }
  }

  static async listarBibliotecaDigital(): Promise<BibliotecaDigitalItem[]> {
    const obras = await this.listarObras({ status: 'publicacao' })

    return obras.map((obra) => ({
      obra_id: obra.id,
      titulo: obra.titulo,
      categoria: obra.categoria,
      nivel: obra.nivel,
      versao: obra.versao,
      formatos: obra.formatos_publicacao,
      atualizado_em: obra.updated_at || obra.created_at,
    }))
  }

  static async analyticsAprendizado(payload: {
    periodo_referencia?: string
    alunos_ativos?: number
    turmas_ativas?: number
    retencao_media_percentual?: number
    conclusao_media_percentual?: number
    engajamento_medio_percentual?: number
  }): Promise<AnalyticsAprendizado> {
    const resumo = await this.resumoSistema()
    const alunos = payload.alunos_ativos || Math.max(45, resumo.total_obras * 18)
    const turmas = payload.turmas_ativas || Math.max(3, Math.ceil(alunos / 30))
    const retencao = payload.retencao_media_percentual || 58
    const conclusao = payload.conclusao_media_percentual || 52
    const engajamento = payload.engajamento_medio_percentual || 64

    const melhoria: string[] = [
      'Reforcar quizzes por modulo para elevar retencao em 8%.',
      'Aplicar simulacoes de obra com feedback imediato do John.',
      'Ajustar linguagem por nivel para reduzir evasao no modulo inicial.',
    ]

    return {
      periodo_referencia: payload.periodo_referencia || '2026-Q2',
      alunos_ativos: alunos,
      turmas_ativas: turmas,
      retencao_media_percentual: retencao,
      conclusao_media_percentual: conclusao,
      engajamento_medio_percentual: engajamento,
      melhoria_sugerida_por_ia: melhoria,
      evolucao_por_turma: Array.from({ length: turmas }).map((_, idx) => ({
        turma_id: `turma_${idx + 1}`,
        progresso_percentual: Math.min(100, conclusao + idx * 3),
        risco_evasao_percentual: Math.max(5, 32 - idx * 4),
      })),
      timestamp: new Date(),
    }
  }

  static async resumoSistema() {
    const resumo = await this.store.resumo()
    return {
      ciclo: 'OPERAR -> MEDIR -> INTERPRETAR -> ENSINAR -> MELHORAR -> OPERAR',
      ...resumo,
    }
  }

  private static transicaoPermitida(
    atual: PipelineEditorialStatus,
    proximo: PipelineEditorialStatus
  ): boolean {
    if (atual === proximo) return true

    const atualIdx = this.PIPELINE_ORDER.indexOf(atual)
    const proximoIdx = this.PIPELINE_ORDER.indexOf(proximo)

    if (atualIdx < 0 || proximoIdx < 0) return false
    return proximoIdx === atualIdx + 1 || (atual === 'publicacao' && proximo === 'diagramacao')
  }

  private static definirTemaPrincipal(input: InteligenciaOperacionalInput): string {
    const retrabalho = input.metricas_obras?.retrabalho_percentual || 0
    const conversao = input.kpis_marketing?.conversao || 0

    if (retrabalho > 20) return 'Redução de retrabalho em construção civil'
    if (conversao > 8) return 'Escala operacional com marketing e gestão de obras'
    return 'Eficiência operacional e fundamentos técnicos aplicados'
  }

  private static gerarObjetivosAprendizagem(input: InteligenciaOperacionalInput): string[] {
    const objetivos = [
      'Traduzir indicadores operacionais em decisões de campo.',
      'Aplicar gestão orientada por dados em obras e projetos.',
      'Conectar métricas de desempenho com aprendizagem prática.',
    ]

    if ((input.metricas_obras?.retrabalho_percentual || 0) > 15) {
      objetivos.push('Implementar padrões de qualidade para reduzir retrabalho técnico.')
    }

    if ((input.comportamento_usuarios?.retencao || 0) < 45) {
      objetivos.push('Desenhar trilhas com maior retenção de conteúdo e engajamento.')
    }

    return objetivos
  }

  private static recomendarPublico(input: InteligenciaOperacionalInput): CategoriaEducacional[] {
    const publico: CategoriaEducacional[] = ['tecnico_construcao_civil', 'engenharia', 'gestao_de_obras']
    const engajamento = input.comportamento_usuarios?.engajamento_medio || 0

    if (engajamento < 50) {
      publico.push('ensino_medio', 'capacitacao_profissional')
    }

    return Array.from(new Set(publico))
  }

  private static definirNivelComplexidade(input: InteligenciaOperacionalInput): NivelComplexidade {
    const produtividade = input.metricas_obras?.produtividade || 0
    const retrabalho = input.metricas_obras?.retrabalho_percentual || 0

    if (produtividade > 80 && retrabalho < 10) return 'avancado'
    if (produtividade > 55) return 'intermediario'
    return 'iniciante'
  }

  private static tituloCapituloPorCategoria(categoria: CategoriaEducacional, ordem: number): string {
    const porCategoria: Record<CategoriaEducacional, string[]> = {
      ensino_fundamental: [
        'Leitura de Ambientes e Materiais',
        'Noções de Medição e Segurança',
        'Projeto em Equipe e Responsabilidade',
      ],
      ensino_medio: [
        'Fundamentos de Projeto e Planejamento',
        'Análise de Indicadores na Prática',
        'Simulações e Tomada de Decisão',
      ],
      tecnico_construcao_civil: [
        'Execução e Qualidade de Obra',
        'Controle de Custos e Prazo',
        'Prevenção de Retrabalho',
      ],
      capacitacao_profissional: [
        'Rotinas Operacionais de Campo',
        'Produtividade e Segurança',
        'Comunicação Técnica no Canteiro',
      ],
      engenharia: [
        'Modelagem e Planejamento Técnico',
        'Indicadores de Performance em Engenharia',
        'Gestão de Risco e Otimização',
      ],
      gestao_de_obras: [
        'Planejamento Mestre e Cronograma',
        'Integração Equipe-Fornecedor-Cliente',
        'Governança por KPI e Melhoria Contínua',
      ],
    }

    const base = porCategoria[categoria]
    return base[(ordem - 1) % base.length]
  }

  private static objetivosPorCapitulo(categoria: CategoriaEducacional, ordem: number): string[] {
    return [
      `Compreender os fundamentos de ${categoria} no módulo ${ordem}.`,
      'Aplicar o conteúdo em exercício orientado por dados.',
      'Consolidar aprendizado por desafio com feedback do John.',
    ]
  }

  private static topicosPorFoco(
    foco: Array<'didatica' | 'rigor_tecnico' | 'fundamentos_historicos' | 'gamificacao'>,
    ordem: number
  ): string[] {
    const topicos: string[] = []

    if (foco.includes('didatica')) {
      topicos.push(`Progressão didática em espiral no capítulo ${ordem}`)
    }
    if (foco.includes('rigor_tecnico')) {
      topicos.push('Formalização de requisitos, métricas e validações')
    }
    if (foco.includes('fundamentos_historicos')) {
      topicos.push('Contexto histórico e fundamentos clássicos de engenharia e álgebra')
    }
    if (foco.includes('gamificacao')) {
      topicos.push('Missões, pontos de progresso e feedback adaptativo')
    }

    return topicos.length > 0 ? topicos : ['Síntese técnica e aplicação prática']
  }

  private static narrativaPorPublico(
    publico: CategoriaEducacional,
    nivel: NivelComplexidade
  ): string {
    if (publico === 'ensino_fundamental') {
      return `John organiza a narrativa com exemplos visuais, linguagem simples e progressão ${nivel}, conectando teoria com atividades práticas curtas.`
    }

    if (publico === 'ensino_medio') {
      return `John conduz explicações contextualizadas em projetos reais, com checkpoints de aprendizagem e trilha ${nivel} orientada por desafios.`
    }

    return `John integra rigor técnico com aplicação operacional, linguagem ${nivel} e foco em decisões de obra baseadas em KPIs.`
  }
}