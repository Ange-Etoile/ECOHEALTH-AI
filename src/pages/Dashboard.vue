<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 md:p-6 text-on-surface transition-colors duration-300">

    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
          <v-icon size="x-small">mdi-shield-check-outline</v-icon> Surveillance Environnementale
        </div>
        <h2 class="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          EcoHealth <span class="text-primary italic">AI</span>
        </h2>
        <p class="text-[10px] md:text-xs opacity-50 font-bold uppercase tracking-widest mt-2">
          Analyse Qualité de l'Air — {{ selectedFilters.city || selectedFilters.region || 'Vue Nationale' }} ({{ selectedFilters.year }})
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <v-btn 
          @click="loadAllData" 
          :loading="loading" 
          icon="mdi-refresh" 
          color="primary" 
          variant="tonal" 
          class="rounded-xl shadow-sm"
        ></v-btn>
      </div>
    </header>

    <v-card variant="outlined" class="bg-surface p-3 md:p-4 rounded-3xl border-outline-variant shadow-sm">
      <FilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading" 
        @change="loadAllData" 
      />
    </v-card>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      <KpiBox label="Moyenne PM2.5" :value="stats.pm25 || 0" unit="µg/m³" icon="mdi-blur" :color="stats.pm25 > 40 ? 'red' : 'green'" :sub="getAirStatus(stats.pm25)" :loading="loading" />
      <KpiBox label="Top Région" :value="stats.top_region || '--'" unit="" icon="mdi-map-marker-radius" color="blue" sub="Zone en Alerte" :loading="loading" />
      <KpiBox label="Pic Temporel" :value="stats.critical_month || '--'" unit="" icon="mdi-calendar-clock" color="orange" sub="Mois Critique" :loading="loading" />
      <KpiBox label="Niveau d'alerte National" :value="stats.vigilance_msg || '--'" unit="" icon="mdi-shield-alert" :color="stats.vigilance_msg === 'Danger' ? 'red' : 'green'" sub="Indice de Risque" :loading="loading" />
      <KpiBox label="Indice Santé" :value="getAirStatus(stats.pm25)" unit="" icon="mdi-heart-pulse" :color="stats.pm25 > 55 ? 'red' : 'yellow'" :sub="stats.pm25 > 55 ? 'Risque Élevé' : 'Normal'" :loading="loading" />
    </div>

    <div class="grid grid-cols-12 gap-6" v-show="!initialLoading">
      <div class="col-span-12 lg:col-span-8 space-y-6">
        
        <ChartCard number="01" title="Tendance Mensuelle" badge="PM2.5 vs T°">
          <div id="evolutionPlot" class="w-full h-[300px]"></div>
        </ChartCard>

        <ChartCard number="02" title="Distribution par Région" badge="DENSITÉ">
          <div id="violinPlot" class="w-full h-[300px]"></div>
        </ChartCard>

        <ChartCard number="03" title="Impact Précipitations" badge="LESSIVAGE">
          <div id="precipPlot" class="w-full h-[300px]"></div>
        </ChartCard>

        <ChartCard number="04" title="Comparatif Régional" badge="PM2.5">
          <div id="regionBarPlot" class="w-full h-[300px]"></div>
        </ChartCard>
      </div>

      <div class="max-h-auto col-span-12 lg:col-span-4">
        <v-card class="rounded-[24px] border border-outline-variant p-5 h-full shadow-none bg-surface-light">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6 flex items-center gap-2">
            {{ selectedFilters.region ? 'Classement des Villes' : 'Classement Régional' }}
          </h3>
          
          <div class="space-y-3">
            <div v-for="(item, index) in (selectedFilters.region ? chartData.cities : chartData.regions)" :key="item.name" 
                 class="group relative overflow-hidden bg-surface border border-outline-variant p-4 rounded-xl flex items-center justify-between transition-all hover:translate-x-1">
              <div class="z-10">
                <span class="text-[8px] font-black opacity-30 block uppercase">Rang #{{ index + 1 }}</span>
                <p class="font-black text-xs uppercase tracking-tight">{{ item.name }}</p>
              </div>
              <div class="text-right z-10">
                <p class="text-base font-black tabular-nums">{{ item.value }} <span class="text-[8px] opacity-40">µg</span></p>
                <span :class="item.value > 40 ? 'text-rose-500' : 'text-emerald-500'" class="text-[9px] font-black uppercase">±{{ item.variation }}%</span>
              </div>
              <div class="absolute bottom-0 left-0 h-[2px] bg-primary opacity-20" :style="{ width: Math.min(item.value, 100) + '%' }"></div>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <div v-if="initialLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <v-progress-circular indeterminate color="primary" size="40" width="4" />
      <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Initialisation des composants...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import Plotly from 'plotly.js-dist-min'
import KpiBox from '@/components/dashboard/KpiBox.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import FilterBar from '@/components/dashboard/FilterBar.vue' // Importé FilterBar au lieu de SimpleFilterBar
import { getDashboardData, getFilterOptions } from '@/services/dataService'

const loading = ref(false)
const initialLoading = ref(true)
const stats = ref({ pm25: 0, top_region: '--', critical_month: '--', vigilance_msg: '--' })
const chartData = ref({ 
  evolution: { months: [], pm25: [], temp: [] }, 
  precip: { months: [], pm25: [], pre_cul: [] }, 
  regions: [],
  cities: [], // Ajout du support pour les villes
  distribution: { x: [], y: [] }
})
const filterOptions = ref({ regions: [], cities: [], annees: [] })
const selectedFilters = ref({ region: null, city: null, year: 2025 })

const getColor = (v) => v > 50 ? '#f43f5e' : (v > 25 ? '#fbbf24' : '#10b981');

const drawPlots = () => {
  const commonLayout = {
    autosize: true,
    margin: { l: 40, r: 40, t: 10, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', size: 10 },
    showlegend: true,
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' }
  }

  // 1. Evolution Plot
  Plotly.react('evolutionPlot', [
    { 
      x: chartData.value.evolution.months, y: chartData.value.evolution.temp, 
      name: 'T°C', type: 'scatter', fill: 'tozeroy', fillcolor: 'rgba(251, 191, 36, 0.05)', 
      line: { color: '#fbbf24', width: 1.5, shape: 'spline' }, yaxis: 'y2' 
    },
    { 
      x: chartData.value.evolution.months, y: chartData.value.evolution.pm25, 
      name: 'PM2.5', mode: 'lines+markers', line: { color: '#3b82f6', width: 3, shape: 'spline' }
    }
  ], { ...commonLayout, yaxis2: { overlaying: 'y', side: 'right', showgrid: false } }, { responsive: true, displayModeBar: false })

  // 2. Violin Plot
  Plotly.react('violinPlot', [
    {
      type: 'violin',
      y: chartData.value.distribution.y,
      x: chartData.value.distribution.x,
      points: 'none',
      box: { visible: true },
      line: { color: '#6366f1' },
      fillcolor: 'rgba(99, 102, 241, 0.2)',
      meanline: { visible: true },
      name: 'Distribution PM2.5'
    }
  ], { ...commonLayout }, { responsive: true, displayModeBar: false })

  // 3. Precip Plot
  Plotly.react('precipPlot', [
    { 
      x: chartData.value.precip.months, y: chartData.value.precip.pre_cul, 
      name: 'Précip. Cumulée', type: 'scatter', fill: 'tozeroy', 
      line: { color: '#fbbf24', width: 1.5 }, yaxis: 'y2' 
    },
    { 
      x: chartData.value.precip.months, y: chartData.value.precip.pm25, 
      name: 'PM2.5', mode: 'lines+markers', line: { color: '#3b82f6', width: 3 }
    }
  ], { ...commonLayout, yaxis2: { overlaying: 'y', side: 'right', showgrid: false } }, { responsive: true, displayModeBar: false })

  // 4. BarPlot Régional
  Plotly.react('regionBarPlot', [{
    x: chartData.value.regions.map(r => r.name),
    y: chartData.value.regions.map(r => r.value),
    type: 'bar',
    marker: { color: chartData.value.regions.map(r => getColor(r.value)), opacity: 0.8 }
  }], { ...commonLayout, showlegend: false }, { responsive: true, displayModeBar: false })
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
    ['evolutionPlot', 'violinPlot', 'precipPlot', 'regionBarPlot'].forEach(id => {
       const el = document.getElementById(id)
       if (el) Plotly.Plots.resize(id)
    })
  })
})

onUnmounted(() => window.removeEventListener('resize', () => {}))
</script>

<style scoped>
:deep(.main-svg) { background: transparent !important; }
:deep(.js-plotly-plot .plotly .modebar) { display: none !important; }
.chart-skel {
  border-radius: 16px;
  background: rgba(150, 150, 150, 0.1);
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
</style>