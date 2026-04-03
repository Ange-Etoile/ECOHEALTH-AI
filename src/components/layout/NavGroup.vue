<template>
  <li class="list-none my-0.5 relative group">
    <div 
      @click="toggle"
      class="relative flex items-center gap-3 h-[42px] px-3 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden"
      :class="[
        isChildActive && !isOpen
          ? 'bg-nav-item-active-bg text-nav-item-active-text' 
          : 'text-nav-item-text hover:bg-nav-item-hover-bg hover:text-on-surface/90',
        isRail ? 'justify-center px-0 w-[42px] mx-auto' : ''
      ]"
    >
      <span 
        v-if="isChildActive && !isOpen" 
        class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-current"
      ></span>

      <span 
        class="flex items-center justify-center w-5 shrink-0 transition-opacity duration-200"
        :class="isChildActive || isOpen ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'"
      >
        <v-icon :icon="item.icon" size="18" />
      </span>

      <template v-if="!isRail">
        <span class="text-[0.82rem] whitespace-nowrap tracking-wide flex-1 font-bold">
          {{ item.title }}
        </span>
        <v-icon 
          size="14" 
          class="transition-transform duration-300 opacity-50"
          :class="{ 'rotate-180': isOpen }"
        >
          mdi-chevron-down
        </v-icon>
      </template>
    </div>

    <Transition name="expand">
      <ul v-if="isOpen && !isRail" class="pl-4 mt-1 space-y-1 border-l ml-5 border-on-surface/5">
        <li v-for="child in item.children" :key="child.to">
          <router-link 
            :to="child.to"
            class="relative flex items-center gap-3 h-[38px] px-3 rounded-xl no-underline transition-all duration-200 overflow-hidden"
            :class="[
              currentPath === child.to 
                ? 'bg-nav-item-active-bg text-nav-item-active-text' 
                : 'text-nav-item-text hover:bg-nav-item-hover-bg hover:text-on-surface/90'
            ]"
          >
            <span 
              v-if="currentPath === child.to" 
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-current"
            ></span>

            <span 
              class="flex items-center justify-center w-5 shrink-0 transition-opacity duration-200"
              :class="currentPath === child.to ? 'opacity-100' : 'opacity-50'"
            >
              <v-icon :icon="child.icon || 'mdi-circle-small'" :size="child.icon ? 16 : 20" />
            </span>

            <span 
              class="text-[0.78rem] whitespace-nowrap tracking-wide flex-1"
              :class="currentPath === child.to ? 'font-bold' : 'font-medium'"
            >
              {{ child.title }}
            </span>
          </router-link>
        </li>
      </ul>
    </Transition>

    <v-menu v-if="isRail" activator="parent" location="right" open-on-hover offset="15">
      <v-list density="compact" class="bg-surface border border-on-surface/5 rounded-lg shadow-xl py-2">
        <v-list-item 
          v-for="child in item.children" 
          :key="child.to" 
          :to="child.to"
          :prepend-icon="child.icon || 'mdi-circle-small'"
          :title="child.title"
          class="text-[0.8rem] font-medium"
          nav
        />
      </v-list>
    </v-menu>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

interface NavGroupProps {
  item: {
    title: string
    icon: string
    children: Array<{ title: string, to: string, icon?: string }>
  }
  isRail: boolean
}

const props = defineProps<NavGroupProps>()
const route = useRoute()
const isOpen = ref(false)

const currentPath = computed(() => route.path)
const isChildActive = computed(() => props.item.children.some(c => c.to === route.path))

watch(isChildActive, (active) => { if (active) isOpen.value = true }, { immediate: true })

const toggle = () => { if (!props.isRail) isOpen.value = !isOpen.value }
</script>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>