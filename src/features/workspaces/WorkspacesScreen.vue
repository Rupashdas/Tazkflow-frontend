<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import Button from '@/ui/Button.vue'
import { useWorkspaces } from './queries'
import { initials } from '@/lib/initials'
import { workspaceCopy } from './copy'

const copy = workspaceCopy.list
const router = useRouter()
const route = useRoute()
const { data: workspaces, isPending, isError, refetch } = useWorkspaces()

// Why they were sent here, if they were sent here.
const issue = computed(() => {
	const code = route.query.issue
	if (typeof code !== 'string') return ''
	return workspaceCopy.issues[code] ?? ''
})
</script>

<template>
	<div class="min-h-screen bg-page">
		<header class="flex h-[68px] items-center gap-3 border-b border-border bg-surface px-8">
			<div class="flex size-[34px] items-center justify-center rounded-[9px] bg-text text-[15px] font-bold text-page">
				T
			</div>
			<span class="text-[17px] font-bold text-text">Tazkflow</span>
		</header>

		<div class="mx-auto max-w-[720px] px-6 py-12">
			<p v-if="issue" class="mb-8 rounded-control bg-warning-soft px-4 py-3 text-[14px] text-warning-text" role="status">
				{{ issue }}
			</p>
			
			<p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ copy.overline }}</p>
			<h1 class="mt-2.5 text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
			<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

			<div v-if="isPending" class="mt-8 space-y-3">
				<div v-for="n in 2" :key="n" class="h-[84px] animate-pulse rounded-card bg-surface-subtle" />
			</div>

			<div v-else-if="isError" class="mt-8 rounded-card border border-border bg-surface p-8 shadow-card">
				<h2 class="text-[20px] font-semibold text-text">{{ copy.errorTitle }}</h2>
				<button class="mt-4 text-[15px] font-semibold text-accent-text" @click="refetch()">{{ copy.retry }}</button>
			</div>

			<div
				v-else-if="workspaces && workspaces.length === 0"
				class="mt-8 rounded-card border border-border bg-surface p-9 text-center shadow-card"
			>
				<h2 class="text-[20px] font-semibold text-text">{{ copy.emptyTitle }}</h2>
				<p class="mx-auto mt-2 max-w-[420px] text-secondary">{{ copy.emptyBody }}</p>
				<div class="mt-6 flex justify-center">
					<Button @click="router.push('/welcome')">
						<Plus class="size-4" aria-hidden="true" />
						{{ copy.create }}
					</Button>
				</div>
			</div>

			<template v-else>
				<ul class="mt-8 flex flex-col gap-3">
					<li
						v-for="item in workspaces"
						:key="item.slug"
						class="flex items-center gap-5 rounded-card border border-border bg-surface p-5 shadow-card"
					>
						<span
							class="flex size-11 shrink-0 items-center justify-center rounded-card bg-surface-subtle text-[15px] font-bold text-secondary"
						>
							{{ initials(item.name) }}
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-[16px] font-semibold text-text">{{ item.name }}</span>
							<span class="block truncate text-[14px] text-muted">
								tazkflow.app/{{ item.slug }} · {{ item.is_owner ? copy.owner : (item.role?.label ?? '—') }}
							</span>
						</span>
						<Button variant="secondary" @click="router.push(`/${item.slug}`)">{{ copy.open }}</Button>
					</li>
				</ul>

				<div class="mt-6">
					<Button variant="secondary" @click="router.push('/welcome')">
						<Plus class="size-4" aria-hidden="true" />
						{{ copy.create }}
					</Button>
				</div>
			</template>
		</div>
	</div>
</template>
