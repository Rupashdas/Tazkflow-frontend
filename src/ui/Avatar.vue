<script setup>
import { initials } from '@/lib/initials'

/** A person's picture, or their initials when there is none. */
defineProps({
	name: { type: String, default: '' },
	src: { type: String, default: null },
	size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
})

const sizes = {
	sm: 'size-9 text-[14px]',
	md: 'size-11 text-[15px]',
	lg: 'size-[72px] text-[24px]',
}
</script>

<template>
	<!-- The name is always written next to an avatar, so the picture itself is decoration. -->
	<img v-if="src" :src="src" alt="" class="shrink-0 rounded-full object-cover" :class="sizes[size]" />
	<span
		v-else
		class="flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-soft-text"
		:class="sizes[size]"
		aria-hidden="true"
	>
		{{ initials(name) }}
	</span>
</template>
