<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// The API sends people here from the email link, with ?error when it failed.
// An unknown error is treated as a bad link: never claim success that did not happen.
const outcome = computed(() => {
	const error = route.query.error
	if (!error) return 'confirmed'
	return error === 'email_taken' ? 'emailTaken' : 'linkInvalid'
})

const copy = computed(() => authCopy.verified[outcome.value])

function next() {
	// /verify-email can send a new link; signing in first brings them back to it.
	if (outcome.value === 'linkInvalid') {
		router.replace(auth.isLoggedIn ? '/verify-email' : { path: '/login', query: { next: '/verify-email' } })
		return
	}

	router.replace(auth.isLoggedIn ? '/' : '/login')
}
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>
		<div class="mt-8">
			<Button @click="next">{{ copy.action }}</Button>
		</div>
	</AuthLayout>
</template>
