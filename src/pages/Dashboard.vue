<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 md:p-6 text-on-surface transition-colors duration-300">

    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
          <v-icon size="x-small">mdi-shield-check-outline</v-icon> Protection de votre santé
        </div>
        <h2 class="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          EcoHealth <span class="text-primary italic">AI</span>
        </h2>
        <p class="text-[10px] md:text-xs opacity-60 font-bold uppercase tracking-widest mt-2">
          Analyse simplifiée de la pollution — {{ selectedFilters.city || selectedFilters.region || 'Cameroun (Vue Nationale)' }}
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <v-btn 
          href="/download-app" 
          target="_blank"
          color="primary" 
          variant="flat" 
          rounded="xl" 
          class="d-none d-md-flex font-black uppercase tracking-widest px-6"
          elevation="4"
        >
          <v-icon start class="mr-2">mdi-android</v-icon>
          Installer l'App
        </v-btn>

        <v-tooltip location="bottom" text="Pourquoi ces chiffres ?">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-help-circle-outline" variant="text" color="primary"></v-btn>
          </template>
        </v-tooltip>
        <v-btn @click="loadAllData" :loading="loading" icon="mdi-refresh" color="primary" variant="tonal" class="rounded-xl"></v-btn>
      </div>
    </header>

    <v-alert border="start" variant="tonal" color="primary" class="rounded-2xl py-3">
      <template v-slot:prepend>
        <v-icon size="30">mdi-information-outline</v-icon>
      </template>
      <div class="text-xs font-bold uppercase mb-1">C'est quoi le PM2.5 ?</div>
      <div class="text-[11px] leading-snug opacity-80">
        Ce sont des particules fines invisibles qui pénètrent dans vos poumons. 
        <strong>Moins le chiffre est élevé, mieux vous respirez.</strong> 
        La limite recommandée par l'OMS est de 15 µg/m³.
      </div>
    </v-alert>

    <v-row class="ma-0 gap-4">
      <v-col cols="12" md="4" class="pa-0">
        <v-card variant="flat" :color="getAirColor(stats.pm25) + '-lighten-5'" class="rounded-[32px] p-6 border-2" :style="{ borderColor: getAirHexColor(stats.pm25) }">
          <div class="text-center space-y-2">
             <div class="text-[10px] font-black uppercase opacity-60 tracking-widest">État de l'Air</div>
             <v-icon :color="getAirHexColor(stats.pm25)" size="64">{{ getAirIcon(stats.pm25) }}</v-icon>
             <div class="text-4xl font-black uppercase italic" :style="{ color: getAirHexColor(stats.pm25) }">
               {{ getAirStatus(stats.pm25) }}
             </div>
             <p class="text-xs font-medium leading-relaxed">{{ getAirAdvice(stats.pm25) }}</p>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" class="pa-0">
        <v-card variant="outlined" class="bg-surface p-4 rounded-[32px] border-outline-variant h-full flex flex-col justify-center">
          <div class="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">Filtres de recherche</div>
          <FilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadAllData" />
        </v-card>
      </v-col>
    </v-row>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      <KpiBox label="Niveau Particules" :value="stats.pm25 || 0" unit="µg/m³" icon="mdi-blur" :color="getAirColor(stats.pm25)" :sub="'Qualité ' + getAirStatus(stats.pm25)" :loading="loading" />
      <KpiBox label="Zone la plus polluée" :value="stats.top_region || '--'" unit="" icon="mdi-map-marker-radius" color="blue-grey" sub="À surveiller" :loading="loading" />
      <KpiBox label="Mois à risque" :value="stats.critical_month || '--'" unit="" icon="mdi-calendar-clock" color="deep-orange" sub="Période critique" :loading="loading" />
      <KpiBox label="Alerte Santé" :value="stats.vigilance_msg || '--'" unit="" icon="mdi-shield-alert" :color="stats.pm25 > 40 ? 'red' : 'green'" sub="Recommandation" :loading="loading" />
      <KpiBox label="Indice de Vie" :value="stats.pm25 < 25 ? 'Excellent' : 'Dégradé'" unit="" icon="mdi-heart-pulse" :color="stats.pm25 > 40 ? 'red' : 'emerald'" sub="Impact corporel" :loading="loading" />
    </div>

    <div class="grid grid-cols-12 gap-6" v-show="!initialLoading">
      <div class="col-span-12 lg:col-span-8 space-y-6">
        
        <ChartCard number="01" title="Évolution dans l'année" badge="Est-ce que ça s'améliore ?">
          <template v-slot:subtitle>Comparaison entre la chaleur (T°) et la poussière (PM2.5)</template>
          <div id="evolutionPlot" class="w-full h-[300px]"></div>
          
          <div class="mt-4 p-4 bg-primary/5 rounded-2xl border-l-4 border-primary">
            <p class="text-[11px] leading-relaxed italic">
              <v-icon size="14" color="primary" class="mr-1">mdi-robot-outline</v-icon>
              <strong>Analyse :</strong> {{ getEvolutionInterpretation() }}
            </p>
          </div>
        </ChartCard>

        <ChartCard number="02" title="Où se situe la pollution ?" badge="PAR RÉGION">
          <template v-slot:subtitle>Analyse de la concentration moyenne par zone géographique</template>
          <div id="violinPlot" class="w-full h-[300px]"></div>

          <div class="mt-4 p-4 bg-indigo/5 rounded-2xl border-l-4 border-indigo">
            <p class="text-[11px] leading-relaxed italic">
              <v-icon size="14" color="indigo" class="mr-1">mdi-chart-bell-curve</v-icon>
              <strong>Répartition :</strong> {{ getDistributionInterpretation() }}
            </p>
          </div>
        </ChartCard>

      </div>

      <div class="max-h-auto col-span-12 lg:col-span-4">
        <v-card class="rounded-[32px] border border-outline-variant p-6 h-full shadow-lg bg-surface-light">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
              <v-icon size="small">mdi-format-list-numbered</v-icon>
              {{ selectedFilters.region ? 'Villes les plus touchées' : 'Régions les plus touchées' }}
            </h3>
            <v-chip size="x-small" class="font-black">TOP 10</v-chip>
          </div>
          
          <div class="space-y-4">
            <div v-for="(item, index) in (selectedFilters.region ? chartData.cities : chartData.regions)" :key="item.name" 
                 class="group relative overflow-hidden bg-surface border border-outline-variant p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-primary/5 cursor-default">
              <div class="z-10 flex items-center gap-4">
                <span class="text-lg font-black opacity-20 italic">#{{ index + 1 }}</span>
                <div>
                  <p class="font-black text-xs uppercase tracking-tight">{{ item.name }}</p>
                  <v-progress-linear :model-value="(item.value / 100) * 100" :color="getAirHexColor(item.value)" height="3" rounded class="mt-1 w-24 opacity-40"></v-progress-linear>
                </div>
              </div>
              <div class="text-right z-10">
                <p class="text-base font-black tabular-nums" :style="{ color: getAirHexColor(item.value) }">{{ item.value }} <span class="text-[8px] opacity-40 text-on-surface">µg</span></p>
                <v-icon size="small" :color="item.variation > 0 ? 'red' : 'green'">
                  {{ item.variation > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-outline-variant flex flex-wrap gap-3 justify-center">
            <div class="flex items-center gap-1 text-[9px] font-bold uppercase opacity-60">
              <div class="w-2 h-2 rounded-full bg-emerald-500"></div> Bon
            </div>
            <div class="flex items-center gap-1 text-[9px] font-bold uppercase opacity-60">
              <div class="w-2 h-2 rounded-full bg-amber-500"></div> Moyen
            </div>
            <div class="flex items-center gap-1 text-[9px] font-bold uppercase opacity-60">
              <div class="w-2 h-2 rounded-full bg-rose-500"></div> Critique
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <div v-if="initialLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <v-progress-circular indeterminate color="primary" size="48" width="6" />
      <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 animate-pulse">Synchronisation des données IA...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import Plotly from 'plotly.js-dist-min'
import KpiBox from '@/components/dashboard/KpiBox.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import { getDashboardData, getFilterOptions } from '@/services/dataService'

const loading = ref(false)
const initialLoading = ref(true)
const stats = ref({ pm25: 0, top_region: '--', critical_month: '--', vigilance_msg: '--' })
const chartData = ref({ 
  evolution: { months: [], pm25: [], temp: [] }, 
  precip: { months: [], pm25: [], pre_cul: [] }, 
  regions: [], cities: [], distribution: { x: [], y: [] }
})
const filterOptions = ref({ regions: [], cities: [], annees: [] })
const selectedFilters = ref({ region: null, city: null, year: 2025 })

// LOGIQUE D'INTERPRÉTATION DYNAMIQUE
const getEvolutionInterpretation = () => {
  const city = selectedFilters.value.city || selectedFilters.value.region || 'le pays';
  if (stats.value.pm25 > 40) {
    return `Pour ${city}, on remarque une corrélation forte entre la chaleur et les pics de PM2.5, particulièrement en période de pic annuel (${stats.value.critical_month}).`;
  }
  return `L'évolution à ${city} montre une qualité d'air stable malgré les variations de température sur l'année ${selectedFilters.value.year}.`;
};

const getDistributionInterpretation = () => {
  if (selectedFilters.value.region) {
    return `La dispersion des données indique que certaines villes de la région ${selectedFilters.value.region} subissent des épisodes de pollution plus intenses que d'autres.`;
  }
  return `Au niveau national, la répartition montre que les zones urbaines restent les principaux foyers de concentration de particules fines.`;
};

// LOGIQUE DE VULGARISATION (UX)
const getAirStatus = (v) => {
  if (!v) return '--';
  if (v <= 15) return 'Air Pur';
  if (v <= 40) return 'Acceptable';
  if (v <= 60) return 'Pollué';
  return 'Critique';
};

const getAirColor = (v) => {
  if (v <= 15) return 'emerald';
  if (v <= 40) return 'amber';
  return 'rose';
};

const getAirHexColor = (v) => {
  if (v <= 15) return '#10b981';
  if (v <= 40) return '#f59e0b';
  return '#f43f5e';
};

const getAirIcon = (v) => {
  if (v <= 15) return 'mdi-emoticon-happy-outline';
  if (v <= 40) return 'mdi-emoticon-neutral-outline';
  return 'mdi-mask-outline';
};

const getAirAdvice = (v) => {
  if (v <= 15) return 'Qualité idéale. C\'est le moment parfait pour vos activités sportives en plein air.';
  if (v <= 40) return 'Air modéré. Les personnes très sensibles au niveau respiratoire devraient limiter les efforts.';
  return 'Risque sanitaire. Port du masque conseillé et évitez d\'aérer vos pièces en fin de journée.';
};

const drawPlots = () => {
  const commonLayout = {
    autosize: true,
    margin: { l: 40, r: 40, t: 30, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', size: 10 },
    showlegend: true,
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' }
  }

  Plotly.react('evolutionPlot', [
    { x: chartData.value.evolution.months, y: chartData.value.evolution.temp, name: 'Température (°C)', type: 'scatter', line: { color: '#fbbf24', shape: 'spline' }, yaxis: 'y2' },
    { x: chartData.value.evolution.months, y: chartData.value.evolution.pm25, name: 'Pollution (PM2.5)', mode: 'lines+markers', line: { color: '#3b82f6', width: 3, shape: 'spline' } }
  ], { ...commonLayout, yaxis2: { overlaying: 'y', side: 'right', showgrid: false } }, { responsive: true, displayModeBar: false })

  Plotly.react('violinPlot', [{
      type: 'violin', y: chartData.value.distribution.y, x: chartData.value.distribution.x,
      box: { visible: true }, line: { color: '#6366f1' }, fillcolor: 'rgba(99, 102, 241, 0.2)', name: 'Répartition'
  }], { ...commonLayout }, { responsive: true, displayModeBar: false })
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
  finally { loading.value = false; initialLoading.value = false; }
}

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  await loadAllData()
  window.addEventListener('resize', () => {
    ['evolutionPlot', 'violinPlot'].forEach(id => {
       const el = document.getElementById(id)
       if (el) Plotly.Plots.resize(id)
    })
  })
})
</script>

<style scoped>
:deep(.main-svg) { background: transparent !important; }
.v-card { transition: all 0.3s ease; }
</style>