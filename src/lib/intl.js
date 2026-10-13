/**
 * Dates the way the person wants them: in their own timezone, in English
 * (the app's only language for now). Pass auth.user.preferences.
 */
export function formatDate(value, preferences) {
	return new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeZone: preferences?.timezone || undefined,
	}).format(new Date(value))
}
