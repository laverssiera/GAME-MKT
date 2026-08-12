import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DashboardPage from '@/pages/DashboardPage.vue'
import LeadsPage from '@/pages/LeadsPage.vue'
import CampaignsPage from '@/pages/CampaignsPage.vue'
import BundlesPage from '@/pages/BundlesPage.vue'
import CommandCenterPage from '@/pages/CommandCenterPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/leads',
    name: 'Leads',
    component: LeadsPage
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: CampaignsPage
  },
  {
    path: '/bundles',
    name: 'Bundles',
    component: BundlesPage
  },
  {
    path: '/command-center',
    name: 'CommandCenter',
    component: CommandCenterPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
