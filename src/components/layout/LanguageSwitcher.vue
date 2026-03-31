<template>
  <v-menu transition="slide-y-transition" location="bottom end" :offset="12" v-model="open">
    <template #activator="{ props }">
      <button 
        v-bind="props" 
        class="flex items-center gap-2 h-8 px-3 rounded-lg border border-solid transition-all duration-200"
        :class="open 
          ? 'border-primary/40 bg-primary/10 text-primary' 
          : 'border-on-surface/10 bg-on-surface/5 text-on-surface/70 hover:border-primary/30 hover:bg-primary/5'"
      >
        <v-avatar size="18" rounded="sm" class="shrink-0">
          <v-img :src="currentLang.flag" />
        </v-avatar>
        <span class="text-[0.72rem] font-extrabold tracking-wider">{{ currentLang.short }}</span>
        <v-icon 
          size="12" 
          class="transition-transform duration-200 opacity-50"
          :class="{ 'rotate-180': open }"
        >mdi-chevron-down</v-icon>
      </button>
    </template>

    <div class="bg-surface border border-solid border-on-surface/10 rounded-xl shadow-xl p-1.5 min-w-[160px]">
      <div class="text-[0.6rem] font-black tracking-[0.1em] uppercase text-on-surface/40 px-3 py-2">
        {{ $t('language') || 'Langue' }}
      </div>
      
      <button
        v-for="lang in languages"
        :key="lang.value"
        @click="changeLanguage(lang)"
        class="flex items-center gap-3 w-full h-10 px-3 rounded-lg border-none cursor-pointer transition-colors duration-150"
        :class="currentLang.value === lang.value 
          ? 'bg-primary/10 text-primary' 
          : 'bg-transparent text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface'"
      >
        <v-avatar size="18" rounded="sm">
          <v-img :src="lang.flag" />
        </v-avatar>
        <span class="text-sm font-semibold flex-1 text-left">{{ lang.label }}</span>
        <v-icon v-if="currentLang.value === lang.value" size="14" class="ml-auto">
          mdi-check
        </v-icon>
      </button>
    </div>
  </v-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const open = ref(false)

const languages = [
  { label: 'Français', short: 'FR', value: 'fr', flag: 'https://flagcdn.com/w40/fr.png' },
  { label: 'English',  short: 'EN', value: 'en', flag: 'https://flagcdn.com/w40/gb.png' },
]

const currentLang = computed(() =>
  languages.find(l => l.value === locale.value) || languages[0]
)

const changeLanguage = (lang) => {
  locale.value = lang.value
  localStorage.setItem('user_lang', lang.value)
  open.value = false
}
</script>