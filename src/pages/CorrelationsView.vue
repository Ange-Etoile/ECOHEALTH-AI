<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 md:p-6 text-on-surface">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">
          Analyses des <span class="text-secondary italic">Corrélations</span>
        </h2>
        <p class="text-[10px] md:text-xs opacity-50 font-bold uppercase tracking-widest mt-2">
          Interactions Multi-variées — {{ selectedFilters.city || selectedFilters.region || 'Vue Nationale' }} ({{ selectedFilters.year }})
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <v-btn @click="loadAnalysis" :loading="loading" prepend-icon="mdi-database-refresh" color="secondary" variant="elevated" class="rounded-xl font-bold text-xs">
          Actualiser les données
        </v-btn>
      </div>
    </header>

    <v-card variant="outlined" class="bg-surface p-6 rounded-3xl border-outline-variant shadow-sm">
      <FilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadAnalysis" />
    </v-card>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
            <span class="text-[10px] font-black uppercase tracking-widest">Matrice de Pearson (Temps Réel)</span>
            <v-chip size="x-small" color="secondary" variant="flat">DYNAMIQUE</v-chip>
          </div>
          <div class="relative w-full h-[350px] md:h-[450px]">
            <div id="heatmapChart" class="absolute inset-0"></div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-widest">Analyse Variable :</span>
              <v-select
                v-model="activeFactor"
                :items="factors"
                density="compact"
                hide-details
                variant="plain"
                class="max-w-auto text-[10px] font-light"
                @update:modelValue="updateCharts"
              ></v-select>
            </div>
            <v-icon size="small" color="secondary">mdi-chart-scatter-plot</v-icon>
          </div>
          <div class="relative w-full h-[350px] md:h-[450px]">
            <div id="scatterChart" class="absolute inset-0"></div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="rounded-3xl p-6 md:p-8 border-outline-variant bg-surface shadow-sm">
      <div class="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
        <v-avatar color="secondary" variant="tonal" size="32">
          <v-icon size="18">mdi-microscope</v-icon>
        </v-avatar>
        <h3 class="text-sm font-black uppercase tracking-widest">Diagnostic Environnemental : {{ selectedFilters.city || selectedFilters.region || 'Secteur National' }}</h3>
      </div>
      
      <div v-if="analysisData.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="space-y-4 text-sm leading-relaxed text-justify">
          <div class="flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-wider">
            <v-icon size="small">mdi-brain</v-icon> Analyse des corrélations observées
          </div>
          <p v-html="generateObservation"></p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/5">
            <span class="text-[9px] font-bold uppercase opacity-60 block text-primary">Dispersion (Vent)</span>
            <span class="text-xl font-black">{{ avgWind }} <small class="text-[10px]">km/h</small></span>
          </div>
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/5">
            <span class="text-[9px] font-bold uppercase opacity-60 block text-blue">Lessivage (Pluie)</span>
            <span class="text-xl font-black">{{ avgRain }} <small class="text-[10px]">mm</small></span>
          </div>
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/10 col-span-2 flex justify-between items-center">
            <div>
              <span class="text-[9px] font-bold uppercase opacity-60 block">Moyenne PM2.5</span>
              <div class="text-2xl font-black text-secondary">{{ avgPM25 }} <small class="text-[10px]">µg/m³</small></div>
            </div>
            <v-chip :color="pmStatusColor" size="small" class="font-black uppercase text-[10px]">{{ pmStatusText }}</v-chip>
          </div>
        </div>
      </div>
      <div v-else class="flex justify-center py-10">
        <v-progress-circular indeterminate color="secondary"></v-progress-circular>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import Plotly from 'plotly.js-dist-min'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import { getFilterOptions, getAnalysisData } from '@/services/dataService'
import { useTheme } from 'vuetify'

const theme = useTheme()
const loading = ref(false)
const selectedFilters = ref({ region: null, city: null, year: 2025 })
const filterOptions = ref({ regions: [], citiesData: {}, annees: [] })
const analysisData = ref([])

const activeFactor = ref('shortwave_radiation_sum')
const factors = [
  { title: 'Rayonnement Solaire', value: 'shortwave_radiation_sum' },
  { title: 'Précipitations', value: 'precipitation_sum' },
  { title: 'Vitesse du Vent', value: 'wind_speed_10m_max' },
  { title: 'Humidité', value: 'humidity' },
  { title: 'Température', value: 'temperature_2m_mean' }
]

// --- MATHS : CORRÉLATION DE PEARSON ---
const getPearsonCorrelation = (x, y) => {
  const n = x.length; if (n === 0) return 0;
  const muX = x.reduce((a, b) => a + b, 0) / n;
  const muY = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((acc, val, i) => acc + (val - muX) * (y[i] - muY), 0);
  const den = Math.sqrt(x.reduce((acc, val) => acc + Math.pow(val - muX, 2), 0) * y.reduce((acc, val) => acc + Math.pow(val - muY, 2), 0));
  return den === 0 ? 0 : num / den;
}

// --- CALCULS MOYENNES ---
const avgPM25 = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.pm25_proxy, 0) / analysisData.value.length).toFixed(2) : 0)
const avgRain = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.precipitation_sum, 0) / analysisData.value.length).toFixed(1) : 0)
const avgWind = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.wind_speed_10m_max, 0) / analysisData.value.length).toFixed(1) : 0)
const avgRad = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.shortwave_radiation_sum, 0) / analysisData.value.length).toFixed(0) : 0)

const pmStatusColor = computed(() => parseFloat(avgPM25.value) < 25 ? 'success' : 'error')
const pmStatusText = computed(() => parseFloat(avgPM25.value) < 25 ? 'Air Sain' : 'Air Pollué')

const generateObservation = computed(() => {
  if (!analysisData.value.length) return ""
  const zone = selectedFilters.value.city || selectedFilters.value.region || 'nationale'
  const year = selectedFilters.value.year
  
  // Calcul de la corrélation réelle Solaire/PM2.5 pour le texte
  const corrSolaire = getPearsonCorrelation(analysisData.value.map(d => d.shortwave_radiation_sum), analysisData.value.map(d => d.pm25_proxy)).toFixed(2)

  let html = `Pour l'année <strong>${year}</strong> à <strong>${zone}</strong>, la matrice confirme une corrélation de <strong>${corrSolaire}</strong> entre le rayonnement et les particules. `
  
  if (parseFloat(avgRain.value) > 10) {
    html += `L'impact des précipitations (moyenne ${avgRain.value}mm) agit comme un filtre naturel, tandis que `
  } else {
    html += `La faible pluviométrie accentue la persistance des PM2.5. De plus, `
  }

  if (parseFloat(avgWind.value) > 15) {
    html += `une vitesse de vent de ${avgWind.value}km/h favorise une dispersion rapide des polluants vers l'extérieur de la zone.`
  } else {
    html += `la faiblesse des vents (${avgWind.value}km/h) crée un effet de confinement thermique.`
  }
  return html
})

// --- GRAPHES ---
const updateCharts = () => {
  const isDark = theme.global.current.value.dark
  const textColor = isDark ? '#FFFFFF' : '#424242'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'

  nextTick(() => {
    renderDynamicHeatmap(textColor)
    renderScatter(textColor, gridColor)
  })
}

const renderDynamicHeatmap = (textColor) => {
  if (!analysisData.value.length) return
  
  const keys = ['temperature_2m_mean', 'shortwave_radiation_sum', 'precipitation_sum', 'pm25_proxy', 'humidity', 'wind_speed_10m_max']
  const labels = ['Temp', 'Solaire', 'Pluie', 'PM2.5', 'Humidité', 'Vent']
  
  // Calcul de la matrice de corrélation réelle sur les données filtrées
  const zValues = keys.map(key1 => 
    keys.map(key2 => getPearsonCorrelation(analysisData.value.map(d => d[key1]), analysisData.value.map(d => d[key2])))
  )

  Plotly.react('heatmapChart', [{
    z: zValues, x: labels, y: labels, type: 'heatmap',
    colorscale: [[0, '#3F51B5'], [0.5, '#F5F5F5'], [1, '#F44336']],
    zmin: -1, zmax: 1
  }], {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 10, b: 40, l: 50, r: 10 }, font: { color: textColor, size: 9 }
  }, { responsive: true, displayModeBar: false })
}

const renderScatter = (textColor, gridColor) => {
  const factor = factors.find(f => f.value === activeFactor.value)
  
  Plotly.react('scatterChart', [{
    x: analysisData.value.map(d => d[activeFactor.value]),
    y: analysisData.value.map(d => d.pm25_proxy),
    mode: 'markers',
    marker: { size: 8, color: '#FF5252', opacity: 0.5, line: { width: 1, color: textColor } }
  }], {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 30, b: 50, l: 50, r: 20 }, font: { color: textColor, size: 10 },
    xaxis: { title: factor.title, gridcolor: gridColor },
    yaxis: { title: 'PM2.5 (µg/m³)', gridcolor: gridColor }
  }, { responsive: true, displayModeBar: false })
}

const loadAnalysis = async () => {
  loading.value = true
  try {
    const data = await getAnalysisData(selectedFilters.value)
    analysisData.value = data
    updateCharts()
  } finally { loading.value = false }
}

watch(() => theme.global.current.value.dark, () => updateCharts())

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  loadAnalysis()
  window.addEventListener('resize', () => {
    ['heatmapChart', 'scatterChart'].forEach(id => {
      const el = document.getElementById(id); if (el) Plotly.Plots.resize(el)
    })
  })
})
</script>

<style scoped>
.text-justify { text-align: justify; }
</style>