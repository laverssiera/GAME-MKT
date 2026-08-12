<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import JohnBrasileiro from './components/JohnBrasileiro.vue'
import JohnNarrator from './components/JohnNarrator.vue'
import MegaMenu from './components/MegaMenu.vue'

const loadSocialProof = () => import('./components/SocialProof.vue')
const loadPortalGrid = () => import('./components/PortalGrid.vue')
const loadEcosystemWellbeingPanel = () => import('./components/EcosystemWellbeingPanel.vue')
const loadEditorialDashboard = () => import('./components/EditorialDashboard.vue')
const loadCommercialDashboard = () => import('./components/CommercialDashboard.vue')
const loadCustomerJourney = () => import('./components/CustomerJourney.vue')
const loadMissionPresentation = () => import('./components/MissionPresentation.vue')
const loadExecutiveCockpit = () => import('./components/ExecutiveCockpit.vue')

const SocialProof = defineAsyncComponent(loadSocialProof)
const PortalGrid = defineAsyncComponent(loadPortalGrid)
const EcosystemWellbeingPanel = defineAsyncComponent(loadEcosystemWellbeingPanel)
const EditorialDashboard = defineAsyncComponent(loadEditorialDashboard)
const CommercialDashboard = defineAsyncComponent(loadCommercialDashboard)
const CustomerJourney = defineAsyncComponent(loadCustomerJourney)
const MissionPresentation = defineAsyncComponent(loadMissionPresentation)
const ExecutiveCockpit = defineAsyncComponent(loadExecutiveCockpit)

let firstScrollPrefetchBound = false
let idlePrefetchTimer = 0

const prefetchNearFoldChunks = () => {
  void loadSocialProof()
  void loadPortalGrid()
}

const prefetchDeepChunks = () => {
  void loadEcosystemWellbeingPanel()
  void loadEditorialDashboard()
  void loadCommercialDashboard()
  void loadCustomerJourney()
  void loadMissionPresentation()
  void loadExecutiveCockpit()
}

const handleFirstScroll = () => {
  prefetchDeepChunks()
  if (firstScrollPrefetchBound) {
    window.removeEventListener('scroll', handleFirstScroll)
    firstScrollPrefetchBound = false
  }
}

onMounted(() => {
  if ('requestIdleCallback' in window) {
    ;(window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
      prefetchNearFoldChunks
    )
  } else {
    idlePrefetchTimer = setTimeout(prefetchNearFoldChunks, 250)
  }

  window.addEventListener('scroll', handleFirstScroll, { passive: true })
  firstScrollPrefetchBound = true
})

onUnmounted(() => {
  if (idlePrefetchTimer) {
    clearTimeout(idlePrefetchTimer)
    idlePrefetchTimer = 0
  }

  if (firstScrollPrefetchBound) {
    window.removeEventListener('scroll', handleFirstScroll)
    firstScrollPrefetchBound = false
  }
})
</script>

<template>
  <div class="relative min-h-screen bg-liceu-surface text-liceu-primary">
    <div class="ambient-bg" aria-hidden="true"></div>
    <MegaMenu />

    <main class="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <HeroSection />
      <SocialProof class="mt-16" />
      <CommercialDashboard class="mt-16" />
      <CustomerJourney class="mt-16" />
      <MissionPresentation class="mt-16" />
      <ExecutiveCockpit class="mt-16" />
      <PortalGrid class="mt-16" />
      <EcosystemWellbeingPanel class="mt-16" />
      <EditorialDashboard class="mt-16" />
    </main>

    <JohnNarrator />
    <JohnBrasileiro />
  </div>
</template>
