import { ref } from 'vue'
import { defineStore } from 'pinia'
import { setWorkspaceSlug } from '@/lib/api'

const LAST_USED_KEY = 'tazkflow.workspace'

/**
 * Which workspace the app is in. The slug comes from the URL, and every
 * request carries it as the X-Workspace header.
 *
 * The remembered slug is a convenience for the next visit, never a claim of
 * access — the API checks membership on every request.
 */
export const useWorkspaceStore = defineStore('workspace', () => {
	const slug = ref(null)

	function setSlug(value) {
		slug.value = value
		setWorkspaceSlug(value)
		try {
			localStorage.setItem(LAST_USED_KEY, value)
		} catch {
			// Private windows can refuse storage; the app still works.
		}
	}

	function clear() {
		slug.value = null
		setWorkspaceSlug(null)
	}

	function rememberedSlug() {
		try {
			return localStorage.getItem(LAST_USED_KEY)
		} catch {
			return null
		}
	}

	return { slug, setSlug, clear, rememberedSlug }
})
