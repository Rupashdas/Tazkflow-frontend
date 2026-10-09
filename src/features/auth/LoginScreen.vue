<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
				<div
					class="flex size-10 items-center justify-center rounded-control bg-text text-[18px] font-bold text-page"
				>
					T
				</div>
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

					<button
						type="submit"
						:disabled="submitting"
						class="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-control bg-accent px-5 text-[15px] font-semibold text-accent-contrast transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<span
							v-if="submitting"
							class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							aria-hidden="true"
						/>
						{{ copy.submit }}
					</button>
				</form>
			</div>
		</div>
	</div>
</template>
