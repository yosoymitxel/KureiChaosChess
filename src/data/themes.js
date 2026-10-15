// Table moods. Values feed CSS custom properties (see css/tokens.css for the defaults).
export const THEMES = {
  walnut: {
    id: 'walnut', name: 'Nogal',
    swatch: ['oklch(0.27 0.03 55)', 'oklch(0.93 0.03 85)', 'oklch(0.62 0.19 35)', 'oklch(0.72 0.12 85)'],
    vars: {
      'table': 'oklch(0.22 0.025 55)', 'table-2': 'oklch(0.3 0.035 55)',
      'tile-a': 'oklch(0.86 0.045 80)', 'tile-b': 'oklch(0.7 0.06 65)', 'tile-side': 'oklch(0.45 0.05 55)',
      'side-light': 'oklch(0.95 0.025 90)', 'side-dark': 'oklch(0.6 0.19 32)', 'side-wild': 'oklch(0.65 0.13 160)',
    },
  },
  felt: {
    id: 'felt', name: 'Tapete',
    swatch: ['oklch(0.32 0.06 160)', 'oklch(0.93 0.03 95)', 'oklch(0.5 0.16 25)', 'oklch(0.75 0.12 80)'],
    vars: {
      'table': 'oklch(0.27 0.055 160)', 'table-2': 'oklch(0.34 0.07 160)',
      'tile-a': 'oklch(0.9 0.035 95)', 'tile-b': 'oklch(0.62 0.07 150)', 'tile-side': 'oklch(0.4 0.05 150)',
      'side-light': 'oklch(0.96 0.02 95)', 'side-dark': 'oklch(0.5 0.17 25)', 'side-wild': 'oklch(0.72 0.14 75)',
    },
  },
  slate: {
    id: 'slate', name: 'Pizarra',
    swatch: ['oklch(0.25 0.02 250)', 'oklch(0.92 0.02 240)', 'oklch(0.7 0.14 200)', 'oklch(0.68 0.18 15)'],
    vars: {
      'table': 'oklch(0.2 0.02 250)', 'table-2': 'oklch(0.27 0.025 250)',
      'tile-a': 'oklch(0.78 0.02 245)', 'tile-b': 'oklch(0.55 0.03 245)', 'tile-side': 'oklch(0.35 0.03 250)',
      'side-light': 'oklch(0.95 0.015 240)', 'side-dark': 'oklch(0.66 0.19 15)', 'side-wild': 'oklch(0.75 0.13 200)',
    },
  },
};

export function applyTheme(id) {
  const t = THEMES[id] || THEMES.walnut;
  const s = document.documentElement.style;
  for (const [k, v] of Object.entries(t.vars)) s.setProperty('--' + k, v);
}
