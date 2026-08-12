export interface EditorialViewEvent {
  topic: string
  time: number
  scroll: number
  clicks: number
}

export interface EditorialAction {
  action: 'create_lead' | 'recommend_content'
  origin?: 'editorial'
  topic: string
  interest_score?: number
}

export function handleEditorial(event: EditorialViewEvent): EditorialAction {
  const interestScore = calculateInterest(event)

  if (interestScore > 70) {
    return {
      action: 'create_lead',
      origin: 'editorial',
      topic: event.topic,
      interest_score: interestScore,
    }
  }

  return {
    action: 'recommend_content',
    topic: event.topic,
    interest_score: interestScore,
  }
}

export function calculateInterest(event: EditorialViewEvent): number {
  return event.time * 0.4 + event.scroll * 0.3 + event.clicks * 0.3
}

export function recommendEditorialContent(topic: string, interestScore: number): string[] {
  if (interestScore > 80) {
    return [
      `${topic}: guia avançado`,
      `${topic}: estudo de caso premium`,
      `${topic}: convite para webinar estratégico`,
    ]
  }

  if (interestScore > 50) {
    return [
      `${topic}: fundamentos práticos`,
      `${topic}: checklist de implementação`,
      `${topic}: FAQ para decisão`,
    ]
  }

  return [
    `${topic}: introdução`,
    `${topic}: conteúdo explicativo rápido`,
    `${topic}: resumo visual`,
  ]
}
