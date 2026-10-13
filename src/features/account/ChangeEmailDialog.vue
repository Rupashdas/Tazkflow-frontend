<script setup>
import { ref, watch } from 'vue'
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
	DialogTitle,
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, endsSession, errorMessage, fieldErrors } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { fill } from '@/lib/fill'
import { accountCopy } from './copy'

const copy = accountCopy.changeEmail
const open = defineModel('open', { type: Boolean, default: false })
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errors = ref({})
const formError = ref('')
const saving = ref(false)

// Every opening starts clean: a password typed last time must not wait in the field.
watch(open, (isOpen) => {
	if (!isOpen) return
	email.value = ''
	password.value = ''
	errors.value = {}
	formError.value = ''
})

async function submit() {
	errors.value = {}
	formError.value = ''

	// The API would quietly accept this and change nothing, which looks like a bug.
	const typed = email.value.trim().toLowerCase()
	if (typed === auth.user.email.toLowerCase()) {
		errors.value = { email: copy.sameEmail }
		return
	}
	// Here too the API changes nothing and sends nothing, so "we sent a link" would be untrue.
	if (typed === auth.user.pending_email?.toLowerCase()) {
		errors.value = { email: copy.samePending }
		return
	}

	saving.value = true
	try {
		const { data } = await api.patch('/api/user', { email: email.value.trim(), current_password: password.value })
		auth.setUser(data.data)
		open.value = false
		toast(fill(copy.sent, { email: data.data.pending_email }))
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
	<DialogRoot v-model:open="open">
		<DialogPortal>
			<DialogOverlay class="fixed inset-0 z-50 bg-overlay" />
			<DialogContent
				class="fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface p-7 shadow-popover max-md:p-5"
			>
				<DialogTitle class="pr-8 text-[20px] font-semibold text-text">{{ copy.title }}</DialogTitle>
				<DialogDescription class="mt-2 text-secondary">{{ copy.description }}</DialogDescription>

				<form class="mt-6" @submit.prevent="submit">
					<p v-if="formError" class="mb-5 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
						{{ formError }}
					</p>

					<div class="flex flex-col gap-[22px]">
						<TextField v-model="email" type="email" :label="copy.email" autocomplete="email" :error="errors.email" />
						<TextField
							v-model="password"
							type="password"
							:label="copy.password"
							:hint="copy.passwordHint"
							autocomplete="current-password"
							:error="errors.current_password"
						/>
					</div>

					<div class="mt-7 flex justify-end gap-3">
						<DialogClose as-child>
							<Button variant="secondary">{{ copy.cancel }}</Button>
						</DialogClose>
						<Button type="submit" :loading="saving">{{ copy.submit }}</Button>
					</div>
				</form>

				<DialogClose
					:aria-label="copy.close"
					class="absolute right-4 top-4 flex size-10 items-center justify-center rounded-control text-icon-muted hover:text-text"
				>
					<X class="size-5" aria-hidden="true" />
				</DialogClose>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
