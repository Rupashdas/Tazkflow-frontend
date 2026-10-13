import { ref } from 'vue'

/**
 * Short confirmations after an action ("Profile saved"). Toaster.vue in the
 * app layout shows them and removes each one once it closes.
 */
export const toasts = ref([])

let nextId = 0

/** tone is 'success' or 'error'. */
export function toast(message, tone = 'success') {
	toasts.value.push({ id: ++nextId, message, tone })
}

export function dismissToast(id) {
	toasts.value = toasts.value.filter((item) => item.id !== id)
}
