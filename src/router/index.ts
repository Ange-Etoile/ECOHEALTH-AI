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
        path: 'cycles', 
        name: 'CyclesPollution',
        component: () => import('@/pages/CyclesAnalysis.vue')
      },
      {
        path: 'map', 
        name: 'Cartographie',
        component: () => import('@/pages/Map.vue') 
      },
      {
        path: 'performance-ia', 
        name: 'PerformanceIA',
        component: () => import('@/pages/PerformanceIA.vue') 
      },
      { 
        path: 'correlations', 
        name: 'Correlations',
        component: () => import('@/pages/CorrelationsView.vue'),
      },
      { 
        path: 'regional-benchmark', 
        name: 'Cartographie',
        component: () => import('@/pages/RegionalProfile.vue'),
      },
      { 
        path: 'sunshine-hydric', 
        name: 'SunshineHydric',
        component: () => import('@/pages/SunshineAnalysis.vue'), 
      },
      {
        path: 'health', 
        name: 'IASante',
        component: () => import('@/pages/HealthAI.vue')
      },
      {
        path: 'alerts', 
        name: 'Alertes',
        component: () => import('@/pages/Alerts.vue')
      },
      {
        path: 'about', 
        name: 'About',
        component: () => import('@/pages/AboutView.vue')
      },
      {
        path: 'documentation', 
        name: 'Documentation',
        component: () => import('@/pages/Documentation.vue')
      },
      {
        path: 'predictions-2026', 
        name: 'Predictions2026',
        component: () => import('@/pages/PredictionsGeneral.vue')
      },
      {
        path: 'future-projections', 
        name: 'FutureProjections',
        component: () => import('@/pages/FuturePrediction.vue') 
      },
      {
        path: 'geoloc', 
        name: 'Geolocalisation',
        component: () => import('@/pages/GeolocView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router