// Verifica que las referencias APK tienen VFX propios y no son alias del renderer principal.
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const proto = read('src/lab/apk/prototypes.js');
const effects = read('src/lab/apk/effects.js');
const lab = read('src/lab.js');
const labHtml = read('lab.html');
const page = read('tests/apk-lab.html');
const css = read('css/screens.css');
const refDoc = read('references/apk/effects-contract.md');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

const importMatch = proto.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/effects\.js['"]/);
check(Boolean(importMatch), 'prototypes.js debe importar el renderer propio ./effects.js');
const imports = importMatch
  ? importMatch[1].split(',').map((name) => name.trim()).filter(Boolean)
  : [];
const exports = new Set([...effects.matchAll(/export\s+(?:async\s+)?function\s+([\w$]+)/g)].map((m) => m[1]));
for (const name of imports) check(exports.has(name), `effects.js no exporta ${name}`);

check(!/\bview\.fx\.[\w$]+\s*\(/.test(proto), 'prototypes.js no debe delegar en BoardView.Fx');
check(!/\bview\.(?:shake|kill|hurt|rise|infect|meteor)\s*\(/.test(proto), 'prototypes.js no debe invocar VFX/cinemáticas genéricas de BoardView');
check(!/\bnew\s+Match\s*\(/.test(proto), 'los prototipos APK no deben entrar en el motor de partidas');
check(/function\s+movePieceAPK\s*\(/.test(proto), 'falta la curva de movimiento independiente del APK');
check(proto.includes('playAPKDeal(view,pieces,boardFrame)') && proto.includes('vfx:false'), 'las modalidades APK deben tener entrada propia y el VFX genérico apagado');
check(!/\bview\.intro\s*\(/.test(proto), 'los prototipos APK no deben usar la entrada genérica de BoardView');
check(proto.includes('target.color=zombie.color;target.zombie=true;'), 'Zombie Chess debe cambiar el bando al convertir la pieza');
check(proto.includes('playAPKZombieAttack(') && proto.includes('playAPKTransform('), 'Zombie Chess debe tener mordida y transformación propias');
check(proto.includes('cells.map(([row,col])=>({row,col}))'), 'los meteoritos deben pasar coordenadas al renderer en formato {row,col}');
for (const line of proto.split('\n').filter((line) => line.includes('playAPKBombBlast(') && line.includes('nearbyCells('))) {
  check(line.includes('.map(([row,col])=>({row,col}))'), 'Bomb Chess/Arcade deben convertir pares de coordenadas para el renderer');
}

check(/createElement\('canvas'\)/.test(effects) && /requestAnimationFrame/.test(effects), 'effects.js debe renderizar su propia capa animada');
check(effects.includes('imageSmoothingEnabled = false'), 'los VFX pixelados deben conservar píxeles duros');
check(/export async function playAPKDeal/.test(effects) && /export function playAPKSpawnBurst/.test(effects), 'falta la entrada APK propia con llegada pixelada de piezas');
check(lab.includes('APK · Estela pixelada (movimiento)') && lab.includes('APK · Caza zombi (persecución y mordida)'), 'lab.html debe ofrecer comparadores APK inequívocos');
check(lab.includes("stage.classList.toggle('apk-ref-mode'"), 'el selector debe activar/desactivar el estado visual APK');
check(lab.includes('if (s.apkPlay) await playAPKDeal(view, s.pieces, stage);') && lab.includes('vfx: !s.apkPlay'), 'las escenas APK del laboratorio deben saltarse el intro y el VFX genéricos');
check(labHtml.includes('Referencias del APK (aisladas)'), 'lab.html debe separar los apartados Kure\'i y APK');
check(css.includes('.lab-stage.apk-ref-mode::before'), 'falta la marca visual del renderer separado en el laboratorio');
check(page.includes('.apk-board-frame .tile.doom') && page.includes('#3dff8e'), 'la página APK debe tener estilos de efectos propios');
check(refDoc.includes('BoardView.Fx') && refDoc.includes('Revisión de aislamiento'), 'la documentación debe registrar el contrato de aislamiento');

if (errors.length) {
  console.error(errors.map((message) => '✗ ' + message).join('\n'));
  process.exit(1);
}
console.log(`APK VFX isolation OK: ${imports.length} imports propios, sin llamadas a BoardView.Fx ni al VFX genérico.`);
