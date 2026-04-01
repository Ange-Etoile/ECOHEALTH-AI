<template>
  <div class="flex items-center">
    <button 
      @click="toggleTheme"
      class="group relative flex items-center transition-all duration-300 shadow-sm
             p-1 rounded-full border
             lg:gap-3 lg:px-3 lg:py-1.5 lg:rounded-xl"
      :class="isDark 
        ? 'bg-[#1c1f26] border-white/10 hover:border-primary/50' 
        : 'bg-slate-100 border-slate-200 hover:border-amber-400'"
    >
      <div 
        class="relative w-9 h-5 lg:w-10 lg:h-5 rounded-full transition-colors duration-300"
        :class="isDark ? 'bg-primary/20' : 'bg-slate-300'"
      >
        <div 
          class="absolute top-1 w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm"
          :class="isDark 
            ? 'left-5 lg:left-6 bg-primary shadow-primary/50' 
            : 'left-1 bg-white'"
        >
          <i class="mdi text-[8px]" 
             :class="isDark ? 'mdi-weather-night text-white' : 'mdi-white-balance-sunny text-amber-500'">
          </i>
        </div>
      </div>

      <span 
        class="hidden lg:block text-[10px] font-black uppercase tracking-widest transition-colors duration-300 whitespace-nowrap"
        :class="isDark ? 'text-slate-400 group-hover:text-primary' : 'text-slate-500 group-hover:text-amber-600'"
      >
        {{ isDark ? 'Sombre' : 'Clair' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const updateTailwind = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleTheme = () => {
  const newValue = !isDark.value
  theme.global.name.value = newValue ? 'dark' : 'light'
  updateTailwind(newValue)
  localStorage.setItem('user_theme', theme.global.name.value)
}

onMounted(() => {
  const saved = localStorage.getItem('user_theme') || 'light'
  theme.global.name.value = saved
  updateTailwind(saved === 'dark')
})
</script>