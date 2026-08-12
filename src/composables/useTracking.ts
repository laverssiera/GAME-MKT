import { onBeforeUnmount, onMounted } from 'vue'
import { useGameMktApi } from './useGameMktApi'

interface TrackingOptions {
  empresaId: string
  userId: string
  sessionId?: string
}

export function useTracking(options: TrackingOptions) {
  const api = useGameMktApi()
  const sessionId = options.sessionId || `sess_${Date.now()}`
  let mountedAt = 0

  const track = async (tipo: string, metadata?: Record<string, unknown>) => {
    try {
      await api.trackEvent({
        tipo,
        empresa_id: options.empresaId,
        user_id: options.userId,
        session_id: sessionId,
        url: window.location.href,
        metadata,
      })
    } catch {
      // Tracking must not break UX.
    }
  }

  onMounted(() => {
    mountedAt = Date.now()
    void track('page_view')
  })

  onBeforeUnmount(() => {
    const duracao = Math.max(0, Date.now() - mountedAt)
    void track('return_visit', { duracao_ms: duracao })
  })

  return {
    track,
  }
}
