<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  useGameMktApi,
  type HumanizedMetric,
  type InsightItem,
  type KpiItem,
  type Medalha,
  type WellbeingAlert,
} from '../composables/useGameMktApi'

const api = useGameMktApi()

const loading = ref(false)
const feedback = ref('')

const kpis = ref<KpiItem[]>([])
const insights = ref<InsightItem[]>([])
const metricasHumanizadas = ref<HumanizedMetric[]>([])
const medalhas = ref<Medalha[]>([])
const alertas = ref<WellbeingAlert[]>([])

const heatmapSeed = ref(7)
const heatmap = computed(() => {
  const cells: number[] = []
  for (let i = 0; i < 35; i += 1) {
    const value = ((i * 17 + heatmapSeed.value * 13) % 100) + 1
    cells.push(value)
  }
  return cells
})

const scoreSaude = computed(() => {
  if (!kpis.value.length) return 0
  const roi = kpis.value.find((k) => k.tipo === 'ROI')?.valor ?? 0
  const conversao = kpis.value.find((k) => k.tipo === 'conversao')?.valor ?? 0
  const cac = kpis.value.find((k) => k.tipo === 'CAC')?.valor ?? 0
  const normalizado = Math.max(0, Math.min(100, conversao * 4 + roi * 0.2 + (300 - cac) * 0.1))
  return Number(normalizado.toFixed(1))
})

const loadDashboard = async () => {
  loading.value = true
  feedback.value = ''

  try {
    const [kpiData, humanData, medalhaData, alertaData] = await Promise.all([
      api.getMultiKpis(),
      api.getHumanizedMetrics(),
      api.getMedalhas({
        usuario_id: 'col_111',
        actor_tipo: 'colaborador',
        metricas: {
          equilibrio: 82,
          tempo_resposta: 20,
          qualidade: 95,
          satisfacao_parceiros: 92,
          projetos_no_prazo: 6,
          score_colaboracao: 85,
          score_comunicacao: 80,
        },
      }),
      api.getWellbeingAlerts({
        actor_id: 'col_111',
        actor_tipo: 'colaborador',
        equilibrio_status: 'atencao',
        carga_trabalho: 72,
        produtividade: 58,
        tempo_offline: 24,
        horas_extras: 8,
        tendencia: 'estavel',
      }),
    ])

    kpis.value = kpiData.kpis
    metricasHumanizadas.value = humanData.slice(0, 6)
    medalhas.value = medalhaData.medalhas_conquistadas
    alertas.value = alertaData.alertas

    const insightData = await api.analyzeInsights({
      kpis: kpiData.kpis,
      historicosPorTipo: {
        CAC: [190, 200, 210, 220],
        ROI: [130, 150, 170, 180],
        conversao: [5.4, 5.9, 6.3, 6.8],
      },
    })
    insights.value = insightData.insights

    feedback.value = 'Painel consolidado com dados de marketing, gamificacao e bem-estar.'
    heatmapSeed.value += 2
  } catch (error) {
    feedback.value = String(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section id="ecosystem-wellbeing" class="rounded-3xl glass p-6 sm:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">BEM-ESTAR E GAMIFICACAO</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Human KPI Engine + Performance Dashboard</h2>
      </div>

      <button
        class="rounded-xl border border-liceu-secondary/25 px-4 py-2 text-sm font-semibold text-liceu-secondary"
        @click="loadDashboard"
      >
        {{ loading ? 'Atualizando...' : 'Atualizar painel' }}
      </button>
    </div>

    <p class="mb-6 rounded-xl bg-white px-4 py-3 text-sm text-liceu-primary/80">
      {{ feedback || 'Sincronizando dados do ecossistema...' }}
    </p>

    <div class="grid gap-4 lg:grid-cols-4">
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <p class="text-xs text-liceu-primary/60">Score saude ecossistema</p>
        <p class="mt-2 text-3xl font-bold text-liceu-secondary">{{ scoreSaude }}</p>
      </article>
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <p class="text-xs text-liceu-primary/60">Medalhas conquistadas</p>
        <p class="mt-2 text-3xl font-bold text-liceu-success">{{ medalhas.length }}</p>
      </article>
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <p class="text-xs text-liceu-primary/60">Alertas ativos</p>
        <p class="mt-2 text-3xl font-bold text-liceu-alert">{{ alertas.length }}</p>
      </article>
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <p class="text-xs text-liceu-primary/60">Insights automaticos</p>
        <p class="mt-2 text-3xl font-bold text-liceu-accent">{{ insights.length }}</p>
      </article>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-2">
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <h3 class="text-lg font-semibold text-liceu-primary">Metricas humanizadas</h3>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <div
            v-for="m in metricasHumanizadas"
            :key="m.tecnico"
            class="rounded-xl border border-liceu-secondary/10 bg-liceu-surface px-3 py-2"
          >
            <p class="text-xs font-semibold text-liceu-secondary">{{ m.tecnico }}</p>
            <p class="text-sm text-liceu-primary/80">{{ m.descricao }}</p>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <h3 class="text-lg font-semibold text-liceu-primary">Heatmap de engajamento</h3>
        <div class="mt-3 grid grid-cols-7 gap-1">
          <div
            v-for="(cell, idx) in heatmap"
            :key="idx"
            class="h-6 rounded"
            :style="{
              backgroundColor: `rgba(59,130,246,${Math.max(0.15, cell / 100)})`,
            }"
          ></div>
        </div>
        <p class="mt-2 text-xs text-liceu-primary/60">Ultimos 35 blocos de atividade comportamental.</p>
      </article>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-2">
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <h3 class="text-lg font-semibold text-liceu-primary">Medalhas de performance</h3>
        <div v-if="medalhas.length" class="mt-3 space-y-2">
          <div
            v-for="medalha in medalhas"
            :key="medalha.id"
            class="rounded-xl border border-emerald-500/20 bg-emerald-50 px-3 py-2"
          >
            <p class="text-sm font-semibold text-emerald-700">{{ medalha.nome }}</p>
            <p class="text-xs text-emerald-700/80">{{ medalha.descricao }}</p>
          </div>
        </div>
        <p v-else class="mt-3 text-sm text-liceu-primary/70">Sem medalhas nesta janela.</p>
      </article>

      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <h3 class="text-lg font-semibold text-liceu-primary">Alertas do ecossistema</h3>
        <div v-if="alertas.length" class="mt-3 space-y-2">
          <div
            v-for="alerta in alertas"
            :key="alerta.id"
            class="rounded-xl border border-amber-500/20 bg-amber-50 px-3 py-2"
          >
            <p class="text-sm font-semibold text-amber-700">{{ alerta.tipo }} · {{ alerta.severidade }}</p>
            <p class="text-xs text-amber-700/80">{{ alerta.mensagem }}</p>
          </div>
        </div>
        <p v-else class="mt-3 text-sm text-liceu-primary/70">Nenhum alerta ativo.</p>
      </article>
    </div>

    <article class="mt-5 rounded-2xl border border-liceu-secondary/15 bg-white p-4">
      <h3 class="text-lg font-semibold text-liceu-primary">Insights automaticos</h3>
      <div v-if="insights.length" class="mt-3 grid gap-2 sm:grid-cols-2">
        <div
          v-for="insight in insights.slice(0, 4)"
          :key="insight.id"
          class="rounded-xl border border-liceu-secondary/10 bg-liceu-surface px-3 py-2"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-liceu-secondary">{{ insight.nivel }}</p>
          <p class="text-sm font-semibold text-liceu-primary">{{ insight.titulo }}</p>
          <p class="text-xs text-liceu-primary/70">{{ insight.recomendacao }}</p>
        </div>
      </div>
      <p v-else class="mt-3 text-sm text-liceu-primary/70">Sem insights no momento.</p>
    </article>
  </section>
</template>
