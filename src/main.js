import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import { setUnauthorizedHandler } from './lib/api'
import { useAuthStore } from './stores/useAuthStore'
import { applyAppearance, startThemeSync, storedAppearance } from './lib/theme'
import './styles/base.css'

applyAppearance(storedAppearance())
startThemeSync()

const app = createApp(App)
app.use(createPinia())
app.use(VueQueryPlugin, { queryClient })

// The session ended while someone was using the app. A 401 before anyone was
// signed in is just "no session yet", which the guard already handles.
setUnauthorizedHandler(() => {
	const auth = useAuthStore()
	if (!auth.isLoggedIn) return

	auth.clear()
	router.replace({ path: '/login', query: { next: router.currentRoute.value.fullPath } })
})

app.use(router)
app.mount('#app')
