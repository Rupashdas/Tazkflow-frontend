<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue'
import { notFoundCopy as copy } from './copy'
</script>

<template>
	<AuthLayout>
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.body }}</p>
		<!-- "/" decides the rest: a workspace when signed in, sign in otherwise. -->
		<RouterLink to="/" class="mt-8 inline-block font-semibold text-accent-text">{{ copy.home }}</RouterLink>
	</AuthLayout>
</template>
