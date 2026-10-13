<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { fill } from '@/lib/fill'
import { authCopy } from './copy'

const copy = authCopy.reset
const route = useRoute()
const auth = useAuthStore()

// The emailed link carries both of these. Without them there is nothing to do.
const token = typeof route.query.token === 'string' ? route.query.token : ''
const email = typeof route.query.email === 'string' ? route.query.email : ''

const password = ref('')
const passwordConfirmation = ref('')
const errors = ref({})
const formError = ref('')
const submitting = ref(false)
const done = ref(false)

const subtitle = computed(() => fill(copy.subtitle, { email }))

async function submit() {
	submitting.value = true
	errors.value = {}
	formError.value = ''

	try {
		await ensureCsrfCookie()
		await api.post('/api/reset-password', {
			token,
			email,
			password: password.value,
			password_confirmation: passwordConfirmation.value,
		})

		// Only now, with a valid token used, does anyone get signed out: the new
		// password should be what lets them back in, and a link for another
		// account must not leave the previous person signed in on this device.
		if (auth.isLoggedIn) await auth.logout()
		done.value = true
	} catch (error) {
		errors.value = fieldErrors(error)
		// A bad or expired token comes back under "email", a field this form
		// does not show — so it becomes the message for the whole form.
		formError.value = errors.value.email ?? (errors.value.password ? '' : errorMessage(error, copy.failed))
	} finally {
		submitting.value = false
	}
}
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>

		<template v-if="!token || !email">
			<p class="mt-2 text-secondary">{{ copy.brokenLink }}</p>
			<RouterLink to="/forgot-password" class="mt-8 inline-block font-semibold text-accent-text">
				{{ copy.newLink }}
			</RouterLink>
		</template>

		<template v-else-if="done">
			<p class="mt-6 rounded-control bg-success-soft px-4 py-3 text-[14px] text-success-text" role="status">
				{{ copy.done }}
			</p>
			<RouterLink to="/login" class="mt-8 inline-block font-semibold text-accent-text">{{ copy.signIn }}</RouterLink>
		</template>

		<template v-else>
			<p class="mt-2 text-secondary">{{ subtitle }}</p>

			<form class="mt-8 flex flex-col gap-[22px]" @submit.prevent="submit">
				<p v-if="formError" class="rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
					{{ formError }}
				</p>

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
		</template>
	</AuthLayout>
</template>
