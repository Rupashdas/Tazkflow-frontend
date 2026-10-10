import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import { applyAppearance, startThemeSync, storedAppearance } from './lib/theme'
import './styles/base.css'

applyAppearance(storedAppearance())
startThemeSync()

createApp(App).use(createPinia()).use(VueQueryPlugin, { queryClient }).use(router).mount('#app')
