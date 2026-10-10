<script setup>
/**
 * What "/" means, decided at runtime:
 *   no workspace yet   → say so (Task 7 sends them to the wizard instead)
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
const state = ref('loading') // 'loading' | 'none' | 'error'

async function open() {
	state.value = 'loading'

	try {
		const list = await fetchWorkspaces()

		if (list.length === 0) {
			state.value = 'none'
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
		<p v-else-if="state === 'none'" class="text-secondary">{{ copy.none }}</p>
		<template v-else>
			<p class="text-secondary">{{ copy.failed }}</p>
			<button class="text-[15px] font-semibold text-accent-text" @click="open">{{ copy.retry }}</button>
		</template>
	</div>
</template>
