<template>
  <div class="group h-full [perspective:800px]">
    <div class="
      tc-card
      relative h-full flex flex-col
      rounded-[26px] overflow-hidden
      /* Mode Clair */
      bg-white border border-black/[0.05] shadow-sm
      /* Mode Sombre (tes couleurs) */
      dark:bg-[#0d0f18] dark:border-white/[0.07]
      transition-all duration-500 ease-out
      hover:-translate-y-2.5 hover:scale-[1.01]
      hover:border-primary/30
      hover:shadow-[0_32px_72px_-10px_rgba(0,0,0,0.15)]
      dark:hover:shadow-[0_32px_72px_-10px_rgba(0,0,0,0.55),0_0_0_1px_rgba(var(--v-theme-primary),0.2),0_0_80px_-20px_rgba(var(--v-theme-primary),0.35)]
    ">

      <div class="tc-shimmer absolute inset-0 z-10 pointer-events-none rounded-[inherit]"></div>

      <div class="relative h-40 md:h-44 overflow-hidden flex-shrink-0">
        <div class="absolute -top-14 -right-14 w-44 h-44 rounded-full border border-primary/20 z-[1]">
          <div class="absolute inset-[22px] rounded-full border border-primary/10"></div>
        </div>

        <img
          :src="image"
          :alt="name"
          class="absolute inset-0 w-full h-full object-cover object-top brightness-[0.8] dark:brightness-[0.45] saturate-[0.8] scale-100 transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.9] dark:group-hover:brightness-[0.55]"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-[#0d0f18]/60 dark:to-[#0d0f18]"></div>
        
        <span class="
          absolute bottom-3.5 right-4 z-[2]
          px-3 py-1
          text-[9px] font-bold tracking-[0.18em] uppercase
          text-white
          bg-primary/80 dark:bg-primary/20 border border-primary/40
          rounded-full backdrop-blur-md
        ">{{ role }}</span>
      </div>

      <div class="
        tc-avatar-frame
        relative z-[3]
        -mt-10 md:-mt-11 ml-6
        w-[78px] h-[78px] md:w-[88px] md:h-[88px] flex-shrink-0
        transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:scale-105
      ">
        <img
          :src="image"
          :alt="name"
          class="w-full h-full rounded-[20px] object-cover border-2 border-white dark:border-[#0d0f18] shadow-lg"
        />
        <div class="
          absolute -inset-[3px] rounded-[23px] -z-[1]
          bg-gradient-to-br from-primary/90 to-primary/15
          opacity-60 transition-opacity duration-400
          group-hover:opacity-100
        "></div>
      </div>

      <div class="flex flex-col flex-1 px-6 pb-6 pt-4 min-h-0">
        
        <div class="mb-3 flex-shrink-0">
          <h3 class="font-black text-[1.3rem] md:text-[1.55rem] text-slate-900 dark:text-[#eef0ff] leading-[1.1] tracking-tight">
            {{ name }}
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-bio-scroll mb-5 min-h-[60px] max-h-[100px] md:max-h-none">
          <p class="text-[0.78rem] italic text-slate-500 dark:text-white/[0.38] leading-[1.6]">
            &ldquo;{{ bio }}&rdquo;
          </p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-black/[0.05] dark:border-white/[0.06] flex-shrink-0">
          <div class="flex gap-1.5">
            <a
              v-if="linkedin"
              :href="linkedin"
              target="_blank"
              class="social-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a
              v-if="github"
              :href="github"
              target="_blank"
              class="social-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
          </div>

          <a
            v-if="portfolio"
            :href="portfolio"
            target="_blank"
            class="portfolio-btn"
          >
            Portfolio
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  role: string
  bio: string
  image: string
  linkedin?: string
  github?: string
  portfolio?: string
}>()
</script>

<style scoped>
.tc-card {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tc-shimmer {
  background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.05) 50%, transparent 65%);
  background-size: 250% 100%;
  background-position: 250% 0;
  transition: background-position 0s;
}
.group:hover .tc-shimmer {
  background-position: -250% 0;
  transition: background-position 0.65s ease;
}

/* Scrollbar très discrète pour la bio sur mobile */
.custom-bio-scroll::-webkit-scrollbar {
  width: 2px;
}
.custom-bio-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.2);
  border-radius: 10px;
}

.social-link {
  @apply inline-flex items-center justify-center w-[34px] h-[34px] rounded-[10px] 
         border border-black/[0.08] dark:border-white/[0.08] 
         bg-black/[0.02] dark:bg-white/[0.03] 
         text-slate-400 dark:text-white/40 
         transition-all duration-200 
         hover:text-primary hover:bg-primary/10 hover:border-primary/30 hover:-translate-y-1;
}

.portfolio-btn {
  @apply inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-[10px] 
         text-[10px] font-bold uppercase tracking-wider 
         text-primary border border-primary/25 bg-primary/[0.05] 
         transition-all duration-200 
         hover:bg-primary hover:text-white hover:-translate-y-0.5;
}
</style>