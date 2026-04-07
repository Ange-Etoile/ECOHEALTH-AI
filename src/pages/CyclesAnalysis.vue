<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 md:p-6 text-on-surface transition-colors duration-300">

    <header class="relative overflow-hidden rounded-2xl border border-on-surface/10 bg-surface-variant dark:bg-[#0d0f18] p-6 md:p-8">
      <div class="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
      <div class="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400/80">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            Analyse Temporelle & Saisonnière
          </div>
          <h1 class="text-3xl md:text-5xl font-black tracking-tighter text-on-surface dark:text-white">
            Cycles de <span class="text-orange-500 italic">Pollution</span>
          </h1>
          <p class="text-sm text-on-surface/60 dark:text-white/40 max-w-xl leading-relaxed">
            Variations PM2.5 selon la saisonnalité — Harmattan (Nov–Mar) vs Saison des pluies (Avr–Oct).
          </p>
        </div>
        <div class="flex gap-2">
          <span class="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[11px] font-bold text-orange-600 dark:text-orange-400">🌵 Harmattan</span>
          <span class="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-600 dark:text-blue-400">🌧️ Pluies</span>
        </div>
      </div>
    </header>

    <v-card variant="outlined" class="bg-surface p-3 md:p-4 rounded-3xl border-outline-variant shadow-sm">
      <FilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading" 
        @change="loadData" 
      />
    </v-card>

    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <KpiBox label="PM2.5 moyen" :value="kpis?.avg_pm25" unit="µg/m³" :color="pmColor(kpis?.avg_pm25)" :sub="pmLabel(kpis?.avg_pm25)" :loading="loading" />
      <KpiBox label="Harmattan PM2.5" :value="kpis?.dry_season_pm25" unit="µg/m³" color="orange" sub="🌵 Saison sèche" :loading="loading" />
      <KpiBox label="Pluies PM2.5" :value="kpis?.wet_season_pm25" unit="µg/m³" color="blue" sub="🌧️ Lessivage" :loading="loading" />
      <KpiBox label="Jours critiques" :value="kpis?.critical_dry_pct" unit="%" :color="kpis?.critical_dry_pct > 50 ? 'red' : 'yellow'" sub="Sèche > OMS" :loading="loading" />
      <KpiBox label="Pire mois" :value="kpis?.monthly_critical" unit="" color="red" sub="Pic PM2.5 max" :loading="loading" />
      <KpiBox label="Ratio Sèche/Pluies" :value="kpis?.dry_wet_ratio" unit="×" color="purple" sub="Amplification" :loading="loading" />
    </div>

    <ChartCard number="01" title="Évolution chronologique PM2.5" badge="TIMELINE">
      <div v-if="loading" class="chart-skel h-[380px]"></div>
      <div v-show="!loading" ref="elTimeline" class="w-full h-[360px] md:h-[420px]"></div>
    </ChartCard>

    <ChartCard number="02" title="Saisonnalité mensuelle" badge="DUAL AXIS">
      <div v-if="loading" class="chart-skel h-[320px]"></div>
      <div v-show="!loading" ref="elSeasonal" class="w-full h-[300px] md:h-[360px]"></div>
    </ChartCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <ChartCard number="03" title="Bilan Hydrique" badge="DÉFICIT/EXCÉDENT">
        <div v-if="loading" class="chart-skel h-[280px]"></div>
        <div v-show="!loading" ref="elBilan" class="w-full h-[260px] md:h-[300px]"></div>
      </ChartCard>

      <ChartCard number="04" title="Distribution par saison" badge="VIOLON">
        <div v-if="loading" class="chart-skel h-[280px]"></div>
        <div v-show="!loading" ref="elViolin" class="w-full h-[260px] md:h-[300px]"></div>
      </ChartCard>
    </div>

    <ChartCard v-if="rawData?.heatmap" number="05" title="Heatmap PM2.5" badge="TENDANCE">
      <div v-if="loading" class="chart-skel h-[240px]"></div>
      <div v-show="!loading" ref="elHeatmap" class="w-full h-[220px] md:h-[280px]"></div>
    </ChartCard>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onBeforeUnmount, watch } from 'vue'
import Plotly from 'plotly.js-dist-min'
import { getCyclesAnalysis, getFilterOptions } from '@/services/dataService'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import KpiBox from '@/components/dashboard/KpiBox.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'

const loading = ref(false)
const filterOptions = ref({ regions: [], years: [] })
const selectedFilters = ref({ region: null, year: 2025 })
const kpis = ref({})
const rawData = ref({})

const elTimeline = ref(null); const elSeasonal = ref(null); const elBilan = ref(null); const elViolin = ref(null); const elHeatmap = ref(null);
const isDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

const pmColor = v => !v ? 'gray' : v <= 15 ? 'green' : v <= 35 ? 'yellow' : v <= 55 ? 'orange' : 'red'
const pmLabel = v => !v ? '–' : v <= 15 ? 'Sain' : v <= 35 ? 'Modéré' : v <= 55 ? 'Mauvais' : 'Dangereux'

const GET_LAYOUT = (extra = {}) => {
  const textColor = isDark.value ? 'rgba(255,255,255,0.7)' : '#374151'
  const gridColor = isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: true,
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center', font: { color: textColor } },
    font: { family: 'Inter, sans-serif', size: 11, color: textColor },
    margin: { l: 45, r: 45, t: 20, b: 60 },
    autosize: true,
    xaxis: { gridcolor: gridColor, zeroline: false, tickfont: { color: textColor } },
    yaxis: { gridcolor: gridColor, zeroline: false, tickfont: { color: textColor } },
    ...extra
  }
}

const renderCharts = () => {
  const d = rawData.value
  if (!d || Object.keys(d).length === 0) return

  // 01. Timeline
  if (elTimeline.value && d.timeline?.length > 0) {
    Plotly.react(elTimeline.value, [{
      x: d.timeline.map(r => r.date),
      y: d.timeline.map(r => r.pm25),
      name: 'PM2.5',
      type: 'scatter', mode: 'lines', line: { color: '#f97316', width: 3 },
      fill: 'tozeroy', fillcolor: 'rgba(249,115,22,0.1)'
    }], GET_LAYOUT(), { responsive: true, displayModeBar: false })
  }

  // 02. Seasonal (CORRIGÉ ICI)
  if (elSeasonal.value && d.seasonal?.length > 0) {
    Plotly.react(elSeasonal.value, [
      { 
        x: d.seasonal.map(r => r.mois_nom), 
        y: d.seasonal.map(r => r.pm25), 
        name: 'PM2.5 (µg/m³)', 
        type: 'bar', 
        marker: { color: '#f97316' } 
      },
      { 
        x: d.seasonal.map(r => r.mois_nom), 
        y: d.seasonal.map(r => r.precip), 
        name: 'Précipitations (mm)', 
        type: 'scatter', 
        yaxis: 'y2', 
        line: { color: '#3b82f6', width: 3 } 
      }
    ], GET_LAYOUT({ 
      yaxis2: { 
        overlaying: 'y', 
        side: 'right', 
        showgrid: false, 
        title: { text: 'mm', font: { size: 10 } } 
      } 
    }), { responsive: true })
  }

  // 03. Bilan
  if (elBilan.value && d.seasonal?.length > 0) {
    Plotly.react(elBilan.value, [{
      x: d.seasonal.map(r => r.mois_nom), 
      y: d.seasonal.map(r => r.bilan), 
      name: 'Bilan Hydrique',
      type: 'bar',
      marker: { color: d.seasonal.map(r => r.bilan >= 0 ? '#22c55e' : '#ef4444') }
    }], GET_LAYOUT(), { responsive: true })
  }

  // 04. Violin
  if (elViolin.value && d.violin) {
    const traces = []
    if (d.violin.dry) traces.push({ y: d.violin.dry, name: 'Saison Sèche', type: 'violin', line: { color: '#f97316' } })
    if (d.violin.wet) traces.push({ y: d.violin.wet, name: 'Saison Pluies', type: 'violin', line: { color: '#3b82f6' } })
    if (traces.length) Plotly.react(elViolin.value, traces, GET_LAYOUT(), { responsive: true })
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getCyclesAnalysis(selectedFilters.value)
    kpis.value = response?.kpis || {}
    rawData.value = response?.data || {}
    await nextTick()
    setTimeout(renderCharts, 200)
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
    filterOptions.value = { regions: opts?.regions || [], years: opts?.years || [2024, 2025] }
  } catch (e) {}
  await loadData()
  window.addEventListener('resize', () => {
    [elTimeline, elSeasonal, elBilan, elViolin, elHeatmap].forEach(el => {
      if (el.value) Plotly.Plots.resize(el.value)
    })
  })
})
</script>

<style scoped>
.chart-skel {
  border-radius: 16px;
  background: rgba(150, 150, 150, 0.1);
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
</style>