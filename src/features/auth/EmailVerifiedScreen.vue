<script setup>
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Button from '@/ui/Button.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { authCopy } from './copy'

const copy = authCopy.verified
const auth = useAuthStore()
const router = useRouter()
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>
		<div class="mt-8">
			<Button @click="router.replace(auth.isLoggedIn ? '/' : '/login')">{{ copy.continue }}</Button>
		</div>
	</AuthLayout>
</template>
