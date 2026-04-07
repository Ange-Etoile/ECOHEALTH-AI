<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 md:p-6 text-on-surface transition-colors duration-500">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-widest text-[10px]">
          <v-icon size="small" color="secondary">mdi-map-marker-radius</v-icon> Surveillance Géospatiale
        </div>
        <h2 class="text-xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          Surveillance <span class="text-secondary italic text-stroke">Spatiale</span>
        </h2>
        <p class="text-[10px] md:text-xs opacity-60 font-bold uppercase tracking-widest mt-1">
          {{ currentZoneName }} — {{ selectedFilters.year }} — Focus Sanitaire PM2.5
        </p>
      </div>
      
      <v-btn @click="loadData" :loading="loading" prepend-icon="mdi-refresh" color="secondary" variant="elevated" 
        class="rounded-xl font-bold text-[10px] md:text-xs text-black w-full sm:w-auto">
        Actualiser la carte
      </v-btn>
    </header>

    <v-card variant="outlined" class="bg-surface p-4 md:p-6 rounded-3xl border-outline-variant shadow-sm">
      <SimpleFilterBar v-model="selectedFilters" :options="filterOptions" :loading="loading" @change="loadData" />
    </v-card>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface overflow-hidden h-[500px] md:h-[650px] shadow-sm relative">
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <v-chip size="x-small" color="secondary" variant="flat" class="font-bold text-black uppercase">
              {{ citiesData.length }} Villes surveillées
            </v-chip>
            <v-chip size="x-small" color="surface" variant="flat" class="font-bold uppercase border border-outline-variant">
              Année : {{ selectedFilters.year }}
            </v-chip>
          </div>
          <div id="riskMap" class="w-full h-full"></div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="space-y-4 md:space-y-6">
          
          <v-card variant="outlined" class="rounded-3xl p-5 md:p-6 border-outline-variant bg-surface shadow-sm">
            <h3 class="text-xs font-black uppercase mb-4 flex items-center gap-2 italic">
              <v-icon color="secondary" size="small">mdi-shield-search</v-icon>
              Diagnostic de Vulnérabilité
            </h3>
            <div class="text-xs md:text-sm leading-relaxed text-justify opacity-80" v-html="riskAnalysis"></div>
          </v-card>

          <v-card variant="outlined" class="rounded-3xl p-5 border-outline-variant bg-surface shadow-sm">
            <span class="text-[10px] font-black uppercase opacity-50 tracking-widest block mb-4 italic">Concentrations Critiques</span>
            <div class="space-y-4">
              <div v-for="city in topCities" :key="city.city" class="space-y-1">
                <div class="flex justify-between items-end">
                  <span class="text-[11px] font-bold uppercase">{{ city.city }}</span>
                  <span class="text-[10px] font-black" :class="getPMColorText(city.pm25_proxy)">{{ city.pm25_proxy.toFixed(1) }} µg/m³</span>
                </div>
                <v-progress-linear :model-value="(city.pm25_proxy / 100) * 100" :color="getPMColor(city.pm25_proxy)" height="6" rounded striped></v-progress-linear>
              </div>
            </div>
          </v-card>

          <div class="grid grid-cols-1 gap-4">
            <div class="p-4 rounded-2xl bg-error/10 border border-error/20">
              <span class="text-[9px] font-black uppercase opacity-60 block">Zones Danger ({{ selectedFilters.year }})</span>
              <span class="text-xl font-black text-error">{{ kpis.danger_cities_count }} <small class="text-[10px]">Villes</small></span>
            </div>
            <div class="p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
              <span class="text-[9px] font-black uppercase opacity-60 block">Évolution du Risque</span>
              <span class="text-xl font-black text-secondary">{{ kpis.risk_trend > 0 ? '+' : '' }}{{ kpis.risk_trend }}%</span>
            </div>
          </div>

        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Plotly from 'plotly.js-dist-min'
import SimpleFilterBar from '@/components/dashboard/SimpleFilterBar.vue'
import { getFilterOptions, getMapData } from '@/services/dataService'
import { useTheme } from 'vuetify'

const theme = useTheme()
const loading = ref(false)
const selectedFilters = ref({ region: null, year: 2025 })
const filterOptions = ref({ regions: [], annees: [] })
const citiesData = ref([])
const kpis = ref({ danger_cities_count: 0, top_alert_region: 'N/A', risk_trend: 0 })

const currentZoneName = computed(() => selectedFilters.value.region || 'Cameroun (National)')

// --- LOGIQUE COULEURS SANITAIRES ---
const getPMColor = (val) => {
  if (val <= 15) return 'success'
  if (val <= 25) return 'warning' 
  if (val <= 50) return 'orange'
  return 'error'
}
const getPMColorText = (val) => `text-${getPMColor(val)}`

const topCities = computed(() => [...citiesData.value].sort((a, b) => b.pm25_proxy - a.pm25_proxy).slice(0, 5))

// --- ANALYSE DYNAMIQUE ---
const riskAnalysis = computed(() => {
  if (!citiesData.value.length) return "Initialisation des capteurs..."
  
  const trend = kpis.value.risk_trend
  const zone = currentZoneName.value
  const year = selectedFilters.value.year
  const highestCity = topCities.value[0] // La ville la plus polluée de la sélection actuelle

  let text = `Pour l'année <strong>${year}</strong>, l'analyse spatiale à <strong>${zone}</strong> indique `
  
  if (trend > 0) {
    text += `une <span class="text-error font-bold font-mono">hausse des concentrations de ${trend}%</span> par rapport à la moyenne nationale.`
  } else if (trend < 0) {
    text += `une <span class="text-success font-bold">baisse des concentrations de ${Math.abs(trend)}%</span> par rapport à la moyenne nationale.`
  } else {
    text += `des concentrations <span class="text-info font-bold">équivalentes</span> à la moyenne nationale.`
  }
  text += `<br><br>`

  // Logique conditionnelle pour le focus local vs régional
  if (selectedFilters.value.region) {
    text += `Au sein de cette région, la ville de <strong>${highestCity.city}</strong> présente le niveau le plus critique avec une moyenne de <strong>${highestCity.pm25_proxy.toFixed(1)} µg/m³</strong>.`
  } else {
    text += `La région <strong>${kpis.value.top_alert_region}</strong> concentre actuellement le plus grand nombre d'alertes sanitaires.`
  }

  return text
})

// --- CARTE PLOTLY SCATTERGEO ---
const renderMap = () => {
  const isDark = theme.global.current.value.dark
  const data = citiesData.value
  if (!data.length) return

  const isMobile = window.innerWidth < 768
  const center = { lon: 12.35, lat: 7.37 }
  const scale = isMobile ? 5.5 : 7.2

  const trace = {
    type: 'scattergeo',
    lon: data.map(d => d.longitude),
    lat: data.map(d => d.latitude),
    text: data.map(d => `<b>${d.city}</b><br>PM2.5: ${d.pm25_proxy.toFixed(1)} µg/m³<br>Année: ${selectedFilters.value.year}`),
    hoverinfo: 'text',
    marker: {
      size: data.map(d => Math.max(d.pm25_proxy * 1.2, 10)), 
      color: data.map(d => d.pm25_proxy),
      colorscale: [
          [0, '#4CAF50'],     
          [0.25, '#FFC107'], 
          [0.5, '#FF9800'],  
          [1, '#F44336']     
      ],
      cmin: 0, 
      cmax: 80, 
      colorbar: {
        title: { text: 'µg/m³', font: { size: 10, color: isDark ? '#FFF' : '#000' } },
        thickness: 8,
        len: 0.5,
        x: 0.9 
      },
      line: { width: 1.5, color: isDark ? '#121212' : '#FFF' }
    }
  }

  const layout = {
    geo: {
      scope: 'africa', center,
      projection: { scale, type: 'mercator' },
      showland: true, landcolor: isDark ? '#1a1a1a' : '#f5f5f5',
      subunitcolor: '#444', bgcolor: 'rgba(0,0,0,0)',
      showcountries: true, countrycolor: '#666'
    },
    margin: { t: 0, b: 0, l: 0, r: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)'
  }

  Plotly.react('riskMap', [trace], layout, { responsive: true, displayModeBar: false })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMapData(selectedFilters.value)
    citiesData.value = res.data
    kpis.value = res.kpis
    await nextTick()
    renderMap()
  } finally { loading.value = false }
}

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  loadData()
  window.addEventListener('resize', () => {
    renderMap()
    Plotly.Plots.resize('riskMap')
  })
})

watch(() => theme.global.current.value.dark, renderMap)
</script>

<style scoped>
.text-justify { text-align: justify; }
.text-stroke {
  -webkit-text-stroke: 1px currentColor;
  color: transparent;
}
</style>