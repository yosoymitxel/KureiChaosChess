// El catálogo debe seguir cargando aunque falle una dependencia de los temas píxel.
const FALLBACK_THEMES = {
  walnut: { id: 'walnut', name: 'Nogal' },
  felt: { id: 'felt', name: 'Tapete' },
  slate: { id: 'slate', name: 'Pizarra' },
  pergamino: { id: 'pergamino', name: 'Pergamino' },
  corinto: { id: 'corinto', name: 'Corinto' },
  noche: { id: 'noche', name: 'Noche' },
};
let THEMES = FALLBACK_THEMES;
try {
  const themesModule = await import('./data/themes.js');
  if (themesModule.THEMES && Object.keys(themesModule.THEMES).length) {
    THEMES = themesModule.THEMES;
  }
} catch (error) {
  console.error('[Banco de pruebas] No se pudieron cargar todos los temas; se usa el catálogo básico.', error);
}

// Variantes de tablero: las mecánicas de partida de modifiers.js (sin descanso ni bolsa) y el jefe.
const { MODIFIERS } = await import('./data/modifiers.js');
const BOARD_VARIANTS = Object.values(MODIFIERS).filter((m) => !m.mini && !['rest', 'bag'].includes(m.id))
  .map((m) => [`board:${m.id}`, `TABLERO NORMAL · ${m.id === 'boss' ? 'Jefe final' : m.name}`]);
const APK_OPTIONS = (await import('./lab/apk/catalog.js')).APK_CATALOG
  .map((entry) => [`apk:${entry.id}`, `APK: ${entry.name}`]);
const MINIS = [
  ...Object.entries((await import('./data/minigame-catalog.js')).MINIGAMES)
    .map(([id, game]) => [id, `Minijuego · ${game.name}`]),
  ...BOARD_VARIANTS,
  ...APK_OPTIONS,
];

const themeSelect = document.getElementById('theme');
const miniSelect = document.getElementById('mini');
const difficulty = document.getElementById('difficulty');
const frame = document.getElementById('preview');

function fillSelect(select, rows) {
  const fragment = document.createDocumentFragment();
  for (const [id, name] of rows) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    fragment.append(option);
  }
  select.replaceChildren(fragment);
}

{
  fillSelect(themeSelect, Object.values(THEMES).map(theme => [theme.id, theme.name]));
}
fillSelect(miniSelect, MINIS);
themeSelect.value = THEMES.walnut ? 'walnut' : Object.keys(THEMES)[0];
miniSelect.value = 'caceria';

function updatePreview() {
  const selected = miniSelect.value;
  const isApk = selected.startsWith('apk:');
  difficulty.disabled = isApk;
  if (isApk) difficulty.value = 'normal';
  const params = new URLSearchParams({ theme: themeSelect.value, diff: isApk ? 'normal' : difficulty.value });
  if (isApk) {
    params.set('game', selected.slice(4));
    frame.src = 'tests/apk-lab.html?' + params.toString();
  } else if (selected.startsWith('board:')) {
    params.set('variant', selected.slice('board:'.length));
    frame.src = 'tests/visual-board.html?' + params.toString();
  } else {
    params.set('mini', selected);
    frame.src = 'tests/visual.html?' + params.toString();
  }
}
themeSelect.addEventListener('change', updatePreview);
miniSelect.addEventListener('change', updatePreview);
difficulty.addEventListener('change', updatePreview);
updatePreview();
