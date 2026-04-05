<template>
  <div class="max-w-5xl mx-auto px-4 py-6  text-on-surface space-y-8 md:space-y-12">
    
    <header class="space-y-4 border-b border-outline-variant pb-6 md:pb-8 text-center md:text-left">
      <div class="flex items-center justify-center md:justify-start gap-2 text-secondary font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
        <v-icon size="small">mdi-shield-check-outline</v-icon> Protocole IndabaX Cameroon 2026
      </div>
      <h1 class="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight md:leading-none">
        Documentation <br class="hidden sm:block md:hidden"> 
        <span class="text-secondary italic text-stroke">Technique</span>
      </h1>
      <p class="text-sm md:text-lg opacity-70 leading-relaxed max-w-3xl mx-auto md:mx-0">
        Architecture prédictive et analytique pour la résilience climatique. 
        Anticipation des concentrations de PM2.5 à 7 jours via intégration multi-source.
      </p>
    </header>

    <section class="space-y-6 md:space-y-8">
      <div class="flex items-center gap-3 md:gap-4 justify-center md:justify-start">
        <span class="text-3xl md:text-4xl font-black opacity-10 font-mono">01</span>
        <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight">Vision & Prédiction</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
        <div class="space-y-4 opacity-80 text-sm md:text-base text-justify md:text-left leading-relaxed order-2 md:order-1">
          <p>
            Notre système ne se contente pas d'afficher des données historiques. Nous avons couplé notre modèle de Machine Learning 
            avec l'<strong>API Open-Météo</strong> pour extraire les prévisions en temps réel sur 42 villes du Cameroun. 
          </p>
          <p>
            En injectant ces données météo futures, nous générons une <strong>prédiction précise de la qualité de l'air sur 7 jours</strong>, 
            permettant de passer d'un constat passif à une alerte proactive.
          </p>
        </div>
        <v-card variant="tonal" color="secondary" class="rounded-2xl md:rounded-3xl p-5 md:p-6 border border-secondary/20 order-1 md:order-2">
          <h4 class="font-black uppercase text-[10px] md:text-xs mb-4 flex items-center gap-2">
            <v-icon size="small">mdi-api</v-icon> Pipeline de Données
          </h4>
          <ul class="space-y-3 text-[10px] md:text-[11px] font-bold uppercase tracking-wide opacity-90">
            <li class="flex items-center gap-3">
              <v-icon size="18" color="secondary">mdi-database-import</v-icon>
              <span>87 240 observations historiques</span>
            </li>
            <li class="flex items-center gap-3">
              <v-icon size="18" color="secondary">mdi-cloud-sync</v-icon>
              <span>Flux temps réel API Météo</span>
            </li>
            <li class="flex items-center gap-3">
              <v-icon size="18" color="secondary">mdi-crystal-ball</v-icon>
              <span>Prédiction glissante J+7</span>
            </li>
          </ul>
        </v-card>
      </div>
    </section>

    <section class="space-y-6 md:space-y-8">
      <div class="flex items-center gap-3 md:gap-4 justify-center md:justify-start">
        <span class="text-3xl md:text-4xl font-black opacity-10 font-mono">02</span>
        <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight text-center md:text-left">Exploration des Pages</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <v-card v-for="(page, i) in pagesInfo" :key="i" variant="outlined" class="rounded-xl md:rounded-2xl p-5 md:p-6 border-outline-variant hover:bg-surface-variant/10 transition-all">
          <v-icon color="secondary" class="mb-3 md:mb-4" size="default">{{ page.icon }}</v-icon>
          <h4 class="font-black uppercase text-xs mb-2 tracking-wider">{{ page.title }}</h4>
          <p class="text-[10px] md:text-[11px] opacity-70 leading-snug">{{ page.desc }}</p>
        </v-card>
      </div>
    </section>

    <section class="chatbot-section rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 overflow-hidden position-relative">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center position-relative" style="z-index: 2">
        <div class="text-center md:text-left">
          <h2 class="text-secondary font-black uppercase tracking-widest text-[10px] mb-3 italic">
            Support IA
          </h2>
          <h3 class="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-4 md:mb-6 section-title">
            Assistance <br class="hidden md:block"> Conversationnelle
          </h3>
          <p class="text-xs md:text-sm leading-relaxed font-medium section-text opacity-90 max-w-md mx-auto md:mx-0">
            Nous avons intégré un <strong>Chatbot dédié</strong> capable d'interpréter le dataset et les prédictions futures. 
            Interrogez l'IA sur l'évolution de la qualité de l'air ou demandez des conseils de santé personnalisés.
          </p>
        </div>
        <div class="flex justify-center order-first md:order-last">
          <v-icon color="secondary" class="chatbot-icon">
            mdi-robot-happy-outline
          </v-icon>
        </div>
      </div>
    </section>

    <section class="space-y-6 border border-outline-variant p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem]">
      <div class="flex items-center gap-3 md:gap-4 justify-center md:justify-start">
        <span class="text-3xl md:text-4xl font-black opacity-10 font-mono">03</span>
        <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight">Standard Sanitaire</h2>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <v-alert v-for="(alert, i) in alertSystem" :key="i" :color="alert.color" variant="tonal" class="rounded-xl border-none">
          <template v-slot:prepend>
            <v-chip :color="alert.color" size="x-small" class="font-black px-2 md:px-4">{{ alert.level }}</v-chip>
          </template>
          <div class="ml-2 md:ml-4">
            <div class="font-black uppercase text-[9px] md:text-[10px] tracking-widest" :class="`text-${alert.color}`">{{ alert.status }}</div>
            <div class="text-[10px] md:text-[11px] opacity-80 leading-tight">{{ alert.action }}</div>
          </div>
        </v-alert>
      </div>
    </section>
  </div>
</template>

<script setup>
const pagesInfo = [
  { title: 'Vue d’Ensemble', icon: 'mdi-monitor-dashboard', desc: 'Monitoring global en temps réel des 42 villes camerounaises.' },
  { title: 'Corrélations', icon: 'mdi-chart-scatter-plot', desc: 'Liens entre variables météo et concentration de particules.' },
  { title: 'Analyses Thermiques', icon: 'mdi-thermometer-alert', desc: 'Influence des pics de chaleur sur la stagnation des polluants.' },
  { title: 'Bilan Solaire & Hydrique', icon: 'mdi-weather-sunny-alert', desc: 'Impact de l’ensoleillement et des pluies sur l’air.' },
  { title: 'Profils Régionaux', icon: 'mdi-city-variant-outline', desc: 'Comparatif détaillé par zone : Sahélienne, Tropicale et Équatoriale.' }
]

const alertSystem = [
  { level: "Vert", color: "success", status: "Sain", action: "Air de bonne qualité. Aucune restriction pour les activités extérieures." },
  { level: "Jaune", color: "warning", status: "Modéré", action: "Vigilance recommandée pour les personnes sensibles (asthme, enfants)." },
  { level: "Orange", color: "orange", status: "Alerte", action: "Qualité dégradée. Limitation des efforts physiques intenses conseillée." },
  { level: "Rouge", color: "error", status: "Urgence", action: "Danger immédiat. Port du masque conseillé et limitation des sorties." }
]
</script>

<style scoped>
/* Effet de contour du texte */
.text-stroke {
  -webkit-text-stroke: 1px currentColor;
  color: transparent;
}

/* Fix Chatbot Section pour les deux modes */
.chatbot-section {
  position: relative;
  border: 1px solid rgba(var(--v-theme-secondary), 0.2);
}

/* Couleurs basées sur les variables Vuetify pour le mode sombre/clair */
.v-theme--light .chatbot-section {
  background-color: #f1f3f4;
  color: #1a1a1a;
}
.v-theme--dark .chatbot-section {
  background-color: #1a1a1a;
  color: #ffffff;
}

.chatbot-icon {
  font-size: 80px !important; /* Taille mobile */
  opacity: 0.15;
}

@media (min-width: 960px) {
  .chatbot-icon {
    font-size: 180px !important; /* Taille desktop */
  }
}

.section-title {
  color: inherit;
}

.section-text {
  color: inherit;
}
</style>