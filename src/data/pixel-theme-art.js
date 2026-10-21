// Arte píxel original para los cinco paquetes nuevos de Zug. Las formas se dibujan en una retícula
// de coordenadas enteras: nada de filtros que pretendan convertir arte vectorial en pixel art.
export const PIXEL_THEME_ART_PACKS = Object.freeze([
  'calaveras-ataudes', 'vocaloid-miku', 'gatos-negros-naranjosos',
  'colibries-flores-lilas', 'pandas-mapaches'
]);

export const PIXEL_THEME_ART_SIZES = Object.freeze({
  pawn: [20, 27], rook: [30, 29], knight: [35, 31], bishop: [27, 33], queen: [29, 34], king: [31, 36],
  guard: [28, 31], advisor: [25, 30], elephant: [34, 30], camel: [35, 30], cannon: [36, 28],
  'boss-titan': [38, 40], 'boss-ram': [44, 32], 'boss-hydra': [43, 38], 'boss-golem': [42, 37],
  'boss-rider': [32, 41], 'boss-wall': [46, 30], 'boss-devourer': [41, 38]
});

const PACK_FAMILY = Object.freeze({
  'calaveras-ataudes': 'skull', 'vocaloid-miku': 'miku',
  'gatos-negros-naranjosos': 'cat', 'colibries-flores-lilas': 'hummingbird',
  'pandas-mapaches': 'raccoon'
});
const ink = 'var(--ink, #201a22)';
const light = 'var(--pc, #e8d8c0)';
const shade = 'var(--pc-2, #5e5148)';
const accent = 'var(--accent, #9c3658)';
const brass = 'var(--brass, #d4ad58)';
const paper = 'var(--paper, #eee5d8)';
const metal = '#818b94';
const rect = (x,y,w,h,fill,stroke=ink) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1"/>';
const poly = (points,fill,stroke=ink) => '<polygon points="'+points+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1" stroke-linejoin="miter"/>';
const ell = (x,y,rx,ry,fill,stroke=ink) => '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1"/>';
const line = (x1,y1,x2,y2,stroke,width=1) => '<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" fill="none" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="square"/>';

function decorate(family,type) {
  const boss = type.startsWith('boss-');
  const role = boss ? type.slice(5) : type;
  let s = '';
  if (family === 'skull') {
    s += poly('13,23 17,20 28,20 32,25 30,36 15,36',shade)+rect(15,28,15,3,light)+rect(17,31,3,4,shade)+rect(25,31,3,4,shade)+rect(15,35,6,3,ink)+rect(25,35,6,3,ink);
    s += ell(22.5,13,8,7,paper)+rect(14,13,17,7,paper)+rect(16,12,4,4,ink,'none')+rect(25,12,4,4,ink,'none');
    s += poly('20,18 23,17 25,19 23,21 20,21',ink,'none')+rect(18,22,2,2,ink,'none')+rect(22,22,2,2,ink,'none')+rect(26,22,2,2,ink,'none');
    if (role === 'queen' || role === 'king' || role === 'titan') s += poly('13,8 16,2 20,7 23,0 27,7 31,2 34,8',brass)+rect(21,3,4,3,accent,'none');
    if (role === 'bishop' || role === 'rider') s += poly('12,10 15,4 29,4 33,10',shade)+rect(21,5,4,4,accent,'none');
    if (role === 'ram') s += poly('14,12 4,6 2,9 12,16',paper)+poly('31,12 41,6 43,9 33,16',paper);
    if (role === 'hydra') s += ell(7,12,5,5,paper)+ell(38,12,5,5,paper)+rect(5,11,3,3,ink,'none')+rect(37,11,3,3,ink,'none');
  } else if (family === 'miku') {
    s += poly('15,9 9,11 5,26 10,28 15,18',light)+poly('30,9 36,11 40,26 35,28 30,18',light);
    s += ell(22.5,13,7,7,light)+rect(16,12,4,4,ink,'none')+rect(25,12,4,4,ink,'none');
    s += rect(19,19,7,2,accent,'none')+poly('18,23 27,23 30,32 15,32',shade)+poly('20,23 25,23 24,29 21,29',accent,'none')+rect(15,32,6,5,ink)+rect(25,32,6,5,ink)+rect(14,37,8,2,metal)+rect(24,37,8,2,metal);
    s += rect(16,7,3,6,brass,'none')+rect(27,7,3,6,brass,'none');
    if (role === 'queen' || role === 'king' || role === 'titan') s += poly('13,8 16,2 20,7 23,0 27,7 31,2 34,8',brass)+rect(21,3,4,3,accent,'none');
    if (role === 'guard' || role === 'ram' || role === 'wall') s += line(37,8,37,33,metal,2)+poly('33,10 37,2 41,10',brass);
    if (role === 'hydra') s += rect(3,13,5,9,light)+rect(37,13,5,9,light)+rect(4,14,3,3,ink,'none')+rect(38,14,3,3,ink,'none');
  } else if (family === 'cat') {
    s += poly('14,13 14,4 21,10 24,10 31,4 31,13 29,22 16,22',shade)+ell(18,14,2,3,brass,'none')+ell(27,14,2,3,brass,'none');
    s += poly('20,18 23,18 22,20',accent,'none')+line(18,20,10,19,paper)+line(18,22,10,23,paper)+line(27,20,35,19,paper)+line(27,22,35,23,paper);
    s += poly('12,28 15,23 30,23 33,28 30,34 15,34',light)+poly('15,27 18,28 18,33 14,34',shade,'none')+poly('28,27 31,28 32,34 28,33',shade,'none')+rect(15,33,6,4,shade)+rect(25,33,6,4,shade)+rect(13,37,8,2,ink)+rect(24,37,8,2,ink);
    s += line(9,28,4,20,shade,2)+line(4,20,7,15,shade,2);
    if (role === 'queen' || role === 'king' || role === 'titan') s += poly('13,10 16,3 20,8 23,1 27,8 31,3 34,10',brass)+rect(21,4,4,3,accent,'none');
    if (role === 'hydra') s += ell(7,14,5,5,shade)+ell(38,14,5,5,light)+rect(5,13,3,3,brass,'none')+rect(37,13,3,3,brass,'none');
    if (role === 'golem' || role === 'elephant') s += ell(9,25,6,7,shade)+ell(36,25,6,7,light)+rect(6,24,3,2,ink,'none')+rect(35,24,3,2,ink,'none');
  } else if (family === 'hummingbird') {
    s += poly('9,18 3,8 12,11 18,19 22,18',light)+poly('28,18 40,7 35,18 30,23 23,21',shade)+ell(23,21,6,7,light);
    s += poly('28,16 42,13 29,19',brass)+rect(24,12,2,2,ink,'none')+poly('17,25 24,25 29,30 24,34 16,30',accent,'none');
    s += line(23,30,20,38,shade,2)+line(24,30,30,37,shade,1)+rect(17,36,4,3,ink)+rect(26,36,4,3,ink);
    s += ell(12,31,4,3,accent,'none')+ell(16,28,4,3,accent,'none')+ell(12,27,4,3,accent,'none')+ell(13,30,2,2,brass,'none');
    if (role === 'queen' || role === 'king' || role === 'titan') s += poly('16,12 18,5 22,10 26,4 29,11 33,7 32,14',brass)+rect(24,8,3,3,accent,'none');
    if (role === 'hydra') s += ell(7,15,5,6,light)+ell(38,15,5,6,shade)+poly('9,15 15,14 9,18',brass,'none')+poly('36,15 30,14 36,18',brass,'none');
    if (role === 'bishop' || role === 'advisor') s += ell(11,10,4,5,accent,'none')+ell(34,10,4,5,accent,'none')+ell(11,10,2,2,brass,'none')+ell(34,10,2,2,brass,'none');
  } else {
    s += ell(22.5,15,8,8,light)+ell(15,7,4,4,shade)+ell(30,7,4,4,shade);
    s += ell(18,15,3,4,shade,'none')+ell(27,15,3,4,shade,'none')+ell(19,15,1,2,brass,'none')+ell(28,15,1,2,brass,'none');
    s += poly('21,19 24,19 22.5,21',ink,'none')+rect(19,22,7,2,ink,'none')+rect(20,23,2,2,paper,'none')+rect(23,23,2,2,paper,'none');
    s += ell(22.5,29,9,6,light)+rect(14,27,4,7,shade,'none')+rect(27,27,4,7,shade,'none')+rect(14,34,7,4,shade)+rect(25,34,7,4,shade)+rect(12,38,9,2,ink)+rect(25,38,9,2,ink);
    if (role === 'knight' || role === 'camel' || role === 'rider') s += line(31,28,37,32,shade,3)+ell(37,33,3,4,shade);
    if (role === 'queen' || role === 'king' || role === 'titan') s += poly('13,9 16,2 20,7 23,0 27,7 31,2 34,9',brass)+rect(21,4,4,3,accent,'none');
    if (role === 'hydra') s += ell(7,15,5,6,light)+ell(38,15,5,6,shade)+ell(7,15,2,2,ink,'none')+ell(38,15,2,2,ink,'none');
    if (role === 'ram') s += poly('15,13 5,6 3,9 12,17',light)+poly('30,13 40,6 42,9 33,17',light);
    if (role === 'elephant' || role === 'golem') s += ell(9,25,6,7,shade)+ell(36,25,6,7,light)+rect(7,24,3,3,paper,'none')+rect(35,24,3,3,paper,'none');
  }
  if (role === 'rook' || role === 'wall') s += poly('8,19 8,13 13,13 13,9 18,9 18,13 27,13 27,9 32,9 32,13 37,13 37,19',shade);
  if (role === 'knight' || role === 'rider') s += poly('8,29 11,23 20,23 27,27 37,29 35,32 10,32',shade)+rect(11,32,4,5,shade)+rect(28,32,4,5,shade);
  if (role === 'bishop' || role === 'advisor') s += poly('12,12 17,4 23,1 29,5 34,12 29,15 17,15',shade)+rect(21,5,3,4,brass,'none');
  if (role === 'cannon') s += ell(12,34,5,4,metal)+ell(33,34,5,4,metal)+rect(8,24,29,6,shade)+rect(17,20,14,5,light)+rect(19,22,10,3,ink);
  if (boss && ['titan','devourer','golem'].includes(role)) s += rect(8,35,29,3,shade)+rect(12,37,21,1,brass,'none');
  if (role === 'rider') s += poly('12,7 8,13 12,17 14,11 31,11 34,16 37,12 32,5',shade);
  return s;
}

export function pixelThemeSprite(type, pack) {
  if (!PACK_FAMILY[pack] || !PIXEL_THEME_ART_SIZES[type]) return null;
  const dims = PIXEL_THEME_ART_SIZES[type];
  const role = type.startsWith('boss-') ? type.slice(5) : type;
  const family = PACK_FAMILY[pack];
  const art = decorate(family,type);
  const box = { left: 22.5 - dims[0]/2, right: 22.5 + dims[0]/2, top: 40.5 - dims[1] };
  return { L: box, svg: '<g shape-rendering="crispEdges" stroke-linecap="square" stroke-linejoin="miter">'+art+'</g>' };
}

function escapeXml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function dataUrl(svg) { return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")'; }
function texture(pack,name,vars) {
  const family = PACK_FAMILY[pack];
  const size = name === 'table' ? 32 : (name === 'panel' || name === 'boton' ? 12 : 16);
  const table = escapeXml(vars.table || '#201a22'), table2 = escapeXml(vars['table-2'] || table);
  const a = escapeXml(vars['tile-a'] || '#d9d0c2'), b = escapeXml(vars['tile-b'] || '#83756c');
  const side = escapeXml(vars['tile-side'] || '#493d3a'), inkColor = escapeXml(vars.ink || '#211a1d');
  const accentColor = escapeXml(vars.accent || '#8d293c'), brassColor = escapeXml(vars.brass || '#d2a84a');
  const tileA = name.startsWith('tile-a'), tileB = name.startsWith('tile-b');
  let s = '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" shape-rendering="crispEdges">';
  if (name === 'panel' || name === 'boton') {
    const edge = name === 'boton' ? brassColor : inkColor;
    s += '<path d="M2 0H10V2H12V10H10V12H2V10H0V2H2Z" fill="'+edge+'"/>';
    s += '<path d="M3 2H9V3H10V9H9V10H3V9H2V3H3Z" fill="'+accentColor+'"/>';
    if (family === 'skull') s += '<path d="M3 3H4V4H3ZM8 3H9V4H8ZM5 7H7V8H5Z" fill="'+brassColor+'"/>';
    else if (family === 'miku') s += '<path d="M3 3H4V7H3ZM5 3H6V6H5ZM7 3H8V8H7Z" fill="'+table+'"/>';
    else if (family === 'cat') s += '<path d="M3 4H4V3H5V4H6V5H5V6H4V5H3ZM7 7H8V8H7Z" fill="'+table+'"/>';
    else if (family === 'hummingbird') s += '<path d="M6 3H7V4H8V5H7V6H6V5H5V4H6Z" fill="'+brassColor+'"/>';
    else s += '<path d="M3 4H4V3H5V4H6V5H5V6H4V5H3Z" fill="'+table+'"/>';
  } else {
    const base = name === 'table' ? table : tileA ? a : tileB ? b : '#00000000';
    s += '<rect width="'+size+'" height="'+size+'" fill="'+base+'"/>';
    if (name === 'table') {
      s += '<path d="M0 0H32V2H0ZM0 15H32V17H0ZM0 30H32V32H0Z" fill="'+table2+'"/><path d="M0 0V32H2V0ZM15 0V32H17V0ZM30 0V32H32V0Z" fill="'+table2+'"/>';
      s += '<path d="M3 3H11V4H3ZM21 21H29V22H21Z" fill="'+side+'"/>';
    } else {
      s += '<path d="M0 0H'+size+'V1H0ZM0 0V'+size+'H1V0ZM'+(size-1)+' 1H'+size+'V'+size+'H'+(size-1)+'Z" fill="'+side+'"/>';
      if (name.endsWith('2')) s += '<path d="M'+(size-4)+' 2H'+(size-3)+'V'+(size-5)+'H'+(size-2)+'V'+(size-7)+'H'+(size-1)+'V'+(size-8)+'H'+(size-2)+'V'+(size-6)+'H'+(size-3)+'V'+(size-4)+'H'+(size-4)+'Z" fill="'+side+'"/>';
      if (name.endsWith('3')) s += '<path d="M2 2H3V4H5V5H7V6H5V7H3V5H2Z" fill="'+side+'"/>';
      if (family === 'skull') s += '<path d="M5 5H7V4H10V5H12V7H11V10H9V12H7V10H5V7H4V6H5Z" fill="'+brassColor+'"/><path d="M6 7H8V9H6ZM10 7H11V9H10Z" fill="'+inkColor+'"/>';
      else if (family === 'miku') s += '<path d="M3 4H4V9H3ZM4 8H9V9H4ZM10 4H11V12H10ZM11 11H14V12H11Z" fill="'+side+'"/><path d="M5 6H7V7H5ZM12 4H13V7H12Z" fill="'+accentColor+'"/>';
      else if (family === 'cat') s += '<path d="M6 4H8V6H10V8H8V10H6V8H4V6H6Z" fill="'+inkColor+'"/><path d="M5 3H6V5H5ZM9 3H10V5H9ZM4 8H5V9H4ZM10 8H11V9H10Z" fill="'+accentColor+'"/>';
      else if (family === 'hummingbird') s += '<path d="M8 2H10V4H12V6H10V8H8V6H6V4H8Z" fill="'+accentColor+'"/><path d="M9 4H10V5H9ZM4 10H5V13H4ZM5 12H8V13H5Z" fill="'+brassColor+'"/>';
      else s += '<path d="M3 3H4V5H6V6H7V7H6V8H4V6H3Z" fill="'+inkColor+'"/><path d="M10 8H11V10H13V11H11V12H10V11H9V10H10Z" fill="'+side+'"/>';
    }
  }
  return s+'</svg>';
}

export function pixelThemeTextures(pack, vars) {
  if (!PACK_FAMILY[pack]) return {};
  const result = {};
  ['tile-a','tile-a2','tile-a3','tile-b','tile-b2','tile-b3','table','panel','boton'].forEach(name => {
    result['px-'+name] = dataUrl(texture(pack,name,vars || {}));
  });
  return result;
}
