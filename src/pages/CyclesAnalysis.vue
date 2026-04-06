<template>
  <div class="max-w-7xl mx-auto space-y-6 md:space-y-10 p-4 md:p-6 text-on-surface transition-colors duration-500">
    
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant pb-8 md:pb-10 text-center md:text-left">
      <div class="space-y-4">
        <div class="flex items-center justify-center md:justify-start gap-2 text-secondary font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
          <v-icon size="small" color="secondary">mdi-sync</v-icon> Analyse Temporelle & Saisonnier
        </div>
        <h1 class="text-xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight md:leading-none">
          Cycles de <br class="hidden sm:block md:hidden"> 
          <span class="text-secondary italic">Pollution</span>
        </h1>
        <p class="text-sm md:text-lg opacity-70 leading-relaxed max-w-2xl mx-auto md:mx-0 font-medium">
          Étude des variations cycliques basées sur la saisonnalité (Harmattan vs Pluies) et les pics historiques de PM2.5 au Cameroun.
        </p>
      </div>
    </header>

    <section class="w-full">
      <SimpleFilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading" 
        @change="loadCyclesData" 
      />
    </section>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <KPICard 
        label="Saison Sèche Critique"
        :value="stats.critical_dry_pct"
        unit="%"
        icon="drought" 
        status="Jours > seuil OMS"
        :color="stats.critical_dry_pct > 50 ? 'error' : 'warning'"
      />

      <KPICard 
        label="Mois le plus critique"
        :value="stats.worst_month"
        unit=""
        icon="calendar" 
        status="Pic de pollution max"
        color="secondary"
      />

      <KPICard 
        label="PM2.5 Moyenne"
        :value="stats.avg_pm25"
        unit="µg/m³"
        icon="dust" 
        status="Concentration réelle"
        :color="getPMColor(stats.avg_pm25)"
      />
    </div>

    <div class="space-y-6 md:space-y-8">
      <v-card variant="outlined" class="rounded-xl md:rounded-[2rem] border-outline-variant bg-surface-variant/5 overflow-hidden">
        <div class="p-4 md:p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div class="flex items-center gap-2">
             <span class="text-xl font-black opacity-20 font-mono">01</span>
             <h3 class="text-xs md:text-sm font-black uppercase tracking-widest text-secondary">Évolution Chronologique</h3>
          </div>
          <v-chip size="x-small" color="secondary" variant="flat" class="font-black">PRÉCIS</v-chip>
        </div>
        <div class="p-2 md:p-6">
          <div id="plot-timeline" class="w-full h-[300px] md:h-[450px]"></div>
        </div>
      </v-card>

      <v-card variant="outlined" class="rounded-xl md:rounded-[2rem] border-outline-variant bg-surface-variant/5 overflow-hidden">
        <div class="p-4 md:p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div class="flex items-center gap-2">
             <span class="text-xl font-black opacity-20 font-mono">02</span>
             <h3 class="text-xs md:text-sm font-black uppercase tracking-widest text-secondary">Saisonnalité Mensuelle</h3>
          </div>
          <v-chip size="x-small" color="secondary" variant="outlined" class="font-black">MOYENNES</v-chip>
        </div>
        <div class="p-2 md:p-6">
          <div id="plot-seasonal" class="w-full h-[300px] md:h-[400px]"></div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Plotly from 'plotly.js-dist-min'
import KPICard from '@/components/dashboard/KPICard.vue'
import SimpleFilterBar from '@/components/dashboard/SimpleFilterBar.vue'
import { getCyclesAnalysis, getFilterOptions } from '@/services/dataService'

const loading = ref(false)
const filterOptions = ref({ regions: [], annees: [] })
const selectedFilters = ref({ region: null, year: 2025 })

const stats = ref({
  critical_dry_pct: 0,
  worst_month: '--',
  avg_pm25: 0
})

/**
 * Logique de couleur synchronisée sur la documentation :
 * Vert (success) | Jaune (warning) | Orange (orange) | Rouge (error)
 */
const getPMColor = (val) => {
  if (val <= 15) return 'success' // Sain
  if (val <= 25) return 'warning' // Modéré
  if (val <= 50) return 'orange'  // Alerte
  return 'error'                  // Urgence
}

const loadCyclesData = async () => {
  loading.value = true
  try {
    const data = await getCyclesAnalysis(selectedFilters.value)
    stats.value = data.kpis

    await nextTick()

    const config = { 
      responsive: true, 
      displayModeBar: false,
      autosizable: true
    }

    // Rendu avec les couleurs secondaires pour les lignes/barres si possible
    if (data.charts.time_series) {
      Plotly.react('plot-timeline', data.charts.time_series.data, data.charts.time_series.layout, config)
    }
    if (data.charts.seasonal_bar) {
      Plotly.react('plot-seasonal', data.charts.seasonal_bar.data, data.charts.seasonal_bar.layout, config)
    }
    
  } catch (e) {
    console.error("Erreur chargement cycles:", e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const options = await getFilterOptions()
  filterOptions.value = options
  loadCyclesData()

  window.addEventListener('resize', () => {
    ['plot-timeline', 'plot-seasonal'].forEach(id => {
      const el = document.getElementById(id)
      if (el) Plotly.Plots.resize(el)
    })
  })
})
</script>

<style scoped>
/* Effet de contour du texte identique à la Doc */
/* .text-stroke {
  -webkit-text-stroke: 1px currentColor;
  color: transparent;
} */

/* On force la transparence des graphiques Plotly pour qu'ils héritent du style Vuetify */
:deep(.js-plotly-plot .plotly, .js-plotly-plot .plotly svg) {
  background: transparent !important;
}

:deep(.js-plotly-plot .plotly .modebar) {
  display: none !important;
}

:deep(.plotly svg) {
  width: 100% !important;
}
</style>