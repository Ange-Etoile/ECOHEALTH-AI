import { createRouter, createWebHistory } from 'vue-router'

// Import de ton Layout principal
import DashboardLayout from '@/components/layout/DashboardLayout.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '', 
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'map', 
        name: 'Cartographie',
        component: () => import('@/pages/Map.vue')
      },
      {
        path: 'health', 
        name: 'IA Santé',
        component: () => import('@/pages/HealthAI.vue')
      },
      {
        path: 'alerts', 
        name: 'Alertes',
        component: () => import('@/pages/Alerts.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router