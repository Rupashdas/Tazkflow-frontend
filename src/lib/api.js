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
