<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useJohnStore } from '../store/john.store'
import { useTracking } from '../composables/useTracking'
import type { HeroTwinSceneHandle } from '../lib/heroTwinScene'

const johnStore = useJohnStore()
const twinRef = ref<HTMLDivElement | null>(null)
const { track } = useTracking({ empresaId: 'liceu-6.0', userId: 'frontend-anon' })

let sceneHandle: HeroTwinSceneHandle | null = null

const setupThreeScene = async () => {
  if (!twinRef.value) return
  const { mountHeroTwinScene } = await import('../lib/heroTwinScene')
  sceneHandle?.dispose()
  sceneHandle = mountHeroTwinScene(twinRef.value)
}

onMounted(() => {
  johnStore.simulateRealtime()
  // Adia inicializacao do 3D para nao disputar o first paint.
  if ('requestIdleCallback' in window) {
    ;(window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
      () => {
        void setupThreeScene()
      }
    )
  } else {
    setTimeout(() => {
      void setupThreeScene()
    }, 120)
  }
})

onUnmounted(() => {
  sceneHandle?.dispose()
  sceneHandle = null
})

const onClickDemo = async () => {
  await track('button_click', { cta: 'agendar_demo_enterprise', area: 'hero' })
}

const onClickHub = async () => {
  await track('button_click', { cta: 'explorar_hub_portais', area: 'hero' })
}
</script>

<template>
  <section class="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
    <div class="hero-reveal rise-in rounded-3xl glass px-6 py-8 sm:px-8 lg:px-10">
      <p class="inline-flex items-center rounded-full bg-liceu-secondary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-liceu-secondary">
        MOTOR DE MARKETING GAMIFICADO
      </p>

      <h1 class="mt-6 text-4xl font-bold leading-tight text-liceu-primary sm:text-5xl">
        A Inteligencia do Marketing Gamificado para a Construcao Civil.
      </h1>

      <p class="mt-5 max-w-2xl text-lg leading-relaxed text-liceu-primary/80">
        Transformamos a jornada do real estate em uma experiencia de alta conversao guiada por dados reais, IA conversacional e narrativa competitiva em tempo real.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <button
          class="rounded-xl bg-liceu-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-liceu-accent/30 transition hover:-translate-y-0.5"
          @click="onClickDemo"
        >
          Agendar Demo Enterprise
        </button>
        <button
          class="rounded-xl border border-liceu-secondary/30 bg-white px-6 py-3 text-sm font-semibold text-liceu-secondary transition hover:bg-liceu-secondary/10"
          @click="onClickHub"
        >
          Explorar Hub de Portais
        </button>
      </div>

      <div class="mt-6 rounded-2xl border border-liceu-alert/30 bg-liceu-alert/10 p-4 text-sm text-liceu-primary">
        <p class="font-semibold text-liceu-alert">Dica do John Brasileiro</p>
        <p class="mt-1">{{ johnStore.quickTip }}</p>
      </div>
    </div>

    <div class="hero-reveal rise-in stagger-1 rounded-3xl glass p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold">Digital Twin 3D</h2>
        <span class="rounded-full bg-liceu-success/15 px-3 py-1 text-xs font-semibold text-liceu-success">Sincronizado</span>
      </div>

      <div ref="twinRef" class="h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-liceu-primary to-liceu-secondary"></div>

      <div class="mt-5 grid grid-cols-3 gap-3 text-center">
        <article class="rounded-xl bg-white p-3">
          <p class="text-xs text-liceu-primary/60">Leads Ativos</p>
          <p class="text-2xl font-bold">{{ johnStore.leadsWaiting }}</p>
        </article>
        <article class="rounded-xl bg-white p-3">
          <p class="text-xs text-liceu-primary/60">Conversao</p>
          <p class="text-2xl font-bold text-liceu-success">{{ johnStore.conversion.toFixed(1) }}%</p>
        </article>
        <article class="rounded-xl bg-white p-3">
          <p class="text-xs text-liceu-primary/60">ROI</p>
          <p class="text-2xl font-bold text-liceu-accent">{{ johnStore.roi.toFixed(1) }}%</p>
        </article>
      </div>
    </div>
  </section>
</template>
