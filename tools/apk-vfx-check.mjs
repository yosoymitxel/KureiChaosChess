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
const expansion = read('src/lab/apk/expansion.js');
const catalog = read('src/lab/apk/catalog.js');
const expansionDoc = read('references/apk/expansion-audit.md');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

const importMatch = proto.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/effects\.js['"]/);
check(Boolean(importMatch), 'prototypes.js debe importar el renderer propio ./effects.js');
const exports = new Set([...effects.matchAll(/export\s+(?:async\s+)?function\s+([\w$]+)/g)].map((m) => m[1]));
const labImportMatch = lab.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/lab\/apk\/effects\.js['"]/);
check(Boolean(labImportMatch), 'lab.js debe importar efectos APK desde el renderer aislado');
const labImports = labImportMatch ? labImportMatch[1].split(',').map(name => name.trim()).filter(Boolean) : [];
for (const name of labImports) check(exports.has(name), `effects.js no exporta ${name} usado por lab.js`);
const imports = importMatch
  ? importMatch[1].split(',').map((name) => name.trim()).filter(Boolean)
  : [];
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
const apkEffectSamples = [
  ['APK · Lluvia de meteoritos (aviso e impacto)', 'playAPKMeteorImpact'],
  ['APK · Explosión de bomba (área 3×3)', 'playAPKBombBlast'],
  ['APK · Aviso de campo de bombas', 'playAPKBombField'],
  ['APK · Teletransporte (vórtice cian/violeta)', 'playAPKTeleport'],
  ['APK · Golpe y daño de pieza', 'playAPKDamage'],
  ['APK · Caída y desaparición de pieza', 'playAPKFall'],
  ['APK · Ráfaga de partículas', 'playAPKParticleBurst'],
  ['APK · Escudo energético', 'playAPKShield'],
  ['APK · Rayo mágico (haz)', 'playAPKBeam'],
  ['APK · Transformación zombi (INFECTED!)', 'playAPKTransform'],
  ['APK · Aparición de pieza (ráfaga pixelada)', 'playAPKSpawnBurst'],
  ['APK · Pantalla de victoria (confeti)', 'playAPKVictory'],
  ['APK · Sacudida de impacto', 'playAPKScreenShake'],
  ['APK · Entrada de tablero (losas y piezas pixeladas)', 'playAPKDeal'],
  ['APK · Deslizamiento de gravedad (sin salto)', 'slideAPKLabPiece'],
  ['APK · Escudo roto', 'playAPKShield'],
];
for (const [label, effect] of apkEffectSamples) {
  check(lab.includes(label) && lab.includes(effect), `Falta la muestra de VFX APK aislada: ${label}`);
}
check(!labHtml.includes('apk-games') && !labHtml.includes('tests/apk-lab.html?game='), 'lab.html debe mostrar efectos individuales, no incrustar los minijuegos completos');
check(labHtml.includes('Galería de efectos individuales hallados en el APK') && lab.includes('skipDeal:true'), 'lab.html debe anunciar la galería de efectos individuales y aislar su reproducción');
check(lab.includes("stage.classList.toggle('apk-ref-mode'"), 'el selector debe activar/desactivar el estado visual APK');
check(lab.includes('if (s.apkPlay) { if (!s.skipDeal) await playAPKDeal(view, s.pieces, stage); }') && lab.includes('vfx: !s.apkPlay'), 'las escenas APK deben poder aislar el VFX y desactivar la entrada del tablero cuando corresponda');
check(labHtml.includes('Referencias del APK (aisladas)'), 'lab.html debe separar los apartados Kure\'i y APK');
check(css.includes('.lab-stage.apk-ref-mode::before'), 'falta la marca visual del renderer separado en el laboratorio');
check(page.includes('.apk-board-frame .tile.doom') && page.includes('#3dff8e'), 'la página APK debe tener estilos de efectos propios');
check(refDoc.includes('BoardView.Fx') && refDoc.includes('Revisión de aislamiento'), 'la documentación debe registrar el contrato de aislamiento');

const countEntries = (source, start, end) => {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  if (a < 0 || b < 0) return -1;
  return (source.slice(a, b).match(/\{\s*id\s*:/g) || []).length;
};
check(countEntries(catalog, 'export const APK_MISSING_MODES = [', 'export const APK_MODIFIERS = [') === 15, 'el catálogo debe incluir las 15 modalidades ausentes');
check(countEntries(catalog, 'export const APK_MODIFIERS = [', 'export const APK_RECIPES = [') === 22, 'el catálogo debe incluir los 22 modificadores');
check(countEntries(catalog, 'export const APK_RECIPES = [', 'export const APK_CHAOS_EVENTS = [') === 6, 'el catálogo debe incluir las seis recetas');
check(countEntries(catalog, 'export const APK_CHAOS_EVENTS = [', 'export const APK_HORDE_UPGRADES = [') === 12, 'Chaos 2.0 debe contener los 12 eventos');
check(countEntries(catalog, 'export const APK_HORDE_UPGRADES = [', 'export const APK_CATALOG = Object.freeze') === 24, 'Horde Mode debe indexar las 24 mejoras');
for (const id of ['boss2','horde','randarmy','giant','potato','pqueen','ppawn','horse','speed','invis','drunk','chicken','bullet','anti','p4']) {
  check(catalog.includes(`id:'${id}'`), `falta modalidad APK ${id}`);
}
for (const id of ['ktele','boom','php','enr','grav','fast','dk','abil','ev','zc','sudden','fog','randpromo','extrapawns','ice','hotfloor','royalswap','ducks','lowgrav','bighead','narrator','disco']) {
  check(catalog.includes(`id:'${id}'`), `falta modificador APK ${id}`);
}
for (const id of ['moon','iceage','duckapoc','lava','corporate','overdrive']) {
  check(catalog.includes(`id:'${id}'`), `falta receta APK ${id}`);
}
const expansionImport = expansion.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/effects\.js['"]/);
check(Boolean(expansionImport), 'expansion.js debe consumir el renderer APK propio');
const expansionImports = expansionImport ? expansionImport[1].split(',').map(x => x.trim()).filter(Boolean) : [];
for (const name of expansionImports) check(exports.has(name), `effects.js no exporta ${name} requerido por expansion.js`);
check(!/\bview\.fx\.[\w$]+\s*\(/.test(expansion), 'expansion.js no debe llamar a BoardView.Fx');
check(!/\bnew\s+Match\s*\(/.test(expansion), 'expansion.js no debe crear partidas principales');
check(proto.includes('mountAPKExpansion(root, id, themeId)'), 'prototypes.js debe despachar las nuevas familias al módulo aislado');
check(lab.includes('APK · Vuelo de corona (Rey Patata Caliente)') && lab.includes('playAPKHotPotatoCrown'), 'lab.js debe ofrecer el VFX de corona individual');
check(lab.includes('APK · Ruleta del caos (anuncio y resultado)') && lab.includes('playAPKChaosRoulette'), 'lab.js debe ofrecer el VFX individual de ruleta');
check(effects.includes('export function playAPKHotPotatoCrown') && effects.includes('export function playAPKChaosRoulette'), 'faltan los dos efectos visuales nuevos');
check(expansionDoc.includes('C2_EVENTS') && expansionDoc.includes('Potato.tick') && expansionDoc.includes('p4'), 'la evidencia de expansión debe documentar registros y puntos de extensión');
check(page.includes('.apk-chicken') && page.includes('.apk-hybrid-archbishop') && page.includes('.apk-team-4'), 'faltan estilos de las escenas expandidas');


const newSamples = [
  ['APK · Sello de evento (mxStamp)', 'playAPKEventStamp'],
  ['APK · Zona de ataque telegrafiada (mxZone)', 'playAPKZoneWarning'],
  ['APK · Marcador de punto débil (MxDraw.weak)', 'playAPKWeakPointMarker'],
  ['APK · Impacto en punto débil (mxWeak)', 'playAPKWeakPointHit'],
  ['APK · Entrada cinematográfica de jefe (mxBossCut)', 'playAPKBossCut'],
  ['APK · Ataque cinematográfico de jefe (mxBossCut)', 'playAPKBossCut'],
  ['APK · Derrota cinematográfica de jefe (mxBossCut)', 'playAPKBossCut'],
  ['APK · Proyectil balístico (mxBullet)', 'playAPKBullet'],
  ['APK · Subtítulo del narrador (mxSay)', 'playAPKCaption'],
  ['APK · Casilla vacía (void)', 'playAPKTilePattern'],
  ['APK · Casilla de lava (lava)', 'playAPKTilePattern'],
  ['APK · Casilla maldita (curse)', 'playAPKTilePattern'],
  ['APK · Casilla infectada (infect)', 'playAPKTilePattern'],
  ['APK · Muro temporal (wall)', 'playAPKTilePattern'],
  ['APK · Plataforma de anclaje (plat)', 'playAPKTilePattern'],
  ['APK · Portales enlazados (portal)', 'playAPKTilePattern'],
  ['APK · Trampa de pinchos (trap)', 'playAPKTilePattern'],
  ['APK · Luces de discoteca (disco)', 'playAPKDisco'],
  ['APK · Cuenta atrás de ajedrez relámpago (speed)', 'playAPKSpeedTimer'],
  ['APK · Captura con corte (die: capture)', 'playAPKDeathStyle'],
  ['APK · Muerte por fuego (die: burn)', 'playAPKDeathStyle'],
  ['APK · Desintegración infecciosa (die: infect)', 'playAPKDeathStyle'],
  ['APK · Aplastamiento (die: crush)', 'playAPKDeathStyle'],
  ['APK · Desvanecimiento (die: fade)', 'playAPKDeathStyle'],
  ['APK · Destrucción de jefe (die: boss)', 'playAPKDeathStyle'],
  ['APK · Golpe crítico con daño (dmg)', 'playAPKCriticalDamage'],
  ['APK · Texto flotante (text)', 'playAPKFloatingText'],
  ['APK · Revivir pieza (spawn: revive)', 'playAPKSpawnVariant'],
  ['APK · Transformación dorada (transform: evolve)', 'playAPKTransformVariant'],
  ['APK · Devolución de pieza (transform: devolve)', 'playAPKTransformVariant'],
  ['APK · Salto de pieza (move: jump)', 'moveAPKLabPieceStyle'],
  ['APK · Lanzamiento giratorio (move: hurl)', 'moveAPKLabPieceStyle'],
  ['APK · Movimiento fantasmal (move: phase)', 'moveAPKLabPieceStyle'],
  ['APK · Pisotón pesado (move: stomp)', 'moveAPKLabPieceStyle'],
  ['APK · Embestida de ataque (attack)', 'lungeAPKLabPiece'],
  ['APK · Banner de evento (banner)', 'playAPKBanner'],
  ['APK · Rayo vertical de jefe (beam)', 'playAPKColumnBeam'],
  ['APK · Invocación de pieza (spawn: summon)', 'playAPKSpawnVariant'],
  ['APK · Transformación zombi (transform: zombify)', 'playAPKTransformVariant'],
  ['APK · Explosión de pieza (die: explode)', 'playAPKDeathStyle'],
  ['APK · Invocación zombi (spawn: zombie)', 'playAPKSpawnVariant'],
  ['APK · Coronación (transform: promote)', 'playAPKTransformVariant'],
  ['APK · Destello de casilla (tile)', 'playAPKTileSpark'],
];
for (const [label, effect] of newSamples) {
  check(lab.includes(label) && lab.includes(effect), `Falta la muestra APK recién hallada: ${label}`);
}
for (const name of ['playAPKEventStamp','playAPKZoneWarning','playAPKWeakPointMarker','playAPKWeakPointHit','playAPKBullet','playAPKBossCut','playAPKCaption','playAPKTilePattern','playAPKDisco','playAPKSpeedTimer','playAPKDeathStyle','playAPKCriticalDamage','playAPKFloatingText','playAPKTransformVariant','playAPKSpawnVariant','playAPKColumnBeam','playAPKBanner','playAPKTileSpark']) {
  check(exports.has(name), `Falta implementación VFX de referencia: ${name}`);
}

if (errors.length) {
  console.error(errors.map((message) => '✗ ' + message).join('\n'));
  process.exit(1);
}
console.log(`APK VFX isolation OK: ${imports.length} imports propios, sin llamadas a BoardView.Fx ni al VFX genérico.`);
