import { THEMES } from './data/themes.js';

const MINIS = [
  ['caceria', 'Minijuego · La cacería'],
  ['escape', 'Minijuego · Escape del tablero'],
  ['bodyguard', 'Minijuego · El guardaespaldas'],
  ['giantHunt', 'Minijuego · Caza de gigantes'],
  ['minefield', 'Minijuego · Campo minado'],
  ['contraband', 'Minijuego · Contrabando dimensional'],
  ['laboratory', 'Minijuego · El laboratorio'],
  ['collapsingFloor', 'Minijuego · El suelo se acaba'],
  ['kingImpostor', 'Minijuego · El rey impostor'],
  ['connect4', 'Minijuego · Conecta 4'],
  ['bomber', 'Minijuego · Bombardero'],
  ['barrier', 'Minijuego · Barrera'],
  ['izombie', 'Minijuego · Yo, zombi'],
  ['bowling', 'Minijuego · Boliche'],
  ['laststand', 'Minijuego · Última resistencia'],
  ['mates', 'Minijuego · Mate en uno'],
  ['knight', 'Minijuego · Ruta del caballo'],
  ['queens', 'Minijuego · Reinas'],
  ['marcianos', 'Minijuego · Marcianitos'],
  ['checkers', 'Minijuego · Damas'],
  ['fusion', 'Minijuego · Fusión'],
  ['duel', 'Minijuego · Duelo'],
  ['hockey', 'Minijuego · Hockey de mesa'],
  ['board:none', 'TABLERO NORMAL · Terreno llano'],
  ['board:promote', 'TABLERO NORMAL · Coronación'],
  ['board:chaos', 'TABLERO NORMAL · Terreno inestable'],
  ['board:rush', 'TABLERO NORMAL · Prisa'],
  ['board:fog', 'TABLERO NORMAL · Niebla densa'],
  ['board:ice', 'TABLERO NORMAL · Lago helado'],
  ['board:portal', 'TABLERO NORMAL · Portales'],
  ['board:zombie', 'TABLERO NORMAL · Plaga zombi'],
  ['board:elite', 'TABLERO NORMAL · Élite'],
  ['board:boss', 'TABLERO NORMAL · Jefe final'],
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

fillSelect(themeSelect, Object.values(THEMES).map(theme => [theme.id, theme.name]));
fillSelect(miniSelect, MINIS);
themeSelect.value = THEMES.walnut ? 'walnut' : Object.keys(THEMES)[0];
miniSelect.value = 'caceria';

function updatePreview() {
  const params = new URLSearchParams({
    mini: miniSelect.value,
    theme: themeSelect.value,
    diff: difficulty.value,
  });
  if (miniSelect.value.startsWith('board:')) {\n    params.set('variant', miniSelect.value.slice('board:'.length));\n    params.delete('mini');\n    frame.src = `tests/visual-board.html?${params.toString()}`;\n  } else {\n    frame.src = `tests/visual.html?${params.toString()}`;\n  }
}

themeSelect.addEventListener('change', updatePreview);
miniSelect.addEventListener('change', updatePreview);
difficulty.addEventListener('change', updatePreview);
updatePreview();
