<script setup>
import {
	SelectContent,
	SelectIcon,
	SelectItem,
	SelectItemText,
	SelectPortal,
	SelectRoot,
	SelectTrigger,
	SelectValue,
	SelectViewport,
} from 'reka-ui'
import { Check, ChevronDown } from 'lucide-vue-next'

/** A dropdown of options; each may carry a hint line under its label. A class sets the trigger's width. */
defineOptions({ inheritAttrs: false })

defineProps({
	modelValue: { type: String, default: '' },
	options: { type: Array, required: true }, // [{ value, label, hint? }]
	ariaLabel: { type: String, required: true },
	disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<template>
	<SelectRoot :model-value="modelValue" :disabled="disabled" @update:model-value="$emit('update:modelValue', $event)">
		<SelectTrigger
			v-bind="$attrs"
			:aria-label="ariaLabel"
			class="flex h-[50px] items-center gap-2.5 rounded-control border border-border-strong bg-surface px-4 text-[16px] text-text disabled:cursor-not-allowed disabled:opacity-60"
		>
			<SelectValue class="flex-1 truncate text-left" />
			<SelectIcon>
				<ChevronDown class="size-4 text-icon-muted" aria-hidden="true" />
			</SelectIcon>
		</SelectTrigger>

		<SelectPortal>
			<SelectContent
				position="popper"
				:side-offset="6"
				class="z-50 w-[var(--reka-select-trigger-width)] min-w-[240px] rounded-card border border-border bg-surface p-2 shadow-popover"
			>
				<SelectViewport>
					<SelectItem
						v-for="option in options"
						:key="option.value"
						:value="option.value"
						class="flex cursor-pointer items-start gap-2 rounded-nav px-3.5 py-3 outline-none data-highlighted:bg-surface-subtle data-[state=checked]:bg-accent-soft"
					>
						<span class="min-w-0 flex-1">
							<SelectItemText class="block text-[15px] font-semibold text-text">{{ option.label }}</SelectItemText>
							<span v-if="option.hint" class="mt-0.5 block text-[14px] text-muted">{{ option.hint }}</span>
						</span>
						<Check v-if="option.value === modelValue" class="mt-0.5 size-4 shrink-0 text-accent-soft-text" aria-hidden="true" />
					</SelectItem>
				</SelectViewport>
			</SelectContent>
		</SelectPortal>
	</SelectRoot>
</template>
