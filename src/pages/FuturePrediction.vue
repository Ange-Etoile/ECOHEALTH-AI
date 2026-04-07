<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
    
    <header class="flex flex-col sm:flex-row justify-between gap-4 border-b border-outline-variant pb-6">
      <div class="space-y-1">
        <v-chip color="secondary" size="x-small" variant="flat" class="font-black px-2 italic mb-2">LIVE FORECAST</v-chip>
        <h2 class="text-3xl font-black tracking-tighter uppercase italic leading-none">
          Prévisions <span class="text-secondary">7 Jours</span>
        </h2>
      </div>

      <div class="flex items-center gap-4 bg-surface-variant p-2 rounded-2xl shadow-inner">
        <span class="text-[10px] font-black uppercase opacity-60 ml-2">Jour de l'analyse :</span>
        <v-btn-toggle v-model="dayOffset" mandatory color="secondary" density="compact" variant="text" @update:model-value="updateMarkers">
          <v-btn v-for="n in 7" :key="n-1" :value="n-1" size="small" class="font-bold">J+{{ n-1 }}</v-btn>
        </v-btn-toggle>
      </div>
    </header>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant overflow-hidden h-[600px] relative shadow-2xl">
          <div id="futureMap" class="w-full h-full"></div>
          
          <div class="absolute bottom-6 left-6 z-[1000] pointer-events-none">
             <v-card class="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white shadow-2xl">
                <div class="text-[10px] font-black text-secondary uppercase mb-2">Météo Prévue</div>
                <div class="flex items-center gap-6" v-if="selectedPoint">
                   <div class="text-center">
                      <v-img :src="selectedPoint.icon" width="48" class="mx-auto"></v-img>
                      <div class="text-xl font-black">{{ selectedPoint.temp }}°C</div>
                   </div>
                   <div class="space-y-1">
                      <div class="text-sm font-bold">{{ selectedPoint.city }}</div>
                      <div class="text-[11px] opacity-70 italic">{{ selectedPoint.condition }}</div>
                      <v-chip size="x-small" :color="selectedPoint.color" class="font-black">{{ selectedPoint.pm25 }} µg/m³</v-chip>
                   </div>
                </div>
                <div v-else class="text-[11px] opacity-50 italic">Survolez une ville sur la carte</div>
             </v-card>
          </div>

          <v-overlay v-model="loading" persistent class="align-center justify-center" contained>
            <v-progress-circular indeterminate color="secondary" size="64"></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" class="space-y-4">
        <v-card variant="outlined" class="rounded-3xl p-6 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div class="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Résumé IA - J+{{ dayOffset }}</div>
          <p class="text-sm italic opacity-80 leading-relaxed">{{ summaryText }}</p>
        </v-card>

        <v-card variant="outlined" class="rounded-3xl p-5 border-outline-variant bg-surface h-[435px] flex flex-col">
          <div class="text-[10px] font-black uppercase opacity-50 mb-4 tracking-widest">Top Alertes Pollution</div>
          <div class="overflow-y-auto space-y-4 pr-2 custom-scroll">
            <div v-for="city in sortedForecast" :key="city.city" class="p-3 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/50 transition-all border border-transparent hover:border-secondary/20">
              <div class="flex justify-between items-center">
                <span class="text-xs font-black uppercase">{{ city.city }}</span>
                <span class="text-xs font-mono font-bold" :style="{ color: city.current.color }">{{ city.current.pm25 }}</span>
              </div>
              <div class="text-[10px] opacity-60">{{ city.current.status }}</div>
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
  return rawData.value.map(c => ({
    city: c.city,
    current: c.forecast[dayOffset.value]
  })).sort((a, b) => b.current.pm25 - a.current.pm25)
})

const summaryText = computed(() => {
  if (!rawData.value.length) return "Calcul des trajectoires atmosphériques en cours..."
  const risks = sortedForecast.value.filter(f => f.current.pm25 > 35).length
  return `Pour le jour J+${dayOffset.value}, nos modèles prévoient des conditions dégradées dans ${risks} zones urbaines. L'humidité et la température moyenne influenceront la stagnation des particules.`
})

const initMap = () => {
  map = L.map('futureMap', { zoomControl: false }).setView([7.37, 12.35], 6)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map)
}

const updateMarkers = () => {
  if (!map || !rawData.value.length) return
  if (markerLayer) map.removeLayer(markerLayer)
  markerLayer = L.layerGroup().addTo(map)

  rawData.value.forEach(city => {
    const dayData = city.forecast[dayOffset.value]
    const icon = L.divIcon({
      html: `<div class="marker-pulse" style="background: ${dayData.color}"></div>`,
      className: 'custom-future-icon',
      iconSize: [12, 12]
    })

    const marker = L.marker([city.lat, city.lon], { icon }).addTo(markerLayer)
    marker.on('mouseover', () => {
      selectedPoint.value = { ...dayData, city: city.city }
    })
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getFuturePredictions()
    rawData.value = res.data || []
    await nextTick()
    if (!map) initMap()
    updateMarkers()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.marker-pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-secondary), 0.2); border-radius: 10px; }
</style>