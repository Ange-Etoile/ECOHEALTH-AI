<template>
  <div class="max-w-7xl mx-auto px-6 py-6 space-y-12">
    
    <section class="text-center max-w-2xl mx-auto space-y-4">
      <h1 class="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">
        L'équipe <span class="text-primary italic">EcoHealth AI</span>
      </h1>
      <p class="text-on-surface/60 font-medium leading-relaxed">
        Des étudiants en Master 1  à l'Université de Douala unis pour transformer les données environnementales du Cameroun.
      </p>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
      
      <TeamMemberCard 
        v-for="member in team" 
        :key="member.name"
        v-bind="member"
      />

    </section>
  </div>
</template>

<script setup lang="ts">
import TeamMemberCard from '@/components/about/TeamMemberCard.vue'

const team = [
  {
    name: "NGO MATJABO PRICILLE ANGE ETOILE",
    role: "Full Stack Developer",
    bio: "Developpeuse de l'application web de ECOHEALTH-AI. Expert en intégration de modèles de Deep Learning et architecture Full-stack (Laravel/Vue).",
    image: "/images/etoile.jpeg", 
    linkedin: "https://linkedin.com/in/ton-profil",
    github: "https://github.com/Ange-Etoile"
  },
  {
    name: "WANDJI NGABO STEPHANE JUNIOR",
    role: "Data Scientist",
    bio: "Analyse statistique et traitement du dataset Indabax. Spécialiste Python et visualisation de données.",
    image: "/images/stephane_W.jpeg", 
    linkedin: "https://www.linkedin.com/in/stephane-wandji-800929287",
    github: "https://github.com/stephade4"
  },
  {
    name: "NGUEFA DJIFACK HERVÉ STÉPHANE",
    role: "Data Analyst",
    bio: "Étude des corrélations entre les variables climatiques et les indicateurs de santé publique au Cameroun.",
    image: "/images/stephane.jpeg",
    linkedin: "https://www.linkedin.com/in/hervé-nguefa",
    github: "https://github.com/herve237ddf"
  },
  {
    name: "TCHOUNKEU YANZEU IGOR VLADIMIR ",
    role: "Ecological and Environmental Biodiversity",
    bio: "Spécialiste des dynamiques écologiques, il décode l'impact des variables météorologiques sur la dispersion des polluants. Son expertise permet de corréler les données climatiques brutes aux indicateurs de santé publique pour des prédictions IA de haute précision.",
    image: "/images/vladimir.jpeg",
    linkedin: "https://www.linkedin.com/in/hervé-nguefa",
    github: "https://github.com/herve237ddf"
  }
]
</script>