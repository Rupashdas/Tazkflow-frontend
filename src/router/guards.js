import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Runs before every navigation.
 *
 * On a cold page load we do not yet know whether there is a session, so the
 * first navigation asks the API once. Routes then say what they need through
 * meta: `requiresAuth` or `guestOnly`.
 */
export const authGuard = async (to) => {
	const auth = useAuthStore()

	if (!auth.checked) await auth.fetchUser()

	if (to.meta.requiresAuth && !auth.isLoggedIn) {
		return { path: '/login', query: { next: to.fullPath } }
	}

	if (to.meta.guestOnly && auth.isLoggedIn) {
		return { path: '/' }
	}

	return true
}
