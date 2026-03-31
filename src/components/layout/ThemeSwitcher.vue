<template>
  <div class="inline-flex items-center">
    <button
      class="inline-flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg border border-solid transition-all duration-200 group"
      :class="isDark 
        ? 'border-primary/30 bg-primary/10' 
        : 'border-on-surface/10 bg-on-surface/5 hover:border-primary/30 hover:bg-primary/5'"
      @click="toggle"
      :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    >
      <div 
        class="w-[28px] h-[18px] rounded-full relative shrink-0 transition-colors duration-300"
        :class="isDark ? 'bg-primary/30' : 'bg-on-surface/10'"
      >
        <div 
          class="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-surface flex items-center justify-center shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :class="isDark ? 'left-[12px] text-primary' : 'left-[2px] text-orange-500'"
        >
          <v-icon size="10">{{ isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
        </div>
      </div>
      
      <span class="text-[0.72rem] font-bold tracking-tight text-on-surface/60 group-hover:text-on-surface transition-colors">
        {{ isDark ? 'Sombre' : 'Clair' }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

// Fonction magique pour synchroniser Tailwind avec Vuetify
const syncTailwind = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggle = () => {
  const nextTheme = isDark.value ? 'light' : 'dark'
  theme.global.name.value = nextTheme
  localStorage.setItem('user_theme', nextTheme)
  syncTailwind(nextTheme === 'dark')
}

// Au chargement, on vérifie la préférence stockée
onMounted(() => {
  const savedTheme = localStorage.getItem('user_theme') || 'dark'
  theme.global.name.value = savedTheme
  syncTailwind(savedTheme === 'dark')
})
</script>