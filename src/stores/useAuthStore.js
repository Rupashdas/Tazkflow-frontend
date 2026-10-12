import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ensureCsrfCookie } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { useWorkspaceStore } from './useWorkspaceStore'
import { ACCENTS, applyAccent, applyAppearance } from '@/lib/theme'

export const useAuthStore = defineStore('auth', () => {
	const user = ref(null)
	/** True once we have asked the API whether there is a session. */
	const checked = ref(false)
	const isLoggedIn = computed(() => user.value !== null)

	function setUser(value) {
		user.value = value

		// The server is the source of truth for how the app looks, so the same
		// account looks the same on any device.
		const { appearance, palette } = value.preferences ?? {}
		if (appearance === 'light' || appearance === 'dark' || appearance === 'os') applyAppearance(appearance)
		if (ACCENTS.includes(palette)) applyAccent(palette)
	}

	async function fetchUser() {
		try {
			const { data } = await api.get('/api/user')
			setUser(data.data)
		} catch {
			// 401 here simply means "no session yet".
			user.value = null
		} finally {
			checked.value = true
		}
	}

	async function login(email, password, remember) {
		// Laravel refuses a POST without the XSRF cookie, and a new visitor has none.
		await ensureCsrfCookie()
		const { data } = await api.post('/api/login', { email, password, remember })
		setUser(data.data)
	}

	/**
	 * Forget everything this session loaded, so the next person to sign in on
	 * this tab never sees the last one's workspaces from the query cache.
	 */
	function endSession() {
		user.value = null
		queryClient.clear()
		useWorkspaceStore().clear()
	}

	async function logout() {
		// No CSRF fetch: signing in already left a fresh XSRF cookie behind.
		await api.post('/api/logout')
		endSession()
	}

	return { user, checked, isLoggedIn, setUser, fetchUser, login, logout, endSession }
})
