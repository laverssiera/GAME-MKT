<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const menuItems = [
  { label: 'Visao Geral', href: '#top' },
  { label: 'Mission Presentation', href: '#mission-presentation' },
  { label: 'Executive Cockpit', href: '#executive-cockpit' },
  { label: 'Commercial Dashboard', href: '#commercial-dashboard' },
  { label: 'Customer Journey', href: '#customer-journey' },
  { label: 'Portais', href: '#portal-grid' },
  { label: 'Gamificacao', href: '#ecosystem-wellbeing' },
  { label: 'Dashboard Editorial', href: '#editorial-dashboard' },
]

const activeHref = ref('#top')
const isScrolled = ref(false)

const itemClass = (href: string) => {
  if (activeHref.value === href) {
    return 'bg-liceu-secondary text-white shadow-lg shadow-liceu-secondary/30'
  }
  return 'text-liceu-primary hover:bg-liceu-secondary hover:text-white'
}

const updateActiveFromScroll = () => {
  isScrolled.value = window.scrollY > 8
  const marker = window.scrollY + 150
  const anchors = menuItems
    .filter((item) => item.href !== '#top')
    .map((item) => ({
      href: item.href,
      element: document.querySelector(item.href) as HTMLElement | null,
    }))
    .filter((entry) => Boolean(entry.element)) as Array<{ href: string; element: HTMLElement }>

  if (window.scrollY < 80 || anchors.length === 0) {
    activeHref.value = '#top'
    return
  }

  let currentHref = '#top'
  for (const anchor of anchors) {
    if (anchor.element.offsetTop <= marker) {
      currentHref = anchor.href
    }
  }

  activeHref.value = currentHref
}

onMounted(() => {
  updateActiveFromScroll()
  window.addEventListener('scroll', updateActiveFromScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveFromScroll)
})
</script>

<template>
  <header
    id="top"
    :class="[
      'sticky top-0 z-30 border-b border-liceu-primary/10 bg-white/85 backdrop-blur-lg transition-shadow duration-300 lg:relative lg:top-auto lg:z-20 lg:bg-white/75',
      isScrolled ? 'shadow-lg shadow-liceu-primary/10 lg:shadow-none' : 'shadow-none'
    ]"
  >
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-content-center rounded-xl bg-liceu-primary text-sm font-bold text-white">
          GM
        </div>
        <div>
          <p class="font-display text-sm font-semibold tracking-[0.18em] text-liceu-secondary">LICEU 6.0</p>
          <p class="text-xs text-liceu-primary/70">GAME MKT Frontend Oficial</p>
        </div>
      </div>

      <nav class="hidden items-center gap-2 lg:flex">
        <a
          v-for="item in menuItems"
          :key="item.label"
          :href="item.href"
          :class="[
            itemClass(item.href),
            'rounded-full px-4 py-2 text-sm font-medium transition'
          ]"
          :aria-current="activeHref === item.href ? 'page' : undefined"
        >
          {{ item.label }}
        </a>
      </nav>

      <button class="hidden rounded-full bg-liceu-accent px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-liceu-accent/35 transition hover:-translate-y-0.5 sm:inline-flex">
        Solicitar Demonstracao
      </button>
    </div>

    <nav class="border-t border-liceu-primary/10 px-4 pb-3 pt-2 sm:px-6 lg:hidden" aria-label="Navegacao da pagina">
      <div class="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
        <a
          v-for="item in menuItems"
          :key="`mobile-${item.label}`"
          :href="item.href"
          :class="[
            itemClass(item.href),
            'snap-start whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition'
          ]"
          :aria-current="activeHref === item.href ? 'page' : undefined"
        >
          {{ item.label }}
        </a>
      </div>
    </nav>
  </header>
</template>
