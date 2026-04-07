<template>
  <div class="max-w-7xl mx-auto space-y-6 md:space-y-8 p-3 md:p-6 text-on-surface bg-background pb-20 md:pb-6">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-6 md:pb-8">
      <div class="space-y-2 text-center sm:text-left">
        <div class="flex items-center justify-center sm:justify-start gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
          <v-icon size="small" color="primary">mdi-shield-check</v-icon> Validation de l'Architecture
        </div>
        <h2 class="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          Performance <span class="text-primary italic">Modèles</span>
        </h2>
        <p class="text-[11px] md:text-sm opacity-70 font-medium max-w-md mx-auto sm:mx-0">
          Analyse des métriques après optimisation par GridSearchCV (CV=5).
        </p>
      </div>
      
      <div class="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-outline-variant mx-auto sm:mx-0 w-full sm:w-auto justify-center">
        <v-icon size="32" color="success">mdi-check-decagram</v-icon>
        <div>
          <p class="text-[10px] uppercase font-bold opacity-50 leading-none">Modèle Champion</p>
          <p class="text-lg font-black text-success">{{ summary.best_model }}</p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div v-for="(val, label) in topMetrics" :key="label" 
           class="p-5 md:p-6 rounded-[1.5rem] bg-surface border border-outline-variant shadow-sm relative overflow-hidden">
        <span class="text-[10px] font-black uppercase opacity-50 block mb-1">{{ label }}</span>
        <span class="text-2xl md:text-3xl font-black text-primary">{{ val }}</span>
        <v-icon size="60" class="absolute -right-4 -bottom-4 opacity-[0.03]" color="primary">mdi-chart-line</v-icon>
      </div>
    </div>

    <v-row class="ma-0">
      <v-col cols="12" lg="7" class="pa-0 pr-0 lg:pr-3 mb-6 lg:mb-0">
        <v-card variant="outlined" class="rounded-[1.5rem] md:rounded-[2rem] border-outline-variant bg-surface p-4 md:p-6 h-[350px] md:h-[450px]">
          <h3 class="text-[10px] md:text-xs font-black uppercase mb-4 flex items-center gap-2">
            <v-icon color="secondary" size="small">mdi-poll</v-icon> Fidélité du Score (R² Test)
          </h3>
          <div id="compareModelsChart" class="w-full h-[calc(100%-3rem)]"></div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5" class="pa-0 pl-0 lg:pl-3">
        <v-card variant="outlined" class="rounded-[1.5rem] md:rounded-[2rem] border-outline-variant bg-surface p-4 md:p-6 h-[350px] md:h-[450px]">
          <h3 class="text-[10px] md:text-xs font-black uppercase mb-4 flex items-center gap-2">
            <v-icon color="primary" size="small">mdi-flash</v-icon> Variables Prédictives
          </h3>
          <div id="importanceChart" class="w-full h-[calc(100%-3rem)]"></div>
        </v-card>
      </v-col>
    </v-row>

    <div class="space-y-4">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest opacity-60">Matrice de validation détaillée</h3>
        <v-chip size="x-small" color="primary" variant="flat" class="font-black">OPTIMISÉ</v-chip>
      </div>

      <v-card variant="outlined" class="rounded-[1.5rem] md:rounded-[2rem] border-outline-variant bg-surface overflow-hidden hidden md:block">
        <v-table class="bg-transparent">
          <thead>
            <tr class="text-[10px] uppercase font-black opacity-50 bg-neutral-900/5">
              <th class="text-left px-6">Architecture</th>
              <th class="text-center">R² Test</th>
              <th class="text-center">MAE (Erreur)</th>
              <th class="text-center">RMSE</th>
              <th class="text-center">Infér. (s)</th>
            </tr>
          </thead>
          <tbody class="text-xs font-bold">
            <tr v-for="m in models" :key="m.model" 
                :class="{'bg-primary/5': m.model === summary.best_model}"
                class="border-t border-outline-variant hover:bg-neutral-500/5 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <v-icon v-if="m.model === summary.best_model" size="14" color="success">mdi-star</v-icon>
                  {{ m.model }}
                </div>
              </td>
              <td class="text-center text-primary">{{ m.r2_test.toFixed(4) }}</td>
              <td class="text-center">{{ m.mae.toFixed(4) }}</td>
              <td class="text-center">{{ m.rmse.toFixed(4) }}</td>
              <td class="text-center italic opacity-60">{{ m.fit_time }}s</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <div class="space-y-3 md:hidden">
        <div v-for="m in models" :key="m.model" 
             class="p-4 rounded-2xl border border-outline-variant bg-surface relative overflow-hidden"
             :class="{'border-primary/50 ring-1 ring-primary/20': m.model === summary.best_model}">
          
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="text-[9px] font-black text-primary uppercase block">Architecture</span>
              <span class="text-sm font-black flex items-center gap-1">
                 <v-icon v-if="m.model === summary.best_model" size="14" color="success">mdi-star</v-icon>
                 {{ m.model }}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[9px] font-black opacity-40 uppercase block">R² Test</span>
              <span class="text-sm font-black text-primary">{{ m.r2_test.toFixed(4) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-3 border-t border-outline-variant/50">
            <div>
              <span class="text-[8px] font-bold opacity-50 uppercase block">MAE</span>
              <span class="text-[10px] font-black">{{ m.mae.toFixed(3) }}</span>
            </div>
            <div>
              <span class="text-[8px] font-bold opacity-50 uppercase block">RMSE</span>
              <span class="text-[10px] font-black">{{ m.rmse.toFixed(3) }}</span>
            </div>
            <div class="text-right">
              <span class="text-[8px] font-bold opacity-50 uppercase block">Infér.</span>
              <span class="text-[10px] font-black italic">{{ m.fit_time }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Plotly from 'plotly.js-dist-min'
import { getMLPerformance } from '@/services/dataService'
import { useTheme } from 'vuetify'

const theme = useTheme()
const models = ref([])
const summary = ref({})
const importance = ref([])

const topMetrics = computed(() => ({
  "Précision Globale": (summary.value.global_r2 * 100).toFixed(2) + '%',
  "Marge d'Erreur (MAE)": summary.value.global_mae || '0',
  "Confiance Modèle": (summary.value.overall_accuracy || '0') + '%'
}))

const renderCharts = () => {
  const isDark = theme.global.current.value.dark
  const textColor = isDark ? '#E2E8F0' : '#1E293B'
  const isMobile = window.innerWidth < 768
  
  const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: textColor, family: 'Inter, sans-serif', size: isMobile ? 10 : 12 },
    margin: { t: 10, b: 30, l: 40, r: 10 },
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' }
  }

  // Score Chart
  const trainTrace = {
    x: models.value.map(m => m.model),
    y: models.value.map(m => m.r2_train),
    name: 'Train',
    type: 'bar',
    marker: { color: '#6366f1', opacity: 0.3 }
  }

  const testTrace = {
    x: models.value.map(m => m.model),
    y: models.value.map(m => m.r2_test),
    name: 'Test',
    type: 'bar',
    marker: { color: '#6366f1' }
  }

  Plotly.react('compareModelsChart', [trainTrace, testTrace], { 
    ...layoutBase, 
    barmode: 'group',
    yaxis: { range: [0.98, 1.0], gridcolor: isDark ? '#334155' : '#E2E8F0' } 
  }, { responsive: true, displayModeBar: false })

  // Importance Chart
  const importanceTrace = {
    x: importance.value.map(i => i.importance).reverse(),
    y: importance.value.map(i => i.feature).reverse(),
    type: 'bar',
    orientation: 'h',
    marker: { color: '#10b981' }
  }

  Plotly.react('importanceChart', [importanceTrace], { 
    ...layoutBase, 
    margin: { t: 10, b: 30, l: isMobile ? 80 : 140, r: 10 },
    xaxis: { gridcolor: isDark ? '#334155' : '#E2E8F0' }
  }, { responsive: true, displayModeBar: false })
}

onMounted(async () => {
  try {
    const res = await getMLPerformance()
    models.value = res.comparison || []
    summary.value = res.summary || {}
    importance.value = res.feature_importance || []
    renderCharts()
    window.addEventListener('resize', renderCharts)
  } catch (err) {
    console.error("Erreur:", err)
  }
})

watch(() => theme.global.current.value.dark, renderCharts)
</script>

<style scoped>
.v-table {
  --v-table-header-height: 48px;
}
:deep(.v-table__wrapper) {
  overflow-x: auto;
}
/* Scrollbar subtile pour mobile */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 10px;
}
</style>