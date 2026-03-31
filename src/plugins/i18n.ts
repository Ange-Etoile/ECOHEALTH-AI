import { createI18n } from 'vue-i18n'

const messages = {
  fr: {
    dashboard: {
      aqi: "Indice Qualité de l'Air",
      health_risk: "Risque Sanitaire",
      weather: "Prévisions Météo",
      alerts: "Alertes en cours"
    },
    sidebar: {
      analysis: "ANALYSE",
      intelligence: "INTELLIGENCE",
      map: "Cartographie"
    }
  },
  en: {
    dashboard: {
      aqi: "Air Quality Index",
      health_risk: "Health Risk",
      weather: "Weather Forecast",
      alerts: "Current Alerts"
    },
    sidebar: {
      analysis: "ANALYSIS",
      intelligence: "INTELLIGENCE",
      map: "Mapping"
    }
  }
}

export default createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages,
})