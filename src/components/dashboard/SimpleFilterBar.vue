<template>
  <div v-if="options.regions.length > 0" 
       class="relative flex flex-wrap items-stretch bg-[#0d0f18]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl mb-8">
    
    <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

    <div class="hidden lg:flex items-center px-6 border-r border-white/[0.05] bg-white/[0.02]">
      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Filters</span>
    </div>

    <div class="filter-cell flex-1 min-w-[200px] border-r border-white/[0.05]">
      <div class="cell-icon">
        <span class="iconify text-primary/60 text-xl" data-icon="solar:map-point-wave-bold-duotone"></span>
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
        placeholder="National"
      />
    </div>

    <div class="filter-cell w-[180px] border-r border-white/[0.05]">
      <div class="cell-icon">
        <span class="iconify text-primary/60 text-xl" data-icon="solar:calendar-bold-duotone"></span>
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

    <div class="flex items-center px-6 bg-primary/[0.03]">
      <v-progress-circular v-if="loading" indeterminate size="18" width="2" color="primary" />
      <div v-else class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
        <span class="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Sync Space</span>
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
  padding: 0 16px;
  gap: 12px;
  transition: all 0.2s ease;
}
.filter-cell:hover { background: rgba(255, 255, 255, 0.02); }
.cell-icon { display: flex; align-items: center; }

.filter-select :deep(.v-field__input) {
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: #fff !important;
  padding: 14px 0 !important;
}
.filter-select :deep(.v-label) {
  font-size: 0.65rem !important;
  color: rgba(255,255,255,0.3) !important;
  font-weight: 900 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.filter-select :deep(.v-field__outline) { display: none !important; }
</style>