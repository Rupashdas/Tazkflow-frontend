<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const copy = authCopy.register
const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errors = ref({})
const formError = ref('')
const submitting = ref(false)

async function submit() {
	submitting.value = true
	errors.value = {}
	formError.value = ''

	try {
		await ensureCsrfCookie()
		const { data } = await api.post('/api/register', {
			name: name.value,
			email: email.value,
			password: password.value,
			password_confirmation: passwordConfirmation.value,
		})

		// Registering signs you in, so we go straight to the confirmation notice.
		auth.setUser(data.data)
		await router.replace('/verify-email')
	} catch (error) {
		errors.value = fieldErrors(error)
		if (Object.keys(errors.value).length === 0) {
			formError.value = errorMessage(error, copy.failed)
		}
	} finally {
		submitting.value = false
	}
}
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<form class="mt-8 flex flex-col gap-[22px]" @submit.prevent="submit">
			<p
				v-if="formError"
				class="rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text"
				role="alert"
			>
				{{ formError }}
			</p>

			<TextField v-model="name" :label="copy.name" autocomplete="name" :error="errors.name" />
			<TextField v-model="email" :label="copy.email" type="email" autocomplete="email" :error="errors.email" />
			<TextField
				v-model="password"
				:label="copy.password"
				type="password"
				autocomplete="new-password"
				:hint="copy.passwordHint"
				:error="errors.password"
			/>
			<TextField v-model="passwordConfirmation" :label="copy.confirm" type="password" autocomplete="new-password" />

			<Button type="submit" block :loading="submitting">{{ copy.submit }}</Button>
		</form>

		<template #footer>
			{{ copy.footerQuestion }}
			<RouterLink to="/login" class="font-semibold text-accent-text">{{ copy.footerAction }}</RouterLink>
		</template>
	</AuthLayout>
</template>
