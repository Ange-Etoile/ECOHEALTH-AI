<template>
  <div class="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 p-3 md:p-6 pb-24 md:pb-6">
    
    <header class="flex flex-col gap-4 border-b border-outline-variant pb-4 md:pb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div class="space-y-1">
          <v-chip color="secondary" size="x-small" variant="flat" class="font-black px-2 italic mb-1">LIVE FORECAST</v-chip>
          <h2 class="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none">
            Cartographie <span class="text-secondary">7 Jours</span>
          </h2>
        </div>

        <div class="w-full sm:w-auto overflow-x-auto no-scrollbar bg-surface-variant/50 p-1 rounded-2xl shadow-inner">
          <v-btn-toggle v-model="dayOffset" mandatory color="secondary" density="compact" variant="text" @update:model-value="updateMarkers" class="flex">
            <v-btn v-for="n in 7" :key="n-1" :value="n-1" size="small" class="font-bold min-w-[50px]">J+{{ n-1 }}</v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </header>

    <v-row class="fill-height">
      <v-col cols="12" lg="8" class="relative order-1 lg:order-1">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant overflow-hidden h-[400px] md:h-[650px] relative shadow-2xl bg-black">
          <div class="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white hidden sm:block">
            <span class="text-[9px] font-black uppercase block mb-1 opacity-50">Intensité Particules</span>
            <div class="flex items-center gap-2">
              <v-icon size="small" color="secondary">mdi-smog</v-icon>
              <span class="text-[11px] font-bold">PM2.5 (µg/m³)</span>
            </div>
          </div>

          <div id="futureMap" class="w-full h-full"></div>
          
          <div class="absolute bottom-4 left-4 right-4 md:right-auto z-[1000] pointer-events-none transition-all duration-300">
             <v-card v-if="selectedPoint" class="bg-black/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white shadow-2xl max-w-sm mx-auto md:mx-0 pointer-events-auto border-b-4" :style="{ borderBottomColor: selectedPoint.color }">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="text-[9px] font-black text-secondary uppercase tracking-widest">Analyse Locale</div>
                    <div class="text-lg font-black uppercase italic leading-tight">{{ selectedPoint.city }}</div>
                  </div>
                  <v-img :src="selectedPoint.icon" width="36" height="36"></v-img>
                </div>

                <div class="grid grid-cols-4 gap-2 mb-3">
                  <div v-for="(val, label) in { Temp: selectedPoint.temp+'°', Vent: selectedPoint.wind, Hum: selectedPoint.humidity+'%', Pluie: selectedPoint.precip }" :key="label" class="bg-white/5 p-1 rounded-lg border border-white/5 text-center">
                    <div class="text-[7px] opacity-50 uppercase font-black">{{ label }}</div>
                    <div class="text-[10px] md:text-xs font-black">{{ val }}</div>
                  </div>
                </div>

                <div class="pt-2 border-t border-white/10 flex justify-between items-center">
                  <div class="flex items-center gap-1">
                    <v-icon size="14" :color="selectedPoint.color">mdi-smog</v-icon>
                    <span class="text-xs font-black">{{ selectedPoint.pm25 }} <small class="opacity-50">µg</small></span>
                  </div>
                  <span class="text-[9px] font-black uppercase italic px-2 py-0.5 rounded bg-white/10" :style="{ color: selectedPoint.color }">{{ selectedPoint.status }}</span>
                </div>
             </v-card>
          </div>

          <v-overlay v-model="loading" persistent class="align-center justify-center" contained>
            <v-progress-circular indeterminate color="secondary" size="48"></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" class="space-y-4 md:space-y-6 order-2 lg:order-2">
        <v-card variant="outlined" class="rounded-3xl p-5 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div class="flex items-center gap-2 mb-2">
            <v-icon size="16" color="secondary">mdi-weather-cloudy-arrow-right</v-icon>
            <div class="text-[10px] font-black uppercase tracking-widest text-secondary">Prévisions J+{{ dayOffset }}</div>
          </div>
          <p class="text-xs md:text-sm italic opacity-90 leading-relaxed font-medium">{{ summaryText }}</p>
        </v-card>

        <v-card variant="outlined" class="rounded-3xl p-4 border-outline-variant bg-surface flex flex-col shadow-lg">
          <div class="text-[10px] font-black uppercase opacity-50 mb-4 tracking-widest px-2 flex justify-between">
            <span>Classement National</span>
            <v-icon size="14">mdi-filter-variant</v-icon>
          </div>
          
          <div class="overflow-y-auto max-h-[250px] md:max-h-[400px] space-y-2 pr-1 custom-scroll">
            <div v-for="city in sortedForecast" :key="city.city" 
                 class="p-3 rounded-2xl bg-surface-variant/20 active:scale-95 transition-all border border-transparent cursor-pointer flex flex-col"
                 @click="setFocusCity(city.city)">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                   <v-icon size="16" :color="city.current.color">mdi-smog</v-icon>
                   <span class="text-xs font-black uppercase tracking-tighter">{{ city.city }}</span>
                </div>
                <div class="text-xs font-black italic" :style="{ color: city.current.color }">{{ city.current.pm25 }}</div>
              </div>
              <v-progress-linear 
                :model-value="(city.current.pm25 / maxPmVal) * 100" 
                :color="city.current.color" 
                height="4" 
                rounded 
                class="mt-2 opacity-60"
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
  if (!rawData.value.length) return "Chargement des modèles..."
  const data = sortedForecast.value
  const top = data[0]
  return `Analyse J+${dayOffset.value}: Pic de particules détecté à ${top.city} (${top.current.pm25} µg/m³). La dispersion atmosphérique reste sous surveillance.`
})

const initMap = () => {
  if (map) return
  map = L.map('futureMap', { 
    zoomControl: false,
    dragging: true,
    tap: false 
  }).setView([7.37, 12.35], 6)
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map)
}

const updateMarkers = () => {
  if (!map || !rawData.value.length) return
  if (markerLayer) map.removeLayer(markerLayer)
  markerLayer = L.layerGroup().addTo(map)

  const isMobile = window.innerWidth < 768

  rawData.value.forEach(city => {
    const dayData = city.forecast[dayOffset.value]
    if (!dayData) return

    const size = Math.max((dayData.pm25 / maxPmVal.value) * (isMobile ? 25 : 35), isMobile ? 18 : 22)

    const icon = L.divIcon({
      html: `
        <div style="
          background: ${dayData.color}33; 
          border: 2px solid ${dayData.color}; 
          border-radius: 50%; 
          width: ${size}px; height: ${size}px; 
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 15px ${dayData.color}44;
          transition: all 0.3s ease;
        ">
          <i class="mdi mdi-smog" style="color: ${dayData.color}; font-size: ${size/1.6}px;"></i>
        </div>`,
      className: 'custom-future-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    })

    const marker = L.marker([city.lat, city.lon], { icon }).addTo(markerLayer)
    
    const handleSelect = () => {
      selectedPoint.value = { ...dayData, city: city.city, icon: dayData.icon || 'https://cdn.weatherapi.com/weather/64x64/day/116.png' }
    }
    marker.on('click', handleSelect)
    if (!isMobile) marker.on('mouseover', handleSelect)
  })

  const group = L.featureGroup(markerLayer.getLayers())
  map.flyToBounds(group.getBounds().pad(0.2), { duration: 1.5 })
}

const setFocusCity = (cityName) => {
  const city = rawData.value.find(c => c.city === cityName)
  if (city && map) {
    map.flyTo([city.lat, city.lon], 9, { duration: 1.2 })
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
    if (rawData.value.length) {
      updateMarkers()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
#futureMap {
  background: #0b0e14;
  width: 100%;
  height: 100%;
  position: absolute;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-secondary), 0.3); border-radius: 10px; }

:deep(.leaflet-marker-icon) { background: transparent !important; border: none !important; }
:deep(.leaflet-container) { touch-action: pan-x pan-y; }
</style>