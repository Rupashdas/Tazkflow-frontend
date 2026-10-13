<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, X } from 'lucide-vue-next'
import WizardLayout from '@/layouts/WizardLayout.vue'
import Button from '@/ui/Button.vue'
import SelectField from '@/ui/SelectField.vue'
import { api, endsSession, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { useRoles } from '@/features/roles/queries'
import { fill } from '@/lib/fill'
import { onboardingCopy } from './copy'

const copy = onboardingCopy.invite
const route = useRoute()
const router = useRouter()
const { data: roles, error: rolesError } = useRoles()

// Without roles every row would send role_id 0, so Send waits for them.
const rolesReady = computed(() => (roles.value?.length ?? 0) > 0)

// A member who opens this URL directly has no roles.view and gets a 403.
const rolesProblem = computed(() => {
	if (!rolesError.value) return ''
	return rolesError.value.response?.status === 403 ? copy.noPermission : copy.rolesFailed
})

const roleOptions = computed(() =>
	(roles.value ?? []).map((role) => ({ value: String(role.id), label: role.label, hint: copy.roleHints[role.name] })),
)

const rows = ref([
	{ email: '', roleId: '', error: '' },
	{ email: '', roleId: '', error: '' },
])
const sending = ref(false)
const formError = ref('')

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
	filled.value.length === 1 ? copy.submitOne : fill(copy.submit, { count: filled.value.length }),
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
	formError.value = ''
	for (const row of rows.value) row.error = ''

	let failed = 0

	try {
		await ensureCsrfCookie()

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
				// The unauthorized handler is already taking them to sign in;
				// the other rows would only fail the same way.
				if (endsSession(error)) return

				failed += 1
				const errors = fieldErrors(error)
				row.error = errors.email ?? errors.role_id ?? errorMessage(error, copy.rowFailed)
			}
		}
	} catch (error) {
		// No XSRF cookie, usually no connection: nothing was sent.
		formError.value = errorMessage(error, copy.failed)
		return
	} finally {
		sending.value = false
	}

	if (failed === 0) finish()
	else formError.value = copy.partial
}
</script>

<template>
	<WizardLayout :step="2">
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<p
			v-if="rolesProblem || formError"
			class="mt-6 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text"
			role="alert"
		>
			{{ rolesProblem || formError }}
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

					<SelectField
						v-model="row.roleId"
						:options="roleOptions"
						:aria-label="copy.roleLabel"
						class="w-[184px] max-md:w-full"
					/>

					<button
						v-if="rows.length > 1"
						type="button"
						class="mt-[3px] flex size-11 shrink-0 items-center justify-center text-icon-muted hover:text-text max-md:mt-0"
						:aria-label="copy.remove"
						@click="rows.splice(index, 1)"
					>
						<X class="size-5" aria-hidden="true" />
					</button>
				</div>

				<p v-if="row.error" class="mt-2 text-[14px] text-danger-text">{{ row.error }}</p>
			</div>

			<div class="flex flex-wrap items-center gap-4">
				<button type="button" class="flex min-h-10 items-center gap-1.5 text-[15px] font-semibold text-accent-text" @click="addRow">
					<Plus class="size-4" aria-hidden="true" />
					{{ copy.add }}
				</button>
				<span class="text-[15px] text-muted">{{ copy.paste }}</span>
			</div>
		</div>

		<div class="mt-8 flex items-center justify-between gap-3.5 border-t border-divider pt-6.5">
			<Button variant="ghost" @click="finish">{{ copy.later }}</Button>
			<Button :loading="sending" :disabled="filled.length === 0 || !rolesReady" @click="send">{{ submitLabel }}</Button>
		</div>
	</WizardLayout>
</template>
