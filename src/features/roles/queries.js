import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

/** The roles this workspace offers, with their capabilities and how many hold each. Needs roles.view. */
export function useRoles() {
	const workspace = useWorkspaceStore()
	const slug = computed(() => workspace.slug)

	return useQuery({
		queryKey: ['workspace', slug, 'roles'],
		enabled: computed(() => slug.value !== null),
		queryFn: async () => {
			const { data } = await api.get('/api/roles')
			return data.data
		},
	})
}
