/**
 * Puts the theme on <html> as two attributes: data-theme and data-accent.
 * Everything visual follows from those, because the tokens are defined per
 * attribute in tokens.css.
 */
export type Appearance = 'light' | 'dark' | 'os'
export type AccentName = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose'

export const ACCENTS: AccentName[] = ['blue', 'violet', 'emerald', 'amber', 'rose']

const APPEARANCE_KEY = 'tazko.appearance'
const ACCENT_KEY = 'tazko.accent'

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

function resolve(appearance: Appearance): 'light' | 'dark' {
  if (appearance === 'os') return prefersDark() ? 'dark' : 'light'
  return appearance
}

export function applyAppearance(appearance: Appearance): void {
  document.documentElement.dataset.theme = resolve(appearance)
  // Remembered so the boot script in index.html can avoid a flash of the
  // wrong theme on the next page load.
  try {
    localStorage.setItem(APPEARANCE_KEY, appearance)
  } catch {
    // Private windows can refuse storage; the app still works.
  }
}

export function applyAccent(accent: AccentName): void {
  document.documentElement.dataset.accent = accent
  try {
    localStorage.setItem(ACCENT_KEY, accent)
  } catch {
    // ignored on purpose, see above
  }
}

export function storedAppearance(): Appearance {
  try {
    const value = localStorage.getItem(APPEARANCE_KEY)
    if (value === 'light' || value === 'dark' || value === 'os') return value
  } catch {
    // ignored
  }
  return 'os'
}

/** Follows the operating system while the preference is 'os'. */
export function startThemeSync(): void {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (storedAppearance() === 'os') applyAppearance('os')
  })
}
