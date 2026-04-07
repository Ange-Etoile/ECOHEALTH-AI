<template>
  <div class="max-w-7xl mx-auto space-y-6 p-6 text-on-surface transition-colors duration-500">
    
    <header class="flex items-center justify-between border-b border-outline-variant pb-4">
      <div>
        <h2 class="text-3xl font-black tracking-tighter uppercase leading-none">
          EcoHealth <span class="text-primary italic">AI</span> 
        </h2>
        <p class="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Surveillance Environnementale</p>
      </div>
      <v-btn @click="loadAllData" :loading="loading" icon color="primary" variant="tonal" size="small" class="rounded-xl">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </header>

    <section>
      <SimpleFilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadAllData" />
    </section>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <KpiBox 
        label="Moyenne PM2.5" 
        :value="stats.pm25 || 0" 
        unit="µg/m³" 
        icon="mdi-blur"
        :color="stats.pm25 > 40 ? 'red' : 'green'" 
        :sub="getAirStatus(stats.pm25)" 
        :loading="loading" 
      />

      <KpiBox 
        label="Top Région" 
        :value="stats.top_region || '--'" 
        unit="" 
        icon="mdi-map-marker-radius"
        color="blue" 
        sub="Zone en Alerte" 
        :loading="loading" 
      />

      <KpiBox 
        label="Pic Temporel" 
        :value="stats.critical_month || '--'" 
        unit="" 
        icon="mdi-calendar-clock"
        color="orange" 
        sub="Mois Critique" 
        :loading="loading" 
      />

      <KpiBox 
        label="Indice Santé" 
        :value="getAirStatus(stats.pm25)" 
        unit="" 
        icon="mdi-heart-pulse"
        :color="stats.pm25 > 55 ? 'red' : 'yellow'" 
        :sub="stats.pm25 > 55 ? 'Risque Élevé' : 'Normal'" 
        :loading="loading" 
      />
    </div>
   <div class="grid grid-cols-12 gap-6" v-show="!initialLoading">
  <div class="col-span-12 lg:col-span-8 space-y-6">
    <div class="grid grid-cols-1 gap-6"> <v-card class="rounded-2xl border border-outline-variant p-2 shadow-none bg-surface overflow-hidden">
        <h3 class="text-[9px] font-black uppercase tracking-widest opacity-40 px-4 pt-2">Tendance Mensuelle (PM2.5 vs T°)</h3>
        <div id="evolutionPlot" class="w-full h-[250px]"></div>
      </v-card>

      <v-card class="rounded-2xl border border-outline-variant p-2 shadow-none bg-surface overflow-hidden">
        <h3 class="text-[9px] font-black uppercase tracking-widest opacity-40 px-4 pt-2">Impact Précipitations (Lessivage)</h3>
        <div id="precipPlot" class="w-full h-[250px]"></div>
      </v-card>

      <v-card class="rounded-2xl border border-outline-variant p-2 shadow-none bg-surface overflow-hidden">
        <h3 class="text-[9px] font-black uppercase tracking-widest opacity-40 px-4 pt-2">Comparatif Régional PM2.5</h3>
        <div id="regionBarPlot" class="w-full h-[250px]"></div>
      </v-card>
    </div>

    <div class="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-4 items-start">
      <v-icon color="primary" size="small">mdi-auto-fix</v-icon>
      <p class="text-[11px] leading-relaxed font-medium opacity-80 text-primary">
        <b>Analyse :</b> La corrélation entre le cumul de pluie et la baisse des PM2.5 est confirmée.
      </p>
    </div>
  </div>

  <div class="col-span-12 lg:col-span-4">
    <v-card class="rounded-[24px] border border-outline-variant p-5 h-full shadow-none bg-surface-light">
      <h3 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6 flex items-center gap-2">Analyse Régionale</h3>
      <div class="space-y-3">
        <div v-for="(reg, index) in chartData.regions" :key="reg.name" 
             class="group relative overflow-hidden bg-surface border border-outline-variant p-4 rounded-xl flex items-center justify-between transition-all hover:translate-x-1">
          <div class="z-10">
            <span class="text-[8px] font-black opacity-30 block uppercase">Rang #{{ index + 1 }}</span>
            <p class="font-black text-xs uppercase tracking-tight">{{ reg.name }}</p>
          </div>
          <div class="text-right z-10">
            <p class="text-base font-black tabular-nums">{{ reg.value }} <span class="text-[8px] opacity-40">µg</span></p>
            <span :class="reg.value > 40 ? 'text-rose-500' : 'text-emerald-500'" class="text-[9px] font-black uppercase">±{{ reg.variation }}%</span>
          </div>
          <div class="absolute bottom-0 left-0 h-[2px] bg-primary opacity-20" :style="{ width: Math.min(reg.value, 100) + '%' }"></div>
        </div>
      </div>
    </v-card>
  </div>
</div>

    <div v-if="initialLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <v-progress-circular indeterminate color="primary" size="40" width="4" />
      <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Chargement des données...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import Plotly from 'plotly.js-dist-min'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import KPICard from '@/components/dashboard/KPICard.vue'
import KpiBox from '@/components/dashboard/KpiBox.vue'
import SimpleFilterBar from '@/components/dashboard/SimpleFilterBar.vue'
import { getDashboardData, getFilterOptions } from '@/services/dataService'

const loading = ref(false)
const initialLoading = ref(true)
const stats = ref({ pm25: 0, top_region: '--', critical_month: '--' })
const chartData = ref({ 
  evolution: { months: [], pm25: [], temp: [] }, 
  precip: { labels: [], values: [] }, 
  regions: [] 
})
const filterOptions = ref({ regions: [], annees: [] })
const selectedFilters = ref({ region: null, year: 2025 })
let map = null

const getColor = (v) => v > 50 ? '#f43f5e' : (v > 25 ? '#fbbf24' : '#10b981');

const drawPlots = () => {
  const commonLayout = {
    autosize: true,
    margin: { l: 30, r: 30, t: 10, b: 30 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', size: 9 },
    showlegend: false
  }
  Plotly.react('evolutionPlot', [
  { 
    x: chartData.value.evolution.months, 
    y: chartData.value.evolution.temp, 
    name: 'T°C', 
    type: 'scatter', 
    fill: 'tozeroy', 
    fillcolor: 'rgba(251, 191, 36, 0.05)', 
    line: { color: '#fbbf24', width: 1.5, shape: 'spline' }, 
    yaxis: 'y2' 
  },
  { 
    x: chartData.value.evolution.months, 
    y: chartData.value.evolution.pm25, 
    name: 'PM2.5', 
    mode: 'lines+markers', 
    line: { color: '#3b82f6', width: 3, shape: 'spline' }, 
    marker: { size: 5, color: '#3b82f6' } 
  }
], { 
  ...commonLayout, 
  showlegend: true, 
  legend: {
    orientation: 'h',      
    x: 0.5,                
    xanchor: 'center',
    y: -0.2,               
    font: { size: 9 }
  },
  margin: { l: 30, r: 30, t: 10, b: 20 }, 
  yaxis: { 
    gridcolor: '#f8fafc',
    automargin: true      
  }, 
  yaxis2: { 
    overlaying: 'y', 
    side: 'right', 
    showgrid: false,
    automargin: true 
  } 
}, { 
  responsive: true, 
  displayModeBar: false 
  })
  Plotly.react('precipPlot', [
  { 
    x: chartData.value.precip.months, 
    y: chartData.value.precip.pre_cul, 
    name: 'Precipitation Cumulé', 
    type: 'scatter', 
    fill: 'tozeroy', 
    fillcolor: 'rgba(251, 191, 36, 0.05)', 
    line: { color: '#fbbf24', width: 1.5, shape: 'spline' }, 
    yaxis: 'y2' 
  },
  { 
    x: chartData.value.precip.months, 
    y: chartData.value.precip.pm25, 
    name: 'PM2.5', 
    mode: 'lines+markers', 
    line: { color: '#3b82f6', width: 3, shape: 'spline' }, 
    marker: { size: 5, color: '#3b82f6' } 
  }
], { 
  ...commonLayout, 
  showlegend: true, 
  legend: {
    orientation: 'h',      
    x: 0.5,                
    xanchor: 'center',
    y: -0.2,               
    font: { size: 9 }
  },
  margin: { l: 30, r: 30, t: 10, b: 20 }, 
  yaxis: { 
    gridcolor: '#f8fafc',
    automargin: true      
  }, 
  yaxis2: { 
    overlaying: 'y', 
    side: 'right', 
    showgrid: false,
    automargin: true 
  } 
}, { 
  responsive: true, 
  displayModeBar: false 
  })
  
  // 3. BarPlot Régional (Couleurs selon niveau)
  const regionNames = chartData.value.regions.map(r => r.name)
  const regionValues = chartData.value.regions.map(r => r.value)
  const regionColors = regionValues.map(v => getColor(v))

  Plotly.react('regionBarPlot', [{
    x: regionNames,
    y: regionValues,
    type: 'bar',
    marker: { color: regionColors, line: { width: 0 }, opacity: 0.8 },
    width: 0.6
  }], { 
    ...commonLayout, 
    xaxis: { tickangle: 0, gridcolor: 'transparent' }, 
    yaxis: { gridcolor: '#f8fafc' },
    margin: { l: 30, r: 10, t: 10, b: 30 }
  }, { responsive: true, displayModeBar: false })
}

const initMiniMap = () => {
  if (map) map.remove()
  map = L.map('miniMap', { zoomControl: false, attributionControl: false }).setView([4.05, 9.7], 6)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map)
}

const loadAllData = async () => {
  loading.value = true
  try {
    const res = await getDashboardData(selectedFilters.value)
    if (res) {
      stats.value = res.kpis || stats.value
      chartData.value = res.charts || chartData.value
      await nextTick()
      drawPlots()
      initMiniMap()
    }
  } catch (e) { console.error(e) } 
  finally {
    loading.value = false
    initialLoading.value = false
  }
}

const getAirStatus = (v) => {
  if (!v) return '--'
  if (v <= 15) return 'Air Pur'
  if (v < 40) return 'Acceptable'
  return 'Pollution'
}

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  await loadAllData()
  window.addEventListener('resize', () => {
    ['evolutionPlot', 'precipPlot', 'regionBarPlot'].forEach(id => Plotly.Plots.resize(id))
  })
})

onUnmounted(() => window.removeEventListener('resize', () => {}))
</script>

<style scoped>
:deep(.main-svg) { background: transparent !important; }
:deep(.js-plotly-plot .plotly .modebar) { display: none !important; }
</style>