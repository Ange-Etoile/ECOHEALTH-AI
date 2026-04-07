<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 md:p-6 text-on-surface bg-background">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-8">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
          <v-icon size="small" color="primary">mdi-shield-check</v-icon> Validation de l'Architecture
        </div>
        <h2 class="text-xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          Performance <span class="text-primary italic">Modèles</span>
        </h2>
        <p class="text-xs md:text-sm opacity-70 font-medium">
          Analyse des métriques après optimisation par GridSearchCV (CV=5).
        </p>
      </div>
      
      <div class="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-outline-variant">
        <v-icon size="32" color="success">mdi-check-decagram</v-icon>
        <div>
          <p class="text-[10px] uppercase font-bold opacity-50 leading-none">Modèle Champion</p>
          <p class="text-lg font-black text-success">{{ summary.best_model }}</p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(val, label) in topMetrics" :key="label" 
           class="p-6 rounded-[1.5rem] bg-surface border border-outline-variant shadow-sm relative overflow-hidden">
        <span class="text-[10px] font-black uppercase opacity-50 block mb-1">{{ label }}</span>
        <span class="text-3xl font-black text-primary">{{ val }}</span>
        <v-icon size="60" class="absolute -right-4 -bottom-4 opacity-[0.03]" color="primary">mdi-chart-line</v-icon>
      </div>
    </div>

    <v-row>
      <v-col cols="12" lg="7">
        <v-card variant="outlined" class="rounded-[2rem] border-outline-variant bg-surface p-6 h-[450px]">
          <h3 class="text-xs font-black uppercase mb-4 flex items-center gap-2">
            <v-icon color="secondary" size="small">mdi-poll</v-icon> Fidélité du Score (R² Test)
          </h3>
          <div id="compareModelsChart" class="w-full h-[calc(100%-3rem)]"></div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card variant="outlined" class="rounded-[2rem] border-outline-variant bg-surface p-6 h-[450px]">
          <h3 class="text-xs font-black uppercase mb-4 flex items-center gap-2">
            <v-icon color="primary" size="small">mdi-flash</v-icon> Variables Prédictives
          </h3>
          <div id="importanceChart" class="w-full h-[calc(100%-3rem)]"></div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="rounded-[2rem] border-outline-variant bg-surface overflow-hidden">
      <div class="p-6 border-b border-outline-variant flex justify-between items-center">
        <h3 class="text-xs font-black uppercase">Matrice de validation détaillée</h3>
        <v-chip size="x-small" color="primary" variant="flat">Optimisé</v-chip>
      </div>
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
  
  const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: textColor, family: 'Inter, sans-serif' },
    margin: { t: 10, b: 30, l: 40, r: 10 },
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' }
  }

  // Barres groupées Train vs Test (Scores R2)
  const trainTrace = {
    x: models.value.map(m => m.model),
    y: models.value.map(m => m.r2_train),
    name: 'Entraînement',
    type: 'bar',
    marker: { color: '#6366f1', opacity: 0.3 }
  }

  const testTrace = {
    x: models.value.map(m => m.model),
    y: models.value.map(m => m.r2_test),
    name: 'Test (Réel)',
    type: 'bar',
    marker: { color: '#6366f1' }
  }

  Plotly.react('compareModelsChart', [trainTrace, testTrace], { 
    ...layoutBase, 
    barmode: 'group',
    yaxis: { range: [0.98, 1.0], gridcolor: isDark ? '#334155' : '#E2E8F0' } 
  }, { responsive: true, displayModeBar: false })

  // Feature Importance (Horizontal)
  const importanceTrace = {
    x: importance.value.map(i => i.importance).reverse(),
    y: importance.value.map(i => i.feature).reverse(),
    type: 'bar',
    orientation: 'h',
    marker: { 
      color: '#10b981',
      line: { width: 1, color: isDark ? '#059669' : '#fff' }
    }
  }

  Plotly.react('importanceChart', [importanceTrace], { 
    ...layoutBase, 
    margin: { t: 10, b: 30, l: 140, r: 10 },
    xaxis: { gridcolor: isDark ? '#334155' : '#E2E8F0' }
  }, { responsive: true, displayModeBar: false })
}

onMounted(async () => {
  try {
    const res = await getMLPerformance()
    models.value = res.comparison
    summary.value = res.summary
    importance.value = res.feature_importance
    renderCharts()
  } catch (err) {
    console.error("Erreur de chargement des métriques:", err)
  }
})

// Réactualiser si le thème change
watch(() => theme.global.current.value.dark, renderCharts)
</script>