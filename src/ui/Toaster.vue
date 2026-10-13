<script setup>
import { ToastDescription, ToastProvider, ToastRoot, ToastViewport } from 'reka-ui'
import { CircleAlert, CircleCheck } from 'lucide-vue-next'
import { dismissToast, toasts } from '@/lib/toast'
</script>

<template>
	<!-- 5 seconds is long enough to read a sentence; hovering pauses it. -->
	<ToastProvider :duration="5000">
		<ToastRoot
			v-for="item in toasts"
			:key="item.id"
			:type="item.tone === 'error' ? 'foreground' : 'background'"
			class="flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-popover"
			@update:open="(open) => !open && dismissToast(item.id)"
		>
			<CircleAlert v-if="item.tone === 'error'" class="mt-0.5 size-5 shrink-0 text-danger-text" aria-hidden="true" />
			<CircleCheck v-else class="mt-0.5 size-5 shrink-0 text-success-text" aria-hidden="true" />
			<ToastDescription class="text-[15px] text-text">{{ item.message }}</ToastDescription>
		</ToastRoot>

		<ToastViewport
			class="fixed bottom-6 right-6 z-[100] flex w-[380px] max-w-[calc(100vw-32px)] flex-col gap-3 outline-none max-md:bottom-4 max-md:right-4"
		/>
	</ToastProvider>
</template>
