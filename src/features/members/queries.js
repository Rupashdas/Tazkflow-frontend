import { computed, unref } from 'vue'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/vue-query'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

/** Members per request. The API allows up to 100. */
const PAGE_SIZE = 50

/**
 * The workspace's members, a page at a time, sorted by name (the API's order).
 * `role` is a role id or 'none'; `status` is 'active' or 'deactivated'; 'all' or empty leaves either out.
 */
export function useMembers({ search, role, status }) {
	const workspace = useWorkspaceStore()
	const slug = computed(() => workspace.slug)
	const only = (value) => (unref(value) && unref(value) !== 'all' ? unref(value) : undefined)

	return useInfiniteQuery({
		// Every search and filter shares the 'members' prefix, so one invalidate refreshes them all.
		queryKey: ['workspace', slug, 'members', { search, role, status }],
		enabled: computed(() => slug.value !== null),
		// The old list stays up while a new search loads, instead of a skeleton per keystroke.
		placeholderData: keepPreviousData,
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const { data } = await api.get('/api/members', {
				params: {
					page: pageParam,
					per_page: PAGE_SIZE,
					search: unref(search) || undefined,
					role: only(role),
					status: only(status),
				},
			})
			return data
		},
		getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
	})
}
