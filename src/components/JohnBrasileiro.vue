<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useJohnStore } from '../store/john.store'

const loadJohnChat = () => import('./JohnChat.vue')
const JohnChat = defineAsyncComponent(loadJohnChat)

const johnStore = useJohnStore()

const prefetchJohnChat = () => {
  void loadJohnChat()
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
    <p
      v-if="johnStore.isMinimized"
      class="max-w-64 rounded-xl bg-liceu-primary px-3 py-2 text-xs text-white shadow-xl"
    >
      Voce tem {{ johnStore.leadsWaiting }} leads aguardando no Portal do Corretor.
    </p>

    <JohnChat v-if="!johnStore.isMinimized" />

    <button
      class="pulse-soft relative grid h-16 w-16 place-content-center rounded-full bg-liceu-primary text-lg font-bold text-white shadow-2xl shadow-liceu-primary/45"
      @click="johnStore.toggleMinimized"
      @mouseenter="prefetchJohnChat"
      @focus="prefetchJohnChat"
    >
      JB
      <span
        v-if="johnStore.unreadCount > 0 && johnStore.isMinimized"
        class="absolute -right-1 -top-1 grid h-6 w-6 place-content-center rounded-full bg-rose-500 text-xs"
      >
        {{ johnStore.unreadCount }}
      </span>
    </button>
  </div>
</template>
