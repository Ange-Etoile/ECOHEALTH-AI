<template>
  <v-menu location="bottom end" transition="slide-y-transition" :offset="10">
    <template #activator="{ props }">
      <button v-bind="props" class="relative border-none bg-transparent p-0 cursor-pointer outline-none group" aria-label="Profil">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_0_2px_rgba(var(--v-theme-primary),0.20)] transition-all duration-200 group-hover:shadow-[0_0_0_3px_rgba(var(--v-theme-primary),0.35)] group-hover:scale-105">
          <span class="text-[0.85rem] font-black text-white leading-none">E</span>
        </div>
        <div class="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full bg-success border-2 border-solid border-surface"></div>
      </button>
    </template>

    <div class="bg-surface border border-solid border-on-surface/10 rounded-[14px] shadow-2xl p-1.5 min-w-[220px] overflow-hidden">
      <div class="flex items-center gap-3 p-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base font-black text-white shrink-0">
          E
        </div>
        <div class="flex flex-col">
          <span class="text-[0.85rem] font-bold text-on-surface leading-tight">Etoile Admin</span>
          <span class="text-[0.65rem] font-semibold tracking-wider text-primary uppercase opacity-80 mt-0.5">
            Master SIA Student
          </span>
        </div>
      </div>

      <div class="h-px bg-on-surface/10 my-1 mx-2"></div>

      <div class="flex flex-col gap-0.5">
        <button 
          @click="$emit('navigate', 'profile')"
          class="flex items-center gap-2.5 w-full h-10 px-3 rounded-xl border-none bg-transparent text-on-surface/70 text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-on-surface/5 hover:text-on-surface text-left"
        >
          <v-icon size="16">mdi-account-circle-outline</v-icon>
          {{ $t('profile.my_profile') || 'Mon Profil' }}
        </button>

        <button 
          @click="$emit('navigate', 'settings')"
          class="flex items-center gap-2.5 w-full h-10 px-3 rounded-xl border-none bg-transparent text-on-surface/70 text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-on-surface/5 hover:text-on-surface text-left"
        >
          <v-icon size="16">mdi-cog-outline</v-icon>
          {{ $t('profile.settings') || 'Paramètres' }}
        </button>

        <div class="h-px bg-on-surface/10 my-1 mx-2"></div>

        <button 
          @click="$emit('logout')"
          class="flex items-center gap-2.5 w-full h-10 px-3 rounded-xl border-none bg-transparent text-on-surface/70 text-[0.8rem] font-semibold cursor-pointer transition-all hover:bg-error/10 hover:text-error text-left"
        >
          <v-icon size="16">mdi-logout</v-icon>
          {{ $t('profile.logout') || 'Déconnexion' }}
        </button>
      </div>
    </div>
  </v-menu>
</template>

<script lang="ts" setup>
defineEmits(['logout', 'navigate'])
</script>