<script setup lang="ts">
const summaryCards = [
  { label: 'Receita recorrente projetada', value: 'R$ 4,8M', trend: '+12% vs trimestre anterior' },
  { label: 'Custo por lead qualificado', value: 'R$ 92', trend: '-18% com automacao' },
  { label: 'Taxa de fechamento enterprise', value: '31,4%', trend: '+6,2 p.p. no semestre' },
  { label: 'LTV medio por conta ativa', value: 'R$ 182k', trend: '+9% no ciclo anual' },
]

const channels = [
  { canal: 'Portais Imobiliarios', contribuicao: 36, color: 'bg-liceu-secondary' },
  { canal: 'Eventos de Campo', contribuicao: 24, color: 'bg-liceu-accent' },
  { canal: 'Rede de Corretores', contribuicao: 22, color: 'bg-liceu-success' },
  { canal: 'Conteudo Editorial', contribuicao: 18, color: 'bg-liceu-alert' },
]
</script>

<template>
  <section id="commercial-dashboard" class="rise-in stagger-2 rounded-3xl glass p-6 sm:p-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">COMMERCIAL DASHBOARD</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Painel comercial de alta decisao</h2>
      </div>
      <p class="max-w-xl text-sm text-liceu-primary/70">
        Indicadores de receita, eficiencia de captacao e previsibilidade para orientar o comite comercial em tempo real.
      </p>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-2xl border border-liceu-secondary/15 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-liceu-secondary/10"
      >
        <p class="text-xs text-liceu-primary/60">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-bold text-liceu-secondary">{{ card.value }}</p>
        <p class="mt-2 text-xs font-medium text-liceu-success">{{ card.trend }}</p>
      </article>
    </div>

    <div class="rise-in stagger-3 mt-6 rounded-2xl border border-liceu-secondary/15 bg-white p-5">
      <h3 class="text-lg font-semibold text-liceu-primary">Composicao de receita por canal</h3>
      <div class="mt-4 space-y-3">
        <div v-for="item in channels" :key="item.canal">
          <div class="mb-1 flex items-center justify-between text-sm">
            <span class="font-medium text-liceu-primary">{{ item.canal }}</span>
            <span class="text-liceu-primary/70">{{ item.contribuicao }}%</span>
          </div>
          <div class="h-2 rounded-full bg-liceu-surface">
            <div :class="[item.color, 'h-2 rounded-full']" :style="{ width: `${item.contribuicao}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
