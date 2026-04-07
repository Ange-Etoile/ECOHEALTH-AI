<template>
  <div 
    class="relative  overflow-hidden rounded-2xl border p-4 flex flex-col justify-between h-full transition-colors duration-300 bg-surface text-on-surface"
    :class="[colorStyle.card]"
  >
    <div 
      class="absolute top-[-20px] right-[-20px] w-16 h-16 rounded-full blur-3xl opacity-20 dark:opacity-30 pointer-events-none"
      :class="colorStyle.glow"
    ></div>
    
    <div 
      v-if="icon" 
      class="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 dark:opacity-20 pointer-events-none"
    >
      <i :class="['mdi', icon, 'text-3xl', colorStyle.num]"></i>
    </div>

    <div class="relative z-10">
      <p class="text-[10px] font-bold uppercase tracking-[0.12em] opacity-60 dark:text-white/35 mb-1.5">
        {{ label }}
      </p>

      <div v-if="loading" class="h-9 w-20 rounded-md bg-on-surface/10 animate-pulse"></div>

      <div v-else class="flex items-baseline gap-1">
        <span class="text-lg font-black leading-none" :class="colorStyle.num">
          {{ value ?? '–' }}
        </span>
        <span v-if="unit" class="text-xs opacity-50 dark:text-white/35 font-medium">
          {{ unit }}
        </span>
      </div>
    </div>

    <p class="text-[10px] opacity-60 dark:text-white/35 mt-1.5 font-medium relative z-10">
      {{ sub }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  unit: String,
  color: String,
  sub: String,
  loading: Boolean,
  icon: String
})

// Adaptation des couleurs pour qu'elles "claquent" dans les deux modes
const colorMap = {
  green:  { card: 'border-green-500/20 dark:border-green-500/15',  glow: 'bg-green-500',  num: 'text-green-600 dark:text-green-400'  },
  yellow: { card: 'border-yellow-500/20 dark:border-yellow-500/15', glow: 'bg-yellow-400', num: 'text-yellow-600 dark:text-yellow-400' },
  orange: { card: 'border-orange-500/20 dark:border-orange-500/15', glow: 'bg-orange-500', num: 'text-orange-600 dark:text-orange-400' },
  red:    { card: 'border-red-500/20 dark:border-red-500/15',    glow: 'bg-red-500',    num: 'text-red-600 dark:text-red-400'    },
  blue:   { card: 'border-blue-500/20 dark:border-blue-500/15',   glow: 'bg-blue-500',   num: 'text-blue-600 dark:text-blue-400'   },
  purple: { card: 'border-purple-500/20 dark:border-purple-500/15', glow: 'bg-purple-500', num: 'text-purple-600 dark:text-purple-400' },
  gray:   { card: 'border-on-surface/10 dark:border-white/[0.07]',  glow: 'bg-on-surface/20 dark:bg-white/20',   num: 'text-on-surface dark:text-white'      },
}

const colorStyle = computed(() => {
  return colorMap[props.color] || colorMap.gray
})
</script>