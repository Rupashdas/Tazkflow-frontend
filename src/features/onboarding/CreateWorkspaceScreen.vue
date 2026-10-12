<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Info } from 'lucide-vue-next'
import WizardLayout from '@/layouts/WizardLayout.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { onboardingCopy } from './copy'

const copy = onboardingCopy.create
const router = useRouter()

const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const errors = ref({})
const formError = ref('')
const submitting = ref(false)

/**
 * Lower case, with every run of other characters turned into one dash. The ends
 * are left alone, so a dash typed at the end survives until the next letter.
 */
function slugChars(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.slice(0, 60)
}

/** No leading or trailing dash: the API rejects them. */
function trimDashes(value) {
	return value.replace(/^-+|-+$/g, '')
}

/** The same shape the API accepts. Cut to 60 first, so the cut cannot leave a dash at the end. */
function slugify(value) {
	return trimDashes(slugChars(value))
}

// The URL follows the name until the person edits it themselves.
watch(name, (value) => {
	if (!slugTouched.value) slug.value = slugify(value)
})

function onSlugInput(input) {
	slugTouched.value = true
	slug.value = slugChars(input.value)
	// When the cleaned value equals the old one (a second dash typed after a
	// dash), Vue sees no change and would leave the raw text in the field.
	input.value = slug.value
}

// The ends are trimmed when the person leaves the field. An emptied URL goes
// back to following the name, so the person always sees the URL that will be used.
function onSlugBlur() {
	slug.value = trimDashes(slug.value)
	if (slug.value !== '') return
	slugTouched.value = false
	slug.value = slugify(name.value)
}

async function submit() {
	// Enter submits without leaving the field, so blur may not have run.
	slug.value = trimDashes(slug.value)
	submitting.value = true
	errors.value = {}
	formError.value = ''

	try {
		await ensureCsrfCookie()
		const { data } = await api.post('/api/workspaces', {
			name: name.value,
			slug: slug.value || undefined,
		})

		// The switcher's list is now out of date.
		await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
		await router.replace(`/welcome/${data.data.slug}/invite`)
	} catch (error) {
		errors.value = fieldErrors(error)
		if (Object.keys(errors.value).length === 0) {
			formError.value = errorMessage(error, copy.failed)
		}
	} finally {
		submitting.value = false
	}
}
</script>

<template>
	<WizardLayout :step="1">
		<h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<form class="mt-8 flex flex-col gap-[26px]" @submit.prevent="submit">
			<p v-if="formError" class="rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
				{{ formError }}
			</p>

			<TextField v-model="name" :label="copy.name" :hint="copy.nameHint" :error="errors.name" autocomplete="organization" />

			<div>
				<label class="mb-2 block text-[14px] font-semibold text-text" for="workspace-slug">{{ copy.slug }}</label>
				<div
					class="flex h-[50px] overflow-hidden rounded-control border focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-accent"
					:class="errors.slug ? 'border-danger' : 'border-border-strong'"
				>
					<span class="flex items-center border-r border-border-strong bg-surface-subtle px-3.5 text-[15px] text-secondary">
						tazkflow.app/
					</span>
					<input
						id="workspace-slug"
						:value="slug"
						autocomplete="off"
						class="min-w-0 flex-1 bg-surface px-4 text-[16px] text-text outline-none!"
						:aria-invalid="errors.slug ? 'true' : undefined"
						@input="onSlugInput($event.target)"
						@blur="onSlugBlur"
					/>
				</div>
				<p v-if="errors.slug" class="mt-2 text-[14px] text-danger-text">{{ errors.slug }}</p>
				<p v-else class="mt-2 text-[14px] text-muted">{{ copy.slugHint }}</p>
			</div>

			<div class="flex gap-3.5 rounded-card border border-accent-soft bg-accent-soft p-4.5">
				<Info class="size-5 shrink-0 text-accent-soft-text" aria-hidden="true" />
				<div class="text-[15px] text-text">
					<p>{{ copy.note }}</p>
					<ul class="my-2 list-disc pl-5">
						<li v-for="role in copy.roles" :key="role">{{ role }}</li>
					</ul>
					<p>{{ copy.noteAfter }}</p>
				</div>
			</div>

			<div class="flex justify-end border-t border-divider pt-6.5">
				<Button type="submit" :loading="submitting">{{ copy.submit }}</Button>
			</div>
		</form>
	</WizardLayout>
</template>
