<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Info } from 'lucide-vue-next'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, ensureCsrfCookie, fieldErrors, errorMessage } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { onboardingCopy } from './copy'

const copy = onboardingCopy.create
const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const errors = ref({})
const formError = ref('')
const submitting = ref(false)

/** The same shape the API accepts: lower case, hyphens, no leading or trailing dash. */
function slugify(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60)
}

// The URL follows the name until the person edits it themselves.
watch(name, (value) => {
	if (!slugTouched.value) slug.value = slugify(value)
})

function onSlugInput(value) {
	slugTouched.value = true
	slug.value = slugify(value)
}

// An emptied URL goes back to following the name, so the person always sees
// the URL that will be used.
function onSlugBlur() {
	if (slug.value !== '') return
	slugTouched.value = false
	slug.value = slugify(name.value)
}

async function submit() {
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
		await router.replace(`/${data.data.slug}`)
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
			<div class="w-full max-w-[600px] rounded-card border border-border bg-surface p-9 shadow-card max-md:p-6">
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
								@input="onSlugInput($event.target.value)"
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
			</div>
		</div>
	</div>
</template>
