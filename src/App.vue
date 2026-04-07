<template>
  <ConnectivityGuard />

  <router-view />
  
  <EcoChatBot />
</template>

<script setup lang="ts">
import ConnectivityGuard from '@/components/ConnectivityGuard.vue'
import EcoChatBot from '@/components/EcoChatBot.vue'
</script>

<style>
/* S'assurer que les transitions de route ne cachent pas le popup */
#app {
  position: relative;
  min-height: 100vh;
}
</style>