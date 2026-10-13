<script setup>
import { ref } from 'vue'
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import { Check, Monitor, Moon, Sun } from 'lucide-vue-next'
import { api, endsSession } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { ACCENTS } from '@/lib/theme'
import { accountCopy } from './copy'

const copy = accountCopy.preferences
const auth = useAuthStore()

const status = ref('idle') // 'idle' | 'saving' | 'saved' | 'failed'

// What the server last confirmed. A failed save falls back to this, not to
// whatever was on screen when the page opened.
let lastSaved = { ...auth.user.preferences }
// Only the newest request may decide what the screen shows: clicking four
// accents quickly must end on the fourth, whatever order the answers arrive in.
let latest = 0

function show(preferences) {
	// setUser applies appearance and accent to <html> as well.
	auth.setUser({ ...auth.user, preferences })
}

async function save(changes) {
	const request = ++latest
	show({ ...auth.user.preferences, ...changes })
	status.value = 'saving'

	try {
		const { data } = await api.patch('/api/preferences', changes)
		lastSaved = data.data
		if (request !== latest) return
		show(data.data)
		status.value = 'saved'
	} catch (error) {
		if (endsSession(error) || request !== latest) return
		show(lastSaved)
		status.value = 'failed'
	}
}

const appearances = ['light', 'dark', 'os']
const appearanceIcons = { light: Sun, dark: Moon, os: Monitor }

// Full class names, so Tailwind finds them when it scans this file.
const swatch = {
	blue: 'bg-swatch-blue',
	violet: 'bg-swatch-violet',
	emerald: 'bg-swatch-emerald',
	amber: 'bg-swatch-amber',
	rose: 'bg-swatch-rose',
}
</script>

<template>
	<div>
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ copy.overline }}</p>
				<h1 class="mt-2.5 text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
			</div>
			<!-- Polite live region: a screen reader hears "Saved" without losing focus. -->
			<p
				class="mt-1 text-[14px]"
				:class="status === 'failed' ? 'text-danger-text' : 'text-muted'"
				aria-live="polite"
			>
				<template v-if="status === 'saving'">{{ copy.saving }}</template>
				<template v-else-if="status === 'saved'">{{ copy.saved }}</template>
				<template v-else-if="status === 'failed'">{{ copy.failed }}</template>
			</p>
		</div>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<div class="mt-8 divide-y divide-divider rounded-card border border-border bg-surface shadow-card">
			<div class="flex items-center justify-between gap-6 p-6 max-md:flex-col max-md:items-start">
				<div>
					<p id="appearance-label" class="text-[15px] font-semibold text-text">{{ copy.appearance }}</p>
					<p class="mt-1 text-[14px] text-muted">{{ copy.appearanceHint }}</p>
				</div>

				<RadioGroupRoot
					:model-value="auth.user.preferences.appearance"
					aria-labelledby="appearance-label"
					orientation="horizontal"
					class="flex shrink-0 gap-2.5"
					@update:model-value="save({ appearance: $event })"
				>
					<RadioGroupItem
						v-for="value in appearances"
						:key="value"
						:value="value"
						class="flex h-11 items-center gap-2 rounded-control border-2 border-border px-4 text-[15px] text-secondary data-[state=checked]:border-text data-[state=checked]:font-semibold data-[state=checked]:text-text"
					>
						<component :is="appearanceIcons[value]" class="size-[18px]" aria-hidden="true" />
						{{ copy.appearances[value] }}
					</RadioGroupItem>
				</RadioGroupRoot>
			</div>

			<div class="flex items-center justify-between gap-6 p-6 max-md:flex-col max-md:items-start">
				<div>
					<p id="accent-label" class="text-[15px] font-semibold text-text">{{ copy.accent }}</p>
					<p class="mt-1 text-[14px] text-muted">{{ copy.accentHint }}</p>
				</div>

				<RadioGroupRoot
					:model-value="auth.user.preferences.palette"
					aria-labelledby="accent-label"
					orientation="horizontal"
					class="flex shrink-0 gap-2.5"
					@update:model-value="save({ palette: $event })"
				>
					<RadioGroupItem
						v-for="accent in ACCENTS"
						:key="accent"
						:value="accent"
						:aria-label="copy.accents[accent]"
						:title="copy.accents[accent]"
						class="flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface data-[state=checked]:ring-2 data-[state=checked]:ring-text"
						:class="swatch[accent]"
					>
						<!-- A tick as well as the ring: the choice never rests on colour alone. -->
						<Check
							v-if="auth.user.preferences.palette === accent"
							class="size-4 text-accent-contrast"
							aria-hidden="true"
						/>
					</RadioGroupItem>
				</RadioGroupRoot>
			</div>
		</div>
	</div>
</template>
