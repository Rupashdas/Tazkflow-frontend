import { createApp } from 'vue'
import App from './App.vue'
import { startThemeSync, storedAppearance, applyAppearance } from './lib/theme'
import './styles/base.css'

applyAppearance(storedAppearance())
startThemeSync()

createApp(App).mount('#app')
