<script setup lang="ts">
const priorities = [
  {
    frente: 'Expansao Regional',
    owner: 'Diretoria Comercial',
    progresso: 68,
    risco: 'Moderado',
  },
  {
    frente: 'Efetividade de Midia',
    owner: 'Growth Ops',
    progresso: 81,
    risco: 'Baixo',
  },
  {
    frente: 'Automacao de Follow-up',
    owner: 'RevOps + IA',
    progresso: 54,
    risco: 'Alto',
  },
]

const riskClass = (risk: string) => {
  if (risk === 'Baixo') return 'text-liceu-success bg-liceu-success/10'
  if (risk === 'Moderado') return 'text-liceu-alert bg-liceu-alert/10'
  return 'text-rose-600 bg-rose-100'
}
</script>

<template>
  <section id="executive-cockpit" class="rise-in stagger-2 rounded-3xl glass p-6 sm:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">EXECUTIVE COCKPIT</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Cockpit executivo de governanca</h2>
      </div>
      <p class="max-w-xl text-sm text-liceu-primary/70">
        Priorizacao tatico-estrategica para rituais de diretoria com visao de risco, ownership e progresso.
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <article
        v-for="item in priorities"
        :key="item.frente"
        class="rounded-2xl border border-liceu-secondary/15 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-liceu-secondary/10"
      >
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-bold text-liceu-primary">{{ item.frente }}</h3>
          <span :class="[riskClass(item.risco), 'rounded-full px-3 py-1 text-xs font-semibold']">{{ item.risco }}</span>
        </div>

        <p class="mt-3 text-sm text-liceu-primary/70">Owner: {{ item.owner }}</p>

        <div class="mt-4">
          <div class="mb-1 flex items-center justify-between text-xs text-liceu-primary/70">
            <span>Progresso</span>
            <span>{{ item.progresso }}%</span>
          </div>
          <div class="h-2 rounded-full bg-liceu-surface">
            <div class="h-2 rounded-full bg-liceu-secondary" :style="{ width: `${item.progresso}%` }"></div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
