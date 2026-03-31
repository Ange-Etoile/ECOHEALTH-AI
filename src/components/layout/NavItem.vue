<template>
  <li class="list-none my-0.5 relative group" :class="{ 'is-rail': isRail }">
    <v-tooltip 
      :text="item.title" 
      location="right" 
      :disabled="!isRail" 
      offset="14"
    >
      <template #activator="{ props: tip }">
        <router-link 
          :to="item.to" 
          v-bind="tip"
          class="relative flex items-center gap-3 h-[42px] px-3 rounded-xl no-underline transition-all duration-200 overflow-hidden"
          :class="[
            isActive 
              ? 'bg-nav-item-active-bg text-nav-item-active-text' 
              : 'text-nav-item-text hover:bg-nav-item-hover-bg hover:text-on-surface/90',
            isRail ? 'justify-center px-0 w-[42px] mx-auto' : ''
          ]"
        >
          <span 
            v-if="isActive" 
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-current"
          ></span>

          <span 
            class="flex items-center justify-center w-5 shrink-0 transition-opacity duration-200"
            :class="isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'"
          >
            <v-icon :icon="item.icon" size="18" />
          </span>

          <Transition name="label-fade">
            <span 
              v-if="!isRail" 
              class="text-[0.82rem] whitespace-nowrap tracking-wide flex-1"
              :class="isActive ? 'font-bold' : 'font-medium'"
            >
              {{ item.title }}
            </span>
          </Transition>

          <span 
            v-if="item.badge && !isRail" 
            class="ml-auto bg-error text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-md flex items-center justify-center shadow-sm"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </template>
    </v-tooltip>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavItemProps {
  item: {
    title: string
    to: string
    icon: string
    badge?: string | number
  }
  isRail: boolean
}

const props = defineProps<NavItemProps>()
const route = useRoute()

// On vérifie si la route actuelle correspond au lien
const isActive = computed(() => route.path === props.item.to)
</script>

<style scoped>
/* On garde juste les transitions de label car elles sont complexes en Tailwind pur */
.label-fade-enter-active { transition: opacity 0.2s ease; }
.label-fade-leave-active { transition: opacity 0.1s ease; }
.label-fade-enter-from, .label-fade-leave-to { opacity: 0; }

/* Animation subtile au survol pour l'icône */
.router-link-active .v-icon {
  transform: scale(1.05);
}
</style>