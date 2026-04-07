<template>
  <div v-if="options.regions.length > 0" 
       class="relative flex flex-col lg:flex-row items-stretch bg-surface border border-outline-variant rounded-[24px] md:rounded-2xl overflow-hidden shadow-sm mb-8 transition-all duration-300">
    
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

    <div class="flex items-center px-6 py-3 lg:py-0 border-b lg:border-b-0 lg:border-r border-outline-variant bg-primary/[0.03]">
      <v-icon size="small" color="primary" class="mr-2">mdi-brain-outline</v-icon>
      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Filters</span>
    </div>

    <div class="filter-cell flex-1 min-w-[200px] border-b lg:border-b-0 lg:border-r border-outline-variant">
      <div class="cell-icon hidden sm:flex">
        <v-icon size="22" color="primary" class="opacity-60">mdi-map-marker-path</v-icon>
      </div>
      <v-select
        v-model="regionModel"
        :items="options.regions"
        label="Secteur Géographique"
        variant="plain"
        density="compact"
        class="filter-select"
        hide-details
        clearable
        placeholder="National (Cameroun)"
      />
    </div>

    <div class="filter-cell w-full lg:w-[180px] border-b lg:border-b-0 lg:border-r border-outline-variant">
      <div class="cell-icon hidden sm:flex">
        <v-icon size="22" color="primary" class="opacity-60">mdi-calendar-clock</v-icon>
      </div>
      <v-select
        v-model="yearModel"
        :items="options.annees"
        label="Période"
        variant="plain"
        density="compact"
        class="filter-select"
        hide-details
      />
    </div>

    <div class="flex items-center justify-center px-6 py-4 lg:py-0 bg-primary/[0.02] min-w-[130px]">
      <v-progress-circular v-if="loading" indeterminate size="18" width="2" color="primary" />
      <div v-else class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        <span class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Sync Space</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  options: { regions: string[], annees: any[] },
  loading: boolean,
  modelValue: { region: any, year: any }
}>()

const emit = defineEmits(['update:modelValue', 'change'])

// Gestion de la Région
const regionModel = computed({
  get: () => props.modelValue.region,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, region: val })
    emit('change')
  }
})

// Gestion de l'Année
const yearModel = computed({
  get: () => props.modelValue.year,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, year: val })
    emit('change')
  }
})
</script>

<style scoped>
.filter-cell {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 12px;
  transition: all 0.2s ease;
  min-height: 68px;
}

@media (min-width: 1024px) {
  .filter-cell {
    padding: 0 20px;
    min-height: auto;
  }
}

.filter-cell:hover { 
  background: rgba(var(--v-theme-primary), 0.03); 
}

.cell-icon { 
  display: flex; 
  align-items: center; 
  justify-content: center;
}

/* Typography & Adapative Colors */
.filter-select :deep(.v-field__input) {
  font-size: 0.85rem !important;
  font-weight: 800 !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  padding: 14px 0 !important;
}

.filter-select :deep(.v-label) {
  font-size: 0.65rem !important;
  color: rgb(var(--v-theme-on-surface), 0.5) !important;
  font-weight: 900 !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.filter-select :deep(.v-field__outline) { 
  display: none !important; 
}

/* Style spécifique au placeholder pour qu'il ne soit pas trop sombre */
.filter-select :deep(input::placeholder) {
  color: rgb(var(--v-theme-on-surface), 0.3) !important;
  opacity: 1;
}
</style>