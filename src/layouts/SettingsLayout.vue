<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useCan } from '@/features/workspaces/useCan'
import { useWorkspaces } from '@/features/workspaces/queries'
import { layoutCopy } from './copy'

const copy = layoutCopy.settings
const workspace = useWorkspaceStore()
const route = useRoute()
const { can, ready } = useCan()
const { data: workspaces } = useWorkspaces()

// The capability the open page needs, if any (set as route meta).
const needed = computed(() => route.matched.map((record) => record.meta.capability).find(Boolean) ?? null)

// The workspace group is named after the workspace, so it is clear that these
// pages belong to this workspace and "My account" does not.
const workspaceName = computed(() => workspaces.value?.find((w) => w.slug === workspace.slug)?.name ?? copy.workspace)

// One list drives the nav. Pages a person may not open are left out, and a
// group with nothing left in it is not shown at all.
const groups = computed(() =>
	[
		{
			label: copy.myAccount,
			hint: copy.myAccountHint,
			items: [
				{ to: `/${workspace.slug}/account/profile`, label: copy.profile },
				{ to: `/${workspace.slug}/account/security`, label: copy.security },
				{ to: `/${workspace.slug}/account/preferences`, label: copy.preferences },
			],
		},
		{
			label: workspaceName.value,
			hint: copy.workspaceHint,
			items: [{ to: `/${workspace.slug}/settings/members`, label: copy.members, capability: 'members.view' }],
		},
	]
		.map((group) => ({ ...group, items: group.items.filter((item) => !item.capability || can(item.capability)) }))
		.filter((group) => group.items.length > 0),
)
</script>

<template>
	<div class="flex min-h-screen">
		<nav :aria-label="copy.navLabel" class="w-[240px] shrink-0 border-r border-border px-4 py-10">
			<div
				v-for="(group, index) in groups"
				:key="group.label"
				class="mb-6"
				:class="index > 0 ? 'border-t border-border pt-6' : ''"
			>
				<p class="truncate px-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ group.label }}</p>
				<p class="px-3 text-[13px] text-muted">{{ group.hint }}</p>
				<ul class="mt-2 flex flex-col gap-0.5">
					<li v-for="item in group.items" :key="item.to">
						<RouterLink
							:to="item.to"
							class="flex h-10 items-center rounded-nav px-3 text-[15px] text-secondary hover:bg-surface"
							active-class="rounded-l-none bg-surface font-semibold text-text shadow-[inset_3px_0_0_var(--accent-rail)]"
						>
							{{ item.label }}
						</RouterLink>
					</li>
				</ul>
			</div>
		</nav>

		<div class="min-w-0 flex-1 p-10 max-md:p-5">
			<!-- Until the workspace has loaded we cannot tell, so neither page nor refusal. -->
			<div v-if="needed && !ready" class="space-y-3">
				<div class="h-5 w-[120px] animate-pulse rounded-control bg-surface-subtle" />
				<div class="h-9 w-[280px] animate-pulse rounded-control bg-surface-subtle" />
			</div>

			<div
				v-else-if="needed && !can(needed)"
				class="rounded-card border border-border bg-surface p-9 shadow-card"
				role="status"
			>
				<h1 class="text-[20px] font-semibold text-text">{{ copy.noAccessTitle }}</h1>
				<p class="mt-2 max-w-[560px] text-secondary">{{ copy.noAccessBody }}</p>
				<RouterLink
					:to="`/${workspace.slug}`"
					class="mt-5 inline-flex min-h-10 items-center text-[15px] font-semibold text-accent-text"
				>
					{{ copy.backHome }}
				</RouterLink>
			</div>

			<RouterView v-else />
		</div>
	</div>
</template>
