<script setup>
import { ref } from 'vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, endsSession, errorMessage, fieldErrors } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { fill } from '@/lib/fill'
import ChangeEmailDialog from './ChangeEmailDialog.vue'
import { accountCopy } from './copy'

const copy = accountCopy.security
const auth = useAuthStore()
const emailDialogOpen = ref(false)

const resending = ref(false)

async function resend() {
	resending.value = true
	try {
		const { status } = await api.post('/api/email/verification-notification')
		// 200 instead of 202: nothing was sent, because the new address was
		// confirmed meanwhile (another tab or device). Show the account as it is now.
		if (status === 200) {
			await auth.fetchUser()
			toast(copy.alreadyConfirmed)
			return
		}
		toast(copy.resent)
	} catch (error) {
		if (endsSession(error)) return
		// 429 after two tries a minute or ten an hour: the server's own sentence says so.
		toast(errorMessage(error, copy.resendFailed), 'error')
	} finally {
		resending.value = false
	}
}

const current = ref('')
const next = ref('')
const confirm = ref('')
const errors = ref({})
const formError = ref('')
const saving = ref(false)

async function changePassword() {
	saving.value = true
	errors.value = {}
	formError.value = ''

	try {
		await api.put('/api/user/password', {
			current_password: current.value,
			password: next.value,
			password_confirmation: confirm.value,
		})
		// Passwords never stay on screen after they are used.
		current.value = ''
		next.value = ''
		confirm.value = ''
		toast(copy.saved)
	} catch (error) {
		if (endsSession(error)) return
		errors.value = fieldErrors(error)
		if (Object.keys(errors.value).length === 0) formError.value = errorMessage(error, copy.failed)
	} finally {
		saving.value = false
	}
}
</script>

<template>
	<div>
		<p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ copy.overline }}</p>
		<h1 class="mt-2.5 text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<section class="mt-8 rounded-card border border-border bg-surface p-7 shadow-card max-md:p-5">
			<div class="flex items-center justify-between gap-4">
				<div class="min-w-0">
					<h2 class="text-[20px] font-semibold text-text">{{ copy.emailTitle }}</h2>
					<p class="mt-1 truncate text-secondary">{{ auth.user.email }}</p>
				</div>
				<Button variant="secondary" @click="emailDialogOpen = true">{{ copy.change }}</Button>
			</div>

			<div
				v-if="auth.user.pending_email"
				class="mt-5 rounded-control bg-warning-soft px-4 py-3.5 text-[14px] text-warning-text"
				role="status"
			>
				<p class="font-semibold">{{ fill(copy.pendingTitle, { email: auth.user.pending_email }) }}</p>
				<p class="mt-1">{{ fill(copy.pendingBody, { email: auth.user.email }) }}</p>
				<div class="mt-3 flex flex-wrap gap-5">
					<button type="button" class="min-h-10 font-semibold underline-offset-2 hover:underline disabled:opacity-60" :disabled="resending" @click="resend">
						{{ copy.resend }}
					</button>				</div>
			</div>
		</section>

		<ChangeEmailDialog v-model:open="emailDialogOpen" />

		<form class="mt-6 rounded-card border border-border bg-surface p-7 shadow-card max-md:p-5" @submit.prevent="changePassword">
			<h2 class="text-[20px] font-semibold text-text">{{ copy.passwordTitle }}</h2>

			<p v-if="formError" class="mt-5 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
				{{ formError }}
			</p>

			<div class="mt-6 flex flex-col gap-[22px]">
				<TextField v-model="current" type="password" :label="copy.current" autocomplete="current-password" :error="errors.current_password" />
				<TextField v-model="next" type="password" :label="copy.next" :hint="copy.nextHint" autocomplete="new-password" :error="errors.password" />
				<TextField v-model="confirm" type="password" :label="copy.confirm" autocomplete="new-password" />
			</div>

			<div class="mt-7 flex justify-end border-t border-divider pt-6">
				<Button type="submit" :loading="saving">{{ copy.save }}</Button>
			</div>
		</form>
	</div>
</template>
