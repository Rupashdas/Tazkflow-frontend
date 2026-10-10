import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

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

	// Routes under /:workspace carry the slug that every API call needs.
	const slug = to.params.workspace
	if (typeof slug === 'string' && slug.length > 0) {
		useWorkspaceStore().setSlug(slug)
	}

	return true
}
