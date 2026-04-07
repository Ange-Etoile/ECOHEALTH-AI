<template>
  <div class="min-h-screen p-4 md:p-8 space-y-6 transition-colors duration-500 bg-background text-on-surface">
    
    <header class="flex items-center justify-between mb-8 border-b border-outline-variant pb-6">
      <div>
        <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-widest text-[10px] mb-1">
          <v-icon size="x-small">mdi-shield-check</v-icon> Protocole IndabaX 2026
        </div>
        <h1 class="text-3xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-2">
          Focus <span class="text-secondary italic">Local</span>
        </h1>
        <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">
          Intelligence Spatiale & Diagnostic Temps Réel
        </p>
      </div>
      <v-btn icon="mdi-refresh" variant="tonal" color="secondary" @click="getLocation" :loading="loading"></v-btn>
    </header>

    <main class="relative">
      
      <div v-if="!locationActive && !loading" key="waiting-screen" class="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <v-avatar size="140" color="secondary" variant="tonal" class="animate-pulse">
          <v-icon size="70">mdi-map-marker-radius</v-icon>
        </v-avatar>
        <div class="max-w-xs">
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Ma Position</h2>
          <p class="text-xs font-medium opacity-70 mt-2 leading-relaxed">
            Autorisez l'accès pour coupler vos coordonnées aux prédictions de l'IA **ECO-Health**.
          </p>
        </div>
        <v-btn size="large" color="secondary" rounded="xl" block class="max-w-xs font-black uppercase tracking-widest" @click="getLocation">
          Démarrer l'analyse
        </v-btn>
      </div>

      <div v-else-if="loading" key="loading-screen" class="space-y-6">
        <v-skeleton-loader type="card" class="rounded-3xl mb-4"></v-skeleton-loader>
        <v-skeleton-loader type="paragraph" class="rounded-xl"></v-skeleton-loader>
      </div>

      <div v-else-if="locationActive && weatherData" key="results-screen" class="animate-fade-in space-y-6">
        
        <v-card variant="outlined" class="rounded-3xl p-6 border-outline-variant bg-surface shadow-xl overflow-hidden relative">
          <div class="absolute top-0 right-0 p-4 opacity-5">
            <v-icon size="120">mdi-city-variant</v-icon>
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-2 text-secondary font-black uppercase text-[10px] tracking-[0.2em]">
              <v-icon size="small">mdi-navigation-variant</v-icon> Point de contact identifié
            </div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tighter mt-1">{{ weatherData?.city }}</h2>
            <p class="text-sm opacity-70 font-bold uppercase tracking-widest">{{ weatherData?.region }} | CAMEROUN</p>
          </div>
        </v-card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <v-card variant="outlined" class="rounded-3xl p-6 border-outline-variant bg-surface relative overflow-hidden">
            <div :class="`absolute inset-0 bg-${currentAlert.color}/10 opacity-20`"></div>
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-[10px] font-black uppercase italic opacity-60">Qualité de l'air (J+0)</h3>
              <v-chip :color="currentAlert.color" size="x-small" class="font-black px-3 uppercase text-white">
                {{ currentAlert.status }}
              </v-chip>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-6xl font-black tracking-tighter" :style="{ color: currentAlert.hex }">
                {{ pm25Value }}
              </span>
              <span class="text-xs font-black opacity-50 uppercase tracking-tighter">PM2.5 µg/m³</span>
            </div>
            <div class="mt-4 flex items-center gap-2">
               <v-icon size="small" :style="{ color: currentAlert.hex }">mdi-information-outline</v-icon>
               <span class="text-[10px] font-black uppercase tracking-wide" :style="{ color: currentAlert.hex }">
                 Alerte : {{ currentAlert.level }}
               </span>
            </div>
          </v-card>

          <v-card variant="outlined" class="rounded-3xl p-6 border-outline-variant bg-surface">
            <h3 class="text-[10px] font-black uppercase italic opacity-60 mb-4">Conditions Météo</h3>
            <div class="flex items-center justify-between">
              <div>
                <span class="text-6xl font-black tracking-tighter">{{ weatherData?.weather?.temp_c }}°C</span>
                <p class="text-[10px] font-bold uppercase opacity-50 mt-1 tracking-widest italic">
                  Ciel : {{ weatherData?.weather?.condition?.text }}
                </p>
              </div>
              <v-img v-if="weatherData?.weather?.condition?.icon" :src="weatherData.weather.condition.icon" width="80" class="drop-shadow-lg"></v-img>
            </div>
          </v-card>
        </div>

        <v-card variant="outlined" class="rounded-3xl p-6 border-outline-variant bg-surface shadow-sm relative overflow-hidden">
          <div class="flex items-center gap-3 mb-4 border-b border-outline-variant pb-3">
            <v-icon color="secondary">mdi-shield-sun-outline</v-icon>
            <h3 class="text-[12px] font-black uppercase tracking-tighter italic">Guide de Mobilité & Précautions</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div v-for="(guide, index) in activeGuides" :key="'guide-'+index" class="flex gap-4 items-center">
                <v-avatar :color="guide.color" variant="tonal" size="48" rounded="lg">
                  <v-icon :color="guide.color">{{ guide.icon }}</v-icon>
                </v-avatar>
                <div>
                  <h4 class="text-[10px] font-black uppercase" :style="{ color: guide.color }">{{ guide.title }}</h4>
                  <p class="text-xs font-bold leading-tight opacity-80">{{ guide.desc }}</p>
                </div>
              </div>
            </div>

            <v-card variant="tonal" :color="currentAlert.color" class="rounded-2xl p-5 flex flex-col justify-center">
              <div class="flex items-center gap-2 mb-2">
                <v-icon size="small">mdi-robot-confused-outline</v-icon>
                <span class="text-[9px] font-black uppercase tracking-widest">Analyse IA Santé</span>
              </div>
              <p class="text-sm leading-relaxed font-black italic">
                "{{ currentAlert.action }}"
              </p>
            </v-card>
          </div>
        </v-card>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(item, i) in techMetrics" :key="'kpi-' + i" class="p-4 rounded-2xl bg-surface-variant/10 border border-outline-variant text-center transition-all hover:scale-105">
            <v-icon size="small" class="mb-2 opacity-50" color="secondary">{{ item.icon }}</v-icon>
            <span class="block text-[9px] uppercase font-black opacity-50 tracking-tighter">{{ item.label }}</span>
            <span class="text-lg font-black tracking-tight">{{ item.value }}{{ item.unit }}</span>
          </div>
        </div>

        <v-alert
          v-if="pm25Value > 35"
          type="error"
          variant="flat"
          rounded="xl"
          icon="mdi-alert-octagon"
          class="mt-6 font-black uppercase tracking-tighter text-white"
        >
          Danger Immédiat identifié à {{ weatherData?.city }}. Appliquez le protocole de protection.
        </v-alert>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getWeatherDataByCoords } from '@/services/dataService';
import { Geolocation } from '@capacitor/geolocation';

const loading = ref(false);
const locationActive = ref(false);
const weatherData = ref(null);

const alertSystem = [
  { range: [0, 15], level: "Sain", color: "success", hex: "#4CAF50", status: "Air Pur", action: "L'air est excellent. Profitez-en pour vos activités physiques en plein air sans aucune restriction." },
  { range: [15, 25], level: "Modéré", color: "warning", hex: "#FFB300", status: "Air Acceptable", action: "Qualité d'air modérée. Les personnes très sensibles doivent limiter les efforts prolongés." },
  { range: [25, 35], level: "Mauvais", color: "orange", hex: "#FF9800", status: "Alerte Pollution", action: "Qualité médiocre. Port du masque simple conseillé pour les trajets urbains et évitez les zones de brûlis." },
  { range: [35, 999], level: "Dangereux", color: "error", hex: "#F44336", status: "Urgence Sanitaire", action: "Danger critique. Port du masque FFP2 obligatoire en extérieur, gardez les fenêtres fermées et évitez tout effort." }
];

const pm25Value = computed(() => {
  return weatherData.value?.ai_prediction?.days?.[0]?.pm25 ?? 0;
});

const currentAlert = computed(() => {
  const val = pm25Value.value;
  return alertSystem.find(a => val >= a.range[0] && val < a.range[1]) || alertSystem[0];
});

const activeGuides = computed(() => {
  const guides = [];
  if (!weatherData.value) return [];
  const rain = weatherData.value.weather?.precip_mm ?? 0;
  const temp = weatherData.value.weather?.temp_c ?? 0;
  const pm = pm25Value.value;
  const condition = (weatherData.value.weather?.condition?.text || "").toLowerCase();

  if (rain > 0.1 || condition.includes('pluie') || condition.includes('drizzle')) {
    guides.push({ title: "Protection", icon: "mdi-umbrella", color: "blue", desc: `Il pleut actuellement (${rain}mm). Prévoyez un parapluie.` });
  } else if (condition.includes('nuage')) {
    guides.push({ title: "Météo", icon: "mdi-cloud", color: "blue-grey", desc: "Ciel couvert. Temps sec pour le moment." });
  } else {
    guides.push({ title: "Sorties", icon: "mdi-walk", color: "success", desc: "Temps sec et dégagé." });
  }

  if (temp >= 32) {
    guides.push({ title: "Thermique", icon: "mdi-thermometer-alert", color: "error", desc: `Forte chaleur (${temp}°C). Hydratez-vous.` });
  } else {
    guides.push({ title: "Confort", icon: "mdi-check-circle-outline", color: "success", desc: `Température idéale (${temp}°C).` });
  }

  if (pm > 25) {
    guides.push({ title: "Respiration", icon: "mdi-face-mask", color: "error", desc: "Pollution détectée. Port du masque recommandé." });
  } else {
    guides.push({ title: "Santé", icon: "mdi-air-filter", color: "success", desc: "Air sain détecté. Respiration libre." });
  }
  return guides;
});

const techMetrics = computed(() => [
  { label: 'Humidité', icon: 'mdi-water-percent', value: weatherData.value?.weather?.humidity ?? 0, unit: '%' },
  { label: 'Vent', icon: 'mdi-weather-windy', value: weatherData.value?.weather?.wind_kph ?? 0, unit: ' km/h' },
  { label: 'Précipitation', icon: 'mdi-weather-pouring', value: weatherData.value?.weather?.precip_mm ?? 0, unit: ' mm' },
  { label: 'Indice UV', icon: 'mdi-sun-thermometer', value: weatherData.value?.weather?.uv ?? 0, unit: '' }
]);
const getLocation = async () => {
  loading.value = true;
  
  try {
    let permStatus = await Geolocation.checkPermissions();
    
    if (permStatus.location !== 'granted') {
      permStatus = await Geolocation.requestPermissions();
    }

    if (permStatus.location === 'granted') {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000 
      });

      const { latitude, longitude } = coordinates.coords;
      const data = await getWeatherDataByCoords(latitude, longitude);
      if (data) {
        weatherData.value = data;
        locationActive.value = true;
      }
    } else {
      alert("L'accès à la position a été refusé. Veuillez l'activer dans les paramètres de votre téléphone.");
    }
  } catch (err) {
    console.error("Erreur de localisation:", err);
    let errorMsg = "Erreur : Impossible de récupérer votre position.";
    if (err.message.includes("denied")) errorMsg = "Veuillez autoriser la localisation dans vos paramètres.";
    alert(errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.v-theme--dark .bg-surface {
  background-color: #121212 !important;
}
</style>