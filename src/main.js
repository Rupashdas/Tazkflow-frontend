import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import { setUnauthorizedHandler, setWorkspaceErrorHandler } from './lib/api'
import { useAuthStore } from './stores/useAuthStore'
import { useWorkspaceStore } from './stores/useWorkspaceStore'
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

	auth.endSession()
	router.replace({ path: '/login', query: { next: router.currentRoute.value.fullPath } })
})

// The workspace in the URL is gone, or access to it was switched off. Leaving
// the reason in the URL lets the next screen explain it.
setWorkspaceErrorHandler((code) => {
	useWorkspaceStore().clear()
	router.replace({ path: '/workspaces', query: { issue: code } })
})

app.use(router)
app.mount('#app')
