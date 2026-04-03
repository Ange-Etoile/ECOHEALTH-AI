<template>
  <v-app>
    <SideBar 
      v-model="drawer" 
      :is-rail="isRail" 
    />

    <v-main class="bg-[#F8FAFB] dark:bg-[#060F0E] transition-colors duration-500">
      <div class="flex flex-col h-screen overflow-hidden">
        
        <header 
          class="flex-none h-16 min-h-[64px] flex items-center justify-between px-4 md:px-8 bg-surface/80 backdrop-blur-md sticky top-0 z-20 border-b border-on-surface/5"
        >
          <div class="flex items-center gap-4 h-full">
            <button 
              v-if="mobile"
              @click="drawer = !drawer"
              class="p-2 rounded-lg bg-on-surface/5 text-on-surface/70 hover:bg-on-surface/10 transition-colors"
            >
              <v-icon size="20">mdi-menu</v-icon>
            </button>
            
            <RailToggle 
              v-else 
              :is-rail="isRail" 
              @toggle="isRail = !isRail" 
            />

            <h1 class="text-sm md:text-base font-black text-on-surface tracking-tight ml-2 truncate max-w-[150px] md:max-w-none">
              {{ currentRouteName }}
            </h1>
          </div>

          <div class="flex items-center gap-2 md:gap-4 h-full">
            <div class="flex items-center justify-center min-w-[40px]">
              <LanguageSwitcher />
            </div>
            
            <div class="flex items-center justify-center min-w-[40px]">
              <ThemeSwitcher />
            </div>

            <div class="h-6 w-px bg-on-surface/10 mx-1 hidden md:block"></div>
            
            <div class="flex items-center">
              <UserProfile @logout="handleLogout" />
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <router-view v-slot="{ Component }">
            <transition 
              name="page-fade" 
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>

          <footer class="mt-12 mb-4 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">
            EcoHealth AI • Douala, Cameroun • 2026
          </footer>
        </div>

      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

// Import de tes composants
import SideBar from '@/components/layout/SideBar.vue'
import RailToggle from '@/components/layout/RailToggle.vue'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
import UserProfile from '@/components/layout/UserProfile.vue'

const { mobile } = useDisplay()
const route = useRoute()

const drawer = ref(true)
const isRail = ref(false)

const currentRouteName = computed(() => {
  return route.name ? String(route.name).toUpperCase() : 'ECOHEALTH PLATFORM'
})

const handleLogout = () => {
  console.log("Déconnexion en cours...")
}
</script>

<style scoped>
/* Correction de la hauteur et stabilité */
header {
  /* flex-none empêche le header de rétrécir si le contenu central est trop grand */
  flex: 0 0 64px; 
}

/* Transition de page */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.25s ease-out;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Scrollbar élégante pour la zone de contenu */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.2);
}

:deep(.v-main) {
  height: 100vh;
  overflow: hidden;
}
</style>