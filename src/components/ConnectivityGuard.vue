<template>
  <transition name="slide-fade">
    <div v-if="isVisible" class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md">
      <v-card 
        variant="outlined" 
        class="rounded-2xl border-primary/50 bg-surface/80 backdrop-blur-xl shadow-2xl p-4 md:p-5 relative overflow-hidden"
      >
        <div class="absolute bottom-0 left-0 h-[3px] bg-primary transition-all duration-[5000ms] ease-linear" :style="{ width: progressWidth + '%' }"></div>

        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <div class="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <v-icon color="primary" size="24" class="animate-pulse">mdi-wifi-check</v-icon>
            </div>
          </div>

          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <v-chip color="primary" size="x-small" variant="flat" class="font-black uppercase px-2 italic text-[8px]">Système</v-chip>
              <span class="text-[9px] font-black uppercase tracking-widest opacity-60">Vérification Réseau</span>
            </div>
            <h4 class="text-sm md:text-base font-black uppercase italic tracking-tight leading-tight">
              Stabilité <span class="text-primary">Requise</span>
            </h4>
            <p class="text-[11px] md:text-[12px] opacity-80 leading-relaxed">
              Pour une analyse prédictive optimale, assurez-vous d'avoir une <strong>connexion stable</strong>.
            </p>
          </div>

          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small" 
            class="ml-auto opacity-40 hover:opacity-100" 
            @click="close"
          ></v-btn>
        </div>
      </v-card>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(false)
const progressWidth = ref(100)

const close = () => {
  isVisible.value = false
}

onMounted(() => {
  // Déclenchement au chargement
  setTimeout(() => {
    isVisible.value = true
    
    // Animation de la barre de progression
    setTimeout(() => { progressWidth.value = 0 }, 100)

    // Disparition automatique après 5 secondes
    setTimeout(() => {
      close()
    }, 5000)
  }, 800) // Petit délai pour laisser l'app se charger
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

.slide-fade-enter-from {
  transform: translate(-50%, -20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translate(-50%, -10px) scale(0.95);
  opacity: 0;
}

/* On s'assure que le flou ne ralentit pas le mobile */
.backdrop-blur-xl {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
</style>