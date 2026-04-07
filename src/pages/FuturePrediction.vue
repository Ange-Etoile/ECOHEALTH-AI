<template>
  <div class="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 p-3 md:p-6 pb-24 md:pb-6 bg-background">
    
    <header class="flex flex-col gap-4 border-b border-outline-variant pb-4 md:pb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div class="space-y-1">
          <v-chip color="secondary" size="x-small" variant="flat" class="font-black px-2 italic mb-1">LIVE FORECAST</v-chip>
          <h2 class="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none">
            Cartographie <span class="text-secondary">7 Jours</span>
          </h2>
        </div>

        <div class="w-full sm:w-auto overflow-x-auto no-scrollbar bg-surface-variant/30 p-1 rounded-2xl shadow-inner border border-outline-variant/20">
          <v-btn-toggle v-model="dayOffset" mandatory color="secondary" density="compact" variant="text" @update:model-value="updateMarkers" class="flex flex-nowrap">
            <v-btn v-for="n in 7" :key="n-1" :value="n-1" size="small" class="font-black min-w-[55px] text-[10px]">
              {{ n-1 === 0 ? 'AUJOURD\'HUI' : 'J+' + (n-1) }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </header>

    <v-row class="ma-0">
      <v-col cols="12" lg="8" class="pa-0 relative order-1">
        <v-card variant="outlined" class="rounded-[2rem] border-outline-variant overflow-hidden h-[550px] md:h-[850px] relative shadow-2xl bg-black border-2">
          
          <div class="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white hidden sm:block">
            <span class="text-[9px] font-black uppercase block mb-1 opacity-50">Intensité Particules</span>
            <div class="flex items-center gap-2">
              <v-icon size="small" color="secondary">mdi-blur</v-icon>
              <span class="text-[11px] font-bold">PM2.5 (µg/m³)</span>
            </div>
            <div class="flex flex-col gap-1 mt-2 border-t border-white/10 pt-2">
              <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"></div><span class="text-[8px] uppercase">Sain (≤15)</span></div>
              <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[#FFB300]"></div><span class="text-[8px] uppercase">Modéré (≤25)</span></div>
              <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></div><span class="text-[8px] uppercase">Mauvais (≤35)</span></div>
              <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[#F44336]"></div><span class="text-[8px] uppercase">Danger (>35)</span></div>
            </div>
          </div>

          <div id="futureMap" class="w-full h-full z-0"></div>
          
          <transition name="slide-y-transition">
            <div v-if="selectedPoint" 
                  class="absolute bottom-4 left-4 right-4 md:right-auto z-[2000] pointer-events-auto">
                <v-card class="bg-black/95 backdrop-blur-2xl p-4 rounded-[1.5rem] border border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm mx-auto md:mx-0 border-b-4 relative overflow-hidden" 
                        :style="{ borderBottomColor: getStatusColor(selectedPoint.pm25) }">
                  
                  <v-btn icon="mdi-close" size="x-small" variant="text" color="white" class="absolute top-2 right-2 opacity-50" @click="selectedPoint = null"></v-btn>

                  <div class="flex justify-between items-start mb-4 pr-6">
                    <div>
                      <div class="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Détails de la zone</div>
                      <div class="text-xl font-black uppercase italic leading-none tracking-tighter">{{ selectedPoint.city }}</div>
                    </div>
                    <v-img :src="selectedPoint.icon" width="40" height="40" class="shrink-0"></v-img>
                  </div>

                  <div class="grid grid-cols-4 gap-2 mb-4">
                    <div v-for="(val, label) in { Temp: selectedPoint.temp+'°', Vent: selectedPoint.wind, Hum: selectedPoint.humidity+'%', Pluie: selectedPoint.precip }" :key="label" 
                         class="bg-white/10 p-2 rounded-xl border border-white/5 text-center">
                      <div class="text-[7px] opacity-60 uppercase font-black mb-1">{{ label }}</div>
                      <div class="text-[11px] font-black">{{ val }}</div>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-white/10 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full animate-pulse" :style="{ background: getStatusColor(selectedPoint.pm25) }"></div>
                      <span class="text-sm font-black">{{ selectedPoint.pm25 }} <small class="opacity-50 text-[10px]">µg/m³</small></span>
                    </div>
                    <v-chip size="x-small" :color="getStatusColor(selectedPoint.pm25)" variant="flat" class="font-black uppercase italic px-3">
                      {{ getStatusLabel(selectedPoint.pm25) }}
                    </v-chip>
                  </div>
                </v-card>
            </div>
          </transition>

          <v-overlay v-model="loading" persistent class="align-center justify-center" contained>
            <v-progress-circular indeterminate color="secondary" size="48" width="6"></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" class="pa-0 pt-4 lg:pt-0 lg:pl-6 space-y-4 md:space-y-6 order-2">
        <v-card variant="outlined" class="rounded-[2rem] p-5 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div class="flex items-center gap-2 mb-3">
            <v-icon size="18" color="secondary">mdi-chart-line-variant</v-icon>
            <div class="text-[10px] font-black uppercase tracking-widest text-secondary">Insight Prédictif J+{{ dayOffset }}</div>
          </div>
          <p class="text-xs md:text-sm italic opacity-90 leading-relaxed font-bold">{{ summaryText }}</p>
        </v-card>

        <v-card variant="outlined" class="rounded-[2rem] p-5 border-outline-variant bg-surface flex flex-col shadow-lg">
          <div class="text-[10px] font-black uppercase opacity-50 mb-5 tracking-widest flex justify-between items-center">
            <span>Zones à risques</span>
            <span class="text-[8px] bg-outline-variant/20 px-2 py-0.5 rounded-full">Top 10</span>
          </div>
          
          <div class="overflow-y-auto max-h-[300px] md:max-h-[600px] space-y-3 pr-2 custom-scroll">
            <div v-for="city in sortedForecast" :key="city.city" 
                 class="p-4 rounded-2xl bg-surface-variant/10 active:scale-95 transition-all border border-outline-variant/10 cursor-pointer group hover:bg-secondary/5"
                 @click="setFocusCity(city.city)">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                   <div class="w-1.5 h-1.5 rounded-full" :style="{ background: getStatusColor(city.current.pm25) }"></div>
                   <span class="text-xs font-black uppercase tracking-tight">{{ city.city }}</span>
                </div>
                <div class="text-xs font-black" :style="{ color: getStatusColor(city.current.pm25) }">{{ city.current.pm25 }} <small class="opacity-50 font-medium">µg</small></div>
              </div>
              <v-progress-linear 
                :model-value="(city.current.pm25 / maxPmVal) * 100" 
                :color="getStatusColor(city.current.pm25)" 
                height="6" 
                rounded 
                class="opacity-40"
              ></v-progress-linear>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getFuturePredictions } from '@/services/dataService'

const loading = ref(false)
const rawData = ref([])
const dayOffset = ref(0)
const selectedPoint = ref(null)

let map = null
let markerLayer = null

// AJOUT : Logique de couleur synchronisée
const getStatusColor = (val) => {
  if (val <= 15) return '#4CAF50'
  if (val <= 25) return '#FFB300'
  if (val <= 35) return '#FF9800'
  return '#F44336'
}

// AJOUT : Logique de label synchronisée
const getStatusLabel = (val) => {
  if (val <= 15) return 'Sain'
  if (val <= 25) return 'Modéré'
  if (val <= 35) return 'Mauvais'
  return 'Danger'
}

const sortedForecast = computed(() => {
  if (!rawData.value.length) return []
  return rawData.value.map(c => ({
    city: c.city,
    lat: c.lat,
    lon: c.lon,
    current: c.forecast[dayOffset.value]
  })).sort((a, b) => b.current.pm25 - a.current.pm25)
})

const maxPmVal = computed(() => {
  if (!rawData.value.length) return 100
  const allValues = rawData.value.flatMap(c => c.forecast.map(f => f.pm25))
  return Math.max(...allValues, 1)
})

const summaryText = computed(() => {
  if (!rawData.value.length) return "Calcul des trajectoires atmosphériques..."
  const data = sortedForecast.value
  const top = data[0]
  const avg = (data.reduce((acc, c) => acc + c.current.pm25, 0) / data.length).toFixed(1)
  return `Pour J+${dayOffset.value}, le modèle prévoit une concentration moyenne de ${avg} µg/m³. Le point critique se situe à ${top.city} avec un indice de ${top.current.pm25}.`
})

const initMap = () => {
  if (map) return
  map = L.map('futureMap', { 
    zoomControl: false,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    tap: true 
  }).setView([7.37, 12.35], 6)
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
  }).addTo(map)
}

const updateMarkers = () => {
  if (!map || !rawData.value.length) return
  if (markerLayer) map.removeLayer(markerLayer)
  markerLayer = L.layerGroup().addTo(map)

  const isMobile = window.innerWidth < 768

  rawData.value.forEach(city => {
    const dayData = city.forecast[dayOffset.value]
    if (!dayData) return

    const size = Math.max((dayData.pm25 / maxPmVal.value) * (isMobile ? 18 : 35), isMobile ? 12 : 20)
    const color = getStatusColor(dayData.pm25) // Utilisation des nouveaux seuils

    const icon = L.divIcon({
      html: `
        <div class="future-marker-container" style="width: ${size}px; height: ${size}px; border-radius: 100% !important;">
          <div class="future-marker-pulse" style="background: ${color}33; border: 1.5px solid ${color}; border-radius: 100% !important;">
            <i class="mdi mdi-blur" style="color: ${color}; font-size: ${size/1.4}px;"></i>
          </div>
        </div>`,
      className: 'custom-future-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    })

    const marker = L.marker([city.lat, city.lon], { icon }).addTo(markerLayer)
    
    const handleSelect = () => {
      selectedPoint.value = { 
        ...dayData, 
        city: city.city, 
        icon: dayData.icon || 'https://cdn.weatherapi.com/weather/64x64/day/116.png' 
      }
      if (isMobile) {
        map.panTo([city.lat - 1.5, city.lon], { animate: true })
      }
    }

    marker.on('click', handleSelect)
  })

  const group = L.featureGroup(markerLayer.getLayers())
  if (markerLayer.getLayers().length > 0) {
     map.flyToBounds(group.getBounds().pad(0.3), { duration: 1.5 })
  }
}

const setFocusCity = (cityName) => {
  const city = rawData.value.find(c => c.city === cityName)
  if (city && map) {
    const isMobile = window.innerWidth < 768
    map.flyTo([isMobile ? city.lat - 1.2 : city.lat, city.lon], isMobile ? 8 : 9, { duration: 1.2 })
    selectedPoint.value = { ...city.forecast[dayOffset.value], city: city.city }
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getFuturePredictions()
    rawData.value = res.data?.data || res.data || []
    await nextTick()
    initMap()
    updateMarkers()
  } catch (e) {
    console.error("Erreur prévisions:", e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', () => {
    map?.invalidateSize()
    updateMarkers()
  })
})
</script>

<style scoped>
#futureMap {
  background: #0b0e14;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.future-marker-container {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));
}

.future-marker-pulse {
  width: 100%;
  height: 100%;
  border-radius: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { 
  background: rgba(var(--v-theme-secondary), 0.2); 
  border-radius: 10px; 
}

:deep(.leaflet-marker-icon) { 
  background: transparent !important; 
  border: none !important; 
  border-radius: 100% !important;
}

:deep(.leaflet-container) { touch-action: pan-x pan-y; outline: none; }

.slide-y-transition-enter-active,
.slide-y-transition-leave-active {
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.4s;
}
.slide-y-transition-enter-from,
.slide-y-transition-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>