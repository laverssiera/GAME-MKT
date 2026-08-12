export interface CollectiveSignal {
  source: string
  objective: string
  payload: Record<string, unknown>
}

export class CollectiveAgiHooks {
  async emit(signal: CollectiveSignal) {
    return {
      accepted: true,
      ts: new Date().toISOString(),
      signal,
    }
  }
}
