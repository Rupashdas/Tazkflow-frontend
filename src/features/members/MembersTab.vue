<script setup>
import { computed } from 'vue'
import Avatar from '@/ui/Avatar.vue'
import { formatDate } from '@/lib/intl'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMembers } from './queries'
import { membersCopy } from './copy'

const copy = membersCopy.list
const auth = useAuthStore()
const { data, isPending, isError, refetch } = useMembers()

const members = computed(() => data.value?.pages.flatMap((page) => page.data) ?? [])

const joined = (member) => copy.joined.replace('{date}', formatDate(member.joined_at, auth.user.preferences))
</script>

<template>
	<div>
		<div v-if="isPending" class="space-y-2">
			<div v-for="n in 4" :key="n" class="h-[72px] animate-pulse rounded-card bg-surface-subtle" />
		</div>

		<div v-else-if="isError" class="rounded-card border border-border bg-surface p-8 shadow-card">
			<h2 class="text-[20px] font-semibold text-text">{{ copy.errorTitle }}</h2>
			<button class="mt-4 text-[15px] font-semibold text-accent-text" @click="refetch()">{{ copy.retry }}</button>
		</div>

		<ul v-else class="divide-y divide-divider rounded-card border border-border bg-surface shadow-card">
			<li v-for="member in members" :key="member.id" class="flex min-h-[72px] items-center gap-4 px-5 py-3">
				<Avatar :name="member.name" :src="member.avatar" />

				<div class="min-w-0 flex-1">
					<p class="flex items-center gap-2 text-[15px] font-semibold text-text">
						<span class="truncate">{{ member.name }}</span>
						<span v-if="member.id === auth.user.id" class="shrink-0 font-normal text-muted">{{ copy.you }}</span>
						<span
							v-if="member.is_owner"
							class="shrink-0 rounded-chip bg-accent-soft px-2 py-0.5 text-[14px] font-semibold text-accent-soft-text"
						>
							{{ copy.owner }}
						</span>
					</p>
					<p class="truncate text-[14px] text-muted">{{ member.email }}</p>
				</div>

				<span class="w-[180px] shrink-0 truncate text-[15px] text-secondary">{{ member.role?.label ?? copy.noRole }}</span>

				<!-- The word, not just the colour, says which state it is. -->
				<span class="w-[120px] shrink-0">
					<span
						class="rounded-chip px-2 py-1 text-[14px] font-medium"
						:class="member.is_active ? 'bg-success-soft text-success-text' : 'bg-surface-subtle text-muted'"
					>
						{{ member.is_active ? copy.active : copy.deactivated }}
					</span>
				</span>

				<span class="w-[150px] shrink-0 text-[14px] text-muted">{{ joined(member) }}</span>
			</li>
		</ul>
	</div>
</template>
