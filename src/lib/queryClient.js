import { QueryClient } from '@tanstack/vue-query'

/**
 * One cache for the whole app.
 *
 * `staleTime` of 30s means moving between screens shows what we already have
 * instead of a fresh spinner, while a mutation's invalidate still refetches
 * immediately. Retrying is off for 4xx: a 403 will not become a 200.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: (failureCount, error) => {
				const status = error?.response?.status
				if (status && status >= 400 && status < 500) return false
				return failureCount < 2
			},
		},
	},
})
