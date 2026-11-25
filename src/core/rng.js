// Deterministic PRNG so every board/map is reproducible from a seed.
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pickFrom = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// Secure entropy for values that affect persistent progression or cloud saves.
// Fail closed rather than silently falling back to Math.random.
export function secureRandom() {
  const crypto = globalThis.crypto;
  if (!crypto || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Web Crypto is required for secure random values');
  }
  const sample = new Uint32Array(1);
  crypto.getRandomValues(sample);
  return sample[0] / 0x1_0000_0000;
}

export const randomSeed = () => Math.floor(secureRandom() * 1e6);
