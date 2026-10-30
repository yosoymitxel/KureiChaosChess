// Animation lab: stage single BoardView scenes on demand (open lab.html).
import { BoardView } from './view/board-view.js';
import { makePiece, placeBoss } from './game/generate.js';
import { Match } from './game/match.js';
import { key, reachPreview } from './game/rules.js';
import { Moments } from './ui/moments.js';
import { BOSSES } from './data/bosses.js';
import { WEATHER } from './data/weather.js';
import { applyTheme } from './data/themes.js';
import { animate } from 'animejs';
import { clearAPKEffects, playAPKPixelTrail, playAPKShockwave, playAPKZombieAttack, playAPKTransform, playAPKDeal, playAPKMeteorImpact, playAPKBombBlast, playAPKBombField, playAPKDamage, playAPKTeleport, playAPKFall, playAPKParticleBurst, playAPKShield, playAPKBeam, playAPKVictory, playAPKScreenShake, playAPKSpawnBurst, playAPKHotPotatoCrown, playAPKChaosRoulette, playAPKEventStamp, playAPKZoneWarning, playAPKWeakPointMarker, playAPKWeakPointHit, playAPKBullet, playAPKBossCut, playAPKCaption, playAPKTilePattern, playAPKDisco, playAPKSpeedTimer, playAPKDeathStyle, playAPKCriticalDamage, playAPKFloatingText, playAPKTransformVariant, playAPKSpawnVariant, playAPKColumnBeam, playAPKBanner, playAPKTileSpark } from './lab/apk/effects.js';

let view, camera = 'tilt', theme = 'walnut';
const board = () => ({ rows: 7, cols: 7, holes: new Set([key(3, 0), key(3, 6)]), protectRows: 2 });

// Each scene builds a tiny position and returns an async "play" function.
// Foreground moments, played over the lab stage without a match.
const MOMENTS = {
  'Momento: jaque': (m) => m.callout({ text: '¡Jaque!', sub: 'Tu turno: protege al rey', tone: 'danger', piece: { type: 'king', side: 'light' }, anim: 'tremble', tier: 'major' }),
  'Momento: reina caída': (m) => m.callout({ text: '¡Reina caída!', tone: 'brass', piece: { type: 'queen', side: 'dark' }, anim: 'fall', tier: 'major' }),
  'Momento: rey caído': (m) => m.callout({ text: '¡Rey caído!', sub: 'Cae el bando carmesí', tone: 'brass', piece: { type: 'king', side: 'dark' }, anim: 'explode', tier: 'major' }),
  'Momento: coronación': (m) => m.callout({ text: '¡Coronación!', sub: 'El peón asciende a reina', tone: 'brass', piece: { type: 'pawn', side: 'light' }, pieceTo: { type: 'queen', side: 'light' }, anim: 'promote' }),
  'Momento: golpe al jefe': (m) => m.callout({ text: '¡Golpe!', sub: 'A Titán le quedan 2 vidas', tone: 'brass', piece: { type: 'king', side: 'dark' }, anim: 'hit', tier: 'major' }),
  'Momento: aplastados': (m) => m.callout({ text: '¡Aplastados ×3!', tone: 'danger', piece: { type: 'king', side: 'dark' }, anim: 'stomp' }),
  'Momento: derrumbe': (m) => m.callout({ text: '¡Derrumbe!', sub: 'El borde cae al vacío', tone: 'danger', icon: 'collapse', anim: 'crumble', tier: 'major' }),
  'Momento: piso': (m) => m.cinematic({ title: 'Piso 3', sub: 'Prisa. Cada jugador mueve dos veces por turno.', icon: 'rush', wave: ['pawn', 'knight', 'king'].flatMap((t) => [[t, 'light'], [t, 'dark']]) }),
  'Momento: jefe': (m) => m.cinematic({ title: 'Titán', sub: BOSSES.titan.desc, piece: { type: 'king', side: 'dark' }, hp: { hp: 3, max: 3 }, tone: 'danger', anim: 'stomp' }),
  'Momento: jefe derribado': (m) => m.cinematic({ title: '¡Titán derribado!', sub: 'El coloso cae y la torre es tuya.', piece: { type: 'king', side: 'dark' }, tone: 'brass', anim: 'down' }),
  'Demo: mutación': (m) => m.demo({ title: 'Caballo loco', sub: 'Tus caballos también se mueven como alfiles.', piece: { type: 'knight', side: 'light' }, ...reachPreview({ type: 'knight', extra: ['bishop'] }) }),
  'Demo: jefe': (m) => m.demo({ title: 'Así se mueve el Ariete', sub: BOSSES.ram.desc, piece: { type: 'boss-ram', side: 'dark' }, ...reachPreview({ type: 'king', moves: BOSSES.ram.moves, size: BOSSES.ram.size }, 8), n: 8, tone: 'danger' }),
};

const SCENES = {
  'Piezas': () => {
    const b = { rows: 4, cols: 6, holes: new Set(), protectRows: 0 };
    const types = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'guard', 'advisor', 'elephant', 'camel', 'cannon', 'pawn'];
    const pieces = types.map((t, i) => makePiece(t, i < 6 ? 'light' : 'dark', 1 + Math.floor(i / 6) * 2, i % 6));
    return { b, pieces };
  },
  'Jefes': () => {
    const b = { rows: 7, cols: 11, holes: new Set(), protectRows: 0 };
    const at = { titan: [0, 0], ram: [0, 3], hydra: [0, 6], devourer: [0, 9], golem: [3, 0], rider: [3, 4], wall: [3, 7] };
    const pieces = Object.entries(at).map(([id, [r, c]]) => {
      const d = BOSSES[id];
      return makePiece('boss-' + id, 'dark', r, c, { boss: id, h: d.size[0], w: d.size[1], hp: d.hp, maxHp: d.hp, name: d.name, royal: true });
    });
    return { b, pieces };
  },
  'Golpe al jefe': () => {
    const b = board(), pieces = [makePiece('rook', 'light', 5, 3), makePiece('king', 'light', 6, 6)];
    const boss = placeBoss(pieces, b, 'titan'); boss.row = 1;
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 2, col: 3 }) };
  },
  'Jefe aplasta': () => {
    const b = board(), pieces = [makePiece('pawn', 'light', 3, 3), makePiece('pawn', 'light', 3, 4), makePiece('king', 'light', 6, 6)];
    const boss = placeBoss(pieces, b, 'titan'); boss.row = 1;
    return { b, pieces, dark: true, play: (m) => m.move(boss, { row: 2, col: 3 }) };
  },
  'Salto de caballo': () => {
    const b = board(), pieces = [makePiece('knight', 'light', 5, 2), makePiece('pawn', 'dark', 3, 3), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 3, col: 3 }) };
  },
  'Coronación': () => {
    const b = board(), pieces = [makePiece('pawn', 'light', 1, 3, { canCrown: true }), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 0, col: 3 }) };
  },
  'Derrumbe': () => {
    const b = board(), pieces = [makePiece('king', 'light', 6, 3), makePiece('king', 'dark', 0, 3)];
    return { b, pieces, collapse: [[0, 0], [6, 6], [2, 6]] };
  },
  "Kure'i: Plaga zombi (efecto actual)": () => {
    const b = board(), pieces = [makePiece('knight', 'light', 5, 2), makePiece('pawn', 'dark', 3, 3), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, modifier: 'zombie', play: (m) => m.move(pieces[0], { row: 3, col: 3 }) };
  },
  'Victoria': () => {
    const b = board(), pieces = [makePiece('queen', 'light', 4, 3), makePiece('king', 'light', 6, 3), ...[1, 2, 4, 5].map((c) => makePiece('pawn', 'dark', 1, c)), makePiece('king', 'dark', 0, 3)];
    return { b, pieces, victory: true };
  },
};

// Efectos extra (Ajustes › Efectos extra): en el lab van siempre encendidos.
const FX = {
  ...Object.fromEntries(Object.values(WEATHER).map((w) => [`Clima: ${w.name}`, () => ({ b: board(), pieces: [makePiece('king', 'light', 6, 3), makePiece('queen', 'light', 5, 3), makePiece('king', 'dark', 0, 3), makePiece('knight', 'dark', 1, 1)], weather: w.id })])),
  'Escudo: golpe al jefe': SCENES['Golpe al jefe'],
  'Escudo: se rompe': () => {
    const b = board(), pieces = [makePiece('rook', 'light', 5, 3), makePiece('king', 'light', 6, 6)];
    const boss = placeBoss(pieces, b, 'ram'); boss.row = 1; boss.hp = 2;
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 2, col: 3 }) };
  },
  'Escudo: Fortificar': () => {
    const b = board(), pieces = [makePiece('rook', 'light', 5, 3), makePiece('bishop', 'dark', 2, 3, { hp: 2, maxHp: 2 }), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, play: (m) => m.move(pieces[0], { row: 2, col: 3 }) };
  },
  'Fuego: meteorito': () => {
    const b = board(), pieces = [makePiece('rook', 'light', 3, 2), makePiece('knight', 'dark', 2, 4), makePiece('pawn', 'light', 4, 4), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, after: (v) => v.meteor([[3, 3], [2, 3], [4, 3], [3, 4]]) };
  },
  'Aura: bruja y mutación': () => {
    const b = board(), pieces = [makePiece('queen', 'dark', 3, 3, { witch: true }), makePiece('knight', 'light', 5, 2), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, after: (v) => { v.powerUp([pieces[0]], '#c58bff'); v.powerUp([pieces[1]], '#ffcf6b'); } };
  },
  'Veneno: contagio': () => {
    const b = board(), pieces = [makePiece('knight', 'dark', 3, 3), makePiece('pawn', 'dark', 3, 4), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, after: (v) => v.infect([pieces[0], pieces[1]]) };
  },
  'Dash: Paso doble': () => {
    const b = board(), pieces = [makePiece('rook', 'light', 6, 1), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, play: (m) => ({ ...m.move(pieces[0], { row: 1, col: 1 }), dash: true }) };
  },
  'Explosión: mina': () => {
    const b = board(), pieces = [makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, after: (v) => { const t = v.tiles.get('3,3'), p = v.fx.pointOf(t); v.fx.explosion(p.x, p.y, v.sq / 50); v.shake(18, 520); } };
  },
};

// Prototipos visuales inspirados en patrones del APK. No importan su código: usan BoardView/Fx
// ya presentes en el proyecto y solo se ejecutan en lab.html.
const APK_FX = {
  'APK · Estela pixelada (movimiento)': () => {
    const b = board();
    const runner = makePiece('knight', 'light', 5, 2);
    const pieces = [runner, makePiece('pawn', 'dark', 3, 3), makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, apkPlay: async (v) => {
      const from = { row: runner.row, col: runner.col };
      const to = { row: 3, col: 3 };
      await moveAPKLabPiece(v, runner, to, 280);
      await playAPKPixelTrail(stage, v, from, to);
    } };
  },
  'APK · Impacto por bloques (onda)': () => {
    const b = board();
    const striker = makePiece('rook', 'light', 4, 3);
    const target = makePiece('pawn', 'dark', 2, 3);
    const pieces = [striker, target, makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, apkPlay: async (v) => {
      await moveAPKLabPiece(v, striker, { row: 2, col: 3 }, 220);
      const el = v.els.get(target);
      if (el) el.remove();
      v.els.delete(target);
      v.state.delete(target);
      await playAPKShockwave(stage, v, { row: 2, col: 3 });
    } };
  },
  "APK · Caza zombi (persecución y mordida)": () => {
    const b = board();
    const zombie = makePiece('pawn', 'dark', 5, 2, { zombie: true, infected: true });
    const target = makePiece('pawn', 'light', 3, 3);
    const pieces = [zombie, target, makePiece('king', 'light', 6, 6), makePiece('king', 'dark', 0, 0)];
    return { b, pieces, apkPlay: async (v) => {
      let guard = 0;
      while (Math.max(Math.abs(target.row - zombie.row), Math.abs(target.col - zombie.col)) > 1 && guard++ < 4) {
        const from = { row: zombie.row, col: zombie.col };
        const candidates = [[zombie.row - 1, zombie.col], [zombie.row, zombie.col - 1], [zombie.row, zombie.col + 1], [zombie.row + 1, zombie.col]]
          .filter(([r, c]) => r >= 0 && c >= 0 && r < b.rows && c < b.cols && !pieces.some(p => p !== zombie && p.row === r && p.col === c));
        candidates.sort((a, c) => Math.max(Math.abs(target.row - a[0]), Math.abs(target.col - a[1])) - Math.max(Math.abs(target.row - c[0]), Math.abs(target.col - c[1])));
        if (!candidates.length) break;
        const to = { row: candidates[0][0], col: candidates[0][1] };
        await moveAPKLabPiece(v, zombie, to, 300);
        await playAPKPixelTrail(stage, v, from, to);
      }
      await playAPKZombieAttack(stage, v, { row: zombie.row, col: zombie.col }, { row: target.row, col: target.col });
      target.color = zombie.color;
      target.zombie = true;
      target.infected = true;
      v.remake(target);
      await playAPKTransform(stage, v, { row: target.row, col: target.col });
    } };
  },
  'APK · Lluvia de meteoritos (aviso e impacto)': () => {
    const b = board();
    const cells = [{row:2,col:3},{row:3,col:3},{row:3,col:4},{row:4,col:3}];
    const pieces = [
      makePiece('knight','dark',2,3), makePiece('pawn','light',3,3),
      makePiece('rook','dark',3,4), makePiece('bishop','light',4,3),
      makePiece('king','light',6,6), makePiece('king','dark',0,0)
    ];
    return { b, pieces, apkPlay: async v => playAPKMeteorImpact(stage,v,cells), skipDeal:true };
  },
  'APK · Explosión de bomba (área 3×3)': () => {
    const b = board(), center = {row:3,col:3};
    const cells = [];
    for(let r=2;r<=4;r++) for(let c=2;c<=4;c++) cells.push({row:r,col:c});
    const pieces = [
      makePiece('rook','light',3,2),makePiece('pawn','dark',3,3),makePiece('knight','light',2,3),
      makePiece('bishop','dark',4,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)
    ];
    return { b, pieces, apkPlay: async v => playAPKBombBlast(stage,v,center,cells), skipDeal:true };
  },
  'APK · Aviso de campo de bombas': () => {
    const b = board(), center = {row:3,col:3}, cells = [];
    for(let r=2;r<=4;r++) for(let c=2;c<=4;c++) cells.push({row:r,col:c});
    const pieces = [makePiece('knight','light',5,2),makePiece('pawn','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKBombField(stage,v,cells), skipDeal:true };
  },
  'APK · Teletransporte (vórtice cian/violeta)': () => {
    const b = board(), traveler = makePiece('knight','light',5,2);
    const from = {row:traveler.row,col:traveler.col}, to = {row:2,col:4};
    const pieces = [traveler,makePiece('pawn','dark',1,4),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => { await moveAPKLabPiece(v,traveler,to,180); await playAPKTeleport(stage,v,from,to); }, skipDeal:true };
  },
  'APK · Golpe y daño de pieza': () => {
    const b = board(), target = makePiece('rook','dark',3,3);
    const pieces = [makePiece('queen','light',3,2),target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => { await playAPKDamage(stage,v,{row:target.row,col:target.col}); }, skipDeal:true };
  },
  'APK · Caída y desaparición de pieza': () => {
    const b = board(), target = makePiece('knight','dark',3,3);
    const pieces = [makePiece('rook','light',3,2),target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => {
      const cell={row:target.row,col:target.col}, st=v.state.get(target), el=v.els.get(target);
      await Promise.all([
        playAPKFall(stage,v,cell),
        st ? animate(st,{z:[st.z,v.sq*0.72],duration:560,ease:'inQuad',onUpdate:()=>v.apply(target)}) : Promise.resolve(),
        el ? animate(el,{opacity:[1,0],duration:560,ease:'inQuad'}) : Promise.resolve()
      ]);
      el?.remove(); v.els.delete(target); v.state.delete(target);
    }, skipDeal:true };
  },
  'APK · Ráfaga de partículas': () => {
    const b = board(), target = makePiece('queen','light',3,3);
    const pieces = [target,makePiece('pawn','dark',2,4),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKParticleBurst(stage,v,{row:target.row,col:target.col},['#29e3ff','#c58bff','#fff2bd'],30), skipDeal:true };
  },
  'APK · Escudo energético': () => {
    const b = board(), target = makePiece('king','light',3,3,{royal:true});
    const pieces = [target,makePiece('rook','dark',3,5),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKShield(stage,v,{row:target.row,col:target.col},false), skipDeal:true };
  },
  'APK · Escudo roto': () => {
    const b = board(), target = makePiece('king','light',3,3,{royal:true});
    const pieces = [target,makePiece('rook','dark',3,5),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKShield(stage,v,{row:target.row,col:target.col},true), skipDeal:true };
  },
  'APK · Rayo mágico (haz)': () => {
    const b = board(), caster = makePiece('bishop','light',5,1), target=makePiece('pawn','dark',2,4);
    const pieces = [caster,target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKBeam(stage,v,{row:caster.row,col:caster.col},{row:target.row,col:target.col},'#b06bff'), skipDeal:true };
  },
  'APK · Transformación zombi (INFECTED!)': () => {
    const b = board(), target=makePiece('pawn','light',3,3);
    const pieces = [makePiece('pawn','dark',3,2,{zombie:true,infected:true}),target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => {
      target.color='dark'; target.zombie=true; target.infected=true; v.remake(target);
      await playAPKTransform(stage,v,{row:target.row,col:target.col});
    }, skipDeal:true };
  },
  'APK · Aparición de pieza (ráfaga pixelada)': () => {
    const b = board(), target=makePiece('knight','light',3,3,{zombie:true});
    const pieces = [target,makePiece('pawn','dark',2,4),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKSpawnBurst(stage,v,[target]), skipDeal:true };
  },
  'APK · Pantalla de victoria (confeti)': () => {
    const b = board(), pieces = [makePiece('queen','light',3,3),makePiece('king','light',6,3),makePiece('king','dark',0,3)];
    return { b, pieces, apkPlay: async v => playAPKVictory(stage,v,['#ffc83d','#ffffff','#3dff8e']), skipDeal:true };
  },
  'APK · Sacudida de impacto': () => {
    const b = board(), pieces = [makePiece('rook','light',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => playAPKScreenShake(stage,320,9), skipDeal:true };
  },

  'APK · Entrada de tablero (losas y piezas pixeladas)': () => {
    const b = board();
    const pieces = [
      makePiece('rook','light',6,0),makePiece('knight','light',6,2),makePiece('queen','light',6,3),
      makePiece('king','light',6,6),makePiece('bishop','dark',0,1),makePiece('king','dark',0,5)
    ];
    return { b, pieces, apkPlay: async v => playAPKDeal(v,pieces,stage), skipDeal:true };
  },
  'APK · Deslizamiento de gravedad (sin salto)': () => {
    const b = board();
    const movers = [
      {piece:makePiece('rook','light',1,1),to:{row:4,col:1}},
      {piece:makePiece('knight','dark',1,3),to:{row:3,col:3}},
      {piece:makePiece('bishop','light',2,5),to:{row:5,col:5}}
    ];
    const pieces = [...movers.map(x=>x.piece),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return { b, pieces, apkPlay: async v => {
      for (const item of movers) await slideAPKLabPiece(v,item.piece,item.to,420);
    }, skipDeal:true };
  },


  'APK · Vuelo de corona (Rey Patata Caliente)': () => {
    const b=board(),old=makePiece('king','light',5,2,{royal:true}),next=makePiece('knight','light',2,4);
    return { b, pieces:[old,next,makePiece('king','dark',0,3)], apkPlay:async(v)=>playAPKHotPotatoCrown(stage,v,{row:old.row,col:old.col},{row:next.row,col:next.col}) };
  },
  'APK · Ruleta del caos (anuncio y resultado)': () => {
    const b=board(),pieces=[makePiece('king','light',6,3),makePiece('rook','dark',2,3),makePiece('pawn','dark',1,5)];
    return { b, pieces, apkPlay:async(v)=>playAPKChaosRoulette(stage,v,'LLUVIA DE BOMBAS','EN 1 TURNO · TRES OBJETIVOS MARCADOS','#ff6a00') };
  },

  'APK · Sello de evento (mxStamp)': () => {
    const b=board(),cell={row:3,col:3};
    const pieces=[makePiece('king','light',6,3),makePiece('king','dark',0,3)];
    return {b,pieces,apkPlay:async v=>playAPKEventStamp(stage,v,cell,'#9b4dff'),skipDeal:true};
  },
  'APK · Zona de ataque telegrafiada (mxZone)': () => {
    const b=board(),cells=[];
    for(let c=0;c<7;c++)cells.push([3,c]);
    for(let r=0;r<7;r++)if(r!==3)cells.push([r,3]);
    const pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0),makePiece('rook','dark',3,0)];
    return {b,pieces,apkPlay:async v=>playAPKZoneWarning(stage,v,cells.map(([row,col])=>({row,col})),'#ff2d55'),skipDeal:true};
  },
  'APK · Marcador de punto débil (MxDraw.weak)': () => {
    const b=board(),boss=makePiece('boss-titan','dark',2,2,{boss:'titan',h:2,w:2,hp:3,maxHp:3});
    const pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0),boss];
    return {b,pieces,apkPlay:async v=>playAPKWeakPointMarker(stage,v,{row:2,col:2}),skipDeal:true};
  },
  'APK · Impacto en punto débil (mxWeak)': () => {
    const b=board(),boss=makePiece('boss-titan','dark',2,2,{boss:'titan',h:2,w:2,hp:3,maxHp:3});
    const pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0),boss];
    return {b,pieces,apkPlay:async v=>playAPKWeakPointHit(stage,v,{row:2,col:2}),skipDeal:true};
  },
  'APK · Entrada cinematográfica de jefe (mxBossCut)': () => {
    const b=board(),boss=makePiece('boss-titan','dark',2,2,{boss:'titan',h:2,w:2,hp:3,maxHp:3});
    const pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0),boss];
    return {b,pieces,apkPlay:async v=>playAPKBossCut(stage,v,boss,{title:'TITÁN',subtitle:'HA ENTRADO AL TABLERO',quote:'El suelo recuerda cada paso.',color:'#ff2d55',phase:'enter'}),skipDeal:true};
  },
  'APK · Ataque cinematográfico de jefe (mxBossCut)': () => {
    const b=board(),boss=makePiece('boss-titan','dark',2,2,{boss:'titan',h:2,w:2,hp:3,maxHp:3});
    const pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0),boss];
    return {b,pieces,apkPlay:async v=>playAPKBossCut(stage,v,boss,{title:'TITÁN',subtitle:'¡ATAQUE EN CURSO!',quote:'No habrá segunda oportunidad.',color:'#ff6a00',phase:'attack'}),skipDeal:true};
  },
  'APK · Derrota cinematográfica de jefe (mxBossCut)': () => {
    const b=board(),boss=makePiece('boss-titan','dark',2,2,{boss:'titan',h:2,w:2,hp:1,maxHp:3});
    const pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0),boss];
    return {b,pieces,apkPlay:async v=>playAPKBossCut(stage,v,boss,{title:'TITÁN DERROTADO',subtitle:'EL COLOSO CAE',quote:'...',color:'#ffc83d',phase:'defeat'}),skipDeal:true};
  },
  'APK · Proyectil balístico (mxBullet)': () => {
    const b=board(),from={row:5,col:1},to={row:1,col:5};
    const pieces=[makePiece('rook','light',5,1),makePiece('pawn','dark',1,5),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKBullet(stage,v,from,to,'#ffc83d'),skipDeal:true};
  },
  'APK · Subtítulo del narrador (mxSay)': () => {
    const b=board(),pieces=[makePiece('queen','light',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKCaption(stage,v,'UNA JUGADA AUDAZ. O UN ERROR DE DEDO.','#ffc83d'),skipDeal:true};
  },
  'APK · Casilla vacía (void)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'void'),skipDeal:true};
  },
  'APK · Casilla de lava (lava)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'lava'),skipDeal:true};
  },
  'APK · Casilla maldita (curse)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'curse'),skipDeal:true};
  },
  'APK · Casilla infectada (infect)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'infect'),skipDeal:true};
  },
  'APK · Muro temporal (wall)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'wall'),skipDeal:true};
  },
  'APK · Plataforma de anclaje (plat)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'platform'),skipDeal:true};
  },
  'APK · Portales enlazados (portal)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:2,col:2},{row:4,col:4}],'portal'),skipDeal:true};
  },
  'APK · Trampa de pinchos (trap)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTilePattern(stage,v,[{row:3,col:3}],'trap'),skipDeal:true};
  },
  'APK · Luces de discoteca (disco)': () => {
    const b=board(),pieces=[makePiece('queen','light',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDisco(stage,v),skipDeal:true};
  },
  'APK · Cuenta atrás de ajedrez relámpago (speed)': () => {
    const b=board(),pieces=[makePiece('rook','light',5,1),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKSpeedTimer(stage,v),skipDeal:true};
  },

  'APK · Banner de evento (banner)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKBanner(stage,v,'¡LA RULETA HA HABLADO!','EVENTO GLOBAL ACTIVADO','#9b4dff'),skipDeal:true};
  },
  'APK · Rayo vertical de jefe (beam)': () => {
    const b=board(),pieces=[makePiece('boss-titan','dark',1,2,{boss:'titan',h:2,w:2,hp:3,maxHp:3}),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKColumnBeam(stage,v,3,0,6,'#29e3ff'),skipDeal:true};
  },
  'APK · Invocación de pieza (spawn: summon)': () => {
    const b=board(),target=makePiece('pawn','light',3,3),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKSpawnVariant(stage,v,{row:target.row,col:target.col},'summon'),skipDeal:true};
  },
  'APK · Transformación zombi (transform: zombify)': () => {
    const b=board(),target=makePiece('pawn','dark',3,3),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTransformVariant(stage,v,{row:target.row,col:target.col},'zombify'),skipDeal:true};
  },

  'APK · Explosión de pieza (die: explode)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('pawn','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'explode'),skipDeal:true};
  },
  'APK · Invocación zombi (spawn: zombie)': () => {
    const b=board(),target=makePiece('pawn','dark',3,3,{zombie:true}),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKSpawnVariant(stage,v,{row:target.row,col:target.col},'zombie'),skipDeal:true};
  },
  'APK · Coronación (transform: promote)': () => {
    const b=board(),target=makePiece('pawn','light',3,3),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTransformVariant(stage,v,{row:target.row,col:target.col},'promote'),skipDeal:true};
  },
  'APK · Destello de casilla (tile)': () => {
    const b=board(),pieces=[makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTileSpark(stage,v,{row:3,col:3}),skipDeal:true};
  },
  'APK · Captura con corte (die: capture)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('rook','light',3,2),makePiece('pawn','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'capture'),skipDeal:true};
  },
  'APK · Muerte por fuego (die: burn)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('pawn','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'burn'),skipDeal:true};
  },
  'APK · Desintegración infecciosa (die: infect)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('pawn','dark',3,3,{zombie:true,infected:true}),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'infect'),skipDeal:true};
  },
  'APK · Aplastamiento (die: crush)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('pawn','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'crush'),skipDeal:true};
  },
  'APK · Desvanecimiento (die: fade)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('knight','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'fade'),skipDeal:true};
  },
  'APK · Destrucción de jefe (die: boss)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('boss-titan','dark',2,2,{boss:'titan',h:2,w:2,hp:1,maxHp:1}),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKDeathStyle(stage,v,cell,'boss'),skipDeal:true};
  },
  'APK · Golpe crítico con daño (dmg)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('rook','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKCriticalDamage(stage,v,cell,3),skipDeal:true};
  },
  'APK · Texto flotante (text)': () => {
    const b=board(),cell={row:3,col:3},pieces=[makePiece('queen','light',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKFloatingText(stage,v,cell,'¡JAQUE!','#ff2d55'),skipDeal:true};
  },
  'APK · Revivir pieza (spawn: revive)': () => {
    const b=board(),target=makePiece('knight','light',3,3),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKSpawnVariant(stage,v,{row:target.row,col:target.col},'revive'),skipDeal:true};
  },
  'APK · Transformación dorada (transform: evolve)': () => {
    const b=board(),target=makePiece('pawn','light',3,3),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTransformVariant(stage,v,{row:target.row,col:target.col},'evolve'),skipDeal:true};
  },
  'APK · Devolución de pieza (transform: devolve)': () => {
    const b=board(),target=makePiece('queen','dark',3,3),pieces=[target,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>playAPKTransformVariant(stage,v,{row:target.row,col:target.col},'devolve'),skipDeal:true};
  },


  'APK · Salto de pieza (move: jump)': () => {
    const b=board(),runner=makePiece('knight','light',5,1),to={row:3,col:2},pieces=[runner,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>moveAPKLabPieceStyle(v,runner,to,520,'jump'),skipDeal:true};
  },
  'APK · Lanzamiento giratorio (move: hurl)': () => {
    const b=board(),runner=makePiece('knight','light',5,1),to={row:2,col:4},pieces=[runner,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>moveAPKLabPieceStyle(v,runner,to,520,'hurl'),skipDeal:true};
  },
  'APK · Movimiento fantasmal (move: phase)': () => {
    const b=board(),runner=makePiece('bishop','light',5,1),to={row:2,col:4},pieces=[runner,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>moveAPKLabPieceStyle(v,runner,to,520,'phase'),skipDeal:true};
  },
  'APK · Pisotón pesado (move: stomp)': () => {
    const b=board(),runner=makePiece('boss-titan','dark',1,2,{boss:'titan',h:2,w:2,hp:3,maxHp:3}),to={row:3,col:2},pieces=[runner,makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>moveAPKLabPieceStyle(v,runner,to,600,'stomp'),skipDeal:true};
  },
  'APK · Embestida de ataque (attack)': () => {
    const b=board(),attacker=makePiece('rook','light',5,3),cell={row:3,col:3},pieces=[attacker,makePiece('pawn','dark',3,3),makePiece('king','light',6,6),makePiece('king','dark',0,0)];
    return {b,pieces,apkPlay:async v=>{await lungeAPKLabPiece(v,attacker,cell,260);await playAPKDamage(stage,v,cell);},skipDeal:true};
  },

};

async function moveAPKLabPiece(v, piece, to, duration) {
  const st = v.state.get(piece);
  if (!st) return;
  await animate(st, {
    r: to.row, c: to.col, z: [st.z, v.sq * 0.52, 0],
    duration, ease: 'outCubic', onUpdate: () => v.apply(piece)
  });
  piece.row = to.row; piece.col = to.col;
  st.r = to.row; st.c = to.col; st.z = 0;
  v.apply(piece);
}


async function moveAPKLabPieceStyle(v, piece, to, duration, style) {
  const st = v.state.get(piece), el = v.els.get(piece);
  if (!st || !el) return;
  const fig = el.querySelector('.pc-fig');
  const start = { row: piece.row, col: piece.col };
  if (style === 'phase') el.style.opacity = '.38';
  const height = style === 'stomp' ? v.sq * .85 : style === 'jump' || style === 'hurl' ? v.sq * .68 : v.sq * .3;
  const jobs = [animate(st, {
    r: to.row, c: to.col, z: [st.z, height, 0],
    duration, ease: style === 'stomp' ? 'inOutQuad' : 'outCubic',
    onUpdate: () => v.apply(piece)
  })];
  if (style === 'hurl' && fig) jobs.push(animate(fig, { rotate: [0, 720], duration, ease: 'linear' }));
  await Promise.all(jobs);
  piece.row = to.row; piece.col = to.col; st.r = to.row; st.c = to.col; st.z = 0; v.apply(piece);
  el.style.opacity = '1';
  if (style === 'stomp') await playAPKScreenShake(stage, 240, 10);
  if (style === 'phase') await playAPKPixelTrail(stage, v, start, to);
}

async function lungeAPKLabPiece(v, piece, target, duration=240) {
  const st=v.state.get(piece);
  if(!st)return;
  const from={r:piece.row,c:piece.col,z:st.z};
  await animate(st,{r:[from.r,target.row,from.r],c:[from.c,target.col,from.c],z:[from.z,v.sq*.42,0],duration,ease:'inOutQuad',onUpdate:()=>v.apply(piece)});
  st.r=from.r;st.c=from.c;st.z=0;v.apply(piece);
}


async function slideAPKLabPiece(v, piece, to, duration=420) {
  const st=v.state.get(piece);
  if(!st)return;
  await animate(st,{r:to.row,c:to.col,z:0,duration,ease:'inOutQuad',onUpdate:()=>v.apply(piece)});
  piece.row=to.row;piece.col=to.col;st.r=to.row;st.c=to.col;st.z=0;v.apply(piece);
}

async function run(name) {
  clearAPKEffects(stage);
  view?.destroy();
  const s = (SCENES[name] || FX[name] || APK_FX[name])();
  stage.classList.toggle('apk-ref-mode', Boolean(s.apkPlay));
  view = new BoardView(document.getElementById('board'), { camera, vfx: !s.apkPlay, shake: !s.apkPlay });
  view.setBoard(s.b);
  view.setPieces(s.pieces);
  view.setWeather(s.weather || null);
  if (s.apkPlay) { if (!s.skipDeal) await playAPKDeal(view, s.pieces, stage); }
  else await view.intro(s.pieces);
  if (s.apkPlay) {
    await s.apkPlay(view, s);
  } else {
    const players = [{ color: 'light', kind: 'human' }, { color: 'dark', kind: 'bot' }];
    const m = new Match({ board: s.b, pieces: s.pieces, players, modifier: s.modifier || 'none' });
    if (s.dark) m.current = 1;
    await new Promise((r) => setTimeout(r, 300));
    if (s.play) { const res = s.play(m); if (res) await view.playMove(res); }
    if (s.collapse) await view.collapse(s.collapse);
    if (s.after) await s.after(view);
    if (s.victory) await view.victory('light');
  }
}

const stage = document.getElementById('stage');
const moments = new Moments(stage);
async function play(name) {
  if (MOMENTS[name]) {
    stage.classList.remove('apk-ref-mode');
    if (!view) await run('Piezas');
    return MOMENTS[name](moments);
  }
  return run(name);
}

let current = null;
const play2 = (name) => {
  current = name;
  // El selector del prototipo deja visible cuál escena está activa.
  for (const button of document.querySelectorAll('#apk-scenes button')) {
    button.setAttribute('aria-pressed', String(button.dataset.scene === name));
  }
  return play(name);
};
for (const [id, names] of [['scenes', [...Object.keys(SCENES), ...Object.keys(MOMENTS)]], ['fx', Object.keys(FX)]]) {
  for (const name of names) {
    const b = document.createElement('button');
    b.className = 'btn sm'; b.textContent = name; b.onclick = () => play2(name);
    document.getElementById(id).appendChild(b);
  }
}
for (const name of Object.keys(APK_FX)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn sm';
  b.textContent = name.replace(/^APK · /, '');
  b.dataset.scene = name;
  b.setAttribute('aria-pressed', 'false');
  b.onclick = () => play2(name);
  document.getElementById('apk-scenes').appendChild(b);
}
// Mesa normal o píxel: los efectos se ven distinto en cada una.
const arts = document.getElementById('arts');
for (const [id, label] of [['walnut', 'Normal'], ['pixelada', 'Píxel']]) {
  const b = document.createElement('button');
  b.textContent = label; b.className = id === theme ? 'on' : '';
  b.onclick = () => { theme = id; applyTheme(id); [...arts.children].forEach((x) => x.classList.toggle('on', x === b)); if (current && !MOMENTS[current]) run(current); };
  arts.appendChild(b);
}
const cams = document.getElementById('cams');
for (const [id, label] of [['flat', 'Cenital'], ['tilt', 'Mesa'], ['epic', 'Épica']]) {
  const b = document.createElement('button');
  b.textContent = label; b.className = id === camera ? 'on' : '';
  b.onclick = () => { camera = id; [...cams.children].forEach((x) => x.classList.toggle('on', x === b)); view?.setCamera(id); };
  cams.appendChild(b);
}
const q = new URLSearchParams(location.search);
if (q.get('art') === 'pixel') arts.lastChild.click();
play2(q.get('scene') || 'Golpe al jefe');
