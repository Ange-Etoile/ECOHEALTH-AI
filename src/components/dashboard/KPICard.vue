<template>
  <v-card 
    variant="flat" 
    class="kpi-card relative overflow-hidden rounded-[24px] border border-on-surface/5 p-4 sm:p-5 transition-all duration-300 hover:translate-y-[-4px] h-full flex flex-col justify-between"
    :style="{ background: 'linear-gradient(135deg, rgba(var(--v-theme-surface), 0.9) 0%, rgba(var(--v-theme-surface), 0.4) 100%)' }"
  >
    <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>

    <div class="flex items-start justify-between gap-4 relative z-10 w-full">
      
      <div class="flex flex-col flex-1 min-w-0">
        <span class="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface/40 leading-tight mb-2 break-words">
          {{ label }}
        </span>
        
        <div class="flex items-baseline flex-wrap gap-1">
          <span class="text-2xl sm:text-3xl font-black tracking-tighter text-on-surface truncate">
            {{ value }}
          </span>
          <span v-if="unit" class="text-xs font-bold text-on-surface/30 lowercase">
            {{ unit }}
          </span>
        </div>
      </div>

      <div class="shrink-0 p-2.5 sm:p-3 rounded-2xl bg-on-surface/5 border border-on-surface/5 shadow-inner flex items-center justify-center">
        <Icon 
          :icon="weatherIcon" 
          :class="statusTextClass"
          class="text-[30px] sm:text-[38px]" 
        />
      </div>
    </div>

    <div class="mt-4 sm:mt-6 flex items-center gap-2 relative z-10">
      <div 
        class="h-2 w-2 rounded-full animate-pulse"
        :class="statusColorClass"
      ></div>
      <span class="text-[10px] font-extrabold uppercase tracking-widest truncate" :class="statusTextClass">
        {{ status }}
      </span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  label: string
  value: string | number
  unit?: string
  icon: string
  status: string
  color?: 'success' | 'warning' | 'error' | 'primary'
}>()

// Dans KPICard.vue
const weatherIcon = computed(() => {
  const map: Record<string, string> = {
    'temp': 'wi:thermometer',
    'dust': 'wi:dust',     
    'molecule': 'wi:dust', 
    'wind': 'wi:strong-wind',
    'drought': 'wi:hot',
    'sun': 'wi:day-sunny',
    'rain': 'wi:rain'
  }
  if (props.icon.includes(':')) return props.icon
  return map[props.icon] || 'wi:na'
})

// Gestion dynamique des couleurs
const statusColorClass = computed(() => {
  switch (props.color) {
    case 'success': return 'bg-emerald-500'
    case 'warning': return 'bg-amber-500'
    case 'error': return 'bg-rose-500'
    default: return 'bg-primary'
  }
})

const statusTextClass = computed(() => {
  switch (props.color) {
    case 'success': return 'text-emerald-500'
    case 'warning': return 'text-amber-500'
    case 'error': return 'text-rose-500'
    default: return 'text-primary'
  }
})
</script>

<style scoped>
.kpi-card {
  backdrop-filter: blur(12px);
  /* Assure que la carte a une taille minimum mais peut grandir */
  min-height: 140px;
}
.kpi-card:hover {
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

/* On s'assure que le texte ne casse pas le layout sur de très petits écrans */
.break-words {
  word-wrap: break-word;
  white-space: normal;
}
</style>