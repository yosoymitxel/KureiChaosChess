// Regalo diario: uno por día local, el cofre del 7.º con carta, saltarse días no reinicia, reloj atrasado
// o adelantado no da de más, y la semana vale menos que una hora de partida. `node tools/daily-selfcheck.mjs`.
const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
const { mulberry32, randomSeed, secureRandom } = await import('../src/core/rng.js');
const { DAILY } = await import('../src/data/daily.js');
const { dailyReady, loadDaily, rollDaily, claimDaily, dayKey } = await import('../src/game/daily.js');
const { loadShop } = await import('../src/game/shop.js');
const { pickSeed, ZEN_KINDS, blankZen, zenExpand } = await import('../src/game/zen.js');
const { CARDS } = await import('../src/game/cards.js');

const fails = [], ok = (c, m) => c || fails.push(m), H = 3_600_000;
const t0 = new Date(2026, 0, 5, 10).getTime();
// Los datos que pueden acabar en el guardado en la nube no deben depender de Math.random.
const nativeRandom = Math.random;
try {
  Math.random = () => { throw new Error('Math.random fue invocado'); };
  const sample = secureRandom();
  ok(Number.isFinite(sample) && sample >= 0 && sample < 1, 'secureRandom fuera del intervalo [0, 1)');
  const seed = randomSeed();
  ok(Number.isInteger(seed) && seed >= 0 && seed < 1e6, 'randomSeed inválida');
  ok(ZEN_KINDS.includes(pickSeed()), 'pickSeed no produjo una semilla válida');
  ok(zenExpand(blankZen()).size === 5, 'zenExpand no pudo usar Web Crypto');
  const match = { player: { color: 'light' }, pieces: [] };
  const summoned = CARDS.invoke.apply(match, 0, 0);
  ok(match.pieces[0] === summoned, 'la carta Invocación no pudo usar Web Crypto');
  ok(claimDaily(t0), 'el primero no se da');
  ok(!claimDaily(t0 + H), 'dos el mismo día');
  ok(!claimDaily(new Date(2026, 0, 6, 0, 30).getTime()), 'pasada la medianoche pero sin las horas mínimas');
} catch (error) {
  fails.push(`aleatoriedad criptográfica: ${error.message}`);
} finally {
  Math.random = nativeRandom;
}
ok(claimDaily(t0 + 24 * H), 'al día siguiente no toca');
ok(!dailyReady(loadDaily(), t0 - 48 * H), 'reloj atrasado da regalo');
// Adelantar el reloj da uno y luego, de vuelta a la hora real, nada hasta pasarla.
ok(claimDaily(t0 + 30 * 24 * H), 'reloj adelantado no da el suyo');
ok(!claimDaily(t0 + 3 * 24 * H), 'al volver el reloj da otro');
// Saltarse días: el ciclo sigue donde iba.
ok(loadDaily().claims === 3, `regalos contados: ${loadDaily().claims}`);
ok(dayKey(new Date(2026, 0, 5, 23, 59).getTime()) !== dayKey(new Date(2026, 0, 6, 0, 1).getTime()), 'el día no cambia a medianoche');
// Cofre: siempre carta; semana media < 360 monedas contando semillas a su precio.
let total = 0;
for (let k = 1; k <= 200; k++) {
  const rng = mulberry32(k);
  for (let s = 0; s < DAILY.cycle; s++) {
    const r = rollDaily(s, rng);
    if (s === DAILY.cycle - 1) ok(r.cards.length === DAILY.chest.card, 'cofre sin carta');
    ok(r.coins || r.cards.length || Object.keys(r.zen).length || Object.keys(r.water).length, `regalo vacío (${s})`);
    total += r.coins + r.cards.length * 60 + Object.values(r.zen).reduce((a, n) => a + n * 14, 0) + Object.values(r.water).reduce((a, n) => a + n * 14, 0);
  }
}
const week = Math.round(total / 200);
ok(week < 360, `la semana vale ${week} monedas`);
ok(loadShop().coins > 0 || loadShop().pending.length, 'no se repartió nada');
if (fails.length) { console.log('Regalo diario:\n' + [...new Set(fails)].join('\n')); process.exit(1); }
console.log(`regalo diario ok: semana ~${week} monedas`);
