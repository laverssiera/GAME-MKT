export type JohnMode = 'landing' | 'console' | 'narrator'

interface JohnContext {
  leadsWaiting: number
  roi: number
  conversion: number
  rank: number
}

const wittyLines = [
  'Esse lead esta quente, meu amigo. Hora de virar contrato.',
  'ROI subindo como time em final de campeonato.',
  'Campanha redonda: conversao acima da media e torcida animada.',
  'Tem oportunidade aqui com cara de gol no angulo.',
]

export function useJohnIA() {
  const suggestByKeyword = (text: string, context: JohnContext) => {
    const normalized = text.toLowerCase()

    if (normalized.includes('lead')) {
      return `Voce tem ${context.leadsWaiting} leads aguardando no Portal do Corretor. Priorize os que interagiram nas ultimas 24h.`
    }

    if (normalized.includes('roi') || normalized.includes('invest')) {
      return `No cenario atual, ROI em ${context.roi.toFixed(1)}%. Se reforcar midia no canal com melhor CPL, a projeção vai para ${(context.roi + 3.4).toFixed(1)}%.`
    }

    if (normalized.includes('campanha')) {
      return `Sua campanha principal esta em ${context.conversion.toFixed(1)}% de conversao. Sugestao: disparar rodada de remarketing gamificado com bonus para resposta em 15 minutos.`
    }

    if (normalized.includes('ranking') || normalized.includes('corretor')) {
      return `Seu time esta em ${context.rank}o no ranking semanal. Uma aceleracao no Portal de Premiacoes pode subir duas posicoes ainda hoje.`
    }

    return wittyLines[Math.floor(Math.random() * wittyLines.length)]
  }

  const generateNarration = (mode: JohnMode, context: JohnContext) => {
    if (mode === 'landing') {
      return 'Bem-vindo ao GAME MKT. Marketing gamificado com inteligencia de dados para construir conversao em escala.'
    }

    if (mode === 'console') {
      return `Painel ao vivo: ${context.leadsWaiting} leads no funil, conversao em ${context.conversion.toFixed(1)}% e ROI em ${context.roi.toFixed(1)}%. Bora acelerar.`
    }

    return `Atencao equipe: ranking em movimento, campanha lider abrindo vantagem e janela de oportunidade ativa para fechar negocio agora.`
  }

  return {
    suggestByKeyword,
    generateNarration,
  }
}
