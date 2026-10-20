// Hockey de mesa, prueba de la física y del bot: `node tools/hockey-selfcheck.mjs [partidos]`.
// Choques (torre, banda y poste), goles y saque, la lectura de rebotes, que el bot no se atasque
// con el disco en su mitad y partidos enteros bot contra bot que terminan. Lanza error si algo falla.
import { W, H, PUCK_R, MALLET_R, GOAL, GOALS, PUCK_MAX, HOLD_T, DIFFS, newHockey, step, aim, predictX } from '../src/game/hockey.js';

const rngOf = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
const speed = (p) => Math.hypot(p.vx, p.vy);
const run = (s, secs, bots = [], until = () => false) => {
  for (let t = 0; t < secs; t += 1 / 60) { step(s, 1 / 60, bots); if (until(s)) return t; }
  return null;
};
// Mesa de prueba: sin saque pendiente y las dos torres aparcadas en sus esquinas de fondo.
const table = (rng = rngOf(1)) => {
  const s = newHockey('normal', rng);
  s.pause = 0;
  Object.assign(s.me, { x: MALLET_R, y: H - MALLET_R, tx: MALLET_R, ty: H - MALLET_R });
  Object.assign(s.bot, { x: W - MALLET_R, y: MALLET_R, tx: W - MALLET_R, ty: MALLET_R });
  return s;
};

// Choques: la torre que embiste le pasa su velocidad al disco quieto, con tope.
{
  const s = table();
  Object.assign(s.puck, { x: W / 2, y: H * 0.7, vx: 0, vy: 0 });
  Object.assign(s.me, { x: W / 2, y: H * 0.7 + PUCK_R + MALLET_R + 6 });
  aim(s, W / 2, H / 2);
  let hit = null;
  run(s, 0.3, [], () => (hit = s.events.find((e) => e.kind === 'hit')));
  ok(hit, 'la torre no tocó el disco');
  ok(s.puck.vy < -150 && Math.abs(s.puck.vx) < 5, `el golpe recto no salió recto hacia arriba (${s.puck.vx.toFixed(1)}, ${s.puck.vy.toFixed(1)})`);
  ok(speed(s.puck) <= PUCK_MAX + 1e-6, 'el disco pasó su tope de velocidad');
  ok(Math.hypot(s.puck.x - s.me.x, s.puck.y - s.me.y) >= PUCK_R + MALLET_R - 1e-6, 'el disco quedó dentro de la torre');
}
// Banda: rebota con pérdida y sin salirse.
{
  const s = table();
  Object.assign(s.puck, { x: PUCK_R + 2, y: H * 0.6, vx: -200, vy: 0 });
  run(s, 0.1);
  ok(s.puck.vx > 150 && s.puck.vx < 200, `la banda no devolvió el disco con pérdida (${s.puck.vx.toFixed(1)})`);
  ok(s.puck.x >= PUCK_R, 'el disco atravesó la banda');
}
// Fondo fuera de la boca: rebota, no es gol.
{
  const s = table();
  Object.assign(s.puck, { x: GOAL[0] - PUCK_R - 3, y: 30, vx: 0, vy: -220 });
  run(s, 0.4);
  ok(s.score.me === 0 && s.puck.vy > 0, 'el fondo junto a la boca contó como gol o no rebotó');
}
// Poste: el disco que entra rozando la esquina de la boca se desvía hacia dentro.
{
  const s = table();
  Object.assign(s.puck, { x: GOAL[0] + PUCK_R * 0.4, y: 20, vx: 0, vy: -200 });
  run(s, 0.3, [], (s) => s.events.some((e) => e.kind === 'wall'));
  ok(s.puck.vx > 0, 'el poste no desvió el disco');
}
// Gol: el disco entra por la boca, suma y vuelve quieto al centro de la mitad de quien encajó.
{
  const s = table();
  Object.assign(s.puck, { x: W / 2, y: 40, vx: 0, vy: -220 });
  let goal = null;
  run(s, 0.5, [], () => (goal = s.events.find((e) => e.kind === 'goal')));
  ok(goal?.by === 'me' && s.score.me === 1, 'el disco entró en la boca de arriba y no fue gol tuyo');
  ok(s.puck.y < H / 2 && speed(s.puck) === 0 && s.pause > 0, 'tras tu gol el disco no saca desde la mitad del bot');
  Object.assign(s.puck, { x: W / 2, y: H - 40, vx: 0, vy: 220 });
  s.pause = 0;
  run(s, 0.5, [], () => s.score.bot);
  ok(s.score.bot === 1 && s.puck.y > H / 2, 'el gol del bot no contó o no sacaste tú');
}
// Tu torre no cruza la raya ni entra en la portería.
{
  const s = table();
  aim(s, -50, -50);
  run(s, 1);
  ok(s.me.y >= H / 2 + MALLET_R - 1e-6 && s.me.x >= MALLET_R - 1e-6, 'tu torre salió de su mitad');
}
// Disco pinzado contra la banda: ni se escapa de la mesa ni se dispara.
{
  const s = table();
  Object.assign(s.puck, { x: PUCK_R, y: H * 0.75, vx: 0, vy: 0 });
  Object.assign(s.me, { x: PUCK_R * 2 + MALLET_R + 4, y: H * 0.75 });
  aim(s, 0, H * 0.75);
  run(s, 1);
  ok([s.puck.x, s.puck.y, s.puck.vx, s.puck.vy].every(Number.isFinite), 'el disco pinzado dio NaN');
  ok(s.puck.x >= PUCK_R - 1e-6 && speed(s.puck) <= PUCK_MAX + 1e-6, 'el disco pinzado se salió o pasó su tope');
}
// Lectura de rebotes: predictX coincide con la trayectoria simulada sin fricción ni torres.
{
  const rng = rngOf(7);
  for (let i = 0; i < 200; i++) {
    const p = { x: PUCK_R + rng() * (W - 2 * PUCK_R), y: H * 0.8, vx: (rng() * 2 - 1) * 300, vy: -(60 + rng() * 200) };
    const want = predictX(p, 20);
    const q = { ...p };
    while (q.y > 20) {
      const dt = Math.min(1 / 2000, (20 - q.y) / q.vy);
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.x < PUCK_R) { q.x = 2 * PUCK_R - q.x; q.vx = -q.vx; }
      if (q.x > W - PUCK_R) { q.x = 2 * (W - PUCK_R) - q.x; q.vx = -q.vx; }
      if (dt < 1e-9) break;
    }
    ok(Math.abs(q.x - want) < 0.5, `predictX falló: ${want.toFixed(2)} contra ${q.x.toFixed(2)}`);
  }
}
console.log('física OK');

// El bot no se atasca: con el disco quieto en cualquier punto de su mitad (rincones, fondo, raya),
// lo saca de ella antes de que salte la regla de los siete segundos.
for (const key of Object.keys(DIFFS)) {
  const stuck = [];
  for (let y = PUCK_R; y <= H / 2; y += 8) for (let x = PUCK_R; x <= W - PUCK_R; x += 8) {
    const s = table(rngOf(x * 31 + y));
    s.diff = DIFFS[key];
    Object.assign(s.puck, { x, y, vx: 0, vy: 0 });
    Object.assign(s.bot, { x: W / 2, y: 20, tx: W / 2, ty: 20 });
    const t = run(s, HOLD_T, ['bot'], (s) => s.puck.y > H / 2 + PUCK_R || s.score.bot || s.score.me);
    if (t == null) stuck.push(`(${x.toFixed(0)}, ${y.toFixed(0)})`);
  }
  ok(!stuck.length, `bot ${key} atascado con el disco en ${stuck.join(' ')}`);
}
// En el saque el disco está clavado: el bot no lo atraviesa ni, al soltarlo, se lo mete en su portería.
{
  let own = 0;
  for (let g = 0; g < 5; g++) {
    const s = newHockey('dificil', rngOf(50 + g));
    aim(s, 10, H - 10); // tu torre, quieta en un rincón
    run(s, 900, ['bot'], (s) => {
      if (s.pause > 0) ok(Math.hypot(s.bot.x - s.puck.x, s.bot.y - s.puck.y) >= PUCK_R + MALLET_R - 1e-6, 'la torre del bot atravesó el disco en el saque');
      return s.over;
    });
    ok(s.over === 'lose', 'el bot no le ganó a una torre quieta');
    own += s.score.me;
  }
  ok(own <= 1, `el bot difícil se metió ${own} goles en contra en 5 partidos`);
}
console.log('bot sin atascos ni autogoles OK');

// Partidos enteros bot contra bot (tu torre la lleva otro bot): terminan, con marcador válido.
const games = +(process.argv[2] || 6);
const pairs = [['normal', 'normal'], ['facil', 'facil'], ['dificil', 'facil'], ['facil', 'dificil'], ['dificil', 'normal']];
for (const [me, bot] of pairs) {
  let wins = 0, secs = 0;
  for (let g = 0; g < games; g++) {
    const s = newHockey(bot, rngOf(1000 + g));
    s.foeDiff = DIFFS[me];
    const t = run(s, 900, ['me', 'bot'], (s) => s.over);
    ok(t != null, `${me} contra ${bot}: el partido ${g} no terminó en 15 min (${s.score.me}-${s.score.bot})`);
    ok(Math.max(s.score.me, s.score.bot) === GOALS && Math.min(s.score.me, s.score.bot) < GOALS, `marcador final imposible: ${s.score.me}-${s.score.bot} (${s.over})`);
    ok((s.over === 'win') === (s.score.me === GOALS), 'el ganador no cuadra con el marcador');
    wins += s.over === 'win';
    secs += t;
  }
  console.log(`  abajo ${me} contra ${bot}: gana abajo ${wins}/${games}, ${(secs / games).toFixed(0)} s de media`);
}
console.log('partidos OK');
