<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Command Center Interplanetario</h1>
      <div class="flex items-center gap-2">
        <button class="rounded bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800" @click="copyCurrentViewLink">
          Copiar link da visao atual
        </button>
        <span v-if="copyStatus === 'success'" class="text-sm text-green-700">Link copiado</span>
        <span v-if="copyStatus === 'error'" class="text-sm text-red-700">Falha ao copiar link. Use copia manual abaixo.</span>
        <label class="text-sm text-gray-600">Janela (h)</label>
        <select v-model.number="windowHours" class="border rounded px-2 py-1" @change="refreshLive">
          <option :value="1">1h</option>
          <option :value="6">6h</option>
          <option :value="24">24h</option>
          <option :value="72">72h</option>
        </select>
      </div>
    </div>

    <div v-if="showManualCopy" class="card">
      <h3 class="text-lg font-bold mb-2">Copia manual do link</h3>
      <div class="flex items-center gap-2">
        <input
          ref="manualCopyInput"
          :value="currentViewUrl"
          class="w-full rounded border px-2 py-1 text-sm"
          readonly
          @focus="$event.target.select()"
        >
        <button class="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200" @click="selectManualLink">
          Selecionar
        </button>
      </div>
      <p class="mt-1 text-xs text-gray-500">Se a copia automatica nao funcionar, selecione o campo e copie manualmente.</p>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="card">
        <h2 class="text-sm text-gray-600">Receita Runtime</h2>
        <p class="text-3xl font-bold">R$ {{ Number(overview?.command_center?.live_economy_runtime?.gross_revenue || 0).toLocaleString('pt-BR') }}</p>
      </div>
      <div class="card">
        <h2 class="text-sm text-gray-600">Vendas Interplanetarias</h2>
        <p class="text-3xl font-bold text-primary">{{ overview?.command_center?.live_economy_runtime?.interplanetary_sales || 0 }}</p>
      </div>
      <div class="card">
        <h2 class="text-sm text-gray-600">Alertas Causais</h2>
        <p class="text-3xl font-bold text-red-600">{{ overview?.command_center?.predictive_war_room?.causal_alerts || 0 }}</p>
      </div>
      <div class="card">
        <h2 class="text-sm text-gray-600">Fechamentos Preditivos</h2>
        <p class="text-3xl font-bold text-success">{{ overview?.command_center?.predictive_war_room?.predictive_closings || 0 }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="card">
        <h3 class="text-lg font-bold mb-3">Stream em Tempo Real</h3>
        <ul class="space-y-2 text-sm">
          <li class="flex justify-between"><span>Telemetry events</span><strong>{{ live?.stream?.telemetry_events || 0 }}</strong></li>
          <li class="flex justify-between"><span>Memory events</span><strong>{{ live?.stream?.memory_events || 0 }}</strong></li>
          <li class="flex justify-between"><span>Sales closed</span><strong>{{ live?.stream?.sales_closed || 0 }}</strong></li>
          <li class="flex justify-between"><span>Sales revenue</span><strong>R$ {{ Number(live?.stream?.sales_revenue || 0).toLocaleString('pt-BR') }}</strong></li>
        </ul>
      </div>
      <div class="card">
        <h3 class="text-lg font-bold mb-3">Subscribers</h3>
        <p class="text-sm">Enabled: <strong>{{ overview?.subscribers?.enabled ? 'sim' : 'nao' }}</strong></p>
        <p class="text-sm">Reason: <strong>{{ overview?.subscribers?.reason || 'n/a' }}</strong></p>
        <p class="text-sm mt-2">Subjects monitorados: <strong>{{ overview?.subscribers?.subjects?.length || 0 }}</strong></p>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Ultimos Eventos (Telemetry)</h3>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <button class="rounded px-2 py-1 text-xs" :class="groupButtonClass('all')" @click="selectedGroup = 'all'">Todos</button>
            <button class="rounded px-2 py-1 text-xs" :class="groupButtonClass('sales')" @click="selectedGroup = 'sales'">Vendas</button>
            <button class="rounded px-2 py-1 text-xs" :class="groupButtonClass('causal')" @click="selectedGroup = 'causal'">Causal</button>
            <button class="rounded px-2 py-1 text-xs" :class="groupButtonClass('campaign')" @click="selectedGroup = 'campaign'">Campanha</button>
            <button class="rounded px-2 py-1 text-xs" :class="groupButtonClass('observability')" @click="selectedGroup = 'observability'">Observabilidade</button>
          </div>
          <input
            v-model.trim="searchText"
            class="border rounded px-2 py-1"
            placeholder="Buscar subject/payload"
            type="text"
          >
          <label class="text-sm text-gray-600">Subject</label>
          <select v-model="selectedSubject" class="border rounded px-2 py-1">
            <option value="all">Todos</option>
            <option v-for="subject in telemetrySubjects" :key="subject" :value="subject">
              {{ subject }}
            </option>
          </select>
          <label class="flex items-center gap-1 text-sm text-gray-700">
            <input v-model="onlyHigh" type="checkbox">
            Apenas HIGH
          </label>
          <label class="text-sm text-gray-600">Ordenar</label>
          <select v-model="sortMode" class="border rounded px-2 py-1">
            <option value="severity_desc_time_desc">Severidade desc + tempo desc</option>
            <option value="time_desc">Tempo desc</option>
            <option value="time_asc">Tempo asc</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2 pr-4">Severidade</th>
              <th class="py-2 pr-4">Subject</th>
              <th class="py-2 pr-4">Payload</th>
              <th class="py-2 pr-4">Source</th>
              <th class="py-2 pr-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in sortedTelemetry" :key="index" class="border-b">
              <td class="py-2 pr-4">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                  :class="severityClass(getSeverity(event.subject))"
                >
                  {{ getSeverity(event.subject) }}
                </span>
              </td>
              <td class="py-2 pr-4" v-html="highlightText(event.subject)"></td>
              <td class="py-2 pr-4 max-w-xl truncate" v-html="highlightText(payloadPreview(event))"></td>
              <td class="py-2 pr-4">{{ event.source }}</td>
              <td class="py-2 pr-4">{{ event.recorded_at }}</td>
            </tr>
            <tr v-if="sortedTelemetry.length === 0">
              <td class="py-4 text-gray-500" colspan="5">Nenhum evento encontrado com os filtros atuais.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getInterplanetaryCommandCenterLive,
  getInterplanetaryCommandCenterOverview
} from '@/services/api'

const overview = ref<any>(null)
const live = ref<any>(null)
const route = useRoute()
const router = useRouter()

type GroupFilter = 'all' | 'sales' | 'causal' | 'campaign' | 'observability'
type SortMode = 'severity_desc_time_desc' | 'time_desc' | 'time_asc'

const windowHours = ref(24)
const selectedSubject = ref('all')
const selectedGroup = ref<GroupFilter>('all')
const searchText = ref('')
const onlyHigh = ref(false)
const sortMode = ref<SortMode>('severity_desc_time_desc')
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')
const showManualCopy = ref(false)
const manualCopyInput = ref<HTMLInputElement | null>(null)
let refreshTimer: ReturnType<typeof setInterval> | null = null
let syncingFromRoute = false
let copyStatusTimer: ReturnType<typeof setTimeout> | null = null

const telemetrySubjects = computed(() => {
  const events = live.value?.latest?.telemetry || []
  return Array.from(new Set(events.map((event: any) => event.subject))).sort()
})

const filteredTelemetry = computed(() => {
  const events = live.value?.latest?.telemetry || []
  return events.filter((event: any) => {
    const bySubject = selectedSubject.value === 'all' || event.subject === selectedSubject.value
    const byGroup = selectedGroup.value === 'all' || matchesGroup(event.subject, selectedGroup.value)
    const severity = getSeverity(event.subject)
    const bySeverity = !onlyHigh.value || severity === 'HIGH'
    const query = searchText.value.toLowerCase()
    const payloadText = stringifyPayload(event.payload).toLowerCase()
    const bySearch = query.length === 0 || event.subject.toLowerCase().includes(query) || payloadText.includes(query)
    return bySubject && byGroup && bySeverity && bySearch
  })
})

const sortedTelemetry = computed(() => {
  const events = [...filteredTelemetry.value]
  const severityWeight = (subject: string) => {
    const severity = getSeverity(subject)
    if (severity === 'HIGH') {
      return 3
    }
    if (severity === 'MEDIUM') {
      return 2
    }
    return 1
  }
  const eventTime = (event: any) => Date.parse(event.recorded_at || '') || 0

  if (sortMode.value === 'time_desc') {
    return events.sort((a, b) => eventTime(b) - eventTime(a))
  }
  if (sortMode.value === 'time_asc') {
    return events.sort((a, b) => eventTime(a) - eventTime(b))
  }
  return events.sort((a, b) => {
    const severityDiff = severityWeight(b.subject) - severityWeight(a.subject)
    if (severityDiff !== 0) {
      return severityDiff
    }
    return eventTime(b) - eventTime(a)
  })
})

function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload ?? {})
  } catch {
    return ''
  }
}

function payloadPreview(event: any): string {
  const content = stringifyPayload(event.payload)
  if (content.length <= 160) {
    return content
  }
  return `${content.slice(0, 160)}...`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlightText(text: string): string {
  const query = searchText.value.trim()
  if (!query) {
    return escapeHtml(text)
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let cursor = 0
  let output = ''

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor)
    if (matchIndex === -1) {
      output += escapeHtml(text.slice(cursor))
      break
    }

    output += escapeHtml(text.slice(cursor, matchIndex))
    output += `<mark class="bg-yellow-200 rounded px-0.5">${escapeHtml(text.slice(matchIndex, matchIndex + query.length))}</mark>`
    cursor = matchIndex + query.length
  }

  return output
}

function matchesGroup(subject: string, group: 'all' | 'sales' | 'causal' | 'campaign' | 'observability'): boolean {
  if (group === 'all') {
    return true
  }
  if (group === 'sales') {
    return subject.includes('sales.')
  }
  if (group === 'causal') {
    return subject.includes('causal')
  }
  if (group === 'campaign') {
    return subject.includes('campaign.')
  }
  if (group === 'observability') {
    return subject.includes('observability') || subject.includes('market.signal')
  }
  return true
}

function groupButtonClass(group: 'all' | 'sales' | 'causal' | 'campaign' | 'observability') {
  return selectedGroup.value === group
    ? 'bg-slate-900 text-white'
    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
}

function toSingle(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined
  }
  return undefined
}

function parseGroup(value: string | undefined): GroupFilter {
  const groups: GroupFilter[] = ['all', 'sales', 'causal', 'campaign', 'observability']
  if (value && groups.includes(value as GroupFilter)) {
    return value as GroupFilter
  }
  return 'all'
}

function parseSortMode(value: string | undefined): SortMode {
  const modes: SortMode[] = ['severity_desc_time_desc', 'time_desc', 'time_asc']
  if (value && modes.includes(value as SortMode)) {
    return value as SortMode
  }
  return 'severity_desc_time_desc'
}

function applyQueryState() {
  syncingFromRoute = true

  const wh = Number(toSingle(route.query.window_hours))
  if (Number.isFinite(wh) && wh >= 1 && wh <= 168) {
    windowHours.value = wh
  }

  selectedSubject.value = toSingle(route.query.subject) || 'all'
  selectedGroup.value = parseGroup(toSingle(route.query.group))
  searchText.value = toSingle(route.query.q) || ''
  onlyHigh.value = toSingle(route.query.only_high) === '1'
  sortMode.value = parseSortMode(toSingle(route.query.sort))

  syncingFromRoute = false
}

function buildQueryState() {
  return {
    ...route.query,
    window_hours: String(windowHours.value),
    subject: selectedSubject.value !== 'all' ? selectedSubject.value : undefined,
    group: selectedGroup.value !== 'all' ? selectedGroup.value : undefined,
    q: searchText.value || undefined,
    only_high: onlyHigh.value ? '1' : undefined,
    sort: sortMode.value !== 'severity_desc_time_desc' ? sortMode.value : undefined
  }
}

const currentViewUrl = computed(() => {
  const query = buildQueryState()
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.set(key, value)
    }
    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, item))
    }
  })

  const queryString = params.toString()
  if (!queryString) {
    return `${window.location.origin}${window.location.pathname}`
  }
  return `${window.location.origin}${window.location.pathname}?${queryString}`
})

function selectManualLink() {
  manualCopyInput.value?.focus()
  manualCopyInput.value?.select()
}

async function copyCurrentViewLink() {
  const url = currentViewUrl.value

  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      throw new Error('clipboard_unavailable')
    }
    await navigator.clipboard.writeText(url)
    copyStatus.value = 'success'
    showManualCopy.value = false
  } catch {
    copyStatus.value = 'error'
    showManualCopy.value = true
    setTimeout(() => selectManualLink(), 0)
  }

  if (copyStatusTimer) {
    clearTimeout(copyStatusTimer)
  }
  copyStatusTimer = setTimeout(() => {
    copyStatus.value = 'idle'
  }, 1800)
}

function getSeverity(subject: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (subject.includes('causal.alert')) {
    return 'HIGH'
  }
  if (subject.includes('sales.closed') || subject.includes('sales.contract.generated')) {
    return 'MEDIUM'
  }
  return 'LOW'
}

function severityClass(severity: 'HIGH' | 'MEDIUM' | 'LOW') {
  if (severity === 'HIGH') {
    return 'bg-red-100 text-red-700'
  }
  if (severity === 'MEDIUM') {
    return 'bg-amber-100 text-amber-700'
  }
  return 'bg-slate-100 text-slate-700'
}

async function refreshOverview() {
  overview.value = await getInterplanetaryCommandCenterOverview()
}

async function refreshLive() {
  live.value = await getInterplanetaryCommandCenterLive(windowHours.value, 20)
}

onMounted(async () => {
  try {
    applyQueryState()
    await Promise.all([refreshOverview(), refreshLive()])
    refreshTimer = setInterval(() => {
      refreshLive().catch(err => console.error('Failed to refresh live stream', err))
    }, 10000)
  } catch (error) {
    console.error('Failed to load command center', error)
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (copyStatusTimer) {
    clearTimeout(copyStatusTimer)
  }
})

watch(
  () => route.query,
  async () => {
    applyQueryState()
    await refreshLive()
  }
)

watch(
  [windowHours, selectedSubject, selectedGroup, searchText, onlyHigh, sortMode],
  async () => {
    if (syncingFromRoute) {
      return
    }
    await router.replace({ query: buildQueryState() })
  }
)
</script>
