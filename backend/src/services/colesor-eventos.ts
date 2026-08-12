/**
 * EPIC 5 - Coleta de Dados Comportamentais
 * Tracking de eventos do usuário
 */

export enum EventoTipo {
  PAGE_VIEW = 'page_view',
  LEAD_OPEN = 'lead_open',
  PROPOSAL_CLICK = 'proposal_click',
  RETURN_VISIT = 'return_visit',
  SHARE_LINK = 'share_link',
  CHAT_INTERACTION = 'chat_interaction',
  FORM_SUBMIT = 'form_submit',
  DOWNLOAD = 'download',
  VIDEO_PLAY = 'video_play',
  BUTTON_CLICK = 'button_click',
}

export interface EventoComportamento {
  id: string
  tipo: EventoTipo
  empresa_id: string
  user_id?: string
  lead_id?: string
  session_id: string
  url?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  metadata?: Record<string, any>
  timestamp: Date
  duracao_ms?: number // tempo gasto na página/ação
}

export interface ResumoComportamental {
  user_id: string
  total_eventos: number
  eventos_por_tipo: Record<EventoTipo, number>
  tempo_total_navegacao: number
  ultima_atividade: Date
  taxa_retorno: number // percentual de return_visit vs total
}

export class ColesorEventos {
  private eventos: EventoComportamento[] = []

  /**
   * Registra um novo evento
   */
  registrar(evento: Omit<EventoComportamento, 'id'>): EventoComportamento {
    const novoEvento: EventoComportamento = {
      ...evento,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    this.eventos.push(novoEvento)
    return novoEvento
  }

  /**
   * Registra múltiplos eventos em batch
   */
  registrarBatch(eventos: Omit<EventoComportamento, 'id'>[]): EventoComportamento[] {
    return eventos.map((e) => this.registrar(e))
  }

  /**
   * Gera resumo comportamental de um usuário
   */
  gerarResumo(user_id: string): ResumoComportamental {
    const eventos_usuario = this.eventos.filter((e) => e.user_id === user_id)

    const eventos_por_tipo = Object.values(EventoTipo).reduce(
      (acc, tipo) => {
        acc[tipo] = eventos_usuario.filter((e) => e.tipo === tipo).length
        return acc
      },
      {} as Record<EventoTipo, number>
    )

    const tempo_total_navegacao = eventos_usuario.reduce((acc, e) => acc + (e.duracao_ms || 0), 0)

    const return_visits = eventos_usuario.filter((e) => e.tipo === EventoTipo.RETURN_VISIT).length
    const taxa_retorno = eventos_usuario.length > 0 ? (return_visits / eventos_usuario.length) * 100 : 0

    return {
      user_id,
      total_eventos: eventos_usuario.length,
      eventos_por_tipo,
      tempo_total_navegacao,
      ultima_atividade: eventos_usuario.length > 0 ? eventos_usuario[eventos_usuario.length - 1].timestamp : new Date(),
      taxa_retorno,
    }
  }

  /**
   * Retorna eventos filtrados
   */
  filtrar(filtro: {
    empresa_id?: string
    user_id?: string
    tipo?: EventoTipo
    de?: Date
    ate?: Date
  }): EventoComportamento[] {
    return this.eventos.filter((e) => {
      if (filtro.empresa_id && e.empresa_id !== filtro.empresa_id) return false
      if (filtro.user_id && e.user_id !== filtro.user_id) return false
      if (filtro.tipo && e.tipo !== filtro.tipo) return false
      if (filtro.de && e.timestamp < filtro.de) return false
      if (filtro.ate && e.timestamp > filtro.ate) return false
      return true
    })
  }
}

/**
 * Interface para tracking automático no frontend
 * (Use no frontend Vue com composable ou Pinia store)
 */
export interface TrackerFrontendInterface {
  /**
   * Capturar page_view automaticamente
   * Chame em onMounted do componente Vue
   */
  auto_page_view(empresa_id: string, user_id: string | undefined): void

  /**
   * Capturar interações (cliques, scrolls, etc)
   */
  auto_click(empresa_id: string, user_id: string | undefined, elemento_id: string): void

  /**
   * Capturar duration automático na página
   * Chame em onBeforeUnmount do componente Vue
   */
  auto_leave_page(empresa_id: string, user_id: string | undefined, duracao_ms: number): void
}

/**
 * Exemplo de implementação no Frontend Vue:
 *
 * ```typescript
 * // Em src/composables/useTracking.ts
 * export function useTracking() {
 *   const startTime = ref(Date.now())
 *   const empresa_id = 'game-mkt-001'
 *   const user_id = 'user-123' // do contexto de auth
 *
 *   const registrarEvento = async (tipo: string, metadata?: any) => {
 *     await fetch('http://localhost:3001/api/tracking/evento', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({
 *         tipo,
 *         empresa_id,
 *         user_id,
 *         session_id: 'sess-' + Date.now(),
 *         url: window.location.href,
 *         metadata
 *       })
 *     })
 *   }
 *
 *   onMounted(() => {
 *     registrarEvento('page_view')
 *   })
 *
 *   onBeforeUnmount(() => {
 *     const duracao = Date.now() - startTime.value
 *     registrarEvento('page_leave', { duracao_ms: duracao })
 *   })
 *
 *   return { registrarEvento }
 * }
 * ```
 */
