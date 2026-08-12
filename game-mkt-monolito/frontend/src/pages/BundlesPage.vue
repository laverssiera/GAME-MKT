<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Service Bundles (Composer)</h1>
      <button class="btn-primary" @click="reloadAll">Atualizar</button>
    </div>

    <div v-if="errorMessage" class="bg-white rounded-lg shadow p-6">
      <p class="text-red-600">{{ errorMessage }}</p>
    </div>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Templates</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="template in templates" :key="template.id" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold">{{ template.name }}</h3>
          <p class="text-gray-600 mt-2">Price: {{ template.price_range }}</p>
          <p class="text-gray-600">Margin: {{ template.margin }}</p>
          <p class="text-green-600 font-bold">Success: {{ template.success_rate }}</p>
          <button class="mt-4 bg-primary text-white px-4 py-2 rounded w-full" @click="createFromTemplate(template)">
            Criar Bundle
          </button>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Bundles Persistidos</h2>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Preço</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Margem</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Execução</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="bundle in persistedBundles" :key="bundle.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm">{{ bundle.name }}</td>
              <td class="px-6 py-4 text-sm">{{ bundle.template_type }}</td>
              <td class="px-6 py-4 text-sm">R$ {{ Number(bundle.total_price).toLocaleString('pt-BR') }}</td>
              <td class="px-6 py-4 text-sm">{{ bundle.margin_percentage }}%</td>
              <td class="px-6 py-4 text-sm">
                <span class="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {{ bundle.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div v-if="executionMap[bundle.id]" class="space-y-1">
                  <div class="text-xs text-gray-700">{{ executionMap[bundle.id].status }}</div>
                  <div class="text-xs text-gray-500">{{ executionMap[bundle.id].current_phase }}</div>
                  <div class="text-xs text-gray-500">Progresso: {{ executionMap[bundle.id].progress || 0 }}%</div>
                  <div class="w-full h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      class="h-2 bg-emerald-500"
                      :style="{ width: `${executionMap[bundle.id].progress || 0}%` }"
                    />
                  </div>
                  <div class="text-xs text-gray-400">
                    Restante: {{ executionMap[bundle.id].timeline_remaining ?? '-' }} dias
                  </div>
                  <div class="text-xs text-gray-400">Histórico: {{ (executionHistoryMap[bundle.id] || []).length }}</div>
                </div>
                <span v-else class="text-xs text-gray-400">Não iniciada</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button class="px-3 py-1 rounded bg-primary text-white text-xs" @click="runExecution(bundle.id)">
                    Executar
                  </button>
                  <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs" @click="refreshExecution(bundle.id)">
                    Status
                  </button>
                  <button class="px-3 py-1 rounded bg-emerald-200 text-emerald-800 text-xs" @click="advanceExecution(bundle.id)">
                    Avançar
                  </button>
                  <button class="px-3 py-1 rounded bg-amber-200 text-amber-800 text-xs" @click="pushExecution(bundle.id)">
                    +7 dias
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="persistedBundles.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">Nenhum bundle persistido</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  createBundle,
  executeBundle,
  getBundleExecutions,
  getBundles,
  getExecutionStatus,
  getPersistedBundles,
  rescheduleExecution,
  updateExecutionStatus,
} from '@/services/api'

const templates = ref<any[]>([])
const persistedBundles = ref<any[]>([])
const errorMessage = ref('')
const executionMap = ref<Record<string, any>>({})
const executionHistoryMap = ref<Record<string, any[]>>({})

const templateTypeMap: Record<string, string> = {
  'template-residential': 'residential',
  'template-retrofit': 'retrofit',
  'template-farm': 'agro',
}

const priceRangeToNumber = (priceRange: string): number => {
  const normalized = priceRange.toLowerCase().replace(/\s/g, '')
  if (normalized.includes('m')) {
    const start = normalized.split('-')[0]
    return Number(start.replace('m', '')) * 1_000_000
  }
  if (normalized.includes('k')) {
    const start = normalized.split('-')[0]
    return Number(start.replace('k', '')) * 1_000
  }
  return 100000
}

const loadTemplates = async () => {
  const data = await getBundles()
  templates.value = data.templates
}

const loadPersistedBundles = async () => {
  persistedBundles.value = await getPersistedBundles()
}

const loadExecutionHistory = async (bundleId: string) => {
  const result = await getBundleExecutions(bundleId)
  executionHistoryMap.value[bundleId] = result.executions || []
  if ((result.executions || []).length > 0) {
    executionMap.value[bundleId] = result.executions[0]
  }
}

const reloadAll = async () => {
  errorMessage.value = ''
  try {
    await loadTemplates()
    await loadPersistedBundles()
    await Promise.all(persistedBundles.value.map((bundle) => loadExecutionHistory(bundle.id)))
  } catch (error) {
    errorMessage.value = 'Falha ao carregar bundles'
    console.error('Failed to load bundles:', error)
  }
}

const createFromTemplate = async (template: any) => {
  errorMessage.value = ''
  try {
    await createBundle({
      name: template.name,
      description: `Bundle gerado do template ${template.id}`,
      template_type: templateTypeMap[template.id] || 'custom',
      total_price: priceRangeToNumber(template.price_range),
      margin_percentage: Number(String(template.margin).replace('%', '')) || 40,
      products: [],
    })
    await reloadAll()
  } catch (error) {
    errorMessage.value = 'Falha ao criar bundle a partir do template'
    console.error(error)
  }
}

const runExecution = async (bundleId: string) => {
  errorMessage.value = ''
  try {
    const execution = await executeBundle(bundleId)
    executionMap.value[bundleId] = execution
    await loadExecutionHistory(bundleId)
  } catch (error) {
    errorMessage.value = 'Falha ao iniciar execução do bundle'
    console.error(error)
  }
}

const refreshExecution = async (bundleId: string) => {
  const current = executionMap.value[bundleId]
  if (!current?.execution_id) return

  errorMessage.value = ''
  try {
    executionMap.value[bundleId] = await getExecutionStatus(current.execution_id)
    await loadExecutionHistory(bundleId)
  } catch (error) {
    errorMessage.value = 'Falha ao consultar status da execução'
    console.error(error)
  }
}

const advanceExecution = async (bundleId: string) => {
  const current = executionMap.value[bundleId]
  if (!current?.execution_id) return

  errorMessage.value = ''
  try {
    const nextStatus = current.status === 'created'
      ? { status: 'in_progress' as const, progress: 35, current_phase: 'John AI training + Archimedes design' }
      : { status: 'completed' as const, progress: 100, current_phase: 'Delivery completed' }

    executionMap.value[bundleId] = await updateExecutionStatus(current.execution_id, nextStatus)
    await loadExecutionHistory(bundleId)
  } catch (error) {
    errorMessage.value = 'Falha ao avançar execução'
    console.error(error)
  }
}

const pushExecution = async (bundleId: string) => {
  const current = executionMap.value[bundleId]
  if (!current?.execution_id) return

  errorMessage.value = ''
  try {
    await rescheduleExecution(current.execution_id, 7)
    await refreshExecution(bundleId)
  } catch (error) {
    errorMessage.value = 'Falha ao reprogramar execução'
    console.error(error)
  }
}

onMounted(async () => {
  await reloadAll()
})
</script>
