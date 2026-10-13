<script setup>
import { ref } from 'vue'
import Avatar from '@/ui/Avatar.vue'
import Button from '@/ui/Button.vue'
import TextField from '@/ui/TextField.vue'
import { api, endsSession, errorMessage, fieldErrors } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/useAuthStore'
import { accountCopy } from './copy'

const copy = accountCopy.profile
const auth = useAuthStore()

const name = ref(auth.user.name)
const jobTitle = ref(auth.user.title ?? '')
const errors = ref({})
const formError = ref('')
const saving = ref(false)

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // the API's limit (max:5120 KB)
const fileInput = ref(null)
const photoError = ref('')
const uploading = ref(false)

async function upload(event) {
	const file = event.target.files?.[0]
	// Cleared now, so choosing the same file again still fires a change.
	event.target.value = ''
	if (!file) return

	photoError.value = ''
	// Checked here first: a 5 MB upload that the server then refuses is a long wait for nothing.
	if (file.size > MAX_PHOTO_BYTES) {
		photoError.value = copy.photoTooBig
		return
	}

	uploading.value = true
	try {
		const form = new FormData()
		form.append('avatar', file)
		const { data } = await api.post('/api/user/avatar', form)
		auth.setUser(data.data)
		toast(copy.photoSaved)
	} catch (error) {
		if (endsSession(error)) return
		photoError.value = fieldErrors(error).avatar ?? errorMessage(error, copy.photoFailed)
	} finally {
		uploading.value = false
	}
}

const removing = ref(false)

async function removePhoto() {
	photoError.value = ''
	removing.value = true
	try {
		const { data } = await api.delete('/api/user/avatar')
		auth.setUser(data.data)
		toast(copy.photoRemoved)
	} catch (error) {
		if (endsSession(error)) return
		photoError.value = errorMessage(error, copy.removeFailed)
	} finally {
		removing.value = false
	}
}

async function submit() {
	saving.value = true
	errors.value = {}
	formError.value = ''

	try {
		const { data } = await api.patch('/api/user', {
			name: name.value.trim(),
			// An emptied field clears the title instead of saving spaces.
			title: jobTitle.value.trim() || null,
		})
		// The sidebar reads the same user, so the new name shows there at once.
		auth.setUser(data.data)
		toast(copy.saved)
	} catch (error) {
		if (endsSession(error)) return
		errors.value = fieldErrors(error)
		if (Object.keys(errors.value).length === 0) formError.value = errorMessage(error, copy.failed)
	} finally {
		saving.value = false
	}
}
</script>

<template>
	<div>
		<p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{{ copy.overline }}</p>
		<h1 class="mt-2.5 text-[28px] font-bold tracking-[-0.02em] text-text">{{ copy.title }}</h1>
		<p class="mt-2 text-secondary">{{ copy.subtitle }}</p>

		<section class="mt-8 flex items-center gap-6 rounded-card border border-border bg-surface p-7 shadow-card max-md:flex-col max-md:items-start max-md:p-5">
			<Avatar :name="auth.user.name" :src="auth.user.avatar" size="lg" />
			<div class="min-w-0 flex-1">
				<p class="text-[15px] font-semibold text-text">{{ copy.photo }}</p>
				<p class="mt-1 text-[14px]" :class="photoError ? 'text-danger-text' : 'text-muted'" :role="photoError ? 'alert' : undefined">
					{{ photoError || copy.photoHint }}
				</p>
			</div>
			<div class="flex gap-3">
				<input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="upload" />
				<Button variant="secondary" :loading="uploading" @click="fileInput.click()">{{ copy.upload }}</Button>
				<Button v-if="auth.user.avatar" variant="ghost" :loading="removing" @click="removePhoto">
					{{ copy.removePhoto }}
				</Button>
			</div>
		</section>

		<form class="mt-6 rounded-card border border-border bg-surface p-7 shadow-card max-md:p-5" @submit.prevent="submit">
			<p v-if="formError" class="mb-6 rounded-control bg-danger-soft px-4 py-3 text-[14px] text-danger-text" role="alert">
				{{ formError }}
			</p>

			<div class="flex flex-col gap-[22px]">
				<TextField v-model="name" :label="copy.name" autocomplete="name" :error="errors.name" />
				<TextField
					v-model="jobTitle"
					:label="copy.jobTitle"
					autocomplete="organization-title"
					:hint="copy.jobTitleHint"
					:error="errors.title"
				/>
			</div>

			<div class="mt-7 flex justify-end border-t border-divider pt-6">
				<Button type="submit" :loading="saving">{{ copy.save }}</Button>
			</div>
		</form>
	</div>
</template>
