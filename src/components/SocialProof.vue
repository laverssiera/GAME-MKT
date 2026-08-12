<script setup lang="ts">
const companies = ['LICEU Prime', 'Conecta Obras', 'Real State Grid', 'Broker Arena', 'Urbano XP']

const highlights = [
  { label: 'Leads qualificados/mensal', value: '+12.8k' },
  { label: 'Tempo medio para resposta', value: '03m 14s' },
  { label: 'Eficiencia de campanha', value: '+38%' },
]
</script>

<template>
  <section class="rise-in stagger-2 rounded-3xl glass p-6 sm:p-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">SOCIAL PROOF E PERFORMANCE</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Ecossistema confiado por operacoes de alto ticket</h2>
      </div>
      <p class="max-w-xl text-sm text-liceu-primary/70">
        GAME MKT consolida marketing, vendas e gamificacao em um unico cockpit de decisao, no estilo de navegacao Salesforce para squads de crescimento.
      </p>
    </div>

    <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <article
        v-for="company in companies"
        :key="company"
        class="grid h-16 place-content-center rounded-xl border border-liceu-secondary/15 bg-white text-sm font-semibold text-liceu-primary/80"
      >
        {{ company }}
      </article>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <article
        v-for="item in highlights"
        :key="item.label"
        class="rounded-2xl bg-gradient-to-br from-white to-slate-100 p-5"
      >
        <p class="text-xs text-liceu-primary/60">{{ item.label }}</p>
        <p class="mt-2 text-3xl font-bold text-liceu-secondary">{{ item.value }}</p>
      </article>
    </div>
  </section>
</template>
