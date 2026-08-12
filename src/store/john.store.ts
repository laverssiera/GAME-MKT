import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useJohnIA } from '../composables/useJohnIA'

type MessageRole = 'john' | 'user'

export interface JohnMessage {
  id: number
  role: MessageRole
  text: string
  at: string
}

export const useJohnStore = defineStore('john', () => {
  const { suggestByKeyword, generateNarration } = useJohnIA()

  const isMinimized = ref(true)
  const isFullscreen = ref(false)
  const isNarratorMode = ref(false)
  const unreadCount = ref(1)

  const leadsWaiting = ref(34)
  const roi = ref(17.8)
  const conversion = ref(6.4)
  const rank = ref(4)

  const quickTip = computed(() =>
    generateNarration(isNarratorMode.value ? 'narrator' : 'console', {
      leadsWaiting: leadsWaiting.value,
      roi: roi.value,
      conversion: conversion.value,
      rank: rank.value,
    }),
  )

  const messages = ref<JohnMessage[]>([
    {
      id: 1,
      role: 'john',
      text: 'Ola! Eu sou o John Brasileiro. Quer prioridade em leads, campanha ou ROI?',
      at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const pushMessage = (role: MessageRole, text: string) => {
    messages.value.push({
      id: Date.now(),
      role,
      text,
      at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const toggleMinimized = () => {
    isMinimized.value = !isMinimized.value

    if (!isMinimized.value) {
      unreadCount.value = 0
    }
  }

  const toggleNarrator = () => {
    isNarratorMode.value = !isNarratorMode.value
  }

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

  const askJohn = (question: string) => {
    if (!question.trim()) {
      return
    }

    pushMessage('user', question)

    const answer = suggestByKeyword(question, {
      leadsWaiting: leadsWaiting.value,
      roi: roi.value,
      conversion: conversion.value,
      rank: rank.value,
    })

    window.setTimeout(() => {
      pushMessage('john', answer)
      if (isMinimized.value) {
        unreadCount.value += 1
      }
    }, 450)
  }

  const simulateRealtime = () => {
    window.setInterval(() => {
      leadsWaiting.value = Math.max(8, leadsWaiting.value + Math.floor(Math.random() * 5) - 2)
      roi.value = Math.max(9, Number((roi.value + (Math.random() * 1.2 - 0.5)).toFixed(1)))
      conversion.value = Math.max(
        2.1,
        Number((conversion.value + (Math.random() * 0.5 - 0.2)).toFixed(1)),
      )
      rank.value = Math.min(10, Math.max(1, rank.value + (Math.random() > 0.6 ? -1 : 0)))
    }, 6500)
  }

  return {
    isMinimized,
    isFullscreen,
    isNarratorMode,
    unreadCount,
    leadsWaiting,
    roi,
    conversion,
    rank,
    quickTip,
    messages,
    toggleMinimized,
    toggleNarrator,
    toggleFullscreen,
    askJohn,
    simulateRealtime,
  }
})
