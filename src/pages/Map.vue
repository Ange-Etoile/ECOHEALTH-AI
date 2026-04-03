<template>
  <div class="space-y-8 p-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-3xl font-black text-on-surface tracking-tighter italic">Test Interface Dashboard</h2>
      <p class="text-sm text-on-surface/50 font-medium">Validation des composants KPI avec Iconify (Weather Icons)</p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <KPICard 
        label="Température Moyenne"
        value="29.2"
        unit="°C"
        icon="temp" 
        status="Climat Tropical"
        color="primary"
      />

      <KPICard 
        label="Cumul Pluie"
        value="12.5"
        unit="mm"
        icon="rain" 
        status="Saison des pluies"
        color="success"
      />

      <KPICard 
        label="Évapotranspiration"
        value="4.65"
        unit="mm"
        icon="drought" 
        status="Sol Sec"
        color="warning"
      />

      <KPICard 
        label="Vitesse Vent"
        value="21.9"
        unit="km/h"
        icon="wind" 
        status="Stable"
        color="primary"
      />

    </div>

    <v-alert
      type="info"
      variant="tonal"
      class="mt-10 rounded-xl border border-primary/20"
      icon="mdi-information-outline"
    >
      <div class="text-xs font-bold uppercase tracking-widest mb-1">Note de développement</div>
      Les icônes sont maintenant gérées par <strong>Iconify</strong>. Les données seront bientôt synchronisées avec <strong>dataset_final_indabax.csv</strong>.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import KPICard from '@/components/dashboard/KPICard.vue'
</script>