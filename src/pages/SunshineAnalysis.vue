<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 md:p-6 text-on-surface">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <h2 class="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">
          Diagnostic <span class="text-warning italic">Solaire</span> & Hydrique
        </h2>
        <p class="text-[10px] md:text-xs opacity-60 font-bold uppercase tracking-widest mt-1">
          {{ currentZoneName }} — {{ selectedFilters.year }}
        </p>
      </div>
      
      <v-btn 
        @click="loadData" 
        :loading="loading" 
        prepend-icon="mdi-refresh" 
        color="warning" 
        variant="elevated" 
        class="rounded-xl font-bold text-[10px] md:text-xs text-black w-full sm:w-auto"
      >
        Synchroniser les données
      </v-btn>
    </header>

    <v-card variant="outlined" class="bg-surface p-4 md:p-6 rounded-3xl border-outline-variant shadow-sm">
      <FilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading" 
        @change="loadData" 
      />
    </v-card>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface overflow-hidden h-[400px] md:h-[600px] shadow-sm relative">
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <v-chip size="x-small" color="warning" variant="flat" class="font-bold text-black uppercase">
              {{ filteredData.length }} Station(s) active(s)
            </v-chip>
          </div>
          <div id="sunMap" class="w-full h-full"></div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="space-y-4 md:space-y-6">
          <v-card variant="outlined" class="rounded-3xl p-5 md:p-6 border-outline-variant bg-surface shadow-sm">
            <h3 class="text-xs font-black uppercase mb-4 flex items-center gap-2">
              <v-icon color="warning" size="small">mdi-auto-fix</v-icon>
              Diagnostic Contextuel
            </h3>
            <div class="text-xs md:text-sm leading-relaxed text-justify opacity-80" v-html="dynamicAnalysis"></div>
          </v-card>

          <v-card variant="outlined" class="rounded-3xl p-5 border-outline-variant bg-surface shadow-sm">
            <span class="text-[10px] font-black uppercase opacity-50 tracking-widest block mb-4">Intensité de l'Évapotranspiration</span>
            <div class="space-y-4">
              <div v-for="city in displayCities" :key="city.city" class="space-y-1">
                <div class="flex justify-between items-end">
                  <span class="text-[11px] font-bold uppercase">{{ city.city }}</span>
                  <span class="text-[10px] font-black text-warning">{{ city.et0.toFixed(1) }} mm</span>
                </div>
                <v-progress-linear 
                  :model-value="(city.et0 / 10) * 100" 
                  color="warning" 
                  height="6" 
                  rounded 
                  striped
                ></v-progress-linear>
              </div>
            </div>
          </v-card>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-warning/10 border border-warning/20">
              <span class="text-[9px] font-black uppercase opacity-60 block">Moy. Ensoleillement</span>
              <span class="text-xl font-black text-warning">{{ avgSunshine }} <small class="text-[10px]">h/j</small></span>
            </div>
            <div class="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <span class="text-[9px] font-black uppercase opacity-60 block">Moy. Stress ET0</span>
              <span class="text-xl font-black text-primary">{{ avgET0 }} <small class="text-[10px]">mm</small></span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import Plotly from 'plotly.js-dist-min'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import { getFilterOptions, getSunshineData } from '@/services/dataService'
import { useTheme } from 'vuetify'

const theme = useTheme()
const loading = ref(false)
const selectedFilters = ref({ region: null, city: null, year: 2025 })
const filterOptions = ref({ regions: [], citiesData: {}, annees: [] })
const allData = ref([])

// --- LOGIQUE DE FILTRAGE STRICT ---
const filteredData = computed(() => {
  return allData.value.filter(d => {
    const matchRegion = !selectedFilters.value.region || d.region === selectedFilters.value.region
    const matchCity = !selectedFilters.value.city || d.city === selectedFilters.value.city
    return matchRegion && matchCity
  })
})

const currentZoneName = computed(() => selectedFilters.value.city || selectedFilters.value.region || 'Cameroun (National)')

// --- CALCULS KPI DYNAMIQUES ---
const avgSunshine = computed(() => filteredData.value.length ? (filteredData.value.reduce((acc, d) => acc + d.sunshine_duration, 0) / filteredData.value.length).toFixed(1) : 0)
const avgET0 = computed(() => filteredData.value.length ? (filteredData.value.reduce((acc, d) => acc + d.et0_fao_evapotranspiration, 0) / filteredData.value.length).toFixed(1) : 0)
const displayCities = computed(() => [...filteredData.value].sort((a, b) => b.et0_fao_evapotranspiration - a.et0_fao_evapotranspiration).slice(0, 5).map(c => ({ city: c.city, et0: c.et0_fao_evapotranspiration })))

// --- GÉNÉRATEUR D'ANALYSE DYNAMIQUE ---
const dynamicAnalysis = computed(() => {
  if (!filteredData.value.length) return "Aucune donnée disponible pour cette sélection."
  const sunshine = parseFloat(avgSunshine.value)
  const et0 = parseFloat(avgET0.value)
  let analysis = `Pour <strong>${currentZoneName.value}</strong>, `

  if (sunshine > 9) analysis += `l'ensoleillement est <strong>exceptionnel (${sunshine}h)</strong>. `
  else if (sunshine > 6) analysis += `on observe un ensoleillement <strong>modéré (${sunshine}h)</strong>. `
  else analysis += `la couverture nuageuse réduit l'ensoleillement à <strong>${sunshine}h</strong>. `

  if (et0 > 7) analysis += `Le stress hydrique est <span class="text-error font-bold">ALARMANT</span>. L'évapotranspiration de ${et0}mm assèche les sols.`
  else if (et0 > 4) analysis += `Le stress hydrique est significatif (${et0}mm).`
  else analysis += `Le bilan hydrique est équilibré (${et0}mm).`

  return analysis
})

// --- GESTION DE LA CARTE ---
const renderMap = () => {
  const isDark = theme.global.current.value.dark
  const data = filteredData.value
  if (!data.length) return

  // Détection Mobile pour la taille des points
  const isMobile = window.innerWidth < 768
  const pointSizeMultiplier = isMobile ? 1.0 : 1.8 // On réduit le multiplicateur sur mobile
  const minPointSize = isMobile ? 8 : 14 // Taille minimale plus petite sur mobile

  // Calcul du Zoom dynamique
  let center = { lon: 12.35, lat: 7.37 }
  let scale = 6.5
  if (selectedFilters.value.city) {
    center = { lon: data[0].longitude, lat: data[0].latitude }; scale = 18 
  } else if (selectedFilters.value.region) {
    center = { lon: data.reduce((a,b)=>a+b.longitude,0)/data.length, lat: data.reduce((a,b)=>a+b.latitude,0)/data.length }; scale = 10
  }

  const trace = {
    type: 'scattergeo',
    lon: data.map(d => d.longitude),
    lat: data.map(d => d.latitude),
    text: data.map(d => `<b>${d.city}</b><br>Soleil: ${d.sunshine_duration}h<br>ET0: ${d.et0_fao_evapotranspiration}mm`),
    hoverinfo: 'text',
    marker: {
      // Taille dynamique ajustée selon l'appareil
      size: data.map(d => Math.max(d.pm25_proxy * pointSizeMultiplier, minPointSize)),
      color: data.map(d => d.sunshine_duration),
      colorscale: 'YlOrRd',
      colorbar: { 
        title: { text: 'Heures', font: { size: 10, color: isDark ? '#FFF' : '#000' } }, 
        thickness: 8,
        len: 0.5
      },
      line: { width: 0.5, color: isDark ? '#000' : '#FFF' }
    }
  }

  const layout = {
    geo: {
      scope: 'africa', center, projection: { scale, type: 'mercator' },
      showland: true, landcolor: isDark ? '#121212' : '#F9F9F9',
      subunitcolor: '#444', bgcolor: 'rgba(0,0,0,0)'
    },
    margin: { t: 0, b: 0, l: 0, r: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)'
  }

  Plotly.react('sunMap', [trace], layout, { responsive: true, displayModeBar: false })
}

const loadData = async () => {
  loading.value = true
  try {
    allData.value = await getSunshineData(selectedFilters.value)
    await nextTick()
    renderMap()
  } finally { loading.value = false }
}

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  loadData()
  window.addEventListener('resize', () => {
    // Relancer le rendu au resize pour réajuster la taille des points si passage mobile/desktop
    renderMap()
    Plotly.Plots.resize('sunMap')
  })
})

watch(() => theme.global.current.value.dark, renderMap)
</script>

<style scoped>
.text-justify { text-align: justify; }
</style>