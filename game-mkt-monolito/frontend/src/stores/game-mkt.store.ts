import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameMktStore = defineStore('game-mkt', () => {
  const metrics = ref<any>({})
  const leads = ref<any[]>([])
  const campaigns = ref<any[]>([])
  const bundles = ref<any[]>([])

  function setMetrics(data: any) {
    metrics.value = data
  }

  function setLeads(data: any[]) {
    leads.value = data
  }

  function setCampaigns(data: any[]) {
    campaigns.value = data
  }

  function setBundles(data: any[]) {
    bundles.value = data
  }

  return {
    metrics,
    leads,
    campaigns,
    bundles,
    setMetrics,
    setLeads,
    setCampaigns,
    setBundles
  }
})
