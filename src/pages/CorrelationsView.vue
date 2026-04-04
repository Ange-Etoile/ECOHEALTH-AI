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

    <v-row v-if="!loading || analysisData.length > 0">
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden shadow-sm">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/10 flex justify-between items-center">
            <span class="text-[10px] font-black uppercase tracking-widest">Matrice de Pearson (Interactions)</span>
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
              <span class="text-[10px] font-black uppercase tracking-widest">Focus Variable :</span>
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

    <v-card variant="outlined" class="rounded-3xl p-6 md:p-8 border-outline-variant bg-surface shadow-sm mt-6">
      <div class="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
        <v-avatar color="secondary" variant="tonal" size="32">
          <v-icon size="18">mdi-brain</v-icon>
        </v-avatar>
        <h3 class="text-sm font-black uppercase tracking-widest">Interprétation du Modèle Environnemental</h3>
      </div>
      
      <div v-if="analysisData.length > 0" class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        <div class="lg:col-span-3 space-y-4 text-sm leading-relaxed text-justify">
          <div class="flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-wider">
            <v-icon size="small">mdi-text-search</v-icon> Analyse du comportement des polluants
          </div>
          <div class="bg-surface-variant/5 p-5 rounded-2xl border border-outline-variant/50">
             <p v-html="generateObservation"></p>
          </div>
        </div>

        <div class="lg:col-span-2 grid grid-cols-2 gap-3">
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/5">
            <span class="text-[9px] font-bold uppercase opacity-60 block text-blue-darken-2">Précipitations</span>
            <span class="text-xl font-black">{{ avgRain }} <small class="text-[10px]">mm</small></span>
          </div>
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/5">
            <span class="text-[9px] font-bold uppercase opacity-60 block text-orange-darken-2">Solaire</span>
            <span class="text-xl font-black">{{ avgRad }} <small class="text-[10px]">W/m²</small></span>
          </div>
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/5">
            <span class="text-[9px] font-bold uppercase opacity-60 block text-green-darken-2">Vitesse Vent</span>
            <span class="text-xl font-black">{{ avgWind }} <small class="text-[10px]">km/h</small></span>
          </div>
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/5">
            <span class="text-[9px] font-bold uppercase opacity-60 block text-red-lighten-1">Température</span>
            <span class="text-xl font-black">{{ avgTemp }} <small class="text-[10px]">°C</small></span>
          </div>
          <div class="p-4 rounded-2xl border border-outline-variant bg-surface-variant/10 col-span-2 flex justify-between items-center">
            <div>
              <span class="text-[9px] font-bold uppercase opacity-60 block">Niveau Moyen PM2.5</span>
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

// --- MATHS : CORRÉLATION ---
const getPearsonCorrelation = (x, y) => {
  const n = x.length; if (n < 2) return 0;
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
const avgTemp = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.temperature_2m_mean, 0) / analysisData.value.length).toFixed(1) : 0)

const pmStatusColor = computed(() => parseFloat(avgPM25.value) < 25 ? 'success' : 'error')
const pmStatusText = computed(() => parseFloat(avgPM25.value) < 25 ? 'Air Sain' : 'Air Pollué')

// --- LOGIQUE D'INTERPRÉTATION AVANCÉE ---
const generateObservation = computed(() => {
  if (!analysisData.value.length) return ""
  
  const zone = selectedFilters.value.city || selectedFilters.value.region || 'nationale'
  const pm = parseFloat(avgPM25.value)
  const rain = parseFloat(avgRain.value)
  const wind = parseFloat(avgWind.value)
  const rad = parseFloat(avgRad.value)

  const corrSolaire = getPearsonCorrelation(analysisData.value.map(d => d.shortwave_radiation_sum), analysisData.value.map(d => d.pm25_proxy))
  const corrVent = getPearsonCorrelation(analysisData.value.map(d => d.wind_speed_10m_max), analysisData.value.map(d => d.pm25_proxy))
  const corrPluie = getPearsonCorrelation(analysisData.value.map(d => d.precipitation_sum), analysisData.value.map(d => d.pm25_proxy))

  let intro = `L'analyse des données pour <strong>${zone}</strong> révèle un écosystème où la qualité de l'air (PM2.5) est étroitement liée aux conditions météo. <br><br>`
  
  let solarDetail = ""
  if (corrSolaire > 0.3) {
    solarDetail = `Le <strong>rayonnement solaire</strong> (${rad} W/m²) présente une corrélation positive forte (${corrSolaire.toFixed(2)}). Cela indique que le soleil favorise des réactions photochimiques augmentant la concentration des particules fines.`
  } else {
    solarDetail = `L'impact du rayonnement solaire semble modéré sur cette période, ne constituant pas le facteur principal de pollution.`
  }

  let cleanEffect = ""
  if (rain > 10 || corrPluie < -0.2) {
    cleanEffect = `Les <strong>précipitations</strong> (${rain} mm) jouent un rôle de "lessivage" efficace, aidant à rabattre les particules au sol et à assainir l'air.`
  } else {
    cleanEffect = `La faible pluviométrie limite le nettoyage naturel de l'atmosphère, favorisant la stagnation des polluants.`
  }

  let windEffect = ""
  if (wind > 15 || corrVent < -0.3) {
    windEffect = `Le <strong>vent</strong> (${wind} km/h) agit comme un moteur de dispersion. Sa corrélation négative montre qu'une augmentation de la vitesse du vent réduit significativement la densité de PM2.5.`
  } else {
    windEffect = `La faiblesse des courants aériens (${wind} km/h) crée un phénomène de confinement, empêchant l'évacuation des micro-particules.`
  }

  // --- SEUILS SELON LES DIRECTIVES DE L'OMS ---
  let statusDetail = ""
  if (pm <= 15) {
    statusDetail = `<br><br><span class="text-success font-bold">Qualité Excellente :</span> Avec une moyenne de ${pm} µg/m³, l'air respecte l'objectif de santé publique de l'<strong>OMS</strong> (≤ 15 µg/m³).`
  } else if (pm <= 25) {
    statusDetail = `<br><br><span class="text-warning font-bold">Qualité Modérée :</span> Le niveau dépasse l'objectif idéal mais reste sous le seuil critique de pollution de 25 µg/m³.`
  } else {
    statusDetail = `<br><br><span class="text-error font-bold">Alerte Pollution :</span> La concentration dépasse le seuil de <strong>25 µg/m³</strong> fixé par les normes internationales de l'OMS.`
  }

  return `${intro} 1. ${solarDetail} <br> 2. ${cleanEffect} <br> 3. ${windEffect} ${statusDetail}`
})

const updateCharts = () => {
  if (!analysisData.value.length) return
  const isDark = theme.global.current.value.dark
  const textColor = isDark ? '#FFFFFF' : '#424242'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'

  setTimeout(() => {
    nextTick(() => {
      renderDynamicHeatmap(textColor)
      renderScatter(textColor, gridColor)
    })
  }, 50)
}

const renderDynamicHeatmap = (textColor) => {
  const keys = ['temperature_2m_mean', 'shortwave_radiation_sum', 'precipitation_sum', 'pm25_proxy', 'wind_speed_10m_max']
  const labels = ['Temp', 'Solaire', 'Pluie', 'PM2.5', 'Vent']
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
    mode: 'markers', type: 'scattergl',
    marker: { size: 6, color: '#FF5252', opacity: 0.4, line: { width: 0.5, color: textColor } }
  }], {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 30, b: 50, l: 50, r: 20 }, font: { color: textColor, size: 10 },
    xaxis: { title: factor.title, gridcolor: gridColor },
    yaxis: { title: 'PM2.5 (µg/m³)', gridcolor: gridColor }
  }, { responsive: true, displayModeBar: false })
}

const loadAnalysis = async () => {
  if (loading.value) return 
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