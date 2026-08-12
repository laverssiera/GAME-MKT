<script setup lang="ts">
const journeySteps = [
  {
    etapa: 'Atracao',
    acao: 'Conteudo + portais segmentados por regiao e perfil de obra.',
    kpi: 'CTR 7,8%',
  },
  {
    etapa: 'Qualificacao',
    acao: 'John Brasileiro prioriza leads com maior score de fechamento.',
    kpi: 'SLA 03m 12s',
  },
  {
    etapa: 'Experiencia',
    acao: 'Digital Twin e storytelling adaptativo durante o atendimento.',
    kpi: 'NPS 74',
  },
  {
    etapa: 'Conversao',
    acao: 'Bundles inteligentes e contratos com gatilhos de margem.',
    kpi: 'Win Rate 31%',
  },
  {
    etapa: 'Pos-venda',
    acao: 'Trilhas educacionais + recorrencia de servicos em ciclos de 90 dias.',
    kpi: 'Retencao 89%',
  },
]
</script>

<template>
  <section id="customer-journey" class="rise-in stagger-3 rounded-3xl glass p-6 sm:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">CUSTOMER JOURNEY</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Jornada do cliente de ponta a ponta</h2>
      </div>
      <p class="max-w-xl text-sm text-liceu-primary/70">
        Fluxo operacional conectando marketing, vendas e sucesso do cliente em um unico trilho de conversao sustentavel.
      </p>
    </div>

    <ol class="grid gap-4 lg:grid-cols-5">
      <li
        v-for="(step, idx) in journeySteps"
        :key="step.etapa"
        class="rounded-2xl border border-liceu-secondary/15 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-liceu-secondary/10"
      >
        <p class="text-xs font-semibold tracking-[0.12em] text-liceu-secondary">ETAPA {{ idx + 1 }}</p>
        <h3 class="mt-2 text-lg font-bold text-liceu-primary">{{ step.etapa }}</h3>
        <p class="mt-2 text-sm text-liceu-primary/75">{{ step.acao }}</p>
        <p class="mt-3 inline-flex rounded-full bg-liceu-secondary/10 px-3 py-1 text-xs font-semibold text-liceu-secondary">
          {{ step.kpi }}
        </p>
      </li>
    </ol>
  </section>
</template>
