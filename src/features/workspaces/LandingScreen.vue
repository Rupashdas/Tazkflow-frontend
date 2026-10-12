<script setup>
/**
 * What "/" means, decided at runtime:
 *   no workspace yet   → the setup wizard
 *   one or more        → the one they used last, else the first
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { fetchWorkspaces } from './queries'
import { workspaceCopy } from './copy'

const copy = workspaceCopy.landing
const router = useRouter()
const workspace = useWorkspaceStore()
const state = ref('loading') // 'loading' | 'error'

async function open() {
	state.value = 'loading'

	try {
		const list = await fetchWorkspaces()

		if (list.length === 0) {
			// Someone with no workspace has nothing to look at, so the wizard is home.
			await router.replace('/welcome')
			return
		}

		const remembered = workspace.rememberedSlug()
		const target = list.find((item) => item.slug === remembered) ?? list[0]
		await router.replace(`/${target.slug}`)
	} catch {
		state.value = 'error'
	}
}

onMounted(open)
</script>

<template>
	<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6">
		<p v-if="state === 'loading'" class="text-muted">{{ copy.opening }}</p>
		<template v-else>
			<p class="text-secondary">{{ copy.failed }}</p>
			<button class="text-[15px] font-semibold text-accent-text" @click="open">{{ copy.retry }}</button>
		</template>
	</div>
</template>
