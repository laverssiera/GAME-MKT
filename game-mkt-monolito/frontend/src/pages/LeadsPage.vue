<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Leads</h1>
      <button @click="showNewLeadForm" class="bg-primary text-white px-4 py-2 rounded-lg">
        + New Lead
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Score</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="lead in leads" :key="lead.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm">{{ lead.name }}</td>
            <td class="px-6 py-4 text-sm">{{ lead.email }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="inline-block px-3 py-1 text-sm rounded-full" :class="scoreClass(lead.score)">
                {{ lead.score }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">
              <span class="inline-block px-3 py-1 text-sm rounded-full" :class="statusClass(lead.status)">
                {{ lead.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">
              <button @click="qualifyLead(lead.id)" class="text-primary hover:underline">Qualify</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getLeads, qualifyLead as apiQualifyLead } from '@/services/api'

const leads = ref<any[]>([])

onMounted(async () => {
  try {
    const data = await getLeads()
    leads.value = data
  } catch (error) {
    console.error('Failed to load leads:', error)
  }
})

const scoreClass = (score: number) => {
  if (score >= 70) return 'bg-green-100 text-green-800'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const statusClass = (status: string) => {
  const classes: any = {
    'hot': 'bg-red-100 text-red-800',
    'warm': 'bg-yellow-100 text-yellow-800',
    'cold': 'bg-blue-100 text-blue-800',
    'qualified': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const showNewLeadForm = () => {
  // To be implemented
}

const qualifyLead = async (leadId: string) => {
  try {
    await apiQualifyLead(leadId)
    // Reload leads
    const data = await getLeads()
    leads.value = data
  } catch (error) {
    console.error('Failed to qualify lead:', error)
  }
}
</script>
