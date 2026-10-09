<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
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
		const response = error.response

		// 422: a wrong password lands under the email field.
		for (const [field, messages] of Object.entries(response?.data?.errors ?? {})) {
			if (messages[0]) errors.value[field] = messages[0]
		}

		// Anything else (deactivated account, too many tries, no network) needs a
		// place of its own, or the form just refuses to submit with no reason.
		if (Object.keys(errors.value).length === 0) {
			formError.value = response?.data?.message ?? copy.failed
		}
	} finally {
		submitting.value = false
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-page px-6 py-12">
		<div class="w-full max-w-[460px]">
			<div class="mb-8 flex items-center gap-3">
				<svg class="size-9" viewBox="0 0 100 100" aria-hidden="true">
					<path fill="#2563EB" d="M96.30 8.05C96.50 8.26 96.70 8.47 96.91 8.68C97.01 9.02 97.20 9.35 97.21 9.71C97.30 12.76 97.27 15.81 97.21 18.85C97.20 19.72 97.12 20.58 96.97 21.43C96.80 22.40 96.57 23.38 96.25 24.32C95.98 25.16 95.61 25.98 95.21 26.77C94.80 27.54 94.34 28.29 93.83 29.00C93.34 29.67 92.81 30.31 92.23 30.91C91.70 31.46 91.11 31.97 90.51 32.45C89.88 32.93 89.23 33.37 88.55 33.77C87.85 34.17 87.12 34.54 86.37 34.85C85.65 35.14 84.91 35.40 84.16 35.58C83.13 35.81 82.09 36.02 81.03 36.07C77.76 36.23 74.49 36.06 71.22 36.19C70.57 36.21 69.94 36.38 69.32 36.54C68.80 36.67 68.28 36.83 67.79 37.05C67.03 37.39 66.27 37.75 65.57 38.20C64.93 38.60 64.34 39.08 63.79 39.59C63.28 40.05 62.80 40.56 62.39 41.11C61.87 41.82 61.38 42.55 61.00 43.34C60.59 44.19 60.27 45.08 60.04 45.99C59.81 46.86 59.65 47.75 59.63 48.65C59.48 59.63 59.77 70.62 59.54 81.60C59.52 82.57 59.21 83.53 58.88 84.45C58.56 85.34 58.09 86.18 57.59 86.99C57.21 87.60 56.74 88.17 56.24 88.69C55.70 89.24 55.11 89.75 54.48 90.19C53.82 90.65 53.12 91.05 52.38 91.37C51.64 91.69 50.86 91.93 50.07 92.10C49.38 92.25 48.67 92.33 47.97 92.33C47.18 92.33 46.39 92.26 45.62 92.12C44.91 91.99 44.20 91.78 43.52 91.51C42.80 91.22 42.10 90.86 41.45 90.43C40.74 89.96 40.07 89.41 39.47 88.80C38.85 88.17 38.30 87.46 37.83 86.71C37.37 85.97 36.99 85.17 36.70 84.35C36.41 83.56 36.24 82.73 36.10 81.91C36.00 81.28 36.00 80.65 35.99 80.02C35.97 71.09 35.89 62.16 36.01 53.23C36.03 51.33 36.22 49.43 36.44 47.55C36.57 46.43 36.81 45.33 37.06 44.23C37.32 43.12 37.62 42.03 37.95 40.94C38.22 40.06 38.52 39.19 38.86 38.34C39.24 37.38 39.65 36.44 40.09 35.51C40.48 34.68 40.90 33.86 41.36 33.06C41.90 32.11 42.47 31.18 43.07 30.27C43.61 29.46 44.18 28.67 44.78 27.90C45.35 27.17 45.93 26.43 46.58 25.76C47.91 24.38 49.27 23.03 50.70 21.76C51.62 20.94 52.63 20.22 53.64 19.50C54.39 18.97 55.17 18.47 55.97 17.99C56.70 17.55 57.45 17.13 58.22 16.75C59.18 16.27 60.14 15.79 61.14 15.39C62.47 14.87 63.80 14.37 65.17 14.00C66.86 13.55 68.58 13.21 70.31 12.94C71.39 12.78 72.49 12.72 73.58 12.69C76.51 12.62 79.44 12.76 82.37 12.65C83.66 12.61 84.94 12.45 86.21 12.23C87.00 12.10 87.77 11.87 88.52 11.61C89.25 11.36 89.97 11.05 90.65 10.69C91.32 10.34 91.96 9.91 92.58 9.48C93.29 8.99 93.90 8.35 94.64 7.92C94.87 7.78 95.18 7.83 95.45 7.79C95.73 7.87 96.01 7.96 96.30 8.05Z" />
					<path fill="#2563EB" d="M57.41 12.75C56.22 13.41 54.99 14.01 53.82 14.72C52.56 15.50 51.31 16.34 50.12 17.23C48.99 18.08 47.90 18.99 46.85 19.94C45.97 20.74 45.12 21.59 44.31 22.47C43.37 23.50 42.47 24.55 41.62 25.65C40.84 26.65 40.12 27.70 39.43 28.76C38.83 29.68 38.25 30.62 37.75 31.60C36.99 33.06 36.35 34.57 35.66 36.06C35.58 36.11 35.51 36.15 35.44 36.20C28.52 36.21 21.60 36.32 14.68 36.22C13.69 36.21 12.68 36.11 11.72 35.86C10.77 35.62 9.84 35.26 8.98 34.78C8.10 34.30 7.32 33.66 6.56 33.01C6.11 32.63 5.75 32.17 5.38 31.71C5.08 31.33 4.78 30.93 4.56 30.50C4.11 29.64 3.68 28.76 3.38 27.84C3.13 27.08 3.02 26.28 2.93 25.48C2.86 24.82 2.86 24.15 2.92 23.50C3.01 22.64 3.17 21.78 3.41 20.95C3.61 20.26 3.90 19.59 4.23 18.96C4.56 18.33 4.92 17.71 5.38 17.17C5.97 16.45 6.64 15.79 7.35 15.19C7.89 14.74 8.50 14.36 9.12 14.04C9.84 13.67 10.60 13.37 11.38 13.13C12.02 12.93 12.69 12.83 13.35 12.74C13.83 12.68 14.31 12.67 14.79 12.67C29.00 12.68 43.20 12.73 57.41 12.75Z" />
				</svg>
				<span class="text-[20px] font-bold tracking-[-0.01em] text-text">Tazkflow</span>
			</div>

			<div class="rounded-card border border-border bg-surface p-9 shadow-card">
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

					<TextField
						v-model="password"
						:label="copy.password"
						type="password"
						autocomplete="current-password"
						:error="errors.password"
					/>

					<label class="flex items-center gap-2.5 text-[15px] text-secondary">
						<input v-model="remember" type="checkbox" class="size-5 rounded-[6px] accent-[var(--accent)]" />
						{{ copy.remember }}
					</label>

					<Button type="submit" block :loading="submitting">{{ copy.submit }}</Button>
				</form>
			</div>
		</div>
	</div>
</template>
