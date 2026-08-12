<script setup lang="ts">
const missionPillars = [
  {
    titulo: 'Crescimento previsivel',
    descricao: 'Converter variabilidade comercial em rotinas de crescimento mensuraveis e escalaveis.',
  },
  {
    titulo: 'Operacao orientada por IA',
    descricao: 'Unificar recomendacoes de campanha, narrativa e produtividade em uma unica inteligencia.',
  },
  {
    titulo: 'Capital humano no centro',
    descricao: 'Performance com wellbeing, gamificacao e clareza de papis para equipes multidisciplinares.',
  },
]
</script>

<template>
  <section id="mission-presentation" class="rise-in stagger-1 rounded-3xl glass p-6 sm:p-8">
    <div class="grid gap-6 lg:grid-cols-[1fr,1.2fr] lg:items-center">
      <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-liceu-secondary/10">
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">MISSION PRESENTATION</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Missao GAME MKT</h2>
        <p class="mt-4 text-sm leading-relaxed text-liceu-primary/80">
          Orquestrar toda a jornada de receita da construcao civil com narrativa competitiva, automacao inteligente
          e governanca executiva, transformando dados dispersos em decisoes confiantes.
        </p>
      </article>

      <div class="grid gap-4 sm:grid-cols-3">
        <article
          v-for="pillar in missionPillars"
          :key="pillar.titulo"
          class="rounded-2xl border border-liceu-secondary/15 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-liceu-secondary/10"
        >
          <h3 class="text-lg font-bold text-liceu-primary">{{ pillar.titulo }}</h3>
          <p class="mt-3 text-sm text-liceu-primary/75">{{ pillar.descricao }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
