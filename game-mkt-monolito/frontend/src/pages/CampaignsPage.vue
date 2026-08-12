<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Campaigns</h1>
      <button class="btn-primary" @click="createSampleCampaign">+ Nova campanha</button>
    </div>

    <div class="bg-white rounded-lg shadow p-6" v-if="errorMessage">
      <p class="text-red-600">{{ errorMessage }}</p>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Budget</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="campaign in campaigns" :key="campaign.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm">{{ campaign.name }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                {{ campaign.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">R$ {{ Number(campaign.budget).toLocaleString('pt-BR') }}</td>
          </tr>
          <tr v-if="campaigns.length === 0">
            <td colspan="3" class="px-6 py-8 text-center text-gray-500">Nenhuma campanha cadastrada</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createCampaign, getCampaigns } from '@/services/api'

const campaigns = ref<any[]>([])
const errorMessage = ref('')

const loadCampaigns = async () => {
  errorMessage.value = ''
  try {
    campaigns.value = await getCampaigns()
  } catch (error) {
    errorMessage.value = 'Falha ao carregar campanhas'
    console.error(error)
  }
}

const createSampleCampaign = async () => {
  errorMessage.value = ''
  try {
    await createCampaign({
      name: `Campanha ${new Date().toLocaleDateString('pt-BR')}`,
      description: 'Campanha criada pela interface do GAME MKT',
      budget: 25000,
    })
    await loadCampaigns()
  } catch (error) {
    errorMessage.value = 'Falha ao criar campanha'
    console.error(error)
  }
}

onMounted(async () => {
  await loadCampaigns()
})
</script>
