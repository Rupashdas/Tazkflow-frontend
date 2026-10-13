<script setup>
import { useRouter } from 'vue-router'
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuRoot,
	DropdownMenuTrigger,
} from 'reka-ui'
import { Home, MoreHorizontal } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { workspaceCopy } from '@/features/workspaces/copy'
import WorkspaceSwitcher from '@/features/workspaces/WorkspaceSwitcher.vue'
import Avatar from '@/ui/Avatar.vue'
import Toaster from '@/ui/Toaster.vue'

const copy = workspaceCopy.shell
const auth = useAuthStore()
const workspace = useWorkspaceStore()
const router = useRouter()

async function signOut() {
	await auth.logout()
	await router.replace('/login')
}
</script>

<template>
	<div class="flex min-h-screen bg-page">
		<!-- 272px on desktop; the mobile drawer arrives in Plan B, so below
		     1024px it narrows rather than disappearing. -->
		<aside class="flex w-[272px] shrink-0 flex-col gap-6 border-r border-border bg-surface p-5 max-lg:w-[216px]">
			<WorkspaceSwitcher />

			<nav class="flex flex-col gap-1">
				<RouterLink
					:to="`/${workspace.slug}`"
					class="flex h-12 items-center gap-3 rounded-nav px-3.5 text-[15px] text-secondary hover:bg-surface-subtle"
					active-class="rounded-l-none bg-surface-subtle font-semibold text-text shadow-[inset_3px_0_0_var(--accent-rail)]"
				>
					<Home class="size-5 opacity-70" aria-hidden="true" />
					{{ copy.home }}
				</RouterLink>
			</nav>

			<DropdownMenuRoot>
				<DropdownMenuTrigger class="mt-auto flex w-full items-center gap-3 border-t border-divider pt-4 text-left">
					<Avatar :name="auth.user?.name ?? ''" :src="auth.user?.avatar" size="sm" />
					<span class="min-w-0 flex-1">
						<span class="block truncate text-[15px] font-semibold text-text">{{ auth.user?.name }}</span>
						<span class="block truncate text-[14px] text-muted">{{ auth.user?.email }}</span>
					</span>
					<MoreHorizontal class="size-4 shrink-0 text-icon-muted" aria-hidden="true" />
				</DropdownMenuTrigger>

				<DropdownMenuPortal>
					<DropdownMenuContent
						align="start"
						:side-offset="6"
						class="z-50 w-[220px] rounded-card border border-border bg-surface p-2 shadow-popover"
					>
						<DropdownMenuItem
							class="cursor-pointer rounded-nav px-3 py-2.5 text-[15px] text-text outline-none data-highlighted:bg-surface-subtle"
							@select="router.push(`/${workspace.slug}/account`)"
						>
							{{ copy.accountSettings }}
						</DropdownMenuItem>
						<DropdownMenuItem
							class="cursor-pointer rounded-nav px-3 py-2.5 text-[15px] text-text outline-none data-highlighted:bg-surface-subtle"
							@select="signOut"
						>
							{{ copy.signOut }}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</DropdownMenuRoot>
		</aside>

		<main class="min-w-0 flex-1">
			<RouterView />
		</main>

		<Toaster />
	</div>
</template>
