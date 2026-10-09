<script setup>
// TEMPORARY. Task 5 puts the workspace landing rules on "/" and deletes this
// file. It exists so the cookie session can be seen working.
import { useRouter } from 'vue-router'
import Button from '@/ui/Button.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const copy = authCopy.session
const auth = useAuthStore()
const router = useRouter()

async function signOut() {
	await auth.logout()
	await router.replace('/login')
}
</script>

<template>
	<main class="min-h-screen bg-page p-10">
		<h1 class="text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>
		<p class="mt-6 text-[15px] text-text">{{ auth.user?.name }} · {{ auth.user?.email }}</p>
		<div class="mt-8">
			<Button variant="secondary" @click="signOut">{{ copy.signOut }}</Button>
		</div>
	</main>
</template>
