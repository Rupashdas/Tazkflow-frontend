<script setup>
import { computed, ref, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { MoreHorizontal, Search, SearchX } from 'lucide-vue-next'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import Avatar from '@/ui/Avatar.vue'
import Button from '@/ui/Button.vue'
import Dialog from '@/ui/Dialog.vue'
import SelectField from '@/ui/SelectField.vue'
import { api, endsSession, errorMessage } from '@/lib/api'
import { fill } from '@/lib/fill'
import { formatDate } from '@/lib/intl'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useCan } from '@/features/workspaces/useCan'
import { useCurrentWorkspace } from '@/features/workspaces/queries'
import { useRoles } from '@/features/roles/queries'
import { useMembers } from './queries'
import { membersCopy } from './copy'

const copy = membersCopy.list
const auth = useAuthStore()
const workspace = useWorkspaceStore()
const queryClient = useQueryClient()
const { can } = useCan()
const { data: roles } = useRoles()

const search = ref('')
const searched = ref('')
let timer = null

// Ask the API once typing pauses, not on every keystroke.
watch(search, (value) => {
	clearTimeout(timer)
	timer = setTimeout(() => {
		searched.value = value.trim()
	}, 250)
})

// A role id or 'none', and 'active' or 'deactivated'. 'all' leaves the filter out.
const roleFilter = ref('all')
const statusFilter = ref('all')
const filtered = computed(() => roleFilter.value !== 'all' || statusFilter.value !== 'all')

// A button press needs no pause: empty everything at once so the list is back now.
function clearFilters() {
	clearTimeout(timer)
	search.value = ''
	searched.value = ''
	roleFilter.value = 'all'
	statusFilter.value = 'all'
}

// The roles come from roles.view; without it there is nothing to pick from.
const roleFilterOptions = computed(() => [
	{ value: 'all', label: copy.allRoles },
	...(roles.value ?? []).map((role) => ({ value: String(role.id), label: role.label })),
	{ value: 'none', label: copy.noRole },
])

const statusFilterOptions = [
	{ value: 'all', label: copy.allStatuses },
	{ value: 'active', label: copy.active },
	{ value: 'deactivated', label: copy.deactivated },
]

const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useMembers({
	search: searched,
	role: roleFilter,
	status: statusFilter,
})

const members = computed(() => data.value?.pages.flatMap((page) => page.data) ?? [])

const joined = (member) => copy.joined.replace('{date}', formatDate(member.joined_at, auth.user.preferences))

/**
 * The API's rule, checked here so nobody is offered what it will refuse: no
 * one acts on a person whose role allows more than they can do. Without
 * roles.view the roles' capabilities are unknown, so nothing is held back and
 * the API's own message explains a refusal.
 */
function outranksMe(roleRef) {
	if (!roleRef || !can('roles.view')) return false
	// Not loaded yet: hold the controls back rather than show and then hide them.
	const role = roles.value?.find((item) => item.id === roleRef.id)
	return !role || !role.capabilities.every(can)
}

const roleOptions = computed(() =>
	(roles.value ?? []).filter((role) => role.capabilities.every(can)).map((role) => ({ value: String(role.id), label: role.label })),
)

/** Whether the row's actions (access, removal) are offered for this person. */
const manageable = (member) =>
	can('members.manage') && !member.is_owner && member.id !== auth.user.id && !outranksMe(member.role)

/** The role becomes a dropdown only when there is a role to pick. */
const roleEditable = (member) => manageable(member) && roleOptions.value.length > 0

const membersKey = () => ['workspace', workspace.slug, 'members']

const {
	mutate: changeRole,
	isPending: changingRole,
	variables: roleChange,
} = useMutation({
	mutationFn: ({ member, roleId }) => api.patch(`/api/members/${member.id}/role`, { role_id: Number(roleId) }),
	onSuccess: ({ data }) => toast(fill(copy.roleChanged, { name: data.data.name, role: data.data.role.label })),
	onError: (error) => {
		if (!endsSession(error)) toast(errorMessage(error, copy.roleFailed), 'error')
	},
	onSettled: () => {
		queryClient.invalidateQueries({ queryKey: membersKey() })
		// Each role shows how many hold it.
		queryClient.invalidateQueries({ queryKey: ['workspace', workspace.slug, 'roles'] })
	},
})

/** Set one member's is_active in every cached page of every search. */
function setActive(memberId, isActive) {
	queryClient.setQueriesData(
		{ queryKey: membersKey() },
		(data) =>
			data && {
				...data,
				pages: data.pages.map((page) => ({
					...page,
					data: page.data.map((item) => (item.id === memberId ? { ...item, is_active: isActive } : item)),
				})),
			},
	)
}

// The value wanted is sent, not "flip it", so a second press or another
// admin's press at the same moment cannot undo it.
const { mutate: setAccess } = useMutation({
	mutationFn: ({ member, isActive }) => api.patch(`/api/members/${member.id}/active`, { is_active: isActive }),
	// Optimistic: the row changes now. Keep what was there to put back on failure.
	onMutate: async ({ member, isActive }) => {
		await queryClient.cancelQueries({ queryKey: membersKey() })
		const before = queryClient.getQueriesData({ queryKey: membersKey() })
		setActive(member.id, isActive)
		return { before }
	},
	onSuccess: ({ data }) => toast(fill(data.data.is_active ? copy.nowActivated : copy.nowDeactivated, { name: data.data.name })),
	onError: (error, variables, context) => {
		for (const [key, value] of context?.before ?? []) queryClient.setQueryData(key, value)
		if (!endsSession(error)) toast(errorMessage(error, copy.toggleFailed), 'error')
	},
	onSettled: () => queryClient.invalidateQueries({ queryKey: membersKey() }),
})

const { data: currentWorkspace } = useCurrentWorkspace()
const removing = ref(null) // the member the dialog asks about
const removeError = ref('')

const removeOpen = computed({
	get: () => removing.value !== null,
	set: (open) => {
		// Stays open until the answer comes, so the answer lands on this dialog
		// and not on one opened for someone else meanwhile.
		if (!open && !removingNow.value) removing.value = null
	},
})

function askRemove(member) {
	removeError.value = ''
	removing.value = member
}

/** Whether the dialog still asks about this member. */
const asksAbout = (member) => removing.value?.id === member.id

const { mutate: remove, isPending: removingNow } = useMutation({
	mutationFn: (member) => api.delete(`/api/members/${member.id}`),
	onSuccess: (_, member) => {
		toast(fill(copy.removed, { name: member.name }))
		if (asksAbout(member)) removing.value = null
	},
	onError: (error, member) => {
		// Shown in the dialog, which is still open, next to the button they pressed.
		if (!endsSession(error) && asksAbout(member)) removeError.value = errorMessage(error, copy.removeFailed)
	},
	onSettled: () => {
		queryClient.invalidateQueries({ queryKey: membersKey() })
		queryClient.invalidateQueries({ queryKey: ['workspace', workspace.slug, 'roles'] })
	},
})
</script>

<template>
	<div>
		<div class="mb-4 flex flex-wrap gap-3 max-md:flex-col">
			<label class="relative block w-[360px] max-md:w-full">
				<span class="sr-only">{{ copy.search }}</span>
				<Search class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-icon-muted" aria-hidden="true" />
				<input
					v-model="search"
					type="search"
					:placeholder="copy.search"
					class="h-[50px] w-full rounded-control border border-border-strong bg-surface pl-11 pr-4 text-[16px] text-text placeholder:text-muted"
				/>
			</label>

			<SelectField
				v-if="roles"
				v-model="roleFilter"
				:options="roleFilterOptions"
				:aria-label="copy.roleFilter"
				class="w-[184px] max-md:w-full"
			/>

			<SelectField
				v-model="statusFilter"
				:options="statusFilterOptions"
				:aria-label="copy.statusFilter"
				class="w-[184px] max-md:w-full"
			/>
		</div>

		<div v-if="isPending" class="space-y-2">
			<div v-for="n in 4" :key="n" class="h-[72px] animate-pulse rounded-card bg-surface-subtle" />
		</div>

		<div v-else-if="isError" class="rounded-card border border-border bg-surface p-8 shadow-card">
			<h2 class="text-[20px] font-semibold text-text">{{ copy.errorTitle }}</h2>
			<button class="mt-4 text-[15px] font-semibold text-accent-text" @click="refetch()">{{ copy.retry }}</button>
		</div>

		<div
			v-else-if="members.length === 0"
			class="flex flex-col items-center rounded-card border border-border bg-surface px-8 py-14 text-center shadow-card"
		>
			<div class="flex size-12 items-center justify-center rounded-card bg-accent-soft">
				<SearchX class="size-6 text-accent-soft-text" aria-hidden="true" />
			</div>
			<h2 class="mt-5 max-w-[520px] break-words text-[20px] font-semibold text-text">
				{{ searched ? fill(copy.noMatchTitle, { search: searched }) : copy.noFilterMatchTitle }}
			</h2>
			<p class="mt-2 max-w-[420px] text-secondary">{{ searched && !filtered ? copy.noMatchBody : copy.noFilterMatchBody }}</p>
			<Button variant="secondary" class="mt-6" @click="clearFilters">
				{{ filtered ? copy.clearFilters : copy.clearSearch }}
			</Button>
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

				<div class="w-[180px] shrink-0">
					<SelectField
						v-if="roleEditable(member)"
						:model-value="String(member.role?.id ?? '')"
						:options="roleOptions"
						:aria-label="fill(copy.roleLabel, { name: member.name })"
						:disabled="changingRole && roleChange?.member.id === member.id"
						class="w-full"
						@update:model-value="(roleId) => changeRole({ member, roleId })"
					/>
					<span v-else class="block truncate text-[15px] text-secondary">{{ member.role?.label ?? copy.noRole }}</span>
				</div>

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

				<div class="flex w-11 shrink-0 justify-end">
					<DropdownMenuRoot v-if="manageable(member)">
						<DropdownMenuTrigger
							:aria-label="fill(copy.actions, { name: member.name })"
							class="flex size-10 items-center justify-center rounded-control text-icon-muted hover:bg-surface-subtle hover:text-text"
						>
							<MoreHorizontal class="size-5" aria-hidden="true" />
						</DropdownMenuTrigger>
						<DropdownMenuPortal>
							<DropdownMenuContent
								align="end"
								:side-offset="6"
								class="z-50 w-[200px] rounded-card border border-border bg-surface p-2 shadow-popover"
							>
								<DropdownMenuItem
									class="cursor-pointer rounded-nav px-3 py-2.5 text-[15px] text-text outline-none data-highlighted:bg-surface-subtle"
									@select="setAccess({ member, isActive: !member.is_active })"
								>
									{{ member.is_active ? copy.deactivate : copy.activate }}
								</DropdownMenuItem>
								<DropdownMenuItem
									class="cursor-pointer rounded-nav px-3 py-2.5 text-[15px] text-danger-text outline-none data-highlighted:bg-danger-soft"
									@select="askRemove(member)"
								>
									{{ copy.remove }}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuPortal>
					</DropdownMenuRoot>
				</div>
			</li>
		</ul>

		<div v-if="!isPending && !isError && hasNextPage" class="mt-4 flex justify-center">
			<Button variant="secondary" :loading="isFetchingNextPage" @click="fetchNextPage()">{{ copy.loadMore }}</Button>
		</div>

		<Dialog v-model:open="removeOpen" :title="fill(copy.removeTitle, { name: removing?.name ?? '' })" :close-label="copy.close">
			<p class="mt-2 text-secondary">
				{{ fill(copy.removeBody, { name: removing?.name ?? '', workspace: currentWorkspace?.name ?? '' }) }}
			</p>
			<p v-if="removeError" class="mt-5 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
				{{ removeError }}
			</p>
			<div class="mt-7 flex justify-end gap-3">
				<Button variant="secondary" :disabled="removingNow" @click="removeOpen = false">{{ copy.cancel }}</Button>
				<Button variant="danger" :loading="removingNow" @click="remove(removing)">{{ copy.removeConfirm }}</Button>
			</div>
		</Dialog>
	</div>
</template>
