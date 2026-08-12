/**
 * EPIC - Marketing de Ecossistema Sustentável
 * Tipos e interfaces para bem-estar e equilíbrio
 */

export enum ActorTipo {
  COLABORADOR = 'colaborador',
  FORNECEDOR = 'fornecedor',
  PARCEIRO = 'parceiro',
  CLIENTE = 'cliente',
}

export enum EquilibrioStatus {
  SAUDAVEL = 'saudável',
  ATENCAO = 'atenção',
  SOBRECARGA = 'sobrecarga',
}

export enum SaúdeEcossistema {
  EXCELENTE = 'excelente',
  BOM = 'bom',
  ATENCAO = 'atenção',
  CRITICO = 'crítico',
}

/**
 * Human KPI - Indicadores de bem-estar
 */
export interface HumanKPI {
  id: string
  actor_id: string
  actor_tipo: ActorTipo
  empresa_id: string

  // Carga de trabalho
  carga_trabalho: number // 0-100%
  tarefas_abertas: number
  prazos_apertados: number
  tempo_resposta_medio: number // minutos

  // Equilíbrio
  tempo_offline: number // horas/semana
  pausas_realizadas: number
  engajamento_voluntario: number // 0-100
  horas_extras_estimadas: number // horas/semana

  // Bem-estar geral
  equilibrio: number // 0-100
  score_bem_estar: number // 0-100
  tendencia: 'melhorando' | 'estavel' | 'piorando'

  created_at: Date
  updated_at?: Date
}

/**
 * Métrica de Equilíbrio Vida/Trabalho
 */
export interface EquilibrioScore {
  score_equilibrio: number // 0-100
  status: EquilibrioStatus
  justificativa: string
  timestamp: Date
  actor_id: string
  actor_tipo: ActorTipo
}

/**
 * Métrica de Fornecedor
 */
export interface FornecedorKPI {
  fornecedor_id: string
  prazos_apertados: number
  volume_excessivo: number // 0-100
  qualidade_comunicacao: number // 0-100
  dependencia: number // 0-100 (quanto depende só de nós)
  score_saude: number // 0-100
  status: EquilibrioStatus
}

/**
 * Métrica de Colaborador/Equipe
 */
export interface ColaboradorKPI {
  colaborador_id: string
  distribuicao_tarefas: number // 0-100 (quanto distribuído)
  produtividade: number // 0-100
  qualidade_pausas: number // 0-100
  continuidade: number // 0-100 (consistência)
  satisfacao: number // 0-100
  score_bem_estar: number // 0-100
}

/**
 * Score de Saúde do Ecossistema
 */
export interface EcossistemaSaude {
  health_score: number // 0-100
  status: SaúdeEcossistema
  timestamp: Date
  componentes: any
  alertas: string[]
  recomendacoes: string[]
}

/**
 * Alerta de Bem-Estar
 */
export interface AlertaBemEstar {
  id: string
  tipo: 'sobrecarga' | 'cansaco' | 'pressao' | 'desbalanceio'
  actor_id: string
  actor_tipo: ActorTipo
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  mensagem: string
  acao_sugerida: string
  timestamp: Date
  lido: boolean
}

/**
 * Sugestão de Ação (Decision Tree)
 */
export interface SuggestaoAcao {
  id: string
  tipo: 'redistribuir' | 'pausar' | 'ampliar_prazo' | 'aumentar_recursos'
  condicoes: string[]
  acao: string
  impacto_esperado: string
  prioridade: 'baixa' | 'media' | 'alta'
  timestamp: Date
}

/**
 * Medalha de Reconhecimento (Gamificação)
 */
export interface Medalha {
  id: string
  nome: string
  descricao: string
  categoria: 'colaboracao' | 'equilíbrio' | 'eficiencia' | 'sustentabilidade'
  criterios: string[]
  ícone: string
}

/**
 * Conquista de Usuário
 */
export interface Conquista {
  id: string
  usuario_id: string
  actor_tipo: ActorTipo
  medalha_id: string
  data_conquista: Date
  descricao: string
}

/**
 * Ranking Saudável (não competitivo)
 */
export interface RankingSaudavel {
  posicao: number
  actor_id: string
  actor_tipo: ActorTipo
  nome: string
  score_equilibrio: number
  tendencia: 'melhorando' | 'estavel' | 'piorando'
  medalhas: number
  categoria: string // 'fornecedor', 'colaborador', etc
}
