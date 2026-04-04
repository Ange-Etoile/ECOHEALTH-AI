<template>
  <div class="max-w-7xl mx-auto space-y-4 md:space-y-6 p-4 md:p-6 text-on-surface">
    
    <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant pb-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <v-chip color="primary" size="x-small" variant="flat" class="font-black uppercase px-2 italic">Analyse</v-chip>
          <span class="text-[10px] opacity-60 font-bold uppercase tracking-widest text-primary">Étude Comparative Inter-Régionale</span>
        </div>
        <h2 class="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">
          Benchmark <span class="text-primary">National</span>
        </h2>
      </div>
      
      <v-btn @click="loadData" :loading="loading" prepend-icon="mdi-refresh" color="primary" variant="tonal" size="small" class="rounded-xl font-bold text-[10px] uppercase">
        Actualiser les données
      </v-btn>
    </header>

    <v-card variant="outlined" class="bg-surface p-3 md:p-4 rounded-3xl border-outline-variant shadow-sm">
      <FilterBar 
        v-model="selectedFilters" 
        :options="filterOptions" 
        :loading="loading" 
        @change="handleFilterChange" 
      />
    </v-card>

    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 ml-1">
        <div class="w-1 h-3 bg-primary rounded-full"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Indicateur de comparaison</span>
      </div>

      <div class="relative group">
        <v-btn-toggle 
          v-model="activeVarIndex" 
          mandatory 
          rounded="xl" 
          color="primary" 
          variant="flat" 
          class="bg-surface/60 backdrop-blur-md border border-outline-variant p-1.5 h-auto overflow-x-auto max-w-full gap-2 custom-toggle"
        >
          <v-btn 
            v-for="v in variables" 
            :key="v.id" 
            :value="v.id" 
            class="rounded-xl transition-all duration-300 px-6 py-2 h-auto min-h-[50px] flex-grow"
          >
            <div class="flex flex-col items-center gap-1">
              <v-icon size="20" :color="activeVarIndex === v.id ? 'white' : v.color">{{ v.icon }}</v-icon> 
              <span class="text-[9px] font-black uppercase tracking-tighter">{{ v.label }}</span>
            </div>
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant bg-surface overflow-hidden h-[450px] md:h-[650px] shadow-xl relative">
          <div class="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white hidden sm:block">
            <span class="text-[9px] font-black uppercase block mb-1 opacity-50">Échelle d'impact</span>
            <div class="flex items-center gap-2">
              <v-icon size="small" :color="selectedVariable.color">{{ selectedVariable.icon }}</v-icon>
              <span class="text-[11px] font-bold">{{ selectedVariable.label }} ({{ selectedVariable.unit }})</span>
            </div>
          </div>
          <div id="leafletMap" class="w-full h-full"></div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="space-y-4 md:space-y-6">
          <v-card variant="outlined" class="rounded-3xl p-6 border-outline-variant bg-surface shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 p-2 opacity-10">
              <v-icon size="64">{{ selectedVariable.icon }}</v-icon>
            </div>
            <h3 class="text-[10px] font-black uppercase mb-3 flex items-center gap-2 tracking-widest">
              <v-icon color="primary" size="16">mdi-text-box-search-outline</v-icon>
              Analyse du contexte
            </h3>
            <div class="text-xs md:text-sm leading-relaxed text-justify opacity-80" v-html="detailedExplanation"></div>
          </v-card>

          <v-card variant="outlined" class="rounded-3xl p-5 border-outline-variant bg-surface shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <span class="text-[10px] font-black uppercase opacity-50 tracking-widest">Top Impact par Ville</span>
              <v-chip size="x-small" variant="outlined" color="primary" class="font-black">{{ topImpactZones.length }} Zones</v-chip>
            </div>
            <div class="space-y-5">
              <div v-for="(item, index) in topImpactZones" :key="item.city" class="flex items-center gap-3">
                <span class="text-lg font-black opacity-20 w-6">#{{ index + 1 }}</span>
                <div class="flex-grow">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-[11px] font-bold truncate max-w-[140px] uppercase tracking-tight">{{ item.city }}</span>
                    <span class="text-[10px] font-black" :style="{ color: selectedVariable.color }">
                      {{ item.value.toFixed(1) }} <small>{{ selectedVariable.unit }}</small>
                    </span>
                  </div>
                  <v-progress-linear 
                    :model-value="(item.value / maxVal) * 100" 
                    :color="selectedVariable.color" 
                    height="7" 
                    rounded 
                    striped
                  ></v-progress-linear>
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FilterBar from '@/components/dashboard/FilterBar.vue'
import { getFilterOptions, getComparativeData } from '@/services/dataService'
import { useTheme } from 'vuetify'

const theme = useTheme()
const loading = ref(false)
const activeVarIndex = ref('precipitation_sum')
const selectedFilters = ref({ region: null, city: null, year: 2025 })
const filterOptions = ref({ regions: [], citiesData: {}, annees: [] })
const allRawData = ref([])

let map = null
let markerLayer = null

const variables = [
  { id: 'precipitation_sum', label: 'Pluie', icon: 'mdi-water', color: '#2196F3', unit: 'mm', key: 'precipitation_sum' },
  { id: 'sunshine_duration', label: 'Soleil', icon: 'mdi-weather-sunny', color: '#FFB300', unit: 'h/j', key: 'sunshine_duration' },
  { id: 'wind_speed_10m_max', label: 'Vent', icon: 'mdi-weather-windy', color: '#4CAF50', unit: 'km/h', key: 'wind_speed_10m_max' },
  { id: 'pm25_proxy', label: 'Pollution', icon: 'mdi-blur', color: '#FF5252', unit: 'µg/m³', key: 'pm25_proxy' }
]

const selectedVariable = computed(() => variables.find(v => v.id === activeVarIndex.value))

const filteredData = computed(() => {
  return allRawData.value.filter(d => {
    const matchRegion = !selectedFilters.value.region || d.region === selectedFilters.value.region
    const matchCity = !selectedFilters.value.city || d.city === selectedFilters.value.city
    return matchRegion && matchCity
  })
})

const maxVal = computed(() => Math.max(...allRawData.value.map(d => d[selectedVariable.value.key]), 1))

const topImpactZones = computed(() => {
  return [...filteredData.value]
    .sort((a, b) => b[selectedVariable.value.key] - a[selectedVariable.value.key])
    .slice(0, 6)
    .map(d => ({ city: d.city, region: d.region, value: d[selectedVariable.value.key] }))
})

const detailedExplanation = computed(() => {
  if (!filteredData.value.length) return "Aucune donnée disponible pour cette sélection."
  const v = selectedVariable.value
  const top = topImpactZones.value[0]
  const zone = selectedFilters.value.city || selectedFilters.value.region || "Cameroun"
  
  return `L'analyse comparative pour <strong>${zone}</strong> montre que le paramètre <strong>${v.label}</strong> atteint son apogée à <strong>${top.city}</strong> avec une valeur de <strong>${top.value.toFixed(1)}${v.unit}</strong>. 
  <br><br>Dans le contexte régional, cette intensité influence la stabilité climatique et la qualité de l'air locale par rapport aux moyennes observées sur le reste du territoire.`
})

const initMap = () => {
  if (map) return
  map = L.map('leafletMap', { zoomControl: false }).setView([7.37, 12.35], 6)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map)
}

const updateMarkers = () => {
  if (!map) return
  if (markerLayer) map.removeLayer(markerLayer)
  markerLayer = L.layerGroup().addTo(map)

  const isMobile = window.innerWidth < 768
  const currentKey = selectedVariable.value.key

  allRawData.value.forEach(d => {
    const isFiltered = (!selectedFilters.value.region || d.region === selectedFilters.value.region) && 
                       (!selectedFilters.value.city || d.city === selectedFilters.value.city)
    
    const val = d[currentKey]
    const size = Math.max((val / maxVal.value) * (isMobile ? 32 : 48), isMobile ? 20 : 26)
    
    const icon = L.divIcon({
      html: `
        <div style="
          background: ${selectedVariable.value.color}${isFiltered ? '33' : '11'}; 
          border: 2px solid ${selectedVariable.value.color}${isFiltered ? 'FF' : '33'}; 
          border-radius: 50%; 
          width: ${size}px; height: ${size}px; 
          display: flex; align-items: center; justify-content: center;
          box-shadow: ${isFiltered ? `0 0 15px ${selectedVariable.value.color}66` : 'none'};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${isFiltered ? 'scale(1.1)' : 'scale(0.9)'};
          opacity: ${isFiltered ? '1' : '0.3'};
        ">
          <i class="mdi ${selectedVariable.value.icon}" style="color: ${selectedVariable.value.color}; font-size: ${size/2}px;"></i>
        </div>`,
      className: 'custom-icon',
      iconSize: [size, size]
    })

    L.marker([d.latitude, d.longitude], { icon })
      .bindPopup(`
        <div class="p-1">
          <div class="text-[10px] font-black uppercase text-primary">${d.region}</div>
          <div class="text-sm font-bold mb-1">${d.city}</div>
          <div class="text-[11px] opacity-80">${selectedVariable.value.label}: <b>${val.toFixed(1)} ${selectedVariable.value.unit}</b></div>
        </div>
      `)
      .addTo(markerLayer)
  })

  if (selectedFilters.value.city || selectedFilters.value.region) {
    const activeMarkers = allRawData.value
      .filter(d => (!selectedFilters.value.region || d.region === selectedFilters.value.region) && (!selectedFilters.value.city || d.city === selectedFilters.value.city))
      .map(d => [d.latitude, d.longitude])
    
    if (activeMarkers.length > 0) map.flyToBounds(activeMarkers, { padding: [50, 50], duration: 1.5 })
  } else {
    map.flyTo([7.37, 12.35], 6, { duration: 1.5 })
  }
}

const handleFilterChange = () => {
  updateMarkers()
}

const loadData = async () => {
  loading.value = true
  try {
    allRawData.value = await getComparativeData(selectedVariable.value.key, selectedFilters.value.year)
    await nextTick()
    updateMarkers()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  initMap()
  loadData()
  window.addEventListener('resize', updateMarkers)
})

watch([() => activeVarIndex.value, () => theme.global.current.value.dark], () => {
  loadData() // On recharge les données si la variable change
})
</script>

<style>
/* Leaflet UI Customization */
.leaflet-container { background: #0a0a0a !important; font-family: 'Inter', sans-serif !important; }
.leaflet-popup-content-wrapper { background: rgba(15, 15, 15, 0.95) !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; backdrop-filter: blur(10px); border-radius: 16px !important; }
.leaflet-popup-tip { background: rgba(15, 15, 15, 0.95) !important; }
.custom-icon { background: none !important; border: none !important; }

/* Custom Toggle Stylisé */
.custom-toggle {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.custom-toggle::-webkit-scrollbar {
  display: none;
}
.custom-toggle .v-btn {
  background: transparent !important;
  border: none !important;
}
.custom-toggle .v-btn--active {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.3) !important;
}
</style>