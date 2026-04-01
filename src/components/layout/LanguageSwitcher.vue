<template>
  <div class="relative lang-container">
    <button 
      @click="open = !open"
      class="flex items-center h-10 px-3 rounded-lg border transition-all duration-300"
      :class="isDark 
        ? (open ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 text-slate-300') 
        : (open ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-white text-slate-600')"
    >
      <div class="flex items-center gap-2">
        <img :src="currentLang.flag" class="w-4 h-3 object-cover rounded-sm shadow-sm" />
        <span class="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">{{ currentLang.short }}</span>
        <i class="mdi mdi-chevron-down text-sm transition-transform duration-300" :class="{ 'rotate-180': open }"></i>
      </div>
    </button>

    <transition name="pop">
      <div v-if="open" 
           class="absolute right-0 mt-3 w-40 rounded-2xl shadow-2xl z-[110] overflow-hidden border transition-all"
           :class="isDark ? 'bg-[#1c1f26] border-white/10' : 'bg-white border-slate-100'">
        <div class="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-b" :class="isDark ? 'border-white/5' : 'border-slate-50'">
          Language
        </div>
        <div class="p-1.5">
          <button
            v-for="lang in languages" :key="lang.value"
            @click="changeLanguage(lang)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[11px] font-bold text-left mb-1 last:mb-0"
            :class="currentLang.value === lang.value 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-primary')"
          >
            <img :src="lang.flag" class="w-4 h-3 object-cover rounded-sm" />
            <span class="flex-1">{{ lang.label }}</span>
            <i v-if="currentLang.value === lang.value" class="mdi mdi-check-circle text-xs"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const { locale } = useI18n()
const open = ref(false)

const languages = [
  { label: 'Français', short: 'FR', value: 'fr', flag: 'https://flagcdn.com/w40/fr.png' },
  { label: 'English',  short: 'EN', value: 'en', flag: 'https://flagcdn.com/w40/gb.png' },
]

const currentLang = computed(() => languages.find(l => l.value === locale.value) || languages[0])

const changeLanguage = (lang: any) => {
  locale.value = lang.value
  localStorage.setItem('user_lang', lang.value)
  open.value = false
}

const handleOutsideClick = (e: MouseEvent) => {
  if (!(e.target as Element).closest('.lang-container')) open.value = false
}

onMounted(() => window.addEventListener('click', handleOutsideClick))
onUnmounted(() => window.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.pop-enter-active, .pop-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.95) translateY(-10px); }
</style>