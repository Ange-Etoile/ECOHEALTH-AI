<template>
  <div class="max-w-5xl mx-auto p-6 md:p-12 text-on-surface space-y-16">
    <header class="space-y-4 border-b border-outline-variant pb-8 text-center md:text-left">
      <div class="flex items-center justify-center md:justify-start gap-2 text-secondary font-black uppercase tracking-[0.2em] text-xs">
        <v-icon size="small">mdi-shield-check-outline</v-icon> Protocole IndabaX Cameroon 2026
      </div>
      <h1 class="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
        Documentation <span class="text-secondary italic text-stroke">Technique</span>
      </h1>
      <p class="text-lg opacity-70 leading-relaxed max-w-3xl">
        Architecture prédictive et analytique pour la résilience climatique. 
        Anticipation des concentrations de PM2.5 à 7 jours via intégration multi-source.
      </p>
    </header>

    <section class="space-y-8">
      <div class="flex items-center gap-4">
        <span class="text-4xl font-black opacity-10">01</span>
        <h2 class="text-2xl font-black uppercase tracking-tight">Vision & Intelligence Prédictive</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-10">
        <div class="space-y-4 opacity-80 text-justify">
          <p>
            Notre système ne se contente pas d'afficher des données historiques. Nous avons couplé notre modèle de Machine Learning 
            avec l'<strong>API Open-Météo</strong> pour extraire les prévisions en temps réel sur 42 villes du Cameroun. 
          </p>
          <p>
            En injectant ces données météo futures dans notre algorithme, nous générons une <strong>prédiction précise de la qualité de l'air (PM2.5) sur les 7 prochains jours</strong>. 
            Cela permet de passer d'un constat passif à une alerte proactive.
          </p>
        </div>
        <v-card variant="tonal" color="secondary" class="rounded-3xl p-6 border border-secondary/20">
          <h4 class="font-black uppercase text-xs mb-4 flex items-center gap-2">
            <v-icon size="small">mdi-api</v-icon> Pipeline de Données
          </h4>
          <ul class="space-y-3 text-[11px] font-bold uppercase tracking-wide opacity-90">
            <li class="flex items-start gap-2">
              <v-icon size="small">mdi-database-import</v-icon>
              <span>Dataset Historique : 87 240 observations (2020-2025).</span>
            </li>
            <li class="flex items-start gap-2">
              <v-icon size="small">mdi-cloud-sync</v-icon>
              <span>Flux Temps Réel : API Météo (Temp, Vent, Humidité).</span>
            </li>
            <li class="flex items-start gap-2">
              <v-icon size="small">mdi-crystal-ball</v-icon>
              <span>Output : Prédiction PM2.5 glissante sur 7 jours.</span>
            </li>
          </ul>
        </v-card>
      </div>
    </section>

    <section class="space-y-8">
      <div class="flex items-center gap-4">
        <span class="text-4xl font-black opacity-10">02</span>
        <h2 class="text-2xl font-black uppercase tracking-tight">Structure du Dashboard</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <v-card v-for="(page, i) in pagesInfo" :key="i" variant="outlined" class="rounded-2xl p-6 border-outline-variant hover:bg-surface-variant/5 transition-colors">
          <v-icon color="secondary" class="mb-4" size="large">{{ page.icon }}</v-icon>
          <h4 class="font-black uppercase text-xs mb-2 tracking-wider">{{ page.title }}</h4>
          <p class="text-[11px] opacity-70 leading-snug">{{ page.desc }}</p>
        </v-card>
      </div>
    </section>

    <section class="space-y-6">
      <div class="flex items-center gap-4">
        <span class="text-4xl font-black opacity-10">03</span>
        <h2 class="text-2xl font-black uppercase tracking-tight">Mécanismes de Calcul</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <v-card v-for="(feat, i) in features" :key="i" variant="tonal" class="rounded-2xl p-5 border-none">
          <v-icon color="secondary" class="mb-3">{{ feat.icon }}</v-icon>
          <div class="font-black text-xs uppercase mb-1">{{ feat.title }}</div>
          <div class="text-[11px] opacity-70 leading-snug">{{ feat.desc }}</div>
        </v-card>
      </div>
    </section>

   <section class="chatbot-section rounded-[2.5rem] p-8 md:p-12 overflow-hidden position-relative">
    <div class="grid md:grid-cols-2 gap-10 items-center position-relative" style="z-index: 2">
        <div>
        <h2 class="text-secondary font-black uppercase tracking-widest text-xs mb-4 italic">
            Support IA
        </h2>
        <h3 class="text-4xl font-black tracking-tighter uppercase leading-none mb-6 section-title">
            Assistance <br>Conversationnelle
        </h3>
        <p class="text-sm opacity-90 leading-relaxed font-medium section-text">
            Nous avons intégré un <strong>Chatbot dédié</strong> capable d'interpréter le dataset et les prédictions futures. 
            Que vous soyez un citoyen ou un expert, vous pouvez interroger l'IA sur l'évolution de la qualité de l'air dans votre ville 
            ou demander des conseils de santé basés sur les prévisions à venir.
        </p>
        </div>
        <div class="flex justify-center">
        <v-icon size="180" color="secondary" class="chatbot-bg-icon">
            mdi-robot-happy-outline
        </v-icon>
        </div>
    </div>
    </section>

    <section class="space-y-6 border border-outline-variant p-8 rounded-[2rem]">
      <div class="flex items-center gap-4">
        <span class="text-4xl font-black opacity-10">05</span>
        <h2 class="text-2xl font-black uppercase tracking-tight text-center">Niveaux de Risque</h2>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <v-alert v-for="(alert, i) in alertSystem" :key="i" :color="alert.color" variant="tonal" class="rounded-xl border-none">
          <template v-slot:prepend>
            <v-chip :color="alert.color" size="small" class="font-black">{{ alert.level }}</v-chip>
          </template>
          <div class="ml-4">
            <div class="font-black uppercase text-[10px] tracking-widest">{{ alert.status }}</div>
            <div class="text-[11px] opacity-80">{{ alert.action }}</div>
          </div>
        </v-alert>
      </div>
    </section>
  </div>
</template>

<script setup>
const pagesInfo = [
  { 
    title: 'Vue d’Ensemble', 
    icon: 'mdi-monitor-dashboard',
    desc: 'Monitoring global en temps réel des 42 villes camerounaises avec indicateurs clés de performance (KPI).' 
  },
  { 
    title: 'Analyse des Corrélations', 
    icon: 'mdi-chart-scatter-plot',
    desc: 'Exploration des liens entre variables météo (vent, humidité) et concentration de particules fines.' 
  },
  { 
    title: 'Analyses Thermiques', 
    icon: 'mdi-thermometer-alert',
    desc: 'Étude des pics de chaleur et de leur influence sur la stagnation des polluants atmosphériques.' 
  },
  { 
    title: 'Bilan Solaire & Hydrique', 
    icon: 'mdi-weather-sunny-alert',
    desc: 'Analyse de l’ensoleillement et des précipitations comme agents de nettoyage ou de formation du smog.' 
  },
  { 
    title: 'Profils Régionaux', 
    icon: 'mdi-city-variant-outline',
    desc: 'Comparatif détaillé par zone climatique : Sahélienne, Tropicale et Équatoriale.' 
  }
]

const features = [
  { 
    title: "Indice de Stagnation", 
    icon: "mdi-air-filter", 
    desc: "Détection des périodes d'absence de vent et de pluie favorisant l'accumulation des PM2.5." 
  },
  { 
    title: "Effet Mémoire (Lags)", 
    icon: "mdi-history", 
    desc: "Analyse des tendances des 3 derniers jours pour prédire avec précision la cinétique de l'air." 
  },
  { 
    title: "Lessivage Naturel", 
    icon: "mdi-water-check-outline", 
    desc: "Calcul de l'impact des pluies sur la purification de la colonne d'air ambiante." 
  }
]

const alertSystem = [
  { level: "Vert", color: "success", status: "Sain", action: "Air de bonne qualité. Aucune restriction pour les activités extérieures." },
  { level: "Jaune", color: "warning", status: "Modéré", action: "Risque léger pour les personnes ultra-sensibles. Vigilance recommandée." },
  { level: "Orange", color: "orange", status: "Alerte", action: "Qualité dégradée. Limitation des efforts physiques intenses en extérieur." },
  { level: "Rouge", color: "error", status: "Urgence", action: "Air dangereux. Port du masque conseillé et limitation stricte des déplacements." }
]
</script>

<style scoped>
.text-stroke {
  -webkit-text-stroke: 1px currentColor;
  color: transparent;
}
</style>