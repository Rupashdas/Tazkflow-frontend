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

let workspaceSlug = null

/** The workspace store keeps this in step; every request inside a workspace needs it. */
export function setWorkspaceSlug(slug) {
	workspaceSlug = slug
}

api.interceptors.request.use((config) => {
	if (workspaceSlug) config.headers['X-Workspace'] = workspaceSlug
	return config
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

let onUnauthorized = null

/** main.js registers what happens on a 401, so this file never imports the router. */
export function setUnauthorizedHandler(fn) {
	onUnauthorized = fn
}

api.interceptors.response.use(undefined, (error) => {
	const status = error.response?.status

	// 401: the session is gone. 403 account_deactivated: the whole account was
	// switched off mid-session. Both mean the same thing here: out.
	if (status === 401 || (status === 403 && error.response?.data?.code === 'account_deactivated')) {
		csrfReady = false
		onUnauthorized?.()
	}

	return Promise.reject(error)
})
