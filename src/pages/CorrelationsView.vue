<template>
  <div class="max-w-7xl mx-auto space-y-4 p-3 md:p-8 text-on-surface">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-[0.2em] text-[9px]">
          <v-icon size="12">mdi-shield-check-outline</v-icon> Intelligence Environnementale
        </div>
        <h2 class="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          Analyses <span class="text-secondary italic text-stroke-sm">Climatiques</span>
        </h2>
        <p class="text-[9px] md:text-[10px] opacity-60 font-bold uppercase tracking-widest">
          Corrélation des facteurs — {{ selectedFilters.city || selectedFilters.region || 'Vue Nationale' }} ({{ selectedFilters.year }})
        </p>
      </div>
      
      <v-btn 
        @click="loadAnalysis" 
        :loading="loading" 
        icon="mdi-refresh" 
        color="secondary" 
        variant="elevated" 
        size="small"
        class="rounded-xl shadow-lg"
      ></v-btn>
    </header>

    <v-card variant="outlined" class="bg-surface p-3 rounded-2xl border-outline-variant shadow-sm sticky top-2 z-10">
      <FilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadAnalysis" />
    </v-card>

    <v-row v-if="!loading || analysisData.length > 0" dense>
      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden flex flex-col">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/5">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[9px] font-black uppercase tracking-widest text-primary">Confort Thermique</span>
              <v-icon size="small" color="primary">mdi-thermometer-water</v-icon>
            </div>
            <h3 class="text-lg font-black uppercase leading-tight">Température vs Ressenti</h3>
          </div>
          <div class="relative w-full h-[280px] md:h-[350px] grow">
            <div id="tempComparisonChart" class="absolute inset-0"></div>
          </div>
          <div class="p-4 bg-primary/5 border-t border-outline-variant">
            <h4 class="text-[10px] font-black uppercase mb-1 text-primary">Comprendre ce graphique :</h4>
            <p class="text-[11px] leading-snug font-medium opacity-90">
              Ce tracé compare la chaleur mesurée par les capteurs (ligne jaune) à la sensation réelle du corps humain (pointillés rouges). 
              <strong>Analyse :</strong> {{ tempInterpretation }}
            </p>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface h-full overflow-hidden flex flex-col">
          <div class="p-4 border-b border-outline-variant bg-surface-variant/5">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[9px] font-black uppercase tracking-widest text-secondary">Moteur de Causalité</span>
              <v-icon size="small" color="secondary">mdi-chart-scatter-plot</v-icon>
            </div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-black uppercase leading-tight">Impact de :</h3>
              <v-select
                v-model="activeFactor"
                :items="factors"
                density="compact"
                hide-details
                variant="plain"
                class="text-lg font-black text-secondary uppercase italic"
                @update:modelValue="updateCharts"
              ></v-select>
            </div>
          </div>
          <div class="relative w-full h-[280px] md:h-[350px] grow">
            <div id="scatterChart" class="absolute inset-0"></div>
          </div>
          <div class="p-4 bg-secondary/5 border-t border-outline-variant">
            <h4 class="text-[10px] font-black uppercase mb-1 text-secondary">Comprendre ce graphique :</h4>
            <p class="text-[11px] leading-snug font-medium opacity-90">
              Chaque point représente un moment précis. On cherche à voir si la pollution (PM2.5) augmente ou diminue en fonction du facteur sélectionné.
              <strong>Analyse :</strong> {{ scatterInterpretation }}
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="rounded-3xl p-5 md:p-8 border-outline-variant bg-surface shadow-xl mt-4 relative overflow-hidden">
      <div class="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
        <div class="h-8 w-1 bg-secondary rounded-full"></div>
        <div>
          <h3 class="text-xl font-black uppercase tracking-tighter italic text-secondary">Rapport d'Expertise</h3>
          <p class="text-[9px] opacity-60 font-bold uppercase tracking-widest">Analyse dynamique des corrélations PM2.5</p>
        </div>
      </div>
      
      <div v-if="analysisData.length > 0" class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div class="lg:col-span-3 space-y-4">
          <div class="bg-surface-variant/5 p-5 rounded-2xl border border-outline-variant/50">
            <div class="text-[11px] md:text-sm leading-relaxed text-justify space-y-3" v-html="generateDetailedInterpretation"></div>
          </div>

          <v-card :color="airStatus.color" variant="flat" class="rounded-2xl p-4 text-white shadow-md">
            <div class="flex items-center gap-4">
              <div class="text-center border-r border-white/20 pr-4">
                <div class="text-[8px] font-black uppercase tracking-widest opacity-80">Niveau</div>
                <div class="text-lg font-black leading-none">{{ airStatus.level }}</div>
              </div>
              <div class="grow">
                <div class="text-[14px] font-black uppercase leading-tight">{{ airStatus.status }}</div>
                <div class="text-[10px] opacity-90 leading-tight font-medium">{{ airStatus.action }}</div>
              </div>
            </div>
          </v-card>
        </div>

        <div class="lg:col-span-2 grid grid-cols-2 gap-3">
          <div v-for="stat in quickStats" :key="stat.label" 
               class="p-4 rounded-xl border border-outline-variant bg-surface-variant/5 transition-all">
            <div class="flex justify-between items-start mb-1">
              <span :class="`text-[8px] font-bold uppercase opacity-60 text-${stat.color}`">{{ stat.label }}</span>
              <v-icon size="12" :color="stat.color" class="opacity-50">{{ stat.icon }}</v-icon>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-black leading-none">{{ stat.value }}</span>
              <small class="text-[8px] font-bold opacity-50 uppercase">{{ stat.unit }}</small>
            </div>
          </div>
          
          <v-card color="primary" variant="tonal" class="col-span-2 p-6 rounded-2xl flex justify-between items-center border border-primary/20">
            <div>
              <span class="text-[8px] font-black uppercase opacity-80 block mb-1">Concentration Moyenne</span>
              <div class="text-3xl font-black leading-none">{{ avgPM25 }} <span class="text-xs">µg/m³</span></div>
            </div>
            <v-icon size="32" class="opacity-20">mdi-blur</v-icon>
          </v-card>
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center py-16 gap-4 opacity-60">
        <v-progress-circular indeterminate color="secondary" size="50" width="4"></v-progress-circular>
        <span class="text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">Extraction des variables...</span>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue'
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
  { title: 'Soleil', value: 'shortwave_radiation_sum' },
  { title: 'Pluie', value: 'precipitation_sum' },
  { title: 'Vent', value: 'wind_speed_10m_max' },
  { title: 'Chaleur', value: 'temperature_2m_mean' }
]

const currentFactorLabel = computed(() => factors.find(f => f.value === activeFactor.value)?.title)

// --- STATS ---
const avgPM25 = computed(() => analysisData.value.length ? analysisData.value[0].avg_pm25_local.toFixed(2) : 0)
const avgRain = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.precipitation_sum, 0) / analysisData.value.length).toFixed(1) : 0)
const avgWind = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.wind_speed_10m_max, 0) / analysisData.value.length).toFixed(1) : 0)
const avgRad = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.shortwave_radiation_sum, 0) / analysisData.value.length).toFixed(0) : 0)
const avgTemp = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.temperature_2m_mean, 0) / analysisData.value.length).toFixed(1) : 0)
const avgApparent = computed(() => analysisData.value.length ? (analysisData.value.reduce((acc, d) => acc + d.apparent_temperature_mean, 0) / analysisData.value.length).toFixed(1) : 0)

const quickStats = computed(() => [
  { label: 'Pluviométrie', value: avgRain.value, unit: 'mm', color: 'blue', icon: 'mdi-water-outline' },
  { label: 'Rayonnement', value: avgRad.value, unit: 'W/m²', color: 'orange', icon: 'mdi-weather-sunny' },
  { label: 'Flux Éolien', value: avgWind.value, unit: 'km/h', color: 'green', icon: 'mdi-weather-windy' },
  { label: 'Température', value: avgTemp.value, unit: '°C', color: 'red', icon: 'mdi-thermometer' }
])

const airStatus = computed(() => {
  const pm = parseFloat(avgPM25.value)
  if (pm <= 12) return { level: "A", color: "success", status: "Qualité Optimale", action: "Air pur. Aucune restriction nécessaire." }
  if (pm <= 35) return { level: "B", color: "warning", status: "Qualité Modérée", action: "Impact limité sur les sujets très sensibles." }
  if (pm <= 55) return { level: "C", color: "orange-darken-3", status: "Pollution Active", action: "Éviter les efforts physiques intenses en extérieur." }
  return { level: "D", color: "error", status: "Seuil Critique", action: "Danger sanitaire. Port du masque filtrant vivement recommandé." }
})

// --- INTERPRÉTATIONS DYNAMIQUES DES GRAPHES ---
const tempInterpretation = computed(() => {
  const diff = Math.abs(avgTemp.value - avgApparent.value)
  if (diff < 1.5) return "Le confort est stable : l'air n'est ni trop humide ni trop venteux, la chaleur ressentie correspond donc à la mesure réelle."
  return `Il existe un décalage de ${diff.toFixed(1)}°C. Cela signifie que des facteurs extérieurs (comme une forte humidité) rendent la chaleur plus pesante ou "étouffante" que ce que le thermomètre indique.`
})

const scatterInterpretation = computed(() => {
  const f = activeFactor.value
  const pm = parseFloat(avgPM25.value)
  
  if (f === 'precipitation_sum') {
    return "L'analyse montre que la pluie agit comme une 'douche' pour l'atmosphère : plus il pleut (déplacement vers la droite), plus les points de pollution chutent, car l'eau plaque les particules au sol."
  }
  if (f === 'wind_speed_10m_max') {
    return "On observe ici l'effet de balayage : lorsque le vent forcit, les polluants sont dispersés. Un regroupement des points en haut à gauche indiquerait une pollution stagnante due à un air trop calme."
  }
  if (f === 'shortwave_radiation_sum') {
    return "Le soleil peut transformer certains gaz en particules fines. Si les points montent en même temps que l'ensoleillement, cela confirme une pollution d'origine photo-chimique (liée à la lumière)."
  }
  if (f === 'temperature_2m_mean') {
    return "La température influence la densité de l'air. Souvent, une forte chaleur emprisonne les particules PM2.5 près du sol, ce qui se traduit par une montée des points sur la courbe."
  }
  return "Ce graphique permet d'identifier quel facteur météo est le principal responsable des pics de pollution observés."
})

// --- MOTEUR D'INTERPRÉTATION DYNAMIQUE RAPPORT ---
const generateDetailedInterpretation = computed(() => {
  if (!analysisData.value.length) return ""
  const pm = parseFloat(avgPM25.value)
  const rad = parseFloat(avgRad.value)
  const rain = parseFloat(avgRain.value)
  const wind = parseFloat(avgWind.value)
  const temp = parseFloat(avgTemp.value)

  let report = `<p>L'analyse des données croisées montre une concentration de <strong>${pm} µg/m³</strong>. Voici l'influence des variables météo :</p>`
  report += `<p>• <strong>Vecteur Éolien :</strong> Avec une moyenne de ${wind} km/h, `
  report += wind > 12 ? `le vent assure une <strong>dispersion efficace</strong>.` : `le vent est <strong>trop faible</strong> pour évacuer les particules.`
  report += `</p><p>• <strong>Humidité & Pluie :</strong> `
  report += rain > 2 ? `Les précipitations (${rain} mm) agissent comme un <strong>purificateur naturel</strong>.` : `L'absence de pluie facilite la <strong>mise en suspension</strong> des poussières.`
  report += `</p><p>• <strong>Rayonnement Solaire :</strong> Un flux de ${rad} W/m² associé à ${temp}°C `
  report += (rad > 450 && temp > 30) ? `indique un risque de <strong>réactions photo-chimiques</strong>.` : `maintient une stabilité chimique relative.`
  report += `</p>`
  return report
})

const updateCharts = () => {
  if (!analysisData.value.length) return
  const isDark = theme.global.current.value.dark
  const textColor = isDark ? '#FFFFFF' : '#1f2937'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  nextTick(() => {
    renderTempLineChart(textColor, gridColor)
    renderScatterChart(textColor, gridColor)
  })
}

const renderTempLineChart = (textColor, gridColor) => {
  const traces = [
    { y: analysisData.value.map(d => d.temperature_2m_mean), name: 'Réelle', type: 'scatter', mode: 'lines', line: { color: '#fbbf24', width: 2, shape: 'spline' } },
    { y: analysisData.value.map(d => d.apparent_temperature_mean), name: 'Ressenti', type: 'scatter', mode: 'lines', line: { color: '#f43f5e', width: 1.5, dash: 'dot', shape: 'spline' } }
  ]
  Plotly.react('tempComparisonChart', traces, {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 10, b: 30, l: 30, r: 10 }, font: { color: textColor, size: 8 },
    legend: { orientation: 'h', y: -0.1 },
    xaxis: { showgrid: false, zeroline: false },
    yaxis: { gridcolor: gridColor, zeroline: false }
  }, { responsive: true, displayModeBar: false })
}

const renderScatterChart = (textColor, gridColor) => {
  Plotly.react('scatterChart', [{
    x: analysisData.value.map(d => d[activeFactor.value]),
    y: analysisData.value.map(d => d.pm25_proxy),
    mode: 'markers', type: 'scattergl',
    marker: { size: 4, color: '#3b82f6', opacity: 0.5 }
  }], {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 10, b: 40, l: 40, r: 10 }, font: { color: textColor, size: 8 },
    xaxis: { title: { text: currentFactorLabel.value }, gridcolor: gridColor },
    yaxis: { title: { text: 'PM2.5' }, gridcolor: gridColor }
  }, { responsive: true, displayModeBar: false })
}

const loadAnalysis = async () => {
  loading.value = true
  try {
    analysisData.value = await getAnalysisData(selectedFilters.value)
    updateCharts()
  } finally { loading.value = false }
}

watch(() => theme.global.current.value.dark, updateCharts)
onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  loadAnalysis()
  window.addEventListener('resize', updateCharts)
})
onUnmounted(() => window.removeEventListener('resize', updateCharts))
</script>

<style scoped>
.text-justify { text-align: justify; }
.text-stroke-sm { -webkit-text-stroke: 1px currentColor; color: transparent; }
:deep(.js-plotly-plot .plotly .modebar) { display: none !important; }
</style>