<script setup>
import { computed, ref } from 'vue'
import {
	ComboboxAnchor,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxPortal,
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxViewport,
	RadioGroupItem,
	RadioGroupRoot,
} from 'reka-ui'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-vue-next'
import { api, endsSession } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { ACCENTS } from '@/lib/theme'
import SegmentedControl from '@/ui/SegmentedControl.vue'
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
		// Only the fields this request sent go back. Another field changed a
		// moment earlier may still be on its way and must keep its new value.
		const reverted = Object.fromEntries(Object.keys(changes).map((key) => [key, lastSaved[key]]))
		show({ ...auth.user.preferences, ...reverted })
		status.value = 'failed'
	}
}

const appearanceIcons = { light: Sun, dark: Moon, os: Monitor }
const appearances = ['light', 'dark', 'os'].map((value) => ({
	value,
	label: copy.appearances[value],
	icon: appearanceIcons[value],
}))

// Full class names, so Tailwind finds them when it scans this file.
const swatch = {
	blue: 'bg-swatch-blue',
	violet: 'bg-swatch-violet',
	emerald: 'bg-swatch-emerald',
	amber: 'bg-swatch-amber',
	rose: 'bg-swatch-rose',
}

// The browser's list leaves out UTC (the server's default), and a zone saved
// elsewhere may use a newer name than this browser knows (Asia/Kolkata for
// Asia/Calcutta). Both are added, so the saved value is always in the list.
const timezones = [
	...new Set(['UTC', auth.user.preferences.timezone, ...Intl.supportedValuesOf('timeZone')].filter(Boolean)),
]
const timezoneQuery = ref('')

// "new york" finds America/New_York: compare without the underscores and slashes.
const matchingTimezones = computed(() => {
	const words = timezoneQuery.value.toLowerCase().replace(/[_/]/g, ' ').trim()
	if (words === '') return timezones
	return timezones.filter((zone) => zone.toLowerCase().replace(/[_/]/g, ' ').includes(words))
})

const zoneLabel = (zone) => zone?.replaceAll('_', ' ') ?? ''

const weekStarts = ['monday', 'sunday'].map((value) => ({ value, label: copy.weekStarts[value] }))
const timeFormats = ['12', '24'].map((value) => ({ value, label: copy.timeFormats[value] }))
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

				<SegmentedControl
					:model-value="auth.user.preferences.appearance"
					:options="appearances"
					labelled-by="appearance-label"
					@update:model-value="save({ appearance: $event })"
				/>
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

			<div class="flex items-center justify-between gap-6 p-6 max-md:flex-col max-md:items-start">
				<div>
					<p id="timezone-label" class="text-[15px] font-semibold text-text">{{ copy.timezone }}</p>
					<p class="mt-1 text-[14px] text-muted">{{ copy.timezoneHint }}</p>
				</div>

				<ComboboxRoot
					:model-value="auth.user.preferences.timezone"
					ignore-filter
					@update:open="(isOpen) => isOpen && (timezoneQuery = '')"
					class="w-[300px] shrink-0 max-md:w-full"
					@update:model-value="(zone) => zone && save({ timezone: zone })"
				>
					<ComboboxAnchor
						class="flex h-[50px] items-center rounded-control border-2 border-border-strong bg-surface px-4 focus-within:border-accent"
					>
						<ComboboxInput
							v-model="timezoneQuery"
							:display-value="zoneLabel"
							:placeholder="copy.timezoneSearch"
							aria-labelledby="timezone-label"
							class="min-w-0 flex-1 bg-transparent text-[16px] text-text !outline-none placeholder:text-muted"
						/>
						<ComboboxTrigger :aria-label="copy.timezoneSearch">
							<ChevronDown class="size-4 text-icon-muted" aria-hidden="true" />
						</ComboboxTrigger>
					</ComboboxAnchor>

					<ComboboxPortal>
						<ComboboxContent
							position="popper"
							:side-offset="6"
							class="z-50 max-h-[320px] w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded-card border border-border bg-surface p-2 shadow-popover"
						>
							<ComboboxViewport class="max-h-[300px] overflow-y-auto">
								<ComboboxEmpty class="px-3 py-2.5 text-[14px] text-muted">{{ copy.timezoneNone }}</ComboboxEmpty>
								<ComboboxItem
									v-for="zone in matchingTimezones"
									:key="zone"
									:value="zone"
									class="flex cursor-pointer items-center gap-2 rounded-nav px-3 py-2.5 text-[15px] text-text outline-none data-highlighted:bg-surface-subtle data-[state=checked]:font-semibold"
								>
									<span class="flex-1 truncate">{{ zoneLabel(zone) }}</span>
									<Check
										v-if="zone === auth.user.preferences.timezone"
										class="size-4 shrink-0 text-accent-text"
										aria-hidden="true"
									/>
								</ComboboxItem>
							</ComboboxViewport>
						</ComboboxContent>
					</ComboboxPortal>
				</ComboboxRoot>
			</div>

			<div class="flex items-center justify-between gap-6 p-6 max-md:flex-col max-md:items-start">
				<p id="week-start-label" class="text-[15px] font-semibold text-text">{{ copy.weekStart }}</p>
				<SegmentedControl
					:model-value="auth.user.preferences.week_start"
					:options="weekStarts"
					labelled-by="week-start-label"
					@update:model-value="save({ week_start: $event })"
				/>
			</div>

			<div class="flex items-center justify-between gap-6 p-6 max-md:flex-col max-md:items-start">
				<p id="time-format-label" class="text-[15px] font-semibold text-text">{{ copy.timeFormat }}</p>
				<SegmentedControl
					:model-value="String(auth.user.preferences.time_format)"
					:options="timeFormats"
					labelled-by="time-format-label"
					@update:model-value="save({ time_format: $event })"
				/>
			</div>
		</div>
	</div>
</template>
