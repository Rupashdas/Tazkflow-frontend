<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const copy = authCopy.unreachable
const auth = useAuthStore()
const router = useRouter()

const retrying = ref(false)
const stillDown = ref(false)

async function retry() {
	retrying.value = true
	await auth.fetchUser()
	retrying.value = false

	if (auth.unreachable) {
		stillDown.value = true
		return
	}

	// The guard let this route through without an answer; run it again now
	// that there is one, so a signed-out visitor still lands on sign in.
	await router.replace({ path: router.currentRoute.value.fullPath, force: true })
}
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<p v-if="stillDown" class="mt-4 text-[14px] text-secondary" role="status">{{ copy.stillDown }}</p>

		<div class="mt-8">
			<Button :loading="retrying" @click="retry">{{ copy.retry }}</Button>
		</div>
	</AuthLayout>
</template>
