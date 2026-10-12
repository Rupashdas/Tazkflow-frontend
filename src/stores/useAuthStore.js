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
	/** The API gave no answer (offline, down, 5xx), so we cannot tell. */
	const unreachable = ref(false)
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
		} catch (error) {
			const status = error.response?.status

			// No answer, or the server broke: we do not know whether there is a
			// session, so sending them to sign in would be a guess. Stay unchecked.
			if (!status || status >= 500) {
				unreachable.value = true
				return
			}

			// 401 (or a 403 for a switched-off account): no session.
			user.value = null
		}

		// Cleared only once there is an answer, so the retry screen stays up
		// while a retry is in flight instead of flashing the route underneath.
		unreachable.value = false
		checked.value = true
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

	/**
	 * Never throws. Someone who clicks Sign out must end up signed out on this
	 * device, even when the server cannot be reached, answers 419 or fails.
	 */
	async function logout() {
		try {
			// No CSRF fetch: signing in already left a fresh XSRF cookie behind.
			await api.post('/api/logout')
		} catch {
			// The server session may outlive this, but the screen must not keep
			// showing the account to whoever uses this device next.
		}
		endSession()
	}

	return { user, checked, unreachable, isLoggedIn, setUser, fetchUser, login, logout, endSession }
})
