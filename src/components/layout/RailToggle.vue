<template>
  <button
    class="flex items-center justify-center w-6 h-6 border border-solid rounded-md bg-surface shadow-sm cursor-pointer transition-all duration-200 group"
    :class="[
      isRail 
        ? 'border-primary/40 text-primary bg-primary/5' 
        : 'border-on-surface/12 text-on-surface/40 hover:border-primary/45 hover:text-primary hover:bg-primary/5'
    ]"
    @click="$emit('toggle')"
    :title="isRail ? 'Ouvrir le menu' : 'Réduire le menu'"
  >
    <v-icon 
      size="14" 
      class="transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      :class="{ 'rotate-180': isRail }"
    >
      mdi-chevron-left
    </v-icon>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isRail: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>