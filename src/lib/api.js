import axios from 'axios'

/**
 * One axios instance for the whole app.
 *
 * Sanctum authenticates with a cookie session, so every request carries
 * credentials and no token is ever kept in localStorage.
 */
export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	// The API and the app run on different ports, so this is a cross-origin
	// request. Axios only reads the XSRF-TOKEN cookie into a header when this
	// is set — without it every POST gets a 419 CSRF mismatch.
	withXSRFToken: true,
	headers: { Accept: 'application/json' },
})

let csrfReady = false

/** Laravel refuses a POST without the XSRF cookie. Fetched once per page load. */
export async function ensureCsrfCookie() {
	if (csrfReady) return
	await api.get('/sanctum/csrf-cookie')
	csrfReady = true
}

/** 422 validation errors as one message per field, ready for the form. */
export function fieldErrors(error) {
	const data = error?.response?.data
	const out = {}

	for (const [field, messages] of Object.entries(data?.errors ?? {})) {
		if (messages?.[0]) out[field] = messages[0]
	}

	return out
}

/** The server's own message (403, 429 …), or the screen's fallback. */
export function errorMessage(error, fallback) {
	return error?.response?.data?.message ?? fallback
}
