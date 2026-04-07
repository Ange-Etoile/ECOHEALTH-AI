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
        <span class="text-[10px] font-black uppercase opacity-60 ml-2 text-secondary">Timeline :</span>
        <v-btn-toggle v-model="dayOffset" mandatory color="secondary" density="compact" variant="text" @update:model-value="updateMarkers">
          <v-btn v-for="n in 7" :key="n-1" :value="n-1" size="small" class="font-bold">J+{{ n-1 }}</v-btn>
        </v-btn-toggle>
      </div>
    </header>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card variant="outlined" class="rounded-3xl border-outline-variant overflow-hidden h-[600px] relative shadow-2xl bg-black">
          <div id="futureMap" class="w-full h-full"></div>
          
          <div class="absolute bottom-6 left-6 z-[1000] pointer-events-none transition-all duration-300">
             <v-card v-if="selectedPoint" class="bg-black/90 backdrop-blur-xl p-5 rounded-3xl border border-white/10 text-white shadow-2xl min-w-[280px]">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <div class="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Météo & Air</div>
                    <div class="text-xl font-black uppercase italic leading-tight">{{ selectedPoint.city }}</div>
                    <div class="text-[11px] opacity-60">{{ selectedPoint.date }}</div>
                  </div>
                  <v-img :src="selectedPoint.icon || 'https://cdn.weatherapi.com/weather/64x64/day/116.png'" width="50" height="50"></v-img>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div class="text-[9px] opacity-50 uppercase font-bold">Température</div>
                    <div class="text-sm font-black">{{ selectedPoint.temp }}°C</div>
                  </div>
                  <div class="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div class="text-[9px] opacity-50 uppercase font-bold">Vent</div>
                    <div class="text-sm font-black">{{ selectedPoint.wind }} km/h</div>
                  </div>
                  <div class="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div class="text-[9px] opacity-50 uppercase font-bold">Humidité</div>
                    <div class="text-sm font-black">{{ selectedPoint.humidity }}%</div>
                  </div>
                  <div class="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div class="text-[9px] opacity-50 uppercase font-bold">Pluie</div>
                    <div class="text-sm font-black">{{ selectedPoint.precip }} mm</div>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/10 flex justify-between items-center">
                  <v-chip size="small" :color="selectedPoint.color" class="font-black">PM2.5: {{ selectedPoint.pm25 }}</v-chip>
                  <span class="text-[10px] font-bold uppercase italic tracking-tighter" :style="{ color: selectedPoint.color }">
                    {{ selectedPoint.status }}
                  </span>
                </div>
             </v-card>
             <v-card v-else class="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
                <div class="text-[11px] opacity-50 italic">Survolez une station pour voir les prévisions IA</div>
             </v-card>
          </div>

          <v-overlay v-model="loading" persistent class="align-center justify-center" contained>
            <v-progress-circular indeterminate color="secondary" size="64"></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" class="space-y-4">
        <v-card variant="outlined" class="rounded-3xl p-6 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div class="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Analyse Prédictive - J+{{ dayOffset }}</div>
          <p class="text-sm italic opacity-80 leading-relaxed font-medium">{{ summaryText }}</p>
          <div class="absolute -right-4 -bottom-4 opacity-10">
            <v-icon size="80" color="secondary">mdi-brain</v-icon>
          </div>
        </v-card>

        <v-card variant="outlined" class="rounded-3xl p-5 border-outline-variant bg-surface h-[435px] flex flex-col shadow-lg">
          <div class="text-[10px] font-black uppercase opacity-50 mb-4 tracking-widest">Classement Risque Sanitaire</div>
          <div class="overflow-y-auto space-y-3 pr-2 custom-scroll">
            <div v-for="city in sortedForecast" :key="city.city" 
                 class="p-3 rounded-2xl bg-surface-variant/20 hover:bg-surface-variant/40 transition-all border border-transparent hover:border-secondary/20 cursor-pointer"
                 @mouseenter="setFocusCity(city.city)">
              <div class="flex justify-between items-center">
                <span class="text-xs font-black uppercase tracking-tight">{{ city.city }}</span>
                <v-chip size="x-small" :color="city.current.color" variant="flat" class="font-mono font-bold text-white">
                  {{ city.current.pm25 }}
                </v-chip>
              </div>
              <div class="flex justify-between mt-1">
                <div class="text-[10px] opacity-60 font-bold uppercase">{{ city.current.status }}</div>
                <div class="text-[10px] opacity-40 italic">{{ city.current.temp }}°C</div>
              </div>
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

// Calcul du classement des villes pour le jour sélectionné
const sortedForecast = computed(() => {
  if (!rawData.value.length) return []
  return rawData.value.map(c => ({
    city: c.city,
    lat: c.lat,
    lon: c.lon,
    current: c.forecast[dayOffset.value]
  })).sort((a, b) => b.current.pm25 - a.current.pm25)
})

// Résumé dynamique
const summaryText = computed(() => {
  if (!rawData.value.length) return "Initialisation de la matrice climatique..."
  const data = sortedForecast.value
  const highRisk = data.filter(f => f.current.pm25 > 40).length
  const avgPM = (data.reduce((acc, curr) => acc + curr.current.pm25, 0) / data.length).toFixed(1)
  
  return `Pour J+${dayOffset.value}, le modèle XGBoost prévoit une concentration moyenne de ${avgPM} µg/m³. ${highRisk > 0 ? `Attention : ${highRisk} villes présentent un risque d'alerte orange.` : 'La qualité de l\'air semble se stabiliser sur l\'ensemble du territoire.'}`
})

const initMap = () => {
  if (map) return
  map = L.map('futureMap', { zoomControl: false }).setView([7.37, 12.35], 6)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)
}

const updateMarkers = () => {
  if (!map || !rawData.value.length) return
  if (markerLayer) map.removeLayer(markerLayer)
  markerLayer = L.layerGroup().addTo(map)

  rawData.value.forEach(city => {
    const dayData = city.forecast[dayOffset.value]
    if (!dayData) return

    const icon = L.divIcon({
      html: `<div class="marker-pulse" style="background: ${dayData.color}; box-shadow: 0 0 15px ${dayData.color}"></div>`,
      className: 'custom-future-icon',
      iconSize: [12, 12]
    })

    const marker = L.marker([city.lat, city.lon], { icon }).addTo(markerLayer)
    
    marker.on('mouseover', () => {
      selectedPoint.value = { 
        ...dayData, 
        city: city.city,
        // On s'assure d'avoir une icône météo
        icon: dayData.icon || 'https://cdn.weatherapi.com/weather/64x64/day/116.png'
      }
    })
  })
}

// Fonction pour centrer la carte quand on survole la liste à droite
const setFocusCity = (cityName) => {
  const city = rawData.value.find(c => c.city === cityName)
  if (city && map) {
    map.flyTo([city.lat, city.lon], 8, { duration: 1 })
    selectedPoint.value = { ...city.forecast[dayOffset.value], city: city.city }
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getFuturePredictions()
    // Extraction propre des données
    const dataReceived = res.data?.data || res.data || []
    rawData.value = dataReceived
    
    await nextTick() 
    
    initMap()
    
    if (rawData.value.length > 0) {
      updateMarkers()
      // Optionnel : ajuste la vue pour englober tous les points
      const group = L.featureGroup(markerLayer.getLayers())
      if (markerLayer.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }
  } catch (e) {
    console.error("Erreur Fetch Future:", e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
#futureMap {
  background: #0b0e14;
}

.marker-pulse {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
  100% { transform: scale(0.8); opacity: 1; }
}

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { 
  background: rgba(var(--v-theme-secondary), 0.3); 
  border-radius: 10px; 
}
.custom-scroll::-webkit-scrollbar-thumb:hover { 
  background: rgba(var(--v-theme-secondary), 0.6); 
}

/* On s'assure que Leaflet ne cache pas le widget */
:deep(.leaflet-container) {
  font-family: inherit;
}
#futureMap {
  background: #0b0e14;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
:deep(.leaflet-marker-icon) {
  background: transparent;
  border: none;
}

:deep(.leaflet-pane) {
  z-index: 1 !important;
}

:deep(.leaflet-top), :deep(.leaflet-bottom) {
  z-index: 2 !important;
}
</style>