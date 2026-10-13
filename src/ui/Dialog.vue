<script setup>
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

/** A centred dialog: a title, an optional description, then the slot. Esc and the X close it. */
const open = defineModel('open', { type: Boolean, default: false })

defineProps({
	title: { type: String, required: true },
	description: { type: String, default: '' },
	closeLabel: { type: String, required: true },
})
</script>

<template>
	<DialogRoot v-model:open="open">
		<DialogPortal>
			<DialogOverlay class="fixed inset-0 z-50 bg-overlay" />
			<DialogContent
				class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-32px)] w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-border bg-surface p-7 shadow-popover max-md:p-5"
			>
				<DialogTitle class="pr-8 text-[20px] font-semibold text-text">{{ title }}</DialogTitle>
				<DialogDescription v-if="description" class="mt-2 text-secondary">{{ description }}</DialogDescription>

				<slot />

				<DialogClose
					:aria-label="closeLabel"
					class="absolute right-4 top-4 flex size-10 items-center justify-center rounded-control text-icon-muted hover:text-text"
				>
					<X class="size-5" aria-hidden="true" />
				</DialogClose>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
