export class CausalRuntime {
  inferClosingDrivers(signals: Array<{ factor: string; impact: number }>) {
    const ordered = [...signals].sort((a, b) => b.impact - a.impact)

    return {
      top_drivers: ordered.slice(0, 5),
      confidence: ordered.length > 0 ? Math.min(0.99, 0.6 + ordered[0].impact / 100) : 0.5,
    }
  }
}
