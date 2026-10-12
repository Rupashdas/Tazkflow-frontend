import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

/**
 * Runs before every navigation.
 *
 * On a cold page load we do not yet know whether there is a session, so the
 * first navigation asks the API once. Routes then say what they need through
 * meta: `requiresAuth`, `requiresVerified` or `guestOnly`.
 */
export const authGuard = async (to) => {
	const auth = useAuthStore()

	if (!auth.checked) await auth.fetchUser()

	// The API did not answer. App.vue shows the retry screen instead of the
	// route, and retrying runs this guard again once there is an answer.
	if (auth.unreachable) return true

	if (to.meta.requiresAuth && !auth.isLoggedIn) {
		return { path: '/login', query: { next: to.fullPath } }
	}

	// The API refuses most work until the address is confirmed, so send the
	// person to the screen that can resend the link instead of a dead end.
	if (to.meta.requiresVerified && auth.isLoggedIn && !auth.user.email_verified) {
		return { path: '/verify-email' }
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
