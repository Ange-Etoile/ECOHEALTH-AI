<template>
  <ConnectivityGuard />

  <router-view />
  
  <EcoChatBot />
</template>

<script setup lang="ts">
import ConnectivityGuard from '@/components/ConnectivityGuard.vue'
import EcoChatBot from '@/components/EcoChatBot.vue'
import { SplashScreen } from '@capacitor/splash-screen'
import { onMounted } from 'vue'
onMounted(async () => {
  try {
    await SplashScreen.hide()
  } catch (e) {
    console.warn("SplashScreen n'est pas disponible sur le web")
  }
})
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
}
</style>