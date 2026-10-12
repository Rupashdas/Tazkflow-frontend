<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRoot,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'reka-ui'
import { ChevronsUpDown } from 'lucide-vue-next'
import { useWorkspaces } from './queries'
import { initials } from './initials'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { workspaceCopy } from './copy'

const copy = workspaceCopy.switcher
const router = useRouter()
const workspace = useWorkspaceStore()
const { data: workspaces } = useWorkspaces()

const current = computed(() => workspaces.value?.find((w) => w.slug === workspace.slug))
const others = computed(() => (workspaces.value ?? []).filter((w) => w.slug !== workspace.slug))
</script>

<template>
	<DropdownMenuRoot>
		<DropdownMenuTrigger
			:aria-label="copy.label"
			class="flex w-full items-center gap-3 rounded-[11px] border border-border bg-surface-subtle p-3 text-left"
		>
			<span
				class="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-text text-[15px] font-bold text-page"
			>
				{{ current ? initials(current.name) : '·' }}
			</span>
			<span class="min-w-0 flex-1">
				<span class="block truncate text-[15px] font-semibold text-text">{{ current?.name ?? '…' }}</span>
				<span class="block truncate text-[14px] text-muted">
					{{ current?.is_owner ? copy.owner : (current?.role?.label ?? '') }}
				</span>
			</span>
			<ChevronsUpDown class="size-4 shrink-0 text-icon-muted" aria-hidden="true" />
		</DropdownMenuTrigger>

		<DropdownMenuPortal>
			<DropdownMenuContent
				align="start"
				:side-offset="6"
				class="z-50 w-[272px] rounded-card border border-border bg-surface p-2 shadow-popover"
			>
				<DropdownMenuLabel class="px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
					{{ copy.others }}
				</DropdownMenuLabel>

				<DropdownMenuItem
					v-for="item in others"
					:key="item.slug"
					class="flex cursor-pointer items-center gap-3 rounded-nav px-3 py-2.5 text-[15px] text-text outline-none data-highlighted:bg-surface-subtle"
					@select="router.push(`/${item.slug}`)"
				>
					<span
						class="flex size-7 items-center justify-center rounded-[6px] bg-surface-subtle text-[13px] font-bold text-secondary"
					>
						{{ initials(item.name) }}
					</span>
					<span class="min-w-0 flex-1 truncate">{{ item.name }}</span>
				</DropdownMenuItem>

				<p v-if="others.length === 0" class="px-3 py-2 text-[14px] text-muted">{{ copy.onlyOne }}</p>

				<DropdownMenuSeparator class="my-2 h-px bg-divider" />

				<DropdownMenuItem
					class="flex cursor-pointer items-center gap-3 rounded-nav px-3 py-2.5 text-[15px] text-text outline-none data-highlighted:bg-surface-subtle"
					@select="router.push('/workspaces')"
				>
					{{ copy.seeAll }}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenuPortal>
	</DropdownMenuRoot>
</template>
