import { http } from './http'

export async function getDashboardMetrics() {
  const { data } = await http.get('/dashboard/metrics')
  return data
}

export async function getDashboardRealtime() {
  const { data } = await http.get('/dashboard/realtime')
  return data
}

export async function getLeads(skip = 0, limit = 100) {
  const { data } = await http.get('/leads', { params: { skip, limit } })
  return data
}

export async function createLead(leadData: any) {
  const { data } = await http.post('/leads', leadData)
  return data
}

export async function updateLead(leadId: string, leadData: any) {
  const { data } = await http.patch(`/leads/${leadId}`, leadData)
  return data
}

export async function qualifyLead(leadId: string) {
  const { data } = await http.post(`/leads/${leadId}/qualify`)
  return data
}

export async function getCampaigns() {
  const { data } = await http.get('/campaigns')
  return data
}

export async function createCampaign(campaignData: any) {
  const { data } = await http.post('/campaigns', campaignData)
  return data
}

export async function getBundles() {
  const { data } = await http.get('/composer/bundles/templates')
  return data
}

export async function getPersistedBundles(skip = 0, limit = 100) {
  const { data } = await http.get('/composer/bundles', { params: { skip, limit } })
  return data
}

export async function createBundle(payload: {
  name: string
  description?: string
  template_type: string
  total_price: number
  margin_percentage?: number
  products?: string[]
}) {
  const { data } = await http.post('/composer/bundles', payload)
  return data
}

export async function executeBundle(bundleId: string, customerId?: string) {
  const { data } = await http.post('/composer/execute', {
    bundle_id: bundleId,
    customer_id: customerId
  })
  return data
}

export async function getExecutionStatus(executionId: string) {
  const { data } = await http.get(`/composer/executions/${executionId}`)
  return data
}

export async function getBundleExecutions(bundleId: string) {
  const { data } = await http.get(`/composer/bundles/${bundleId}/executions`)
  return data
}

export async function rescheduleExecution(executionId: string, daysAdjustment: number) {
  const { data } = await http.put(`/composer/executions/${executionId}/reschedule`, {
    days_adjustment: daysAdjustment
  })
  return data
}

export async function updateExecutionStatus(
  executionId: string,
  payload: { status: 'created' | 'in_progress' | 'rescheduled' | 'completed'; progress?: number; current_phase?: string }
) {
  const { data } = await http.patch(`/composer/executions/${executionId}/status`, payload)
  return data
}

export async function suggestBundles(requirements: string[], constraints: any) {
  const { data } = await http.post('/composer/suggest', {
    requirements,
    constraints
  })
  return data
}

export async function discoverBundle(query: string) {
  const { data } = await http.post('/composer/discover', { query })
  return data
}

export async function checkBundleCompatibility(bundleId: string) {
  const { data } = await http.post('/composer/compatibility/check', {
    bundle_id: bundleId
  })
  return data
}

export async function getInterplanetaryCommandCenterOverview() {
  const { data } = await http.get('/interplanetary/runtime/command-center/overview')
  return data
}

export async function getInterplanetaryCommandCenterLive(windowHours = 24, limit = 20) {
  const { data } = await http.get('/interplanetary/runtime/command-center/live', {
    params: {
      window_hours: windowHours,
      limit
    }
  })
  return data
}
