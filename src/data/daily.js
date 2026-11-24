// Regalo diario: uno por día (hora local y al menos GAP_H horas desde el anterior). Lo que trae sale al
// azar por peso; el séptimo de cada ciclo es un cofre que siempre trae carta. El ciclo avanza al recoger:
// saltarse días no reinicia nada. Una semana entera vale menos que una hora de partida (~360 monedas).
export const DAILY = {
  cycle: 7,
  gapH: 20,
  // Un regalo normal: una de estas cosas.
  loot: {
    coins: { weight: 4, min: 15, max: 40 },
    zen: { weight: 3, n: 2 },
    water: { weight: 2, n: 2 },
    card: { weight: 2 },
  },
  // Semillas acuáticas: cuánto sale cada una.
  water: { lenteja: 4, nenufar: 3, junco: 2, loto: 1 },
  // Cartas: por rareza, entre las que ya viste (como la tienda).
  cardWeight: { common: 3, rare: 2, lilac: 1 },
  // El cofre del día 7.
  chest: { coins: [50, 80], zen: 1, card: 1 },
  // Si el sobre de cartas está lleno, la carta se cambia por monedas.
  cardCoins: 40,
};
