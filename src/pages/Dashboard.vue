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
          <span class="opacity-20">|</span>
          <span class="flex items-center gap-1">
            <span class="iconify text-lg" data-icon="solar:city-bold-duotone"></span>
            {{ selectedFilters.city || 'Toutes localités' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-surface-light p-2 rounded-2xl border border-outline-variant shadow-sm">

        <div class="hidden sm:block px-4 border-l border-outline-variant">
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
      <FilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading"
        @change="loadAllData"
      />
    </section>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <KPICard 
        label="Température Moyenne"
        :value="stats.temperature"
        unit="°C"
        icon="temp" 
        :status="getTempStatus(stats.temperature)"
        color="primary"
      />
      <KPICard 
        label="Particules Fines (PM2.5)"
        :value="stats.pm25"
        unit="µg/m³"
        icon="dust" 
        :status="getAirStatus(stats.pm25)"
        :color="stats.pm25 > 25 ? 'error' : 'success'"
      />
      <KPICard 
        label="Stress Hydrique"
        :value="stats.secheresse"
        unit="%"
        icon="drought" 
        :status="stats.secheresse > 50 ? 'Critique' : 'Stable'"
        color="warning"
      />
      <KPICard 
        label="Dynamique Éolienne"
        :value="stats.vent"
        unit="km/h"
        icon="wind" 
        status="Vitesse de flux"
        color="primary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue'
import KPICard from '@/components/dashboard/KPICard.vue'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import { getDashboardData, getFilterOptions } from '@/services/dataService' 

const loading = ref(false)
const lastSyncTime = ref('--:--:--')
const stats = ref({ temperature: 0, pm25: 0, vent: 0, secheresse: 0 })

const filterOptions = ref({ regions: [], citiesData: {}, annees: [] })
const selectedFilters = ref({ region: null, city: null, year: 2025 })

const loadAllData = async () => {
  loading.value = true
  try {
    const data = await getDashboardData(selectedFilters.value)
    stats.value = data
    lastSyncTime.value = new Date().toLocaleTimeString('fr-FR', { hour12: false })
  } catch (e) {
    console.error("Erreur de synchronisation", e)
  } finally {
    // Petit délai pour simuler le calcul IA et rendre l'animation visible
    setTimeout(() => { loading.value = false }, 800)
  }
}

const loadFilters = async () => {
  const options = await getFilterOptions()
  filterOptions.value = options
}

const getAirStatus = (val: number) => val <= 12 ? 'Qualité Optimale' : val <= 35 ? 'Vigilance' : 'Alerte Sanitaire'
const getTempStatus = (val: number) => val > 32 ? 'Anomalie Thermique' : 'Stabilité Saisonnière'

onMounted(() => {
  loadFilters()
  loadAllData()
})
</script>

<style scoped>
/* Effet de glassmorphism léger sur le header */
header {
  background: radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.03), transparent);
}

/* Animation personnalisée pour le bouton refresh quand loading */
:deep(.v-btn--loading .iconify) {
  display: none;
}

.text-on-surface {
  color: rgb(var(--v-theme-on-surface));
}
</style>