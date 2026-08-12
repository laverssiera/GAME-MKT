import { ref } from 'vue'

export type PipelineStatus =
  | 'proposta'
  | 'rascunho'
  | 'revisao_tecnica'
  | 'revisao_pedagogica'
  | 'diagramacao'
  | 'publicacao'

export interface ObraEditorialUI {
  id: string
  titulo: string
  descricao: string
  categoria: string
  nivel: string
  status_pipeline: PipelineStatus
  versao: string
  colaboradores_globais: string[]
  capitulos: Array<{ ordem: number; titulo: string }>
}

export interface BibliotecaItemUI {
  obra_id: string
  titulo: string
  categoria: string
  nivel: string
  versao: string
  formatos: string[]
  atualizado_em: string
}

export interface ExportacaoObraUI {
  obra_id: string
  titulo: string
  versao: string
  artefatos: Array<{
    formato: string
    url: string
    checksum: string
    gerado_em: string
  }>
  publicado_em: string
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export function useEditorialApi() {
  const loading = ref(false)
  const error = ref('')

  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.erro || 'Falha na operação editorial')
    }

    return data as T
  }

  const listarObras = async () => {
    loading.value = true
    error.value = ''
    try {
      const data = await request<{ total: number; obras: ObraEditorialUI[] }>('/api/editorial/obras')
      return data.obras
    } catch (err) {
      error.value = String(err)
      return []
    } finally {
      loading.value = false
    }
  }

  const capturarInteligencia = async () => {
    return request('/api/editorial/inteligencia/capturar', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: 'liceu-6.0',
        projeto_id: 'frontend-live',
        periodo_referencia: '2026-Q2',
        comportamento_usuarios: {
          engajamento_medio: 64,
          retencao: 55,
          conclusao_trilhas: 46,
        },
        metricas_obras: {
          prazo_medio_dias: 121,
          retrabalho_percentual: 13,
          produtividade: 74,
        },
        kpis_marketing: {
          cac: 205,
          ltv: 2550,
          ctr: 3.6,
          conversao: 7.7,
          roi: 196,
        },
      }),
    })
  }

  const criarObra = async (payload: {
    titulo: string
    descricao: string
    categoria: string
    nivel: string
  }) => {
    return request<ObraEditorialUI>('/api/editorial/obras', {
      method: 'POST',
      body: JSON.stringify({
        empresa_id: 'liceu-6.0',
        autores: ['Academia do Saber'],
        revisores: ['Conselho Técnico'],
        formatos_publicacao: ['pdf', 'epub', 'web'],
        ...payload,
      }),
    })
  }

  const atualizarPipeline = async (obraId: string, status: PipelineStatus) => {
    return request<ObraEditorialUI>(`/api/editorial/obras/${obraId}/pipeline`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  const estruturarIA = async (obraId: string) => {
    return request(`/api/editorial/obras/${obraId}/ia-john/estruturar`, {
      method: 'POST',
      body: JSON.stringify({
        perfil_publico: 'gestao_de_obras',
        nivel_linguagem: 'intermediario',
        foco: ['didatica', 'rigor_tecnico', 'fundamentos_historicos', 'gamificacao'],
        quantidade_capitulos: 6,
      }),
    })
  }

  const publicar = async (obraId: string) => {
    return request<ObraEditorialUI>(`/api/editorial/obras/${obraId}/publicar`, {
      method: 'POST',
    })
  }

  const exportarObra = async (obraId: string) => {
    return request<ExportacaoObraUI>(`/api/editorial/obras/${obraId}/distribuicao/exportar`, {
      method: 'POST',
      body: JSON.stringify({
        formatos: ['pdf', 'epub', 'web', 'impressao_sob_demanda'],
      }),
    })
  }

  const analyticsAprendizado = async () => {
    return request('/api/editorial/analytics/aprendizado', {
      method: 'POST',
      body: JSON.stringify({
        periodo_referencia: '2026-Q2',
      }),
    })
  }

  const bibliotecaDigital = async () => {
    return request<{ total: number; itens: BibliotecaItemUI[] }>('/api/editorial/academia/biblioteca')
  }

  const resumo = async () => {
    return request('/api/editorial/resumo')
  }

  return {
    loading,
    error,
    listarObras,
    capturarInteligencia,
    criarObra,
    atualizarPipeline,
    estruturarIA,
    publicar,
    exportarObra,
    analyticsAprendizado,
    bibliotecaDigital,
    resumo,
  }
}
