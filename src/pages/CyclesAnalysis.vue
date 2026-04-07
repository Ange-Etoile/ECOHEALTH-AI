<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 md:p-8 text-on-surface transition-colors duration-300">

    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant pb-8">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-black uppercase tracking-[0.25em] text-[10px]">
          <v-icon size="14" color="orange">mdi-calendar-sync</v-icon> Analyse Temporelle & Saisonnière
        </div>
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
          Cycles de <span class="text-orange-500 italic">Pollution</span>
        </h2>
        <div class="flex items-center gap-3 mt-4">
          <v-chip size="small" color="primary" variant="flat" class="font-black uppercase text-[10px]">
            {{ selectedFilters.region || 'National' }}
          </v-chip>
          <v-chip size="small" variant="outlined" class="font-black text-[10px]">
            Période : {{ selectedFilters.year }}
          </v-chip>
        </div>
      </div>
      
      <v-btn 
        @click="loadData" 
        :loading="loading" 
        icon="mdi-refresh" 
        color="orange" 
        variant="elevated" 
        elevation="4"
        class="rounded-2xl h-[56px] w-[56px]"
      ></v-btn>
    </header>

    <div class="sticky top-4 z-10 shadow-xl rounded-[28px]">
      <SimpleFilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading" 
        @change="loadData" 
      />
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiBox label="Qualité de l'air" :value="kpis?.avg_pm25" unit="µg/m³" :color="pmColor(kpis?.avg_pm25)" :sub="pmLabel(kpis?.avg_pm25)" :loading="loading" />
      <KpiBox label="Pic Harmattan" :value="kpis?.dry_season_pm25" unit="µg/m³" color="orange" sub="Saison sèche" :loading="loading" />
      <KpiBox label="Impact Pluies" :value="kpis?.wet_season_pm25" unit="µg/m³" color="blue" sub="Lessivage" :loading="loading" />
      <KpiBox label="Alerte Santé" :value="kpis?.critical_dry_pct" unit="%" :color="kpis?.critical_dry_pct > 50 ? 'red' : 'yellow'" sub="Jours > Limites" :loading="loading" />
      <KpiBox label="Mois critique" :value="kpis?.monthly_critical" unit="" color="red" sub="Concentration Max" :loading="loading" />
      <KpiBox label="Effet Saison" :value="kpis?.dry_wet_ratio" unit="×" color="purple" sub="Multiplicateur" :loading="loading" />
    </div>

    <div class="space-y-4">
      <ChartCard number="01" title="Évolution des particules fines" badge="DYNAMIQUE">
        <div v-if="loading" class="chart-skel h-[380px]"></div>
        <div v-show="!loading" ref="elTimeline" class="w-full h-[360px] md:h-[420px]"></div>
      </ChartCard>
      
      <div v-if="!loading && kpis?.avg_pm25" class="bg-primary/[0.05] border-l-4 border-primary p-5 rounded-r-2xl">
        <div class="flex items-start gap-4">
          <v-icon color="primary" class="mt-1">mdi-lightbulb-on</v-icon>
          <div>
            <h4 class="font-black text-xs uppercase tracking-widest mb-1 text-primary">Analyse de la tendance</h4>
            <p class="text-sm leading-relaxed opacity-90 italic">
              {{ timelineInterpretation }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-3">
        <ChartCard number="02" title="Corrélation Pluies vs Pollution" badge="SAISONNALITÉ">
          <div v-if="loading" class="chart-skel h-[320px]"></div>
          <div v-show="!loading" ref="elSeasonal" class="w-full h-[320px] md:h-[380px]"></div>
        </ChartCard>
      </div>
      <div class="bg-surface border border-outline-variant p-6 rounded-2xl flex flex-col justify-center space-y-4">
        <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <v-icon color="blue" size="20">mdi-weather-pouring</v-icon>
        </div>
        <h4 class="font-black uppercase text-xs tracking-widest text-primary">Interprétation Pluie/PM</h4>
        <p class="text-sm leading-relaxed opacity-80">
          {{ seasonalInterpretation }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <ChartCard number="03" title="Bilan Hydrique Mensuel" badge="RESSOURCES">
          <template #subtitle>Excédent ou déficit d'eau dans l'atmosphère</template>
          <div v-if="loading" class="chart-skel h-[280px]"></div>
          <div v-show="!loading" ref="elBilan" class="w-full h-[260px] md:h-[300px]"></div>
        </ChartCard>
        <div v-if="!loading" class="px-2">
           <p class="text-[11px] leading-snug opacity-70">
             <v-icon size="12" class="mr-1">mdi-information-outline</v-icon>
             <b>Lecture :</b> {{ bilanInterpretation }}
           </p>
        </div>
      </div>

      <div class="space-y-4">
        <ChartCard number="04" title="Stabilité des polluants" badge="VARIABILITÉ">
          <template #subtitle>Dispersion des mesures par saison</template>
          <div v-if="loading" class="chart-skel h-[280px]"></div>
          <div v-show="!loading" ref="elViolin" class="w-full h-[260px] md:h-[300px]"></div>
        </ChartCard>
        <div v-if="!loading" class="px-2">
           <p class="text-[11px] leading-snug opacity-70">
             <v-icon size="12" class="mr-1">mdi-chart-bell-curve</v-icon>
             <b>Risque :</b> {{ violinInterpretation }}
           </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import Plotly from 'plotly.js-dist-min'
import { getCyclesAnalysis, getFilterOptions } from '@/services/dataService'
import SimpleFilterBar from '@/components/dashboard/SimpleFilterBar.vue'
import KpiBox from '@/components/dashboard/KpiBox.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'

const loading = ref(false)
const filterOptions = ref({ regions: [], annees: [] })
const selectedFilters = ref({ region: null, year: 2025 })
const kpis = ref({})
const rawData = ref({})

const elTimeline = ref(null); const elSeasonal = ref(null); const elBilan = ref(null); const elViolin = ref(null);
const isDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

// LOGIQUE D'INTERPRÉTATION DYNAMIQUE
const timelineInterpretation = computed(() => {
  if (!kpis.value.avg_pm25) return "Analyse des tendances en cours..."
  const ratio = kpis.value.dry_wet_ratio || 0
  const city = selectedFilters.value.region || 'le territoire'
  const year = selectedFilters.value.year
  return `Pour ${city} en ${year}, nous observons que la pollution est ${ratio} fois plus intense en saison sèche qu'en saison des pluies. Les pics de PM2.5 coïncident systématiquement avec les périodes de faible humidité, augmentant les risques respiratoires.`
})

const seasonalInterpretation = computed(() => {
  const mois = kpis.value.monthly_critical || 'certains mois'
  const year = selectedFilters.value.year
  return `En ${year}, le mois de ${mois} présente la concentration maximale. Ce graphique montre l'effet de "lessivage" : chaque pic de pluie (courbe bleue) entraîne une chute immédiate des particules fines (barres orange), purifiant naturellement l'air.`
})

const bilanInterpretation = computed(() => {
  const hasDeficit = rawData.value.seasonal?.some(r => r.bilan < 0)
  const year = selectedFilters.value.year
  return hasDeficit 
    ? `En ${year}, les barres rouges indiquent un déficit hydrique critique : l'air est trop sec pour rabattre les poussières au sol, ce qui favorise la suspension prolongée des polluants.`
    : `En ${year}, l'humidité stable permet de limiter la suspension des particules fines sur la majeure partie de l'année.`
})

const violinInterpretation = computed(() => {
  const year = selectedFilters.value.year
  if (kpis.value.critical_dry_pct > 50) {
    return `En saison sèche ${year}, plus de ${kpis.value.critical_dry_pct}% des mesures dépassent les seuils de l'OMS. La dispersion est très large, indiquant des épisodes de pollution imprévisibles et violents.`
  }
  return `En ${year}, la distribution des polluants reste modérée, avec une variabilité saisonnière contrôlée.`
})

const pmColor = v => !v ? 'gray' : v <= 15 ? 'green' : v <= 35 ? 'yellow' : v <= 55 ? 'orange' : 'red'
const pmLabel = v => !v ? '–' : v <= 15 ? 'Excellent' : v <= 35 ? 'Modéré' : v <= 55 ? 'Nocif' : 'Critique'

const GET_LAYOUT = (extra = {}) => {
  const textColor = isDark.value ? 'rgba(255,255,255,0.7)' : '#1f2937'
  const gridColor = isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: true,
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center', font: { color: textColor, size: 10 } },
    font: { family: 'Inter, sans-serif', size: 11, color: textColor },
    margin: { l: 40, r: 40, t: 10, b: 40 },
    xaxis: { gridcolor: gridColor, zeroline: false, tickfont: { color: textColor } },
    yaxis: { gridcolor: gridColor, zeroline: false, tickfont: { color: textColor } },
    hovermode: 'x unified',
    ...extra
  }
}

const renderCharts = () => {
  const d = rawData.value
  if (!d || Object.keys(d).length === 0) return

  if (elTimeline.value && d.timeline?.length > 0) {
    Plotly.react(elTimeline.value, [{
      x: d.timeline.map(r => r.date),
      y: d.timeline.map(r => r.pm25),
      name: 'PM2.5',
      type: 'scatter', mode: 'lines', 
      line: { color: '#f97316', width: 3, shape: 'spline' },
      fill: 'tozeroy', 
      fillcolor: isDark.value ? 'rgba(249,115,22,0.05)' : 'rgba(249,115,22,0.1)'
    }], GET_LAYOUT(), { responsive: true, displayModeBar: false })
  }

  if (elSeasonal.value && d.seasonal?.length > 0) {
    Plotly.react(elSeasonal.value, [
      { 
        x: d.seasonal.map(r => r.mois_nom), 
        y: d.seasonal.map(r => r.pm25), 
        name: 'Pollution', 
        type: 'bar', 
        marker: { color: '#f97316', opacity: 0.8 }
      },
      { 
        x: d.seasonal.map(r => r.mois_nom), 
        y: d.seasonal.map(r => r.precip), 
        name: 'Pluie', 
        type: 'scatter', 
        yaxis: 'y2', 
        line: { color: '#3b82f6', width: 4, shape: 'spline' } 
      }
    ], GET_LAYOUT({ 
      yaxis2: { overlaying: 'y', side: 'right', showgrid: false, tickfont: { color: '#3b82f6' } } 
    }), { responsive: true, displayModeBar: false })
  }

  if (elBilan.value && d.seasonal?.length > 0) {
    Plotly.react(elBilan.value, [{
      x: d.seasonal.map(r => r.mois_nom), 
      y: d.seasonal.map(r => r.bilan), 
      name: 'Balance',
      type: 'bar',
      marker: { color: d.seasonal.map(r => r.bilan >= 0 ? '#10b981' : '#f43f5e') }
    }], GET_LAYOUT(), { responsive: true, displayModeBar: false })
  }

  if (elViolin.value && d.violin) {
    const traces = []
    if (d.violin.dry) traces.push({ 
      y: d.violin.dry, name: 'Sèche', type: 'violin', box: { visible: true }, line: { color: '#f97316' } 
    })
    if (d.violin.wet) traces.push({ 
      y: d.violin.wet, name: 'Pluies', type: 'violin', box: { visible: true }, line: { color: '#3b82f6' } 
    })
    Plotly.react(elViolin.value, traces, GET_LAYOUT(), { responsive: true, displayModeBar: false })
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getCyclesAnalysis(selectedFilters.value)
    kpis.value = response?.kpis || {}
    rawData.value = response?.data || {}
    await nextTick()
    setTimeout(renderCharts, 300)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(isDark, () => renderCharts())

onMounted(async () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', e => isDark.value = e.matches)
  try {
    const opts = await getFilterOptions()
    filterOptions.value = { 
      regions: opts?.regions || [], 
      citiesData: opts?.citiesData || {},
      annees: opts?.annees || [2025] 
    }
  } catch (e) {}
  await loadData()
  window.addEventListener('resize', () => {
    [elTimeline, elSeasonal, elBilan, elViolin].forEach(el => {
      if (el.value) Plotly.Plots.resize(el.value)
    })
  })
})

onUnmounted(() => window.removeEventListener('resize', () => {}))
</script>

<style scoped>
.chart-skel {
  border-radius: 24px;
  background: rgba(var(--v-theme-primary), 0.05);
  animation: pulse 1.8s infinite ease-in-out;
}
@keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.99); } 50% { opacity: 0.7; transform: scale(1); } }
:deep(.js-plotly-plot .plotly .modebar) { display: none !important; }
:deep(.main-svg) { border-radius: 16px !important; }
</style>