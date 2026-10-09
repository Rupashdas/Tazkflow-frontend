<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import { api, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const copy = authCopy.verify
const auth = useAuthStore()
const router = useRouter()

const notice = ref('')
const sending = ref(false)
const checking = ref(false)

// A placeholder rather than a joined sentence, so a translation can move the
// address to wherever its grammar needs it.
const subtitle = computed(() => copy.subtitle.replace('{email}', auth.user?.email ?? ''))

async function resend() {
	sending.value = true
	notice.value = ''

	try {
		await api.post('/api/email/verification-notification')
		notice.value = copy.sent
	} catch (error) {
		notice.value = errorMessage(error, copy.sendFailed)
	} finally {
		sending.value = false
	}
}

async function recheck() {
	checking.value = true
	notice.value = ''

	await auth.fetchUser()
	if (auth.user?.email_verified) {
		await router.replace('/')
	} else {
		notice.value = copy.stillWaiting
	}

	checking.value = false
}

async function signOut() {
	await auth.logout()
	await router.replace('/login')
}
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ subtitle }}</p>

		<p class="mt-5 rounded-control bg-accent-soft px-4 py-3 text-[14px] text-accent-soft-text">
			{{ copy.why }}
		</p>

		<p v-if="notice" class="mt-4 text-[14px] text-secondary" role="status">{{ notice }}</p>

		<div class="mt-8 flex flex-wrap gap-3">
			<Button :loading="checking" @click="recheck">{{ copy.recheck }}</Button>
			<Button variant="secondary" :loading="sending" @click="resend">{{ copy.resend }}</Button>
		</div>

		<template #footer>
			<button class="font-medium text-accent-text" @click="signOut">{{ copy.signOut }}</button>
		</template>
	</AuthLayout>
</template>
