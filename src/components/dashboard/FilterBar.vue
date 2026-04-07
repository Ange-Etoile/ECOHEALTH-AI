<template>
  <div v-if="options.regions.length > 0" 
       class="relative bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm mb-6 transition-all duration-300">
    
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

    <div class="flex flex-col lg:flex-row lg:items-center">
      
      <div class="flex items-center px-4 py-3 lg:h-14 lg:px-6 border-b lg:border-b-0 lg:border-r border-outline-variant bg-primary/[0.03]">
        <v-progress-circular v-if="loading" indeterminate size="14" width="2" color="primary" class="mr-3" />
        <v-icon v-else size="18" color="primary" class="mr-2">mdi-filter-variant</v-icon>
        <span class="text-[10px] font-black uppercase tracking-[0.15em] text-primary whitespace-nowrap">Filtres</span>
      </div>

      <div class="filter-cell flex-1 border-b lg:border-b-0 lg:border-r border-outline-variant">
        <v-select
          v-model="regionModel"
          :items="options.regions"
          label="Région"
          variant="plain"
          density="compact"
          class="filter-select"
          hide-details
          clearable
          placeholder="Choisir"
        />
      </div>

      <div class="filter-cell flex-[1.2] border-b lg:border-b-0 lg:border-r border-outline-variant"
           :class="{'opacity-40 grayscale pointer-events-none': !regionModel}">
        <v-select
          v-model="cityModel"
          :items="availableCities"
          :label="regionModel ? 'Ville' : 'Région requise'"
          variant="plain"
          density="compact"
          class="filter-select"
          hide-details
          :disabled="!regionModel"
          clearable
          placeholder="Toutes"
        />
      </div>

      <div class="filter-cell flex-1 lg:max-w-[120px]">
        <v-select
          v-model="yearModel"
          :items="options.annees"
          label="Année"
          variant="plain"
          density="compact"
          class="filter-select"
          hide-details
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  options: { regions: string[], citiesData: Record<string, string[]>, annees: any[] },
  loading: boolean,
  modelValue: { region: any, city: any, year: any }
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const availableCities = computed(() => {
  if (!props.modelValue.region || !props.options.citiesData) return []
  return props.options.citiesData[props.modelValue.region] || []
})

const regionModel = computed({
  get: () => props.modelValue.region,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, region: val, city: null })
    emit('change')
  }
})

const cityModel = computed({
  get: () => props.modelValue.city,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, city: val })
    emit('change')
  }
})

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
  padding: 4px 16px;
  min-height: 56px;
  transition: background 0.2s ease;
}

@media (min-width: 1024px) {
  .filter-cell {
    min-height: 56px;
    padding: 0 20px;
  }
}

.filter-cell:hover:not(.opacity-40) { 
  background: rgba(var(--v-theme-primary), 0.02); 
}

/* Taille de texte revue et correction de visibilité */
.filter-select :deep(.v-field__input) {
  font-size: 0.85rem !important; 
  font-weight: 700 !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 1 !important; /* Force la visibilité */
  padding: 4px 0 !important;
  display: flex;
  align-items: center;
}

/* Correction spécifique pour l'affichage de la valeur sélectionnée */
.filter-select :deep(.v-select__selection-text) {
  color: rgb(var(--v-theme-on-surface)) !important;
}

.filter-select :deep(.v-label) {
  font-size: 0.65rem !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 800 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.filter-select :deep(.v-field__outline) { display: none !important; }

/* Placeholder plus discret */
.filter-select :deep(input::placeholder) {
  font-size: 0.8rem;
  opacity: 0.4;
}
</style>