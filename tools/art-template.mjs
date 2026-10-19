// Plantillas de dibujo para el dueño: node tools/art-template.mjs → art/plantillas/*.svg
// Cada marco es el lienzo real de una pieza (45×41 unidades, la peana y el centro del juego),
// con la silueta actual como calco bloqueado. Los colores de trabajo son tres y el importador
// los cambia por las variables del tema (ver art/plantillas/LEEME.md).
import { mkdirSync, writeFileSync } from 'node:fs';

globalThis.document = { documentElement: { dataset: {} } };
const { pieceSVG } = await import('../src/view/piece-art.js');
const { PIECE_TYPES, PIECE_NAMES } = await import('../src/data/pieces.js');
const { BOSSES, BOSS_IDS } = await import('../src/data/bosses.js');

const OUT = new URL('../art/plantillas/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Los tres colores de trabajo (cuerpo, detalle, contorno): el importador los vuelve var(--pc), var(--pc-2) y var(--ink).
const BODY = '#f3ead8', DETAIL = '#8a7a66', INK = '#2a2233';
const flat = (svg) => svg.replaceAll('var(--pc-2)', DETAIL).replaceAll('var(--pc)', BODY).replaceAll('var(--ink)', INK);
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

const S = 8, W = 45, H = 41, GAP = 40, LABEL = 34;
const guides = () => `
    <rect width="${W}" height="${H}" fill="#fff" stroke="#c9c2b6" stroke-width="0.15"/>
    <rect x="0" y="32.6" width="${W}" height="${H - 32.6}" fill="#e9e4da"/>
    <line x1="22.5" y1="0" x2="22.5" y2="${H}" stroke="#d98a6c" stroke-width="0.12" stroke-dasharray="0.8 0.6"/>
    <line x1="0" y1="40.5" x2="${W}" y2="40.5" stroke="#d98a6c" stroke-width="0.15"/>
    <line x1="0" y1="4" x2="${W}" y2="4" stroke="#9fb7d8" stroke-width="0.12" stroke-dasharray="0.8 0.6"/>`;

function sheet(name, title, items, cols) {
  const fw = W * S, fh = H * S + LABEL;
  const rows = Math.ceil(items.length / cols);
  const width = cols * fw + (cols + 1) * GAP, height = rows * fh + (rows + 1) * GAP + 60;
  const frames = items.map(({ id, label, svg }, i) => {
    const x = GAP + (i % cols) * (fw + GAP), y = 60 + GAP + Math.floor(i / cols) * (fh + GAP);
    return `
  <g id="marco-${id}" transform="translate(${x} ${y})">
    <text y="22" font-family="sans-serif" font-size="20" font-weight="700" fill="${INK}">${label}</text>
    <g transform="translate(0 ${LABEL}) scale(${S})">${guides()}
      <g id="calco-${id}" opacity="0.28" sodipodi:insensitive="true">${flat(inner(svg))}</g>
      <g id="dibujo-${id}" inkscape:groupmode="layer" inkscape:label="dibujo-${id}"></g>
    </g>
  </g>`;
  }).join('');
  const file = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#faf7f1"/>
  <text x="${GAP}" y="44" font-family="sans-serif" font-size="26" font-weight="800" fill="${INK}">${title}</text>
  <g id="paleta" transform="translate(${width - 3 * 100 - GAP} 18)">
    ${[[BODY, 'cuerpo'], [DETAIL, 'detalle'], [INK, 'contorno']].map(([c, n], i) => `<rect x="${i * 100}" width="28" height="28" rx="4" fill="${c}" stroke="${INK}"/><text x="${i * 100 + 34}" y="19" font-family="sans-serif" font-size="12" fill="${INK}">${n}</text>`).join('')}
  </g>${frames}
</svg>
`;
  writeFileSync(new URL(name, OUT), file);
  return name;
}

const pieces = PIECE_TYPES.map((t) => ({ id: t, label: PIECE_NAMES[t], svg: pieceSVG(t) }));
const bosses = BOSS_IDS.map((id) => ({ id: 'boss-' + id, label: `${BOSSES[id].name} (${BOSSES[id].size.join('×')})`, svg: pieceSVG('boss-' + id) }));
console.log(sheet('piezas.svg', 'Zugzwang · piezas (dibuja en la capa "dibujo-…", sobre el calco)', pieces, 4));
console.log(sheet('jefes.svg', 'Zugzwang · jefes (mismo lienzo; el juego lo estira a su tamaño en casillas)', bosses, 4));

// Tablero y mesa: dos casillas, el canto y un fondo que se repite en mosaico.
writeFileSync(new URL('tablero.svg', OUT), `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="760" viewBox="0 0 1000 760">
  <rect width="100%" height="100%" fill="#faf7f1"/>
  <text x="40" y="44" font-family="sans-serif" font-size="26" font-weight="800" fill="${INK}">Zugzwang · tablero y mesa</text>
  <g id="casilla-clara" transform="translate(40 90)"><rect width="200" height="200" fill="#e6dcc6" stroke="#c9c2b6"/><text y="-10" font-family="sans-serif" font-size="16" font-weight="700">Casilla clara (200×200, se repite)</text></g>
  <g id="casilla-oscura" transform="translate(280 90)"><rect width="200" height="200" fill="#b59a7a" stroke="#c9c2b6"/><text y="-10" font-family="sans-serif" font-size="16" font-weight="700">Casilla oscura</text></g>
  <g id="canto" transform="translate(520 90)"><rect width="200" height="40" fill="#7a5c43" stroke="#c9c2b6"/><text y="-10" font-family="sans-serif" font-size="16" font-weight="700">Canto (lado visible del bloque)</text></g>
  <g id="mesa" transform="translate(40 350)"><rect width="600" height="360" fill="#3a2a20" stroke="#c9c2b6"/><text y="-10" font-family="sans-serif" font-size="16" font-weight="700">Mesa / fondo (mosaico: el borde derecho debe empalmar con el izquierdo, y arriba con abajo)</text></g>
</svg>
`);
console.log('tablero.svg');

// Personaje: un marco por gesto; cada temporada repite la hoja con su ropa.
const POSES = ['neutral', 'habla', 'alegre', 'enfado', 'sorpresa', 'pensando'];
writeFileSync(new URL('personaje.svg', OUT), `<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="760" viewBox="0 0 1040 760">
  <rect width="100%" height="100%" fill="#faf7f1"/>
  <text x="40" y="44" font-family="sans-serif" font-size="26" font-weight="800" fill="${INK}">Zugzwang · personaje (una hoja por temporada: base, halloween, navidad…)</text>
  ${POSES.map((p, i) => {
    const x = 40 + (i % 3) * 330, y = 90 + Math.floor(i / 3) * 330;
    return `<g id="gesto-${p}" transform="translate(${x} ${y})"><text y="-10" font-family="sans-serif" font-size="16" font-weight="700">${p}</text><rect width="300" height="300" fill="#fff" stroke="#c9c2b6"/><line x1="150" y1="0" x2="150" y2="300" stroke="#d98a6c" stroke-dasharray="6 5"/><line x1="0" y1="285" x2="300" y2="285" stroke="#d98a6c"/></g>`;
  }).join('\n  ')}
</svg>
`);
console.log('personaje.svg');
