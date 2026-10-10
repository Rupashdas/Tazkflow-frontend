import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export async function fetchWorkspaces() {
	const { data } = await api.get('/api/workspaces')
	return data.data
}

/** Every workspace the signed-in person can enter. Feeds the switcher. */
export function useWorkspaces() {
	return useQuery({ queryKey: ['workspaces'], queryFn: fetchWorkspaces })
}

/**
 * The workspace named by the URL.
 *
 * The slug is part of the key, so switching workspaces reads a different cache
 * entry instead of briefly showing the previous workspace's answer.
 */
export function useCurrentWorkspace() {
	const workspace = useWorkspaceStore()
	const slug = computed(() => workspace.slug)

	return useQuery({
		queryKey: ['workspace', slug],
		enabled: computed(() => slug.value !== null),
		queryFn: async () => {
			const { data } = await api.get('/api/workspace')
			return data.data
		},
	})
}
