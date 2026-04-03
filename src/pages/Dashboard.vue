<template>
  <div class="space-y-8 p-6">
    <header class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-black text-on-surface tracking-tighter italic">
            Bonjour, Etoile
          </h2>
          <p class="text-sm text-on-surface/50 font-medium">
            Analyse en temps réel — {{ selectedFilters.city || 'Cameroun' }}
          </p>
        </div>
        
        <v-progress-circular v-if="loading" indeterminate size="24" color="primary" />
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <v-select
        v-model="selectedFilters.region"
        :items="filterOptions.regions"
        label="Région"
        variant="solo-filled"
        flat
        density="compact"
        class="rounded-xl"
        clearable
      />
      <v-select
        v-model="selectedFilters.city"
        :items="filterOptions.villes"
        label="Ville"
        variant="solo-filled"
        flat
        density="compact"
        class="rounded-xl"
        clearable
      />
      <v-select
        v-model="selectedFilters.year"
        :items="filterOptions.annees"
        label="Année"
        variant="solo-filled"
        flat
        density="compact"
        class="rounded-xl"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <KPICard 
        label="Température Moyenne"
        :value="stats.temperature"
        unit="°C"
        icon="temp" 
        :status="getTempStatus(stats.temperature)"
        color="primary"
      />

      <KPICard 
        label="Qualité de l'Air"
        :value="stats.pm25"
        unit="µg/m³"
        icon="molecule" 
        :status="getAirStatus(stats.pm25)"
        :color="stats.pm25 > 25 ? 'warning' : 'success'"
      />

      <KPICard 
        label="Indice Sécheresse"
        :value="stats.secheresse"
        unit="%"
        icon="drought" 
        :status="stats.secheresse > 50 ? 'Saison Sèche' : 'Saison Humide'"
        color="warning"
      />

      <KPICard 
        label="Vitesse Vent"
        :value="stats.vent"
        unit="km/h"
        icon="wind" 
        status="Vitesse Moyenne"
        color="primary"
      />

    </div>

    <v-alert
      v-if="!loading"
      type="success"
      variant="tonal"
      class="mt-10 rounded-xl border border-primary/20 text-xs"
      icon="mdi-check-circle-outline"
    >
      Données synchronisées avec le dataset  via Hugging Face.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import KPICard from '@/components/dashboard/KPICard.vue'
import { getDashboardData, getFilterOptions } from '@/services/dataService'

// --- ÉTATS ---
const loading = ref(false)
const stats = ref({
  temperature: 0,
  pm25: 0,
  vent: 0,
  secheresse: 0
})

const filterOptions = ref({
  regions: [],
  villes: [],
  annees: []
})

const selectedFilters = ref({
  region: null,
  city: null,
  year: 2025
})

// --- LOGIQUE DE RÉCUPÉRATION ---
const loadAllData = async () => {
  loading.value = true
  try {
    const data = await getDashboardData(selectedFilters.value)
    stats.value = data
  } catch (error) {
    console.error("Erreur lors du chargement des KPI:", error)
  } finally {
    loading.value = false
  }
}

const loadFilters = async () => {
  try {
    const options = await getFilterOptions()
    filterOptions.value = options
  } catch (error) {
    console.error("Erreur lors du chargement des filtres:", error)
  }
}

// --- HELPERS (LOGIQUE IA/MÉTÉO) ---
const getAirStatus = (val: number) => {
  if (val <= 12) return 'Excellent'
  if (val <= 35) return 'Modéré'
  return 'Mauvais pour la santé'
}

const getTempStatus = (val: number) => {
  if (val > 30) return 'Chaleur Intense'
  if (val > 22) return 'Tropical'
  return 'Frais'
}

// --- CYCLE DE VIE ---
onMounted(() => {
  loadFilters()
  loadAllData()
})

// Observer les changements de filtres pour recharger l'API automatiquement
watch(selectedFilters, () => {
  loadAllData()
}, { deep: true })
</script>