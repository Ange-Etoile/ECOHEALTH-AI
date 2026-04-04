import { createRouter, createWebHistory } from 'vue-router'
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
      path: 'temp', 
      name: 'Analyses Thermiques',
      component: () => import('@/pages/ThermalAnalysis.vue'),
      },
      {
        path: 'alerts', 
        name: 'Alertes',
        component: () => import('@/pages/Alerts.vue')
      },
      // Nouvelle route pour la page À Propos
      {
        path: 'about', 
        name: 'About',
        component: () => import('@/pages/AboutView.vue')
      },
      // // Optionnel : Route pour les paramètres
      // {
      //   path: 'settings', 
      //   name: 'Settings',
      //   component: () => import('@/pages/Settings.vue')
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router