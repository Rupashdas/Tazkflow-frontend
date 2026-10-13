<script setup>
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'

/** A few mutually exclusive choices side by side. Arrow keys move between them. */
defineProps({
	modelValue: { type: String, default: '' },
	options: { type: Array, required: true }, // [{ value, label }]
	labelledBy: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
	<RadioGroupRoot
		:model-value="modelValue"
		:aria-labelledby="labelledBy"
		orientation="horizontal"
		class="flex shrink-0 rounded-control border border-border-strong bg-surface-subtle p-1"
		@update:model-value="$emit('update:modelValue', $event)"
	>
		<RadioGroupItem
			v-for="option in options"
			:key="option.value"
			:value="option.value"
			class="h-10 rounded-[6px] px-4 text-[15px] text-secondary data-[state=checked]:bg-surface data-[state=checked]:font-semibold data-[state=checked]:text-text data-[state=checked]:shadow-card"
		>
			{{ option.label }}
		</RadioGroupItem>
	</RadioGroupRoot>
</template>
