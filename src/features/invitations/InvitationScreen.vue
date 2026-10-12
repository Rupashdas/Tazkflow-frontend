<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { invitationCopy as copy } from './copy'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const token = String(route.params.token ?? '')
const invitation = ref(null)
const loading = ref(true)
const invalid = ref(false)
const name = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errors = ref({})
const formError = ref('')
const working = ref(false)

/** Which of the four situations this visitor is in. */
const mode = computed(() => {
	const data = invitation.value
	if (!data) return 'create'
	if (!auth.isLoggedIn) return data.account_exists ? 'signIn' : 'create'
	return auth.user?.email.toLowerCase() === data.email.toLowerCase() ? 'join' : 'wrongAccount'
})

const title = computed(() => copy.title.replace('{workspace}', invitation.value?.workspace.name ?? ''))
const invitedBy = computed(() =>
	copy.invitedBy
		.replace('{name}', invitation.value?.invited_by ?? '')
		.replace('{role}', invitation.value?.role ?? copy.defaultRole),
)

onMounted(async () => {
	try {
		const { data } = await api.get(`/api/invitations/${token}`)
		invitation.value = data.data
		name.value = data.data.name
	} catch {
		invalid.value = true
	} finally {
		loading.value = false
	}
})

async function enter(slug) {
	await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
	await router.replace(`/${slug}`)
}

async function accept() {
	working.value = true
	errors.value = {}
	formError.value = ''

	try {
		await ensureCsrfCookie()
		const { data } = await api.post(`/api/invitations/${token}/accept`, {
			name: name.value,
			password: password.value,
			password_confirmation: passwordConfirmation.value,
		})

		// Accepting signs them in and confirms the address in one step.
		auth.setUser(data.data)
		await enter(invitation.value.workspace.slug)
	} catch (error) {
		errors.value = fieldErrors(error)
		if (Object.keys(errors.value).length === 0) {
			formError.value = errorMessage(error, copy.failed)
		}
	} finally {
		working.value = false
	}
}

async function join() {
	working.value = true
	formError.value = ''

	try {
		await ensureCsrfCookie()
		const { data } = await api.post(`/api/invitations/${token}/join`)
		await enter(data.data.slug)
	} catch (error) {
		formError.value = errorMessage(error, copy.failed)
	} finally {
		working.value = false
	}
}

async function signOut() {
	await auth.logout()
	// Same page, now as a guest, so the invitation can be taken up properly.
	router.go(0)
}
</script>

<template>
	<AuthLayout>
		<p v-if="loading" class="text-muted">{{ copy.loading }}</p>

		<template v-else-if="invalid">
			<h1 class="text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.invalidTitle }}</h1>
			<p class="mt-2 text-secondary">{{ copy.invalidBody }}</p>
		</template>

		<template v-else>
			<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ title }}</h1>
			<p class="mt-2 text-secondary">{{ invitedBy }}</p>

			<p v-if="formError" class="mt-6 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
				{{ formError }}
			</p>

			<!-- No account yet: make one and join in the same step. -->
			<form v-if="mode === 'create'" class="mt-8 flex flex-col gap-[22px]" @submit.prevent="accept">
				<h2 class="text-[20px] font-semibold text-text">{{ copy.createTitle }}</h2>
				<TextField v-model="name" :label="copy.name" autocomplete="name" :error="errors.name" />
				<TextField
					v-model="password"
					:label="copy.password"
					type="password"
					autocomplete="new-password"
					:hint="copy.passwordHint"
					:error="errors.password"
				/>
				<TextField v-model="passwordConfirmation" :label="copy.confirm" type="password" autocomplete="new-password" />
				<Button type="submit" block :loading="working">{{ copy.accept }}</Button>
			</form>

			<!-- Signed in with the invited address: one button. -->
			<div v-else-if="mode === 'join'" class="mt-8">
				<h2 class="text-[20px] font-semibold text-text">{{ copy.joinTitle }}</h2>
				<div class="mt-5">
					<Button :loading="working" @click="join">{{ copy.join }}</Button>
				</div>
			</div>

			<!-- Has an account but is not signed in. Login's ?next brings them back. -->
			<div v-else-if="mode === 'signIn'" class="mt-8">
				<h2 class="text-[20px] font-semibold text-text">{{ copy.haveAccountTitle }}</h2>
				<p class="mt-2 text-secondary">{{ copy.haveAccountBody.replace('{email}', invitation.email) }}</p>
				<div class="mt-5">
					<Button @click="router.push({ path: '/login', query: { next: route.fullPath } })">{{ copy.signIn }}</Button>
				</div>
			</div>

			<!-- Signed in as someone else. The API refuses this, so we say why first. -->
			<div v-else class="mt-8">
				<h2 class="text-[20px] font-semibold text-text">{{ copy.wrongAccountTitle }}</h2>
				<p class="mt-2 text-secondary">
					{{ copy.wrongAccountBody.replace('{email}', invitation.email).replace('{current}', auth.user?.email ?? '') }}
				</p>
				<div class="mt-5">
					<Button variant="secondary" @click="signOut">{{ copy.signOut }}</Button>
				</div>
			</div>
		</template>
	</AuthLayout>
</template>
