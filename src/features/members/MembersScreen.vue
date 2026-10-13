<script setup>
import MembersTab from './MembersTab.vue'
import { membersCopy } from './copy'

const copy = membersCopy.screen
</script>

<template>
	<div>
		<p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ copy.overline }}</p>
		<h1 class="mt-2.5 text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<div class="mt-8">
			<MembersTab />
		</div>
	</div>
</template>
