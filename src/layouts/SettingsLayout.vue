<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { layoutCopy } from './copy'

const copy = layoutCopy.settings
const workspace = useWorkspaceStore()

// One list drives the nav. Later groups (Workspace) are added here, and the
// pages a person may not open are left out of it.
const groups = computed(() => [
	{
		label: copy.myAccount,
		items: [
			{ to: `/${workspace.slug}/account/profile`, label: copy.profile },
			{ to: `/${workspace.slug}/account/security`, label: copy.security },
			{ to: `/${workspace.slug}/account/preferences`, label: copy.preferences },
		],
	},
])
</script>

<template>
	<div class="flex min-h-screen">
		<nav :aria-label="copy.navLabel" class="w-[240px] shrink-0 border-r border-border px-4 py-10">
			<div v-for="group in groups" :key="group.label" class="mb-8">
				<p class="px-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ group.label }}</p>
				<ul class="mt-2 flex flex-col gap-0.5">
					<li v-for="item in group.items" :key="item.to">
						<RouterLink
							:to="item.to"
							class="flex h-10 items-center rounded-nav px-3 text-[15px] text-secondary hover:bg-surface-subtle"
							active-class="bg-surface-subtle font-semibold text-text"
						>
							{{ item.label }}
						</RouterLink>
					</li>
				</ul>
			</div>
		</nav>

		<div class="min-w-0 flex-1 p-10 max-md:p-5">
			<RouterView />
		</div>
	</div>
</template>
