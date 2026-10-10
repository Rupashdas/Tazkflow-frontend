<script setup>
import { computed } from 'vue'
import { FolderPlus } from 'lucide-vue-next'
import { useCurrentWorkspace } from '@/features/workspaces/queries'
import { useAuthStore } from '@/stores/useAuthStore'
import { homeCopy as copy } from './copy'

const auth = useAuthStore()
const { data: workspace, isPending, isError, refetch } = useCurrentWorkspace()

const greeting = computed(() => copy.greeting.replace('{name}', auth.user?.name?.split(' ')[0] ?? ''))
</script>

<template>
	<div class="p-10 max-md:p-5">
		<p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ copy.overline }}</p>

		<!-- Loading is a skeleton in the shape of the real thing, not a spinner. -->
		<div v-if="isPending" class="mt-2.5 space-y-3">
			<div class="h-9 w-[320px] animate-pulse rounded-control bg-surface-subtle" />
			<div class="h-5 w-[220px] animate-pulse rounded-control bg-surface-subtle" />
		</div>

		<div v-else-if="isError" class="mt-2.5">
			<h1 class="text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.errorTitle }}</h1>
			<p class="mt-2 text-secondary">{{ copy.errorBody }}</p>
			<button class="mt-4 text-[15px] font-semibold text-accent-text" @click="refetch()">{{ copy.retry }}</button>
		</div>

		<template v-else>
			<h1 class="mt-2.5 text-[28px] font-bold tracking-[-0.02em] text-text">{{ greeting }}</h1>
			<p class="mt-2 text-secondary">{{ workspace?.name }}</p>

			<div class="mt-8 rounded-card border border-border bg-surface p-9 shadow-card">
				<div class="flex size-12 items-center justify-center rounded-card bg-accent-soft">
					<FolderPlus class="size-6 text-accent-soft-text" aria-hidden="true" />
				</div>
				<h2 class="mt-5 text-[20px] font-semibold text-text">{{ copy.emptyTitle }}</h2>
				<p class="mt-2 max-w-[620px] text-secondary">{{ copy.emptyBody }}</p>
			</div>
		</template>
	</div>
</template>
