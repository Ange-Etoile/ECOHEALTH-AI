// src/plugins/vuetify.ts
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F4F7F6',
    surface: '#FFFFFF',
    primary: '#00796B', 
    secondary: '#00ACC1', 
    accent: '#4DB6AC',
    error: '#C62828',
    warning: '#EF6C00',
    info: '#0277BD',
    success: '#2E7D32',

    'on-background': '#0D1F1D',
    'on-surface': '#0D1F1D',
    'on-primary': '#FFFFFF',
    'sidebar-start': '#00695C',
    'sidebar-mid': '#00796B',
    'sidebar-end': '#004D40',
    'nav-item-active-bg': '#FFFFFF',
    'nav-item-active-text': '#00695C',
    'nav-item-hover-bg': 'rgba(255,255,255,0.10)',
    'nav-item-text': 'rgba(255,255,255,0.75)',
    'nav-heading': 'rgba(255,255,255,0.40)',
    'divider': 'rgba(255,255,255,0.08)',
  },
}

// --- Thème Sombre (Nuit & Intelligence Artificielle) ---
const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#060F0E',
    surface: '#0C1A19',
    primary: '#00C9A7', // Vert Néon (IA)
    secondary: '#00B4D8', // Bleu Électrique
    accent: '#48CAE4',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#29B6F6',
    success: '#66BB6A',

    'on-background': '#DFF2EF',
    'on-surface': '#DFF2EF',
    'on-primary': '#00201C',

    // Sidebar sombre
    'sidebar-start': '#081312',
    'sidebar-mid': '#0C1A19',
    'sidebar-end': '#060F0E',

    // États de navigation dark
    'nav-item-active-bg': 'rgba(0, 201, 167, 0.12)',
    'nav-item-active-text': '#00C9A7',
    'nav-item-hover-bg': 'rgba(255,255,255,0.05)',
    'nav-item-text': 'rgba(223,242,239,0.65)',
    'nav-heading': 'rgba(0, 201, 167, 0.45)',
    'divider': 'rgba(255,255,255,0.06)',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
  defaults: {
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VBtn: {
      rounded: 'lg',
      fontWeight: '600',
    }
  }
})