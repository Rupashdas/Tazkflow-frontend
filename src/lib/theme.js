/**
 * Puts the theme on <html> as two attributes: data-theme and data-accent.
 * Everything visual follows from those, because the tokens are defined per
 * attribute in tokens.css.
 */
export const ACCENTS = [
  "blue",
  "violet",
  "emerald",
  "amber",
  "rose",
];

const APPEARANCE_KEY = "tazkflow.appearance";
const ACCENT_KEY = "tazkflow.accent";

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

function resolve(appearance) {
	if (appearance === "os") return prefersDark() ? "dark" : "light";
	return appearance;
}

/** appearance is "light", "dark" or "os". */
export function applyAppearance(appearance) {
	document.documentElement.dataset.theme = resolve(appearance);
	// Remembered so the boot script in index.html can avoid a flash of the
	// wrong theme on the next page load.
	try {
		localStorage.setItem(APPEARANCE_KEY, appearance);
	} catch {
		// Private windows can refuse storage; the app still works.
	}
}

/** accent is one of ACCENTS. */
export function applyAccent(accent) {
	document.documentElement.dataset.accent = accent;
	try {
		localStorage.setItem(ACCENT_KEY, accent);
	} catch {
		// ignored on purpose, see above
	}
}

export function storedAppearance() {
	try {
		const value = localStorage.getItem(APPEARANCE_KEY);
		if (value === "light" || value === "dark" || value === "os") return value;
	} catch {
		// ignored
	}
	return "os";
}

/** Follows the operating system while the preference is 'os'. */
export function startThemeSync() {
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
		if (storedAppearance() === "os") applyAppearance("os");
	});
}
