<script setup>
import { ref } from 'vue'
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

		<form class="mt-8 rounded-card border border-border bg-surface p-7 shadow-card max-md:p-5" @submit.prevent="submit">
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
