/**
 * GAME MKT Editorial Engine - LICEU 6.0
 * Tipos centrais para transformar inteligência operacional em conteúdo educacional.
 */

export type PipelineEditorialStatus =
  | 'proposta'
  | 'rascunho'
  | 'revisao_tecnica'
  | 'revisao_pedagogica'
  | 'diagramacao'
  | 'publicacao'

export type CategoriaEducacional =
  | 'ensino_fundamental'
  | 'ensino_medio'
  | 'tecnico_construcao_civil'
  | 'capacitacao_profissional'
  | 'engenharia'
  | 'gestao_de_obras'

export type NivelComplexidade = 'iniciante' | 'intermediario' | 'avancado'

export type OrigemColaboracaoGlobal = 'india' | 'china' | 'mundo_arabe' | 'ia_john'

export interface InteligenciaOperacionalInput {
  empresa_id: string
  projeto_id?: string
  periodo_referencia?: string
  comportamento_usuarios?: {
    engajamento_medio?: number
    retencao?: number
    conclusao_trilhas?: number
  }
  metricas_obras?: {
    prazo_medio_dias?: number
    retrabalho_percentual?: number
    produtividade?: number
  }
  kpis_marketing?: {
    cac?: number
    ltv?: number
    ctr?: number
    conversao?: number
    roi?: number
  }
  dados_projetos?: Record<string, unknown>
  insights_operacionais?: string[]
}

export interface InteligenciaEditorial {
  id: string
  empresa_id: string
  projeto_id?: string
  periodo_referencia?: string
  tema_principal: string
  objetivos_aprendizagem: string[]
  publico_recomendado: CategoriaEducacional[]
  nivel_complexidade: NivelComplexidade
  score_prioridade: number
  origem: 'game_mkt'
  created_at: Date
}

export interface CapituloEditorial {
  ordem: number
  titulo: string
  objetivos: string[]
  topicos: string[]
  atividade_pratica?: string
  quiz?: {
    pergunta: string
    opcoes: string[]
    resposta_correta: number
  }
}

export interface ObraEditorial {
  id: string
  empresa_id: string
  titulo: string
  subtitulo?: string
  descricao: string
  categoria: CategoriaEducacional
  nivel: NivelComplexidade
  status_pipeline: PipelineEditorialStatus
  autores: string[]
  revisores: string[]
  versao: string
  inteligencia_origem_id?: string
  capitulos: CapituloEditorial[]
  colaboradores_globais: OrigemColaboracaoGlobal[]
  formatos_publicacao: Array<'pdf' | 'epub' | 'web' | 'impressao_sob_demanda'>
  created_at: Date
  updated_at?: Date
}

export interface SolicitacaoEstruturacaoIA {
  obra_id: string
  perfil_publico: CategoriaEducacional
  nivel_linguagem: NivelComplexidade
  foco: Array<'didatica' | 'rigor_tecnico' | 'fundamentos_historicos' | 'gamificacao'>
  quantidade_capitulos?: number
}

export interface ConteudoEstruturadoIA {
  obra_id: string
  narrador: 'john_brasileiro'
  narrativa_pedagogica: string
  capitulos: CapituloEditorial[]
  recomendacoes_revisao: string[]
  timestamp: Date
}

export interface AnalyticsAprendizado {
  periodo_referencia: string
  alunos_ativos: number
  turmas_ativas: number
  retencao_media_percentual: number
  conclusao_media_percentual: number
  engajamento_medio_percentual: number
  melhoria_sugerida_por_ia: string[]
  evolucao_por_turma: Array<{
    turma_id: string
    progresso_percentual: number
    risco_evasao_percentual: number
  }>
  timestamp: Date
}

export interface ArtefatoDistribuicao {
  formato: 'pdf' | 'epub' | 'web' | 'impressao_sob_demanda'
  url: string
  checksum: string
  gerado_em: Date
}

export interface ExportacaoObra {
  obra_id: string
  titulo: string
  versao: string
  artefatos: ArtefatoDistribuicao[]
  publicado_em: Date
}

export interface BibliotecaDigitalItem {
  obra_id: string
  titulo: string
  categoria: CategoriaEducacional
  nivel: NivelComplexidade
  versao: string
  formatos: Array<'pdf' | 'epub' | 'web' | 'impressao_sob_demanda'>
  atualizado_em: Date
}

export interface TrilhaEducacional {
  id: string
  nome: string
  categoria: CategoriaEducacional
  publico_alvo: string
  nivel: NivelComplexidade
  modulos: Array<{
    ordem: number
    titulo: string
    tipo: 'livro' | 'apostila' | 'curso' | 'simulacao' | 'desafio'
    carga_horaria_horas: number
  }>
  certificacao_digital: boolean
  progressao_estruturada: boolean
  created_at: Date
}