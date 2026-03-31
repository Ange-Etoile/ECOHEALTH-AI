<template>
  <v-app>
    <SideBar 
      v-model="drawer" 
      :is-rail="isRail" 
    />

    <v-main class="bg-[#F8FAFB] dark:bg-[#060F0E] transition-colors duration-500">
      <div class="flex flex-col h-full min-h-screen">
        
        <header 
          class="h-16 flex items-center justify-between px-4 md:px-8 bg-surface/80 backdrop-blur-md sticky top-0 z-20 border-b border-on-surface/5"
        >
          <div class="flex items-center gap-4">
            <button 
              v-if="mobile"
              @click="drawer = !drawer"
              class="p-2 rounded-lg bg-on-surface/5 text-on-surface/70"
            >
              <v-icon size="20">mdi-menu</v-icon>
            </button>
            
            <RailToggle 
              v-else 
              :is-rail="isRail" 
              @toggle="isRail = !isRail" 
            />

            <h1 class="text-sm md:text-base font-bold text-on-surface tracking-tight ml-2">
              {{ currentRouteName }}
            </h1>
          </div>

          <div class="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <div class="h-6 w-px bg-on-surface/10 mx-1 hidden md:block"></div>
            <UserProfile @logout="handleLogout" />
          </div>
        </header>

        <div class="flex-1 p-4 md:p-8">
          <router-view v-slot="{ Component }">
            <transition 
              name="page-fade" 
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>

        <footer class="p-4 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">
          EcoHealth AI •  2026
        </footer>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

// Import de tes composants atomes
import SideBar from '@/components/layout/SideBar.vue'
import RailToggle from '@/components/layout/RailToggle.vue'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
import UserProfile from '@/components/layout/UserProfile.vue'

const { mobile } = useDisplay()
const route = useRoute()
const router = useRouter()

// États de la navigation
const drawer = ref(true)
const isRail = ref(false)
const currentRouteName = computed(() => {
  return route.name ? String(route.name).toUpperCase() : 'ECOHEALTH PLATFORM'
})

const handleLogout = () => {
  console.log("Déconnexion en cours...")
  // router.push('/login')
}
</script>

<style scoped>
/* Transition de changement de page fluide */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar globale pour le contenu principal */
:deep(.v-main) {
  overflow-y: auto;
  height: 100vh;
}
</style>