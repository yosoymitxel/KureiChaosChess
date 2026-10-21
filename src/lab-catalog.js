import { THEMES } from './data/themes.js';

const MINIS = [
  ['caceria', 'La cacería'],
  ['escape', 'Escape del tablero'],
  ['bodyguard', 'El guardaespaldas'],
  ['giantHunt', 'Caza de gigantes'],
  ['minefield', 'Campo minado'],
  ['contraband', 'Contrabando dimensional'],
  ['laboratory', 'El laboratorio'],
  ['collapsingFloor', 'El suelo se acaba'],
  ['kingImpostor', 'El rey impostor'],
  ['connect4', 'Conecta 4'],
  ['bomber', 'Bombardero'],
  ['barrier', 'Barrera'],
  ['izombie', 'Yo, zombi'],
  ['bowling', 'Boliche'],
  ['laststand', 'Última resistencia'],
  ['mates', 'Mate en uno'],
  ['knight', 'Ruta del caballo'],
  ['queens', 'Reinas'],
  ['marcianos', 'Marcianitos'],
  ['checkers', 'Damas'],
  ['fusion', 'Fusión'],
  ['duel', 'Duelo'],
  ['hockey', 'Hockey de mesa'],
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
  frame.src = `tests/visual.html?${params.toString()}`;
}

themeSelect.addEventListener('change', updatePreview);
miniSelect.addEventListener('change', updatePreview);
difficulty.addEventListener('change', updatePreview);
updatePreview();
