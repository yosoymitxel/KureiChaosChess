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
const group = document.getElementById('group');
const item = document.getElementById('item');
const itemField = document.getElementById('item-field');
const difficulty = document.getElementById('difficulty');
const frame = document.getElementById('preview');
let activeTheme = 'walnut';

function optionsForGroup() {
  const themes = group.value === 'themes';
  itemField.firstChild.textContent = themes ? 'Tema / mesa' : 'Minijuego';
  item.replaceChildren();
  const rows = themes ? Object.values(THEMES).map(t => [t.id, t.name]) : MINIS;
  for (const [id, name] of rows) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    item.append(option);
  }
  if (themes) item.value = activeTheme;
  else item.value = MINIS[0][0];
  difficulty.disabled = themes;
  updatePreview();
}
function updatePreview() {
  const isTheme = group.value === 'themes';
  const mini = isTheme ? 'caceria' : item.value;
  const theme = isTheme ? item.value : activeTheme;
  if (isTheme) activeTheme = theme;
  frame.src = `tests/visual.html?mini=${encodeURIComponent(mini)}&theme=${encodeURIComponent(theme)}&diff=${encodeURIComponent(difficulty.value)}`;
}
group.addEventListener('change', optionsForGroup);
item.addEventListener('change', updatePreview);
difficulty.addEventListener('change', updatePreview);
optionsForGroup();
