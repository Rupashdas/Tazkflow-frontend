<script setup>
import { Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { onboardingCopy } from '@/features/onboarding/copy'

const props = defineProps({ step: { type: Number, required: true } }) // 1 or 2
const auth = useAuthStore()
const copy = onboardingCopy.steps
</script>

<template>
	<div class="min-h-screen bg-page">
		<header class="flex h-[68px] items-center gap-3 border-b border-border bg-surface px-8">
			<div class="flex size-[34px] items-center justify-center rounded-[9px] bg-text text-[15px] font-bold text-page">
				T
			</div>
			<span class="text-[17px] font-bold text-text">Tazkflow</span>
			<span class="ml-auto flex items-center gap-3 text-[15px] text-secondary">
				<span class="size-[34px] rounded-full bg-surface-subtle" />
				{{ auth.user?.name }}
			</span>
		</header>

		<div class="flex justify-center px-6 py-13 max-md:py-8">
			<div class="w-full" :class="props.step === 1 ? 'max-w-[600px]' : 'max-w-[680px]'">
				<ol class="mb-8 flex items-center gap-3.5">
					<li class="flex items-center gap-2.5">
						<span
							class="flex size-[30px] items-center justify-center rounded-full text-[14px] font-bold"
							:class="props.step === 1 ? 'bg-accent text-accent-contrast' : 'bg-success-text text-page'"
						>
							<Check v-if="props.step === 2" class="size-4" aria-hidden="true" />
							<template v-else>1</template>
						</span>
						<span class="text-[15px] font-semibold text-text">{{ copy.workspace }}</span>
					</li>
					<li class="h-0.5 flex-1" :class="props.step === 2 ? 'bg-accent' : 'bg-border-strong'" aria-hidden="true" />
					<li class="flex items-center gap-2.5" :class="props.step === 2 ? '' : 'text-muted'">
						<span
							class="flex size-[30px] items-center justify-center rounded-full text-[14px] font-bold"
							:class="props.step === 2 ? 'bg-accent text-accent-contrast' : 'border border-border-strong text-muted'"
						>
							2
						</span>
						<span class="text-[15px]" :class="props.step === 2 ? 'font-semibold text-text' : ''">{{ copy.invite }}</span>
					</li>
				</ol>

				<div class="rounded-card border border-border bg-surface p-9 shadow-card max-md:p-6">
					<slot />
				</div>
			</div>
		</div>
	</div>
</template>
