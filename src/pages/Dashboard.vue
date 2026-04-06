<template>
  <div class="max-w-7xl mx-auto space-y-10 p-6 text-on-surface transition-colors duration-500">
    
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-outline-variant pb-10">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            Système de Surveillance Environnementale
          </span>
        </div>
        
        <h2 class="text-5xl font-black tracking-tighter uppercase leading-none">
          EcoHealth <span class="text-primary italic">AI</span> 
          <span class="font-thin opacity-20 ml-2">Monitor</span>
        </h2>
        
        <div class="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest opacity-60">
          <span class="flex items-center gap-1">
            <span class="iconify text-lg" data-icon="solar:map-point-bold-duotone"></span>
            {{ selectedFilters.region || 'National' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-surface-light p-2 rounded-2xl border border-outline-variant shadow-sm">
        <div class="hidden sm:block px-4 border-outline-variant">
          <p class="text-[9px] font-black opacity-40 uppercase tracking-widest leading-tight">Dernière Sync</p>
          <p class="text-sm font-mono font-bold">{{ lastSyncTime }}</p>
        </div>
        <v-btn
          @click="loadAllData"
          :loading="loading"
          icon
          color="primary"
          variant="flat"
          class="rounded-xl shadow-lg hover:scale-105 transition-all"
          size="56"
        >
          <v-icon size="28">mdi-refresh</v-icon>
          <v-tooltip activator="parent" location="top">Mettre à jour les données</v-tooltip>
        </v-btn>
      </div>
    </header>

    <section class="relative">
      <SimpleFilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading"
        @change="loadAllData"
      />
    </section>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <KPICard 
        label="PM2.5 National"
        :value="stats.pm25"
        unit="µg/m³"
        icon="dust" 
        :status="getAirStatus(stats.pm25)"
        :color="stats.pm25 > 25 ? 'error' : 'success'"
      />

      <KPICard 
        label="Ville Critique"
        :value="stats.top_city"
        unit=""
        icon="city" 
        status="Max pollution"
        color="warning"
      />

      <KPICard 
        label="Région Max"
        :value="stats.top_region"
        unit=""
        icon="map" 
        status="Zone à risque"
        color="primary"
      />

      <KPICard 
        label="Jour Critique"
        :value="stats.critical_day"
        unit=""
        icon="calendar" 
        status="Pic historique"
        color="surface"
      />

      <KPICard 
        label="Niveau Alerte"
        :value="getAirStatus(stats.pm25)"
        unit=""
        icon="alert" 
        :status="stats.pm25 > 35 ? 'Alerte Active' : 'Sous contrôle'"
        :color="stats.pm25 > 25 ? 'error' : 'warning'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import KPICard from '@/components/dashboard/KPICard.vue'
import SimpleFilterBar from '@/components/dashboard/SimpleFilterBar.vue'
import { getDashboardData, getFilterOptions } from '@/services/dataService' 

const loading = ref(false)
const lastSyncTime = ref('--:--:--')

// Initialisation des stats avec les clés retournées par ton API
const stats = ref({ 
  pm25: 0, 
  top_city: '--',
  top_region: '--',
  critical_day: '--',
  temperature: 0, 
  vent: 0, 
  secheresse: 0,
  precipitation: 0
})

const filterOptions = ref({ regions: [], citiesData: {}, annees: [] })
const selectedFilters = ref({ region: null, year: 2025 })

const loadAllData = async () => {
  loading.value = true
  try {
    const data = await getDashboardData(selectedFilters.value)
    stats.value = data
    lastSyncTime.value = new Date().toLocaleTimeString('fr-FR', { hour12: false })
  } catch (e) {
    console.error("Erreur de synchronisation", e)
  } finally {
    // Petit délai pour l'effet visuel
    setTimeout(() => { loading.value = false }, 800)
  }
}

const loadFilters = async () => {
  try {
    const options = await getFilterOptions()
    filterOptions.value = options
  } catch (e) {
    console.error("Erreur chargement filtres", e)
  }
}

// Logique de statut OMS basée sur le pm25_proxy
const getAirStatus = (val: number) => {
  if (val <= 12) return 'Qualité Optimale'
  if (val <= 35) return 'Vigilance'
  return 'Alerte Sanitaire'
}

onMounted(() => {
  loadFilters()
  loadAllData()
})
</script>

<style scoped>
header {
  background: radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.03), transparent);
}

:deep(.v-btn--loading .iconify) {
  display: none;
}

.text-on-surface {
  color: rgb(var(--v-theme-on-surface));
}
</style>