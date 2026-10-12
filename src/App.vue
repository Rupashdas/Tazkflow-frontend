<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import UnreachableScreen from '@/features/auth/UnreachableScreen.vue'

const auth = useAuthStore()
</script>

<template>
	<!-- Without an answer from the API no screen can be trusted to render. -->
	<UnreachableScreen v-if="auth.unreachable" />
	<RouterView v-else />
</template>
