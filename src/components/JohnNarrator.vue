<script setup lang="ts">
import { computed } from 'vue'
import { useJohnStore } from '../store/john.store'

const johnStore = useJohnStore()

const narration = computed(
  () =>
    `Narracao ativa: ROI ${johnStore.roi.toFixed(1)}%, ${johnStore.leadsWaiting} leads em observacao e ranking atual em ${johnStore.rank}o.`,
)
</script>

<template>
  <transition name="fade">
    <aside
      v-if="johnStore.isNarratorMode"
      class="fixed left-1/2 top-3 z-40 w-[min(92vw,780px)] -translate-x-1/2 rounded-xl bg-liceu-primary px-5 py-3 text-sm text-white shadow-2xl"
    >
      <p class="font-semibold">John Brasileiro no modo narrador</p>
      <p class="mt-1 text-white/85">{{ narration }}</p>
    </aside>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 220ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}
</style>
