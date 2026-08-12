<script setup lang="ts">
const portals = [
  { name: 'Portal do Corretor', status: '34 leads aguardando', kpi: 'Quente', color: 'bg-rose-500/15 text-rose-700' },
  { name: 'Portal de Campanhas', status: '5 campanhas ativas', kpi: 'Escalando', color: 'bg-emerald-500/15 text-emerald-700' },
  { name: 'Portal de Ranking', status: 'Time em 4o lugar', kpi: 'Competitivo', color: 'bg-amber-400/20 text-amber-700' },
  { name: 'Portal de Premiacoes', status: '8 badges liberadas', kpi: 'Engajando', color: 'bg-sky-500/20 text-sky-700' },
  { name: 'Portal de Conteudo', status: '11 pecas prontas', kpi: 'Constante', color: 'bg-indigo-500/20 text-indigo-700' },
  { name: 'Portal de Obras', status: '3 obras narradas', kpi: 'Visual', color: 'bg-cyan-500/20 text-cyan-700' },
  { name: 'Portal de Investimentos', status: 'ROI medio 17.8%', kpi: 'Aprovado', color: 'bg-emerald-500/15 text-emerald-700' },
  { name: 'Portal de Midia Paga', status: 'CPL caiu 14%', kpi: 'Otimo', color: 'bg-blue-500/15 text-blue-700' },
  { name: 'Portal de IA', status: 'John ativo 24/7', kpi: 'Automatizado', color: 'bg-violet-500/15 text-violet-700' },
  { name: 'Portal Executivo', status: 'KPI diario consolidado', kpi: 'Estrategico', color: 'bg-slate-500/20 text-slate-700' },
]
</script>

<template>
  <section id="portal-grid" class="rounded-3xl glass p-6 sm:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">HUB DE ACESSO COM 10 PORTAIS</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Console operacional estilo enterprise</h2>
      </div>
      <p class="max-w-lg text-sm text-liceu-primary/70">
        John Brasileiro destaca prioridades, sugere atalhos e aponta os modulos com maior impacto em conversao para o seu turno.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="portal in portals"
        :key="portal.name"
        class="group rounded-2xl border border-liceu-secondary/15 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-liceu-secondary/10"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-semibold text-liceu-primary">{{ portal.name }}</h3>
          <span :class="['rounded-full px-3 py-1 text-xs font-semibold', portal.color]">
            {{ portal.kpi }}
          </span>
        </div>

        <p class="mt-3 text-sm text-liceu-primary/70">{{ portal.status }}</p>

        <button class="mt-5 rounded-lg border border-liceu-secondary/25 px-3 py-2 text-sm font-semibold text-liceu-secondary transition group-hover:bg-liceu-secondary group-hover:text-white">
          Entrar no portal
        </button>
      </article>
    </div>
  </section>
</template>
