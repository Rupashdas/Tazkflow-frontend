<script setup>
/** The app's only button. Height, radius and weight come from the tokens. */
defineProps({
	variant: { type: String, default: 'primary' }, // 'primary' | 'secondary'
	loading: { type: Boolean, default: false },
	type: { type: String, default: 'button' }, // 'button' | 'submit'
	block: { type: Boolean, default: false },
})
</script>

<template>
	<button
		:type="type"
		:disabled="loading"
		class="inline-flex h-[50px] items-center justify-center gap-2 rounded-control px-5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
		:class="[
			block ? 'w-full' : '',
			variant === 'primary' ? 'bg-accent text-accent-contrast hover:brightness-110' : '',
			variant === 'secondary'
				? 'border border-border-strong bg-surface font-medium text-text hover:bg-surface-subtle'
				: '',
		]"
	>
		<span
			v-if="loading"
			class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		/>
		<slot />
	</button>
</template>
