export const RevenueSubjects = {
  LEAD_CREATED: 'liceu.revenue.lead.created',
  DEAL_CREATED: 'liceu.revenue.deal.created',
  DEAL_WON: 'liceu.revenue.deal.won',
  CAMPAIGN_STARTED: 'liceu.revenue.campaign.started',
  OMNICHANNEL_RUNTIME: 'liceu.revenue.omnichannel.runtime',
  JOHN_NEGOTIATION: 'liceu.revenue.john.negotiation',
  MARKET_SIGNAL: 'liceu.market.signal',
  INTERPLANETARY_MARKET: 'liceu.interplanetary.market',
  WARROOM_ALERT: 'liceu.warroom.alert',
} as const

export type RevenueSubject = (typeof RevenueSubjects)[keyof typeof RevenueSubjects]
