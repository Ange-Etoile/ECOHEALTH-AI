// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Plugins & Config
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'
import router from '@/router'

// Components
import App from './App.vue'

import './style.css'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')