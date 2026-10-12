/** Initials for a square mark; two letters at most so it never overflows. */
export function initials(name) {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('')
}
