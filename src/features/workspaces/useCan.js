import { computed } from 'vue'
import { useCurrentWorkspace } from './queries'

/**
 * What the signed-in person may do in this workspace, read from the "me" of
 * GET /workspace. It only hides what they cannot use; the API still checks
 * every request.
 */
export function useCan() {
	const { data } = useCurrentWorkspace()
	const me = computed(() => data.value?.me ?? null)

	return {
		/** False until the workspace has loaded, so nothing appears and then vanishes. */
		ready: computed(() => me.value !== null),
		isOwner: computed(() => me.value?.is_owner ?? false),
		can: (capability) => me.value?.capabilities.includes(capability) ?? false,
	}
}
