<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
	SelectContent,
	SelectIcon,
	SelectItem,
	SelectItemText,
	SelectPortal,
	SelectRoot,
	SelectTrigger,
	SelectValue,
	SelectViewport,
} from 'reka-ui'
import { Check, ChevronDown, Plus, X } from 'lucide-vue-next'
import WizardLayout from '@/layouts/WizardLayout.vue'
import Button from '@/ui/Button.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { useRoles } from '@/features/workspaces/queries'
import { onboardingCopy } from './copy'

const copy = onboardingCopy.invite
const route = useRoute()
const router = useRouter()
const { data: roles } = useRoles()

const rows = ref([
	{ email: '', roleId: '', error: '' },
	{ email: '', roleId: '', error: '' },
])
const sending = ref(false)
const partialError = ref('')

// Member is the sensible default for a teammate; every new workspace has it.
const defaultRoleId = computed(() => {
	const role = (roles.value ?? []).find((r) => r.name === 'member') ?? roles.value?.[0]
	return role ? String(role.id) : ''
})

watch(defaultRoleId, (id) => {
	for (const row of rows.value) if (!row.roleId) row.roleId = id
})

const filled = computed(() => rows.value.filter((row) => row.email.trim() !== ''))

const submitLabel = computed(() =>
	filled.value.length === 1 ? copy.submitOne : copy.submit.replace('{count}', String(filled.value.length)),
)

function addRow() {
	rows.value.push({ email: '', roleId: defaultRoleId.value, error: '' })
}

/** Pasting "a@x.com, b@y.com" fills a row each instead of one unusable row. */
function onPaste(event, index) {
	const text = event.clipboardData?.getData('text') ?? ''
	const parts = text.split(/[\s,;]+/).filter((part) => part.includes('@'))
	if (parts.length < 2) return

	event.preventDefault()
	const roleId = rows.value[index]?.roleId || defaultRoleId.value
	rows.value.splice(index, 1, ...parts.map((email) => ({ email, roleId, error: '' })))
}

function finish() {
	router.replace(`/${route.params.workspace}`)
}

async function send() {
	sending.value = true
	partialError.value = ''
	for (const row of rows.value) row.error = ''

	await ensureCsrfCookie()
	let failed = 0

	// One request per row, so one bad address does not throw the rest away.
	for (const row of rows.value) {
		if (row.email.trim() === '') continue

		try {
			await api.post('/api/invitations', {
				name: row.email.split('@')[0],
				email: row.email.trim(),
				role_id: Number(row.roleId),
			})
			row.email = ''
		} catch (error) {
			failed += 1
			const errors = fieldErrors(error)
			row.error = errors.email ?? errors.role_id ?? errorMessage(error, copy.rowFailed)
		}
	}

	sending.value = false

	if (failed === 0) finish()
	else partialError.value = copy.partial
}
</script>

<template>
	<WizardLayout :step="2">
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<p v-if="partialError" class="mt-6 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
			{{ partialError }}
		</p>

		<div class="mt-7 flex flex-col gap-4">
			<div v-for="(row, index) in rows" :key="index">
				<div class="flex items-start gap-3.5 max-md:flex-col">
					<input
						v-model="row.email"
						type="email"
						:placeholder="copy.emailPlaceholder"
						:aria-label="copy.emailLabel"
						autocomplete="off"
						class="h-[50px] min-w-0 flex-1 rounded-control border bg-surface px-4 text-[16px] text-text placeholder:text-muted max-md:w-full"
						:class="row.error ? 'border-danger' : 'border-border-strong'"
						:aria-invalid="row.error ? 'true' : undefined"
						@paste="onPaste($event, index)"
					/>

					<!-- The only role picker in Plan A. Plan B's settings are its second
					     user, and it moves into ui/SelectField.vue then. -->
					<SelectRoot v-model="row.roleId">
						<SelectTrigger
							:aria-label="copy.roleLabel"
							class="flex h-[50px] w-[184px] items-center gap-2.5 rounded-control border border-border-strong bg-surface px-4 text-[16px] text-text max-md:w-full"
						>
							<SelectValue class="flex-1 truncate text-left" />
							<SelectIcon>
								<ChevronDown class="size-4 text-icon-muted" aria-hidden="true" />
							</SelectIcon>
						</SelectTrigger>

						<SelectPortal>
							<SelectContent
								position="popper"
								:side-offset="6"
								class="z-50 w-[var(--reka-select-trigger-width)] min-w-[240px] rounded-card border border-border bg-surface p-2 shadow-popover"
							>
								<SelectViewport>
									<SelectItem
										v-for="role in roles ?? []"
										:key="role.id"
										:value="String(role.id)"
										class="flex cursor-pointer items-start gap-2 rounded-nav px-3.5 py-3 outline-none data-highlighted:bg-surface-subtle data-[state=checked]:bg-accent-soft"
									>
										<span class="min-w-0 flex-1">
											<SelectItemText class="block text-[15px] font-semibold text-text">{{ role.label }}</SelectItemText>
											<span v-if="copy.roleHints[role.name]" class="mt-0.5 block text-[14px] text-muted">
												{{ copy.roleHints[role.name] }}
											</span>
										</span>
										<Check
											v-if="String(role.id) === row.roleId"
											class="mt-0.5 size-4 shrink-0 text-accent-soft-text"
											aria-hidden="true"
										/>
									</SelectItem>
								</SelectViewport>
							</SelectContent>
						</SelectPortal>
					</SelectRoot>

					<button
						v-if="rows.length > 1"
						type="button"
						class="mt-3 text-icon-muted hover:text-text max-md:mt-0"
						:aria-label="copy.remove"
						@click="rows.splice(index, 1)"
					>
						<X class="size-5" aria-hidden="true" />
					</button>
				</div>

				<p v-if="row.error" class="mt-2 text-[14px] text-danger-text">{{ row.error }}</p>
			</div>

			<div class="flex flex-wrap items-center gap-4">
				<button type="button" class="flex items-center gap-1.5 text-[15px] font-semibold text-accent-text" @click="addRow">
					<Plus class="size-4" aria-hidden="true" />
					{{ copy.add }}
				</button>
				<span class="text-[15px] text-muted">{{ copy.paste }}</span>
			</div>
		</div>

		<div class="mt-8 flex items-center justify-between gap-3.5 border-t border-divider pt-6.5">
			<Button variant="ghost" @click="finish">{{ copy.later }}</Button>
			<Button :loading="sending" :disabled="filled.length === 0" @click="send">{{ submitLabel }}</Button>
		</div>
	</WizardLayout>
</template>
