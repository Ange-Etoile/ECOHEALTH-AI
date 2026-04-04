<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 md:p-6 text-on-surface">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">
          Analyse <span class="text-primary italic">Temporelle & Spatiale</span>
        </h2>
        <p class="text-[10px] md:text-xs opacity-50 font-bold uppercase tracking-widest mt-2">
          Suivi Environnemental — {{ selectedFilters.city || selectedFilters.region || 'Vue Nationale' }} ({{ selectedFilters.year }})
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <v-btn-toggle v-model="selectedMetric" mandatory color="primary" variant="tonal" class="rounded-xl overflow-hidden shadow-sm">
          <v-btn value="temp" class="text-[10px] font-black px-4">🌡️ TEMPÉRATURE</v-btn>
          <v-btn value="precip" class="text-[10px] font-black px-4">💧 PLUIE</v-btn>
        </v-btn-toggle>

        <v-btn @click="loadAll" :loading="loading" icon color="primary" variant="elevated" size="small" class="rounded-lg">
          <v-icon size="small">mdi-refresh</v-icon>
        </v-btn>
      </div>
    </header>

    <v-card variant="outlined" class="bg-surface p-6 md:p-10 rounded-3xl border-outline-variant shadow-sm">
      <p class="text-[10px] font-black uppercase opacity-50 mb-8 tracking-[0.2em]">Paramètres de filtrage</p>
      <div class="filter-wrapper">
        <FilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadAll" />
      </div>
    </v-card>

    <div class="grid grid-cols-12 gap-6 md:gap-8">
      <v-card variant="outlined" class="col-span-12 lg:col-span-7 rounded-3xl border-outline-variant bg-surface overflow-hidden shadow-sm">
        <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
          <span class="text-[10px] font-black uppercase tracking-widest">Séries Chronologiques Mensuelles</span>
          <v-chip size="x-small" color="primary" variant="flat">DYNAMIQUE</v-chip>
        </div>
        <div class="relative w-full h-[350px] md:h-[450px]">
          <div id="trendChart" class="absolute inset-0"></div>
        </div>
      </v-card>

      <v-card variant="outlined" class="col-span-12 lg:col-span-5 rounded-3xl border-outline-variant bg-surface overflow-hidden shadow-sm">
        <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
          <span class="text-[10px] font-black uppercase tracking-widest">Localisation : {{ selectedFilters.region || 'Cameroun' }}</span>
          <v-icon size="small" color="primary">mdi-map-marker-radius</v-icon>
        </div>
        <div class="relative w-full h-[400px] md:h-[450px]">
          <div id="cameroonMap" class="absolute inset-0"></div>
        </div>
      </v-card>
    </div>

    <v-card variant="outlined" class="rounded-3xl p-6 md:p-8 border-outline-variant bg-surface shadow-sm">
      <div class="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
        <v-avatar color="primary" variant="tonal" size="32">
          <v-icon size="18">mdi-brain</v-icon>
        </v-avatar>
        <h3 class="text-sm font-black uppercase tracking-widest">Analyse de la Zone {{ selectedFilters.city || selectedFilters.region || 'Nationale' }}</h3>
      </div>
      
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
            <v-icon size="small">mdi-chart-bell-curve</v-icon> Valeurs Extrêmes
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center bg-surface-variant/10 p-3 rounded-xl border border-outline-variant">
              <span class="text-xs opacity-70 italic font-medium">Pic maximal</span>
              <span class="font-black text-primary text-sm">{{ stats.max }} {{ stats.unit }}</span>
            </div>
            <div class="flex justify-between items-center bg-surface-variant/10 p-3 rounded-xl border border-outline-variant">
              <span class="text-xs opacity-70 italic font-medium">Point minimal</span>
              <span class="font-black text-secondary text-sm">{{ stats.min }} {{ stats.unit }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3 border-l-0 lg:border-l border-outline-variant lg:pl-8">
          <div class="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
            <v-icon size="small">mdi-text-search</v-icon> Diagnostic Local
          </div>
          <p class="text-sm leading-relaxed opacity-90">
            En {{ selectedFilters.year }}, l'amplitude observée est de <strong>{{ (stats.max - stats.min).toFixed(1) }}{{ stats.unit }}</strong>. 
            <span v-if="selectedMetric === 'temp'">
              Le mois de <strong>{{ stats.maxPeriod }}</strong> présente le stress thermique le plus élevé pour {{ selectedFilters.city || 'cette région' }}.
            </span>
            <span v-else>
              Le pic de pluviométrie en <strong>{{ stats.maxPeriod }}</strong> définit le cœur de la saison humide locale.
            </span>
          </p>
        </div>

        <div class="space-y-3 border-l-0 lg:border-l border-outline-variant lg:pl-8">
          <div class="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
            <v-icon size="small">mdi-alert-decagram</v-icon> Aide à la Décision
          </div>
          <v-alert variant="tonal" color="primary" class="rounded-2xl text-[13px] leading-relaxed border border-primary/20">
            {{ getRecommendation(stats) }}
          </v-alert>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import Plotly from 'plotly.js-dist-min'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import { getFilterOptions, getTrendsData, getMapData } from '@/services/dataService'

const loading = ref(false)
const selectedMetric = ref('temp')
const selectedFilters = ref({ region: null, city: null, year: 2025 })
const filterOptions = ref({ regions: [], citiesData: {}, annees: [] })
const trendData = ref([])
const mapData = ref([])

// --- LOGIQUE DE FILTRAGE DE LA CARTE ---
// Cette propriété calculée s'assure que la carte ne montre que ce qui est sélectionné
const filteredMapPoints = computed(() => {
  if (!mapData.value) return []
  let data = mapData.value
  
  if (selectedFilters.value.region) {
    data = data.filter(d => d.region === selectedFilters.value.region)
  }
  if (selectedFilters.value.city) {
    data = data.filter(d => d.city === selectedFilters.value.city)
  }
  return data
})

// --- STATISTIQUES DYNAMIQUES ---
const stats = computed(() => {
  if (!trendData.value || trendData.value.length === 0) return null
  const isTemp = selectedMetric.value === 'temp'
  const values = isTemp ? trendData.value.map(d => d.temperature_2m_mean) : trendData.value.map(d => d.precipitation_sum)
  const maxVal = Math.max(...values); const minVal = Math.min(...values)
  const maxIdx = trendData.value.find(d => (isTemp ? d.temperature_2m_mean : d.precipitation_sum) === maxVal)?.mois
  const minIdx = trendData.value.find(d => (isTemp ? d.temperature_2m_mean : d.precipitation_sum) === minVal)?.mois
  const moisNom = ["Janv", "Févr", "Mars", "Avril", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"]
  return {
    max: maxVal.toFixed(1), min: minVal.toFixed(1), unit: isTemp ? '°C' : 'mm',
    maxPeriod: moisNom[maxIdx - 1], minPeriod: moisNom[minIdx - 1]
  }
})

const getRecommendation = (s) => {
  if (selectedMetric.value === 'temp') {
    return s.max > 32 ? `Alerte chaleur en ${s.maxPeriod}.` : `Températures stables pour ${selectedFilters.value.year}.`
  }
  return s.max > 150 ? `Risque de fortes pluies en ${s.maxPeriod}.` : `Régime pluviométrique modéré.`
}

// --- VISUALISATION ---
const handleResize = () => {
  ['trendChart', 'cameroonMap'].forEach(id => {
    const el = document.getElementById(id); if (el) Plotly.Plots.resize(el)
  })
}

watch([selectedMetric, filteredMapPoints], () => updateCharts())

const updateCharts = () => {
  nextTick(() => {
    renderTrendChart(trendData.value)
    renderMap(filteredMapPoints.value)
  })
}

const renderTrendChart = (data) => {
  const isTemp = selectedMetric.value === 'temp'
  const trace = {
    x: data.map(d => `Mois ${d.mois}`),
    y: isTemp ? data.map(d => d.temperature_2m_mean) : data.map(d => d.precipitation_sum),
    type: 'scatter', mode: 'lines+markers',
    line: { color: isTemp ? '#2196F3' : '#4CAF50', width: 4, shape: 'spline' },
    fill: 'tozeroy', fillcolor: isTemp ? 'rgba(33, 150, 243, 0.08)' : 'rgba(76, 175, 80, 0.08)'
  }
  const layout = {
    autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 20, b: 60, l: 50, r: 20 }, font: { size: 10, color: '#888' },
    xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false },
    yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, title: isTemp ? '°C' : 'mm' }
  }
  Plotly.react('trendChart', [trace], layout, { responsive: true, displayModeBar: false })
}

const renderMap = (points) => {
  const isTemp = selectedMetric.value === 'temp'
  const trace = {
    type: 'scattergeo',
    lon: points.map(d => d.longitude), lat: points.map(d => d.latitude),
    text: points.map(d => `${d.city}: ${isTemp ? d.temperature_2m_mean.toFixed(1)+'°C' : d.precipitation_sum.toFixed(1)+'mm'}`),
    mode: 'markers',
    marker: {
      size: isTemp ? points.map(d => d.temperature_2m_mean / 1.5) : points.map(d => d.precipitation_sum / 3),
      color: isTemp ? points.map(d => d.temperature_2m_mean) : points.map(d => d.precipitation_sum),
      colorscale: isTemp ? 'YlOrRd' : 'Blues', showscale: true,
      colorbar: { thickness: 10, len: 0.5, tickfont: { size: 8 } }
    }
  }
  const layout = {
    autosize: true,
    geo: {
      scope: 'africa', center: { lon: 12.5, lat: 7.3 },
      projection: { type: 'mercator', scale: 11 },
      showframe: false, showcoastlines: true, bgcolor: 'rgba(0,0,0,0)',
      landcolor: 'rgba(200, 200, 200, 0.05)'
    },
    paper_bgcolor: 'rgba(0,0,0,0)', margin: { t: 0, b: 0, l: 0, r: 0 }
  }
  Plotly.react('cameroonMap', [trace], layout, { responsive: true, displayModeBar: false })
}

const loadAll = async () => {
  loading.value = true
  try {
    const [trends, map] = await Promise.all([
      getTrendsData(selectedFilters.value),
      getMapData({ year: selectedFilters.value.year })
    ])
    trendData.value = trends
    mapData.value = map
    updateCharts()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  filterOptions.value = await getFilterOptions()
  loadAll()
})

onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
/* Correction de l'espacement entre les filtres */
.filter-wrapper :deep(.v-row) {
  margin: -12px !important;
  gap: 16px !important;
}
.filter-wrapper :deep(.v-col) {
  padding: 12px !important;
}
</style>