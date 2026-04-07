<template>
  <div class="rounded-2xl border transition-all duration-300 bg-surface border-on-surface/10 dark:border-white/[0.07] overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-on-surface/5 dark:border-white/[0.06]">
      <div class="flex items-center gap-2">
        <span class="text-sm font-black opacity-20 dark:opacity-15 font-mono text-on-surface dark:text-white">
          {{ number }}
        </span>
        <h3 class="text-[10px] font-black uppercase tracking-widest opacity-70 dark:text-white/65">
          {{ title }}
        </h3>
      </div>

      <span 
        v-if="badge"
        class="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
      >
        {{ badge }}
      </span>
    </div>

    <div class="p-3 md:p-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  number: String, // ex: "01"
  title: String,  // ex: "Évolution Temporelle"
  badge: String   // ex: "Live"
})
</script>

<style scoped>
/* Pour s'assurer que le contenu du graphique s'adapte bien */
:deep(.v-chart) {
  width: 100% !important;
  height: 100% !important;
}
</style>