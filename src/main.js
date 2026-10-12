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
	const workspace = useWorkspaceStore()

	// The cache still says this person is a member: the list would offer the
	// workspace again and "Open" would loop back here. Read the slug before
	// clear() forgets it.
	queryClient.removeQueries({ queryKey: ['workspace', workspace.slug] })
	// Drop it from the cached list now, so the list never shows it while the
	// fresh copy is on its way; the refetch then confirms the rest.
	queryClient.setQueryData(['workspaces'], (list) => list?.filter((item) => item.slug !== workspace.slug))
	queryClient.invalidateQueries({ queryKey: ['workspaces'] })

	workspace.clear()
	router.replace({ path: '/workspaces', query: { issue: code } })
})

app.use(router)
app.mount('#app')
