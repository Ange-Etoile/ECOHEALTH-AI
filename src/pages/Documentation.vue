<template>
  <div class="max-w-6xl mx-auto px-4 py-8 text-on-surface space-y-12 md:space-y-20 selection:bg-secondary/30">
    
    <header class="space-y-6 border-b border-outline-variant pb-10">
      <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-[0.2em] text-[10px]">
        <v-icon size="x-small">mdi-shield-check-outline</v-icon> Protocole IndabaX Cameroon 2026
      </div>
      <h1 class="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
        Architecture <br>
        <span class="text-secondary italic text-stroke">Eco-Health</span>
      </h1>
      <p class="text-sm md:text-lg opacity-70 leading-relaxed max-w-3xl font-medium">
        Système prédictif haute résolution pour la résilience climatique au Cameroun. 
        Intégration de <strong>LightGBM</strong> et moteur <strong>RAG</strong> pour une santé connectée.
      </p>
      <div class="flex flex-wrap gap-2">
        <v-chip size="x-small" variant="tonal" color="secondary" class="font-bold uppercase">LightGBM Final</v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary" class="font-bold uppercase">RAG Engine</v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary" class="font-bold uppercase">Flask API</v-chip>
      </div>
    </header>

    <section class="space-y-8">
      <div class="flex items-center gap-3">
        <span class="text-3xl md:text-4xl font-black opacity-10 font-mono">01</span>
        <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight italic border-l-4 border-secondary pl-4">Ingénierie & Benchmark</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div class="space-y-4 text-xs md:text-sm opacity-80 leading-relaxed text-justify">
          <p>
            Notre démarche scientifique a consisté à comparer <strong>4 modèles de régression</strong> sur un dataset de <strong>87 240 observations</strong>. Après évaluation de la RMSE et du temps d'inférence, <strong>LightGBM</strong> s'est imposé comme la solution la plus robuste face aux variations climatiques locales.
          </p>
          <div class="grid grid-cols-2 gap-2 pt-4 font-mono text-[10px]">
            <div v-for="m in modelMetrics" :key="m.name" class="p-3 border border-outline-variant rounded-xl bg-surface-variant/5">
              <span class="block opacity-50 uppercase">{{ m.name }}</span>
              <span class="font-bold" :class="m.best ? 'text-secondary' : ''">{{ m.score }}</span>
            </div>
          </div>
        </div>
        
        <v-card variant="tonal" color="secondary" class="rounded-3xl p-6 border border-secondary/20">
          <h4 class="font-black uppercase text-xs mb-4 flex items-center gap-2 italic">
            <v-icon size="small">mdi-memory</v-icon> Pipeline de Traitement
          </h4>
          <ul class="space-y-3 text-[10px] md:text-[11px] font-bold uppercase tracking-wide">
            <li class="flex items-center gap-3"><v-icon size="16">mdi-filter-variant</v-icon> Nettoyage Pandas & StandardScaler</li>
            <li class="flex items-center gap-3"><v-icon size="16">mdi-layers-triple</v-icon> Feature Engineering (Lags Temporels)</li>
            <li class="flex items-center gap-3"><v-icon size="16">mdi-check-decagram</v-icon> Optimisation LightGBM</li>
          </ul>
        </v-card>
      </div>
    </section>

    <section class="bg-secondary/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-secondary/10 relative overflow-hidden">
      <v-icon class="absolute -right-10 -top-10 opacity-5 rotate-12" size="250">mdi-heart-pulse</v-icon>
      <div class="max-w-3xl relative z-10 space-y-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl md:text-4xl font-black opacity-10 font-mono">02</span>
          <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight">La Vision Sociale</h2>
        </div>
        <p class="text-sm md:text-lg italic font-medium opacity-90 leading-relaxed border-l-2 border-secondary pl-6">
          "Au-delà des algorithmes, notre mission est de sauver des vies. En zone équatoriale et sahélienne, la pollution est un tueur silencieux. Eco-Health donne une voix aux données pour protéger les plus vulnérables."
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div v-for="(stat, i) in impactStats" :key="i" class="text-center md:text-left">
            <span class="block text-2xl font-black text-secondary">{{ stat.val }}</span>
            <span class="text-[9px] uppercase font-black opacity-40 tracking-widest">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div class="order-2 md:order-1 space-y-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl md:text-4xl font-black opacity-10 font-mono">03</span>
          <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight italic">Assistance RAG</h2>
        </div>
        <p class="text-xs md:text-sm opacity-80 leading-relaxed">
          Nous avons implémenté un système de <strong>Génération Augmentée par Récupération (RAG)</strong>. Le chatbot n'hallucine pas : il interroge dynamiquement le dataset prédit par <strong>LightGBM</strong> pour fournir des recommandations de santé précises et contextuelles.
        </p>
        <v-btn variant="outlined" color="secondary" block class="font-black rounded-xl py-6 uppercase tracking-widest text-[10px]">Lancer le diagnostic IA</v-btn>
      </div>
      <div class="order-1 md:order-2 flex justify-center bg-surface-variant/10 rounded-[2.5rem] p-10 border border-outline-variant">
        <v-icon size="120" color="secondary" class="opacity-30 pulse-animation">mdi-robot-vacuum-variant</v-icon>
      </div>
    </section>

    <section class="space-y-8">
      <h3 class="text-center text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Navigation Système</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div v-for="(page, i) in pagesInfo" :key="i" class="p-4 md:p-6 rounded-2xl border border-outline-variant hover:border-secondary/50 transition-all bg-surface group">
          <v-icon color="secondary" class="mb-3 transition-transform group-hover:-translate-y-1" size="small">{{ page.icon }}</v-icon>
          <h4 class="font-black uppercase text-[10px] md:text-xs mb-2 tracking-tighter">{{ page.title }}</h4>
          <p class="text-[9px] md:text-[10px] opacity-50 leading-snug">{{ page.desc }}</p>
        </div>
      </div>
    </section>

    <footer class="pt-10 border-t border-outline-variant space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div v-for="(alert, i) in alertSystem" :key="i" class="p-3 rounded-xl border border-outline-variant flex flex-col justify-center items-center text-center">
          <div :class="`w-2 h-2 rounded-full bg-${alert.color} mb-2 shadow-lg`" :style="{boxShadow: `0 0 10px var(--v-theme-${alert.color})`}"></div>
          <span class="text-[9px] font-black uppercase">{{ alert.status }}</span>
          <span class="text-[8px] opacity-40 leading-none mt-1 uppercase">{{ alert.level }}</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
const modelMetrics = [
  { name: 'Linear Reg', score: 'RMSE 14.2', best: false },
  { name: 'Rand Forest', score: 'RMSE 8.5', best: false },
  { name: 'XGBoost', score: 'RMSE 6.2', best: false },
  { name: 'LightGBM', score: 'RMSE 5.8', best: true }
]

const impactStats = [
  { val: '42', label: 'Villes Monitoring' },
  { val: 'J+7', label: 'Horizon IA' },
  { val: '94%', label: 'Accuracy Score' },
  { val: '24/7', label: 'Data Sync' }
]

const pagesInfo = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', desc: 'Vue globale temps réel.' },
  { title: 'Analyses', icon: 'mdi-google-analytics', desc: 'Corrélations climatiques.' },
  { title: 'Prédictions', icon: 'mdi-chart-timeline-variant', desc: 'Séries temporelles J+7.' },
  { title: 'Cartes', icon: 'mdi-map-marker-path', desc: 'Zones à risques.' },
  { title: 'Santé', icon: 'mdi-shield-pulse', desc: 'Protocoles OMS.' },
  { title: 'IA Chat', icon: 'mdi-robot-happy', desc: 'Support RAG interactif.' }
]

const alertSystem = [
  { level: "Niveau 1", color: "success", status: "Sain" },
  { level: "Niveau 2", color: "warning", status: "Modéré" },
  { level: "Niveau 3", color: "orange", status: "Alerte" },
  { level: "Niveau 4", color: "error", status: "Urgence" }
]
</script>

<style scoped>
.text-stroke {
  -webkit-text-stroke: 1px var(--v-theme-secondary);
  color: transparent;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.3; }
}
.pulse-animation {
  animation: pulse 3s infinite ease-in-out;
}

/* Optimisation Mobile First */
@media (max-width: 600px) {
  h1 { font-size: 2.2rem !important; }
  .v-chip { font-size: 8px !important; }
}
</style>