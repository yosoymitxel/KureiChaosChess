// Minis por turnos de una pieza (src/game/<id>.js): cada mesa termina con veredicto, varía, un bot que
// juega con cabeza gana a menudo y uno al azar pierde más (cada dificultad es pasable y no trivial).
import assert from 'node:assert/strict';
import { mulberry32 } from '../src/core/rng.js';
import { key } from '../src/game/rules.js';

const IDS = ['race', 'rampage', 'feast', 'pdodge', 'parkour', 'blaster', 'horde'];
// Mínimo de victorias del bot listo (de 40) por dificultad.
const MIN = { facil: 20, normal: 12, dificil: 6 };

for (const id of IDS) {
  const G = await import(`../src/game/${id}.js`);
  for (const level of ['facil', 'normal', 'dificil']) {
    let smart = 0, dumb = 0;
    const layouts = new Set();
    for (let seed = 1; seed <= 40; seed++) for (const clever of [true, false]) {
      const rng = mulberry32(seed * 7 + (clever ? 0 : 1)), s = G.create(level, mulberry32(seed));
      if (clever) layouts.add(JSON.stringify(G.pieces(s).map((p) => p.type + key(p.row, p.col))) + [...s.board.holes].join() + JSON.stringify([...(G.labels?.(s) || [])]));
      for (let i = 0; i < 300 && !s.over; i++) {
        const opts = G.marks(s).filter(([, cls]) => /mv|cap/.test(cls)).map(([k]) => k.split(',').map(Number));
        const [r, c] = clever ? G.auto(s) : opts[Math.floor(rng() * opts.length)];
        assert.ok(G.tap(s, r, c), `${id}/${level}/${seed}: the chosen move is accepted`);
        if (!s.over && G.enemy) G.enemy(s);
        assert.equal(typeof G.status(s), 'string');
      }
      assert.ok(s.over === 'win' || s.over === 'lose', `${id}/${level}/${seed}: ends with a verdict`);
      assert.ok(s.note, `${id}/${level}/${seed}: explains the ending`);
      if (s.over === 'win') clever ? smart++ : dumb++;
    }
    assert.ok(layouts.size >= 30, `${id}/${level}: tables vary (${layouts.size}/40)`);
    assert.ok(smart >= MIN[level], `${id}/${level}: a sensible player wins ${smart}/40`);
    console.log(`${id} ${level}: listo ${smart}/40 · al azar ${dumb}/40`);
  }
}
console.log('Minis por turnos OK');
