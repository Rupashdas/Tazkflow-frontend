<script setup>
import { useId } from 'vue'

defineProps({
	modelValue: { type: String, required: true },
	label: { type: String, required: true },
	type: { type: String, default: 'text' },
	error: String,
	autocomplete: String,
})

defineEmits(['update:modelValue'])

const id = useId()
</script>

<template>
	<div>
		<label :for="id" class="mb-2 block text-[14px] font-semibold text-text">{{ label }}</label>

		<input
			:id="id"
			:type="type"
			:value="modelValue"
			:autocomplete="autocomplete"
			:aria-invalid="error ? 'true' : undefined"
			:aria-describedby="error ? `${id}-help` : undefined"
			class="h-[50px] w-full rounded-control border bg-surface px-4 text-[16px] text-text placeholder:text-muted"
			:class="error ? 'border-danger' : 'border-border-strong'"
			@input="$emit('update:modelValue', $event.target.value)"
		/>

		<!-- Never colour alone: an invalid field also gets a red border and
		     aria-invalid, so it reads for everyone. -->
		<p v-if="error" :id="`${id}-help`" class="mt-2 text-[14px] text-danger-text">{{ error }}</p>
	</div>
</template>
