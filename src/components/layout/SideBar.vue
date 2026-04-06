<template>
  <v-navigation-drawer
    app
    v-model="drawerModel"
    :rail="!mobile && isRail"
    :permanent="!mobile"
    :temporary="mobile"
    width="264"
    rail-width="72"
    class="sidebar-container !border-none"
  >
    <div class="relative z-10 flex flex-col h-full overflow-hidden">
      
      <div 
        class="flex items-center h-20 px-5 transition-all duration-300"
        :class="{ 'justify-center !px-0': isRail && !mobile }"
      >
        <div class="relative shrink-0 w-9 h-9 group">
          <div class="w-9 h-9 rounded-xl border border-primary/35 bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-105">
            <v-icon color="primary" size="22">mdi-leaf</v-icon>
          </div>
          <div class="absolute -inset-1 rounded-[14px] border border-primary/20 animate-pulse"></div>
        </div>

        <Transition name="brand-reveal">
          <div v-show="!isRail || mobile" class="ml-3.5 flex flex-col whitespace-nowrap overflow-hidden">
            <span class="text-[0.95rem] font-black text-on-surface leading-tight tracking-tight">EcoHealth</span>
            <span class="text-[0.55rem] font-bold tracking-[0.2em] text-primary uppercase opacity-90">AI PLATFORM</span>
          </div>
        </Transition>
      </div>

      <div class="h-px bg-on-surface/5 mx-4 shrink-0"></div>

      <div class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
        <nav class="flex flex-col gap-1">
          <template v-for="(item, i) in menuItems" :key="i">
  
            <div
              v-if="item.heading && (!isRail || mobile)"
              class="text-[0.6rem] font-black tracking-[0.15em] text-on-surface/40 px-3 py-4 uppercase"
            >
              {{ item.heading }}
            </div>

            <div v-else-if="item.heading && isRail && !mobile" class="h-px bg-on-surface/5 my-4 mx-2"></div>

            <NavGroup
              v-else-if="item.children"
              :item="item"
              :is-rail="isRail && !mobile"
            />

            <NavLink
              v-else
              :item="item"
              :is-rail="isRail && !mobile"
              @click="handleNavClick"
            />

          </template>
        </nav>
      </div>

      <div class="p-3 mt-auto shrink-0" :class="{ 'flex flex-col items-center': isRail && !mobile }">
        <div class="h-px bg-on-surface/5 mb-4 mx-1 w-full"></div>
        
        <button 
          class="flex items-center gap-3 w-full h-10 px-3 rounded-xl border-none bg-transparent text-on-surface/40 hover:bg-error/10 hover:text-error transition-all duration-200 group relative"
          :class="{ 'justify-center !px-0 !w-10': isRail && !mobile }"
          @click="logout"
        >
          <v-icon size="18" class="shrink-0">mdi-power</v-icon>
          <span v-if="!isRail || mobile" class="text-[0.75rem] font-bold tracking-wide">Déconnexion</span>
          
          <v-tooltip v-if="isRail && !mobile" activator="parent" location="right">
            Déconnexion
          </v-tooltip>
        </button>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import NavLink from '@/components/layout/NavItem.vue'
import NavGroup from '@/components/layout/NavGroup.vue'

const props = defineProps(['isRail', 'modelValue'])
const emit = defineEmits(['update:modelValue'])

const { mobile } = useDisplay()

const drawerModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
const menuItems = [
  { heading: 'ANALYSE' },
  { 
  title: 'Tableau de Bord', 
  icon: 'mdi-view-dashboard-outline', 
    children: [
      { 
        title: 'Vue d’Ensemble', 
        to: '/', 
        icon: 'mdi-monitor-dashboard' 
      },
      { 
        title: 'Cycles de Pollution', 
        to: '/cycles', 
        icon: 'mdi-sync' 
      },
      { 
        title: 'Surveillance Spatiale', 
        to: '/map', 
        icon: 'mdi-map-marker-radius' 
      },
      { 
        title: 'Analyse Climatique', 
        to: '/correlations', 
        icon: 'mdi-chart-scatter-plot' 
      },
      { 
        title: 'Bilan Hydrique', 
        to: '/sunshine-hydric', 
        icon: 'mdi-weather-sunny-alert' 
      }
    ]
  },
  { title: 'Cartographie Régionaux',  icon: 'mdi-map-search-outline',      to: '/regional-benchmark' },
  { heading: 'MODELS' },
  { title: 'Performance IA', to: '/performance-ia', icon: 'mdi-brain' },
  { heading: 'INTELLIGENCE' },
  { title: 'IA Santé',      icon: 'mdi-brain-outline',           to: '/health' },
  { title: 'Alertes Pollution', icon: 'mdi-alert-circle-outline', to: '/alerts', badge: 3 },
  { heading: 'L\'ÉQUIPE' }, 
  { title: 'À Propos',      icon: 'mdi-account-group-outline',   to: '/about' },
  { heading: 'SYSTÈME' },
  { title: 'Documentation',     icon: 'mdi-file-document-outline',   to: '/documentation' },
]

const handleNavClick = () => {
  if (mobile.value) {
    drawerModel.value = false 
  }
}

const logout = () => console.log('Déconnexion logic...')
</script>

<style scoped>
/* Le dégradé signature de la Sidebar */
.sidebar-container {
  background: linear-gradient(
    170deg,
    rgb(var(--v-theme-sidebar-start)) 0%,
    rgb(var(--v-theme-sidebar-mid)) 50%,
    rgb(var(--v-theme-sidebar-end)) 100%
  ) !important;
}

/* Texture subtile en overlay */
.sidebar-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

/* Transitions pour le texte du logo */
.brand-reveal-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.brand-reveal-leave-active { transition: opacity 0.1s ease; }
.brand-reveal-enter-from { opacity: 0; transform: translateX(-10px); }

/* Scrollbar personnalisée discrète */
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.15);
  border-radius: 10px;
}
</style>