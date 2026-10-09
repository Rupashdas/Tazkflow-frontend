<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { fieldErrors, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const copy = authCopy.login
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(false)
const errors = ref({})
const formError = ref('')
const submitting = ref(false)

async function submit() {
	submitting.value = true
	errors.value = {}
	formError.value = ''

	try {
		await auth.login(email.value, password.value, remember.value)
		const next = typeof route.query.next === 'string' ? route.query.next : '/'
		await router.replace(next)
	} catch (error) {
		// 422: a wrong password lands under the email field.
		errors.value = fieldErrors(error)

		// Anything else (deactivated account, too many tries, no network) needs a
		// place of its own, or the form just refuses to submit with no reason.
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

			<TextField
				v-model="email"
				:label="copy.email"
				type="email"
				autocomplete="email"
				:error="errors.email"
			/>

			<div>
				<TextField
					v-model="password"
					:label="copy.password"
					type="password"
					autocomplete="current-password"
					:error="errors.password"
				/>
				<RouterLink to="/forgot-password" class="mt-2 inline-block text-[14px] font-medium text-accent-text">
					{{ copy.forgot }}
				</RouterLink>
			</div>

			<label class="flex items-center gap-2.5 text-[15px] text-secondary">
				<input v-model="remember" type="checkbox" class="size-5 rounded-[6px] accent-[var(--accent)]" />
				{{ copy.remember }}
			</label>

			<Button type="submit" block :loading="submitting">{{ copy.submit }}</Button>
		</form>

		<template #footer>
			{{ copy.footerQuestion }}
			<RouterLink to="/register" class="font-semibold text-accent-text">{{ copy.footerAction }}</RouterLink>
		</template>
	</AuthLayout>
</template>
