<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 md:p-6 text-on-surface">
    
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-outline-variant pb-8">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
          <v-icon size="small" color="primary">mdi-brain</v-icon> Benchmarking des Modèles
        </div>
        <h2 class="text-xl md:text-6xl font-black tracking-tighter uppercase leading-none">
          Évaluation <span class="text-primary italic">IA</span>
        </h2>
        <p class="text-xs md:text-sm opacity-70 font-medium">
          Comparaison multi-modèles et analyse de la hiérarchie des variables.
        </p>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(val, label) in topMetrics" :key="label" 
           class="p-6 rounded-[1.5rem] bg-surface border border-outline-variant shadow-sm flex items-center justify-between">
        <div>
          <span class="text-[10px] font-black uppercase opacity-50 block mb-1">{{ label }}</span>
          <span class="text-3xl font-black text-primary">{{ val }}</span>
        </div>
        <v-icon size="40" class="opacity-10" color="primary">mdi-seal-variant</v-icon>
      </div>
    </div>

    <v-row>
      <v-col cols="12" lg="7">
        <v-card variant="outlined" class="rounded-[2rem] border-outline-variant bg-surface p-6 h-[450px]">
          <h3 class="text-xs font-black uppercase mb-4 flex items-center gap-2">
            <v-icon color="secondary" size="small">mdi-compare</v-icon> Comparaison de Précision (R²)
          </h3>
          <div id="compareModelsChart" class="w-full h-[calc(100%-3rem)]"></div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card variant="outlined" class="rounded-[2rem] border-outline-variant bg-surface p-6 h-[450px]">
          <h3 class="text-xs font-black uppercase mb-4 flex items-center gap-2">
            <v-icon color="primary" size="small">mdi-lightning-bolt</v-icon> Facteurs Décisifs
          </h3>
          <div id="importanceChart" class="w-full h-[calc(100%-3rem)]"></div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="rounded-[2rem] border-outline-variant bg-surface overflow-hidden">
      <v-table class="bg-transparent">
        <thead>
          <tr class="text-[10px] uppercase font-black opacity-50">
            <th class="text-left px-6">Architecture</th>
            <th class="text-center">MAE (Err.)</th>
            <th class="text-center">RMSE</th>
            <th class="text-center">Temps d'infér.</th>
          </tr>
        </thead>
        <tbody class="text-xs font-bold uppercase">
          <tr v-for="m in models" :key="m.model" class="border-t border-outline-variant">
            <td class="px-6 py-4">{{ m.model }}</td>
            <td class="text-center">{{ m.mae }}</td>
            <td class="text-center">{{ m.rmse }}</td>
            <td class="text-center text-primary italic">{{ m.fit_time }}s</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Plotly from 'plotly.js-dist-min'
import { getMLPerformance } from '@/services/dataService'
import { useTheme } from 'vuetify'

const theme = useTheme()
const models = ref([])
const summary = ref({})
const importance = ref([])

const topMetrics = computed(() => ({
  "Champion": summary.value.best_model || '---',
  "Précision (Test)": summary.value.global_r2 || '0',
  "Taux d'Alerte": (summary.value.overall_accuracy || '0') + '%'
}))

const renderCharts = () => {
  const isDark = theme.global.current.value.dark
  const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: isDark ? '#fff' : '#000', family: 'Inter, sans-serif' },
    margin: { t: 20, b: 40, l: 40, r: 20 },
    legend: { orientation: 'h', y: 1.1 }
  }

  // Graphique Comparatif : Barres groupées Train vs Test
  const trainTrace = {
    x: models.value.map(m => m.model),
    y: models.value.map(m => m.r2_train),
    name: 'Score Entraînement',
    type: 'bar',
    marker: { color: '#6366f1', opacity: 0.4 }
  }

  const testTrace = {
    x: models.value.map(m => m.model),
    y: models.value.map(m => m.r2_test),
    name: 'Score Test (Réel)',
    type: 'bar',
    marker: { color: '#6366f1' }
  }

  Plotly.react('compareModelsChart', [trainTrace, testTrace], { 
    ...layoutBase, 
    barmode: 'group',
    yaxis: { range: [0.7, 1.0], gridcolor: '#333' }
  }, { responsive: true, displayModeBar: false })

  // Graphique Feature Importance
  const importanceTrace = {
    x: importance.value.map(i => i.importance),
    y: importance.value.map(i => i.feature),
    type: 'bar',
    orientation: 'h',
    marker: { color: '#10b981' }
  }

  Plotly.react('importanceChart', [importanceTrace], { 
    ...layoutBase, 
    margin: { t: 10, b: 40, l: 120, r: 20 } 
  }, { responsive: true, displayModeBar: false })
}

onMounted(async () => {
  const res = await getMLPerformance()
  models.value = res.comparison
  summary.value = res.summary
  importance.value = res.feature_importance
  renderCharts()
})
</script>

<style scoped>
</style>