/**
 * Puts values into a copy placeholder: fill('Hi {name}', { name: 'Ana' }).
 *
 * A function, not a replacement string, because String.replace reads "$&"
 * and "$'" inside a replacement string as patterns, and an email address
 * may contain them.
 */
export function fill(template, values) {
	return template.replace(/\{(\w+)\}/g, (placeholder, key) => (key in values ? String(values[key] ?? '') : placeholder))
}
