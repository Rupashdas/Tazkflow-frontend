import { computed, unref } from 'vue'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

/** The workspace's members, a page at a time, sorted by name (the API's order). */
export function useMembers(search) {
	const workspace = useWorkspaceStore()
	const slug = computed(() => workspace.slug)

	return useInfiniteQuery({
		// Every search shares the 'members' prefix, so one invalidate refreshes them all.
		queryKey: ['workspace', slug, 'members', { search }],
		enabled: computed(() => slug.value !== null),
		// The old list stays up while a new search loads, instead of a skeleton per keystroke.
		placeholderData: keepPreviousData,
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const { data } = await api.get('/api/members', {
				params: { page: pageParam, search: unref(search) || undefined },
			})
			return data
		},
		getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
	})
}
