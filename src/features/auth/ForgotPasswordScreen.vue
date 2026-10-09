<script setup>
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { authCopy } from './copy'

const copy = authCopy.forgot

const email = ref('')
const errors = ref({})
const notice = ref('')
const formError = ref('')
const submitting = ref(false)

async function submit() {
	submitting.value = true
	errors.value = {}
	formError.value = ''

	try {
		await ensureCsrfCookie()
		// The API answers the same way whether or not the address has an account,
		// so we show its message as it is and never say "no such user".
		const { data } = await api.post('/api/forgot-password', { email: email.value })
		notice.value = data.message
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

		<p v-if="notice" class="mt-6 rounded-control bg-success-soft px-4 py-3 text-[14px] text-success-text" role="status">
			{{ notice }}
		</p>

		<form v-else class="mt-8 flex flex-col gap-[22px]" @submit.prevent="submit">
			<p v-if="formError" class="rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
				{{ formError }}
			</p>

			<TextField v-model="email" :label="copy.email" type="email" autocomplete="email" :error="errors.email" />

			<Button type="submit" block :loading="submitting">{{ copy.submit }}</Button>
		</form>

		<template #footer>
			<RouterLink to="/login" class="font-semibold text-accent-text">{{ copy.back }}</RouterLink>
		</template>
	</AuthLayout>
</template>
