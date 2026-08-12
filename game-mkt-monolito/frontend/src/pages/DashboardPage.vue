<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Dashboard</h1>

    <!-- Key Metrics -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm text-gray-600">Leads Total</h2>
        <p class="text-3xl font-bold text-primary">{{ metrics.leads }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm text-gray-600">Qualified</h2>
        <p class="text-3xl font-bold text-success">{{ metrics.leads_qualified }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm text-gray-600">Conversion</h2>
        <p class="text-3xl font-bold">{{ metrics.conversion_rate }}%</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm text-gray-600">Revenue</h2>
        <p class="text-3xl font-bold">R$ {{ (metrics.revenue / 1000000).toFixed(1) }}M</p>
      </div>
    </div>

    <!-- Activity -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold mb-4">Integrations Active</h3>
        <ul class="space-y-2">
          <li v-for="platform in metrics.platforms" :key="platform" class="flex items-center">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {{ platform }}
          </li>
        </ul>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold mb-4">Connected Systems</h3>
        <ul class="space-y-2">
          <li v-for="integration in metrics.integrations" :key="integration" class="flex items-center">
            <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {{ integration }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getDashboardMetrics } from '@/services/api'
import { useGameMktStore } from '@/stores/game-mkt.store'

const store = useGameMktStore()
const metrics = ref<any>({})

onMounted(async () => {
  try {
    const data = await getDashboardMetrics()
    metrics.value = data
    store.setMetrics(data)
  } catch (error) {
    console.error('Failed to load metrics:', error)
  }
})
</script>
