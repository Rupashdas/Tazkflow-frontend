<script setup>
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'

/** A few mutually exclusive choices side by side. Arrow keys move between them. */
defineProps({
	modelValue: { type: String, default: '' },
	options: { type: Array, required: true }, // [{ value, label, icon? }]
	labelledBy: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
	<RadioGroupRoot
		:model-value="modelValue"
		:aria-labelledby="labelledBy"
		orientation="horizontal"
		class="flex shrink-0 gap-2.5"
		@update:model-value="$emit('update:modelValue', $event)"
	>
		<RadioGroupItem
			v-for="option in options"
			:key="option.value"
			:value="option.value"
			class="flex h-11 items-center gap-2 rounded-control border-2 border-border px-4 text-[15px] text-secondary data-[state=checked]:border-accent data-[state=checked]:font-semibold data-[state=checked]:text-text"
		>
			<component :is="option.icon" v-if="option.icon" class="size-[18px]" aria-hidden="true" />
			{{ option.label }}
		</RadioGroupItem>
	</RadioGroupRoot>
</template>
