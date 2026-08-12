<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJohnStore } from '../store/john.store'

const johnStore = useJohnStore()
const userInput = ref('')

const panelClass = computed(() => {
  if (johnStore.isFullscreen) {
    return 'fixed inset-4 z-50 rounded-3xl'
  }

  return 'w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl'
})

const sendQuestion = () => {
  johnStore.askJohn(userInput.value)
  userInput.value = ''
}
</script>

<template>
  <section :class="panelClass" class="glass flex h-[520px] flex-col overflow-hidden">
    <header class="flex items-center justify-between border-b border-liceu-secondary/20 px-4 py-3">
      <div>
        <p class="font-display text-sm font-bold text-liceu-primary">John Brasileiro</p>
        <p class="text-xs text-liceu-primary/70">Assistente Inteligente do Ecossistema</p>
      </div>

      <div class="flex gap-2">
        <button
          class="rounded-md border border-liceu-secondary/20 px-2 py-1 text-xs text-liceu-secondary"
          @click="johnStore.toggleNarrator"
        >
          Narrador
        </button>
        <button
          class="rounded-md border border-liceu-secondary/20 px-2 py-1 text-xs text-liceu-secondary"
          @click="johnStore.toggleFullscreen"
        >
          {{ johnStore.isFullscreen ? 'Janela' : 'Tela cheia' }}
        </button>
      </div>
    </header>

    <div class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      <article
        v-for="message in johnStore.messages"
        :key="message.id"
        class="max-w-[86%] rounded-xl px-3 py-2 text-sm"
        :class="
          message.role === 'john'
            ? 'bg-liceu-secondary/10 text-liceu-primary'
            : 'ml-auto bg-liceu-accent text-white'
        "
      >
        <p>{{ message.text }}</p>
        <p class="mt-1 text-[11px] opacity-70">{{ message.at }}</p>
      </article>
    </div>

    <form class="border-t border-liceu-secondary/20 p-3" @submit.prevent="sendQuestion">
      <div class="flex gap-2">
        <input
          v-model="userInput"
          class="w-full rounded-lg border border-liceu-secondary/20 bg-white px-3 py-2 text-sm outline-none ring-liceu-accent focus:ring-2"
          placeholder="Pergunte sobre leads, ROI, ranking ou campanhas"
        />
        <button class="rounded-lg bg-liceu-accent px-4 py-2 text-sm font-semibold text-white">Enviar</button>
      </div>
    </form>
  </section>
</template>
