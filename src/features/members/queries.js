import { computed } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

/** The workspace's members, a page at a time, sorted by name (the API's order). */
export function useMembers() {
	const workspace = useWorkspaceStore()
	const slug = computed(() => workspace.slug)

	return useInfiniteQuery({
		queryKey: ['workspace', slug, 'members'],
		enabled: computed(() => slug.value !== null),
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const { data } = await api.get('/api/members', { params: { page: pageParam } })
			return data
		},
		getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
	})
}
