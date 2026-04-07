<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 md:p-6 text-on-surface">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-[0.2em] text-[10px]">
          <v-icon size="x-small">mdi-shield-check-outline</v-icon> Analyse de Corrélation IndabaX
        </div>
        <h2 class="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          Analyses <span class="text-secondary italic">Climatiques</span>
        </h2>
        <p class="text-[10px] md:text-xs opacity-50 font-bold uppercase tracking-widest mt-2">
          Interactions Multi-variées — {{ selectedFilters.city || selectedFilters.region || 'Vue Nationale' }} ({{ selectedFilters.year }})
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <v-btn 
          @click="loadAnalysis" 
          :loading="loading" 
          icon="mdi-refresh" 
          color="secondary" 
          variant="tonal" 
          class="rounded-xl shadow-sm"
        ></v-btn>
      </div>
    </header>

    <v-card variant="outlined" class="bg-surface p-6 rounded-3xl border-outline-variant shadow-sm">
      <FilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadAnalysis" />
    </v-card>

    <v-row v-if="!loading || analysisData.length > 0">
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
            <span class="text-[10px] font-black uppercase tracking-widest text-primary">Évolution Thermique (Réelle vs Apparente)</span>
            <v-icon size="small" color="primary">mdi-chart-line</v-icon>
          </div>
          <div class="relative w-full h-[350px] md:h-[450px]">
            <div id="tempComparisonChart" class="absolute inset-0"></div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-widest">Facteur d'influence :</span>
              <v-select
                v-model="activeFactor"
                :items="factors"
                density="compact"
                hide-details
                variant="plain"
                class="max-w-[200px] text-[10px] font-bold uppercase"
                @update:modelValue="updateCharts"
              ></v-select>
            </div>
            <v-icon size="small" color="secondary">mdi-chart-scatter-plot</v-icon>
          </div>
          <div class="relative w-full h-[350px] md:h-[400px]">
            <div id="scatterChart" class="absolute inset-0"></div>
          </div>
          <div class="p-4 bg-secondary/5 border-t border-outline-variant text-[10px] italic opacity-70">
            <strong>Observation Scatter Plot :</strong> La densité des points montre comment la <strong>PM2.5</strong> réagit aux variations de <strong>{{ currentFactorLabel }}</strong>.
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="rounded-[2rem] p-6 md:p-10 border-outline-variant bg-surface shadow-md mt-6">
      <div class="flex items-center gap-3 mb-8 border-b border-outline-variant pb-6">
        <v-avatar color="secondary" variant="tonal" size="48">
          <v-icon size="24">mdi-brain</v-icon>
        </v-avatar>
        <div>
          <h3 class="text-lg font-black uppercase tracking-tighter">Diagnostic temporel</h3>
          <p class="text-[10px] opacity-60 font-bold uppercase tracking-widest">Analyse croisée des variables environnementales</p>
        </div>
      </div>
      
      <div v-if="analysisData.length > 0" class="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-surface-variant/5 p-6 rounded-[1.5rem] border border-outline-variant/50 relative overflow-hidden">
            <v-icon class="absolute -right-4 -bottom-4 opacity-5 text-8xl">mdi-format-quote-close</v-icon>
            <div class="text-sm md:text-base leading-relaxed text-justify" v-html="generateDetailedInterpretation"></div>
          </div>

          <v-alert :color="airStatus.color" variant="tonal" class="rounded-2xl border-none p-4">
            <div class="flex items-center gap-4">
               <v-chip :color="airStatus.color" class="font-black uppercase text-xs">{{ airStatus.level }}</v-chip>
               <div>
                 <div class="font-black uppercase text-[10px] tracking-widest">Statut : {{ airStatus.status }}</div>
                 <div class="text-[11px] opacity-80 leading-tight">{{ airStatus.action }}</div>
               </div>
            </div>
          </v-alert>
        </div>

        <div class="lg:col-span-2 grid grid-cols-2 gap-4">
          <div class="p-5 rounded-2xl border border-outline-variant bg-surface-variant/5 hover:border-secondary transition-colors">
            <span class="text-[10px] font-bold uppercase opacity-60 block text-blue">Précipitations</span>
            <span class="text-2xl font-black">{{ avgRain }} <small class="text-xs">mm</small></span>
          </div>
          <div class="p-5 rounded-2xl border border-outline-variant bg-surface-variant/5 hover:border-secondary transition-colors">
            <span class="text-[10px] font-bold uppercase opacity-60 block text-orange">Solaire</span>
            <span class="text-2xl font-black">{{ avgRad }} <small class="text-xs">W/m²</small></span>
          </div>
          <div class="p-5 rounded-2xl border border-outline-variant bg-surface-variant/5 hover:border-secondary transition-colors">
            <span class="text-[10px] font-bold uppercase opacity-60 block text-green">Vitesse Vent</span>
            <span class="text-2xl font-black">{{ avgWind }} <small class="text-xs">km/h</small></span>
          </div>
          <div class="p-5 rounded-2xl border border-outline-variant bg-surface-variant/5 hover:border-secondary transition-colors">
            <span class="text-[10px] font-bold uppercase opacity-60 block text-red">Température</span>
            <span class="text-2xl font-black">{{ avgTemp }} <small class="text-xs">°C</small></span>
          </div>
          
          <v-card color="primary" variant="flat" class="col-span-2 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <span class="text-[10px] font-black uppercase opacity-80 block">Indice Moyen PM2.5</span>
              <div class="text-3xl font-black">{{ avgPM25 }} <small class="text-sm">µg/m³</small></div>
            </div>
          </v-card>
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
        <v-progress-circular indeterminate color="secondary" size="64"></v-progress-circular>
        <span class="text-[10px] font-black uppercase tracking-widest">Chargement du moteur d'analyse...</span>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
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
  { title: 'Température', value: 'temperature_2m_mean' }
]

const currentFactorLabel = computed(() => factors.find(f => f.value === activeFactor.value)?.title)

// --- STATS & MOYENNES ---
const avgPM25 = computed(() => analysisData.value.length ? analysisData.value[0].avg_pm25_local.toFixed(2) : 0)
const avgPM25National = computed(() => analysisData.value.length ? analysisData.value[0].avg_pm25_national.toFixed(2) : 0)
const diffNational = computed(() => (parseFloat(avgPM25.value) - parseFloat(avgPM25National.value)).toFixed(2))

const avgRain = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.precipitation_sum, 0) / analysisData.value.length).toFixed(1) : 0)
const avgWind = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.wind_speed_10m_max, 0) / analysisData.value.length).toFixed(1) : 0)
const avgRad = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.shortwave_radiation_sum, 0) / analysisData.value.length).toFixed(0) : 0)
const avgTemp = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.temperature_2m_mean, 0) / analysisData.value.length).toFixed(1) : 0)

// --- SYSTÈME DE STATUT SANITAIRE (4 COULEURS) ---
const airStatus = computed(() => {
  const pm = parseFloat(avgPM25.value)
  if (pm <= 12) return { level: "Vert", color: "success", status: "Air Sain", action: "Qualité excellente. Aucune menace pour la santé publique." }
  if (pm <= 35) return { level: "Jaune", color: "warning", status: "Modéré", action: "Vigilance recommandée pour les personnes asthmatiques ou fragiles." }
  if (pm <= 55) return { level: "Orange", color: "orange-darken-2", status: "Alerte Pollution", action: "Qualité dégradée. Évitez les activités physiques intenses en extérieur." }
  return { level: "Rouge", color: "error", status: "Urgence Sanitaire", action: "Danger immédiat. Port du masque conseillé et limitation stricte des sorties." }
})

// --- INTERPRÉTATION DYNAMIQUE RICHE ---
const generateDetailedInterpretation = computed(() => {
  if (!analysisData.value.length) return ""
  
  const zone = selectedFilters.value.city || selectedFilters.value.region || 'nationale'
  const pm = parseFloat(avgPM25.value)
  const rad = parseFloat(avgRad.value)
  const rain = parseFloat(avgRain.value)
  const wind = parseFloat(avgWind.value)

  let report = `Le diagnostic pour <strong>${zone}</strong> révèle un indice moyen de <strong>${pm} µg/m³</strong>. <br><br>`

  // Analyse Solaire
  if (rad > 400) {
    report += `<strong>Impact Solaire :</strong> Le fort ensoleillement actuel (${rad} W/m²) accélère les réactions chimiques atmosphériques, augmentant potentiellement la production de polluants secondaires. <br>`
  } else {
    report += `<strong>Impact Solaire :</strong> Le rayonnement est modéré, limitant l'effet de serre localisé. <br>`
  }

  // Analyse Pluie
  if (rain > 5) {
    report += `<strong>Lessivage :</strong> Les précipitations (${rain} mm) agissent comme un purificateur naturel, capturant les micro-particules au sol. <br>`
  } else {
    report += `<strong>Sècheresse :</strong> L'absence de pluie favorise la mise en suspension des poussières et leur stagnation. <br>`
  }

  // Analyse Vent
  if (wind < 10) {
    report += `<strong>Dispersion :</strong> La faiblesse du vent (${wind} km/h) crée une "cloche" de pollution, empêchant l'air de se renouveler.`
  } else {
    report += `<strong>Dispersion :</strong> Le vent soutenu (${wind} km/h) favorise une évacuation rapide des masses d'air polluées.`
  }

  return report
})

// --- GRAPHES ---
const updateCharts = () => {
  if (!analysisData.value.length) return
  const isDark = theme.global.current.value.dark
  const textColor = isDark ? '#FFFFFF' : '#424242'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'

  nextTick(() => {
    renderTempLineChart(textColor, gridColor)
    renderScatterChart(textColor, gridColor)
  })
}

const renderTempLineChart = (textColor, gridColor) => {
  const traces = [
    {
      y: analysisData.value.map(d => d.temperature_2m_mean),
      name: 'Réelle', type: 'scatter', mode: 'lines',
      line: { color: '#fbbf24', width: 2.5 }
    },
    {
      y: analysisData.value.map(d => d.apparent_temperature_mean),
      name: 'Apparente', type: 'scatter', mode: 'lines',
      line: { color: '#f43f5e', width: 2, dash: 'dot' }
    }
  ]
  Plotly.react('tempComparisonChart', traces, {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 40, b: 60, l: 50, r: 20 }, font: { color: textColor, size: 9 },
    legend: { orientation: 'h', y: -0.2 },
    xaxis: { showticklabels: false, gridcolor: gridColor },
    yaxis: { title: 'Température (°C)', gridcolor: gridColor }
  }, { responsive: true, displayModeBar: false })
}

const renderScatterChart = (textColor, gridColor) => {
  Plotly.react('scatterChart', [{
    x: analysisData.value.map(d => d[activeFactor.value]),
    y: analysisData.value.map(d => d.pm25_proxy),
    mode: 'markers', type: 'scattergl',
    marker: { size: 5, color: '#3b82f6', opacity: 0.6 }
  }], {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 30, b: 50, l: 50, r: 20 }, font: { color: textColor, size: 10 },
    xaxis: { title: currentFactorLabel.value, gridcolor: gridColor },
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

watch(() => theme.global.current.value.dark, updateCharts)

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  loadAnalysis()
  window.addEventListener('resize', updateCharts)
})
</script>

<style scoped>
.text-justify { text-align: justify; }
.text-stroke { -webkit-text-stroke: 1px currentColor; color: transparent; }
</style>