import { MATES } from '../src/data/mates.js';
import { fromSpec, inCheck, mateKeys } from '../src/game/mates.js';

let total = 0;
let passed = 0;
for (const n of [1, 2]) {
  const positions = MATES[String(n)] || [];
  let accepted = 0;
  console.log(`\nMATE IN ${n}: ${positions.length} positions`);
  positions.forEach((spec, index) => {
    const pieces = fromSpec(spec);
    const startSafe = !inCheck(pieces, 'light') && !inCheck(pieces, 'dark');
    const solutions = startSafe ? mateKeys(pieces, n) : [];
    const ok = startSafe && solutions.length === 1;
    total++;
    if (ok) { accepted++; passed++; }
    console.log(`  #${String(index + 1).padStart(2, '0')}: ${ok ? 'PASS' : 'FAIL'} — startSafe=${startSafe}, winningFirstMoves=${solutions.length}`);
  });
  console.log(`RESULT mate in ${n}: ${accepted}/${positions.length} accepted`);
}
console.log(`\nTOTAL: ${passed}/${total} accepted`);
if (passed !== total) process.exitCode = 1;
