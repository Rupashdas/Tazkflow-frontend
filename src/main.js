import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { applyAppearance, startThemeSync, storedAppearance } from './lib/theme'
import './styles/base.css'

applyAppearance(storedAppearance())
startThemeSync()

createApp(App).use(createPinia()).use(router).mount('#app')
