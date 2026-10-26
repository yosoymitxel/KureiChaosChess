// Root: screen routing + run progression. Screens are dumb; all run mutations happen here.
import { html, useState, useEffect, useRef, useCallback, motion } from './lib.js';
import { CardPick } from './components.js';
import { Icon } from './icons.js';
import { MenuScreen } from './screens/menu.js';
import { MapScreen } from './screens/map.js';
import { SetupScreen, SettingsScreen, RUN_MECHANICS } from './screens/setup.js';
import { GameScreen } from './screens/game.js';
import { HowToOverlay } from './screens/overlays.js';
import { setFullscreen } from './fullscreen.js';
import { setSfxEnabled, setSfxVolume, startAmbient, setMusicScene, playSfx } from './sfx.js';
import { MinisScreen } from './screens/minis.js';
import { ZenScreen } from './screens/zen.js';
import { ShopScreen } from './screens/shop.js';
import { GalleryScreen } from './screens/gallery.js';
import { AchievementsScreen } from './screens/achievements.js';
import { MODIFIERS } from '../data/modifiers.js';
import { MINIGAMES } from '../data/minigame-catalog.js';
import { loadRun, saveRun, clearRun, createRun, completeNode, loadSettings, saveSettings, loadUnlocked, unlockMini, unlockBoss, loadBosses, floorTier, DEFAULT_SETTINGS, withPrefs, takeNewDemos } from '../game/run.js';
import { COINS_PER_NODE, addCoins, addToHand, themeOwned, consumeCard } from '../game/shop.js';
import { ZEN_NAMES, addZenSeeds, pickSeed } from '../game/zen.js';
import { MUTATIONS, pickMutationChoices } from '../data/mutations.js';
import { award, bump, loadAchievements, seeMutations } from '../game/achievements.js';
import { Moments } from './moments.js';
import { playDemo, mutationDemo } from './demos.js';
import { BOSS_IDS } from '../data/bosses.js';
import { applyTheme } from '../data/themes.js';
import { CARDS, HAND_LIMIT, pickCardChoices } from '../game/cards.js';

const REST_CARDS = [
  { id: 'extra_mut', name: 'Meditar', desc: 'Elige una mutación de entre tres.', icon: 'scroll', kind: 'boon' },
  { id: 'promote_one', name: 'Ascenso', desc: 'Un peón empieza el próximo nodo como reina.', icon: 'queen', kind: 'boon' },
  { id: 'fury_now', name: 'Impulso', desc: '+1 movimiento sin captura por turno en el próximo nodo.', icon: 'boot', kind: 'boon' },
];
const BAG_CARDS = [
  { id: 'mut', name: 'Frasco extraño', desc: 'Una mutación al azar, ahora mismo.', icon: 'flask', rarity: 'rare', kind: 'boon' },
  { id: 'deck', name: 'Mazo táctico', desc: 'Dos cartas tácticas al azar para tu mano.', icon: 'hand', rarity: 'rare', kind: 'boon' },
  { id: 'extra_pawn', name: 'Recluta', desc: '+1 peón en tu formación en el próximo nodo.', icon: 'pawn', kind: 'boon' },
  { id: 'fury', name: 'Furia menor', desc: '+1 movimiento sin captura por turno, permanente (máx. 3).', icon: 'boot', rarity: 'rare', kind: 'boon' },
  { id: 'extra_rook', name: 'Torre mercenaria', desc: '+1 torre en tu última fila en el próximo nodo.', icon: 'rook', kind: 'boon' },
];
const shuffle3 = (arr) => arr.slice().sort(() => Math.random() - 0.5).slice(0, 3);
// A won minigame pays a mutation or a piece the army already knows.
const MINI_PRIZES = BAG_CARDS.filter((c) => ['mut', 'extra_rook', 'extra_pawn'].includes(c.id));
const ONE_SHOT =['promoteOne', 'furyNow', 'extraPawn', 'extraRook'];

export function App() {
  const [screen, setScreen] = useState('menu');
  const [run, setRunState] = useState(loadRun);
  const [node, setNode] = useState(null);
  const [seats, setSeats] = useState(null);
  const [versus, setVersus] = useState(null); // partida local suelta: no toca la run ni sus cartas
  const [gameKey, setGameKey] = useState(0);
  const [reward, setReward] = useState(null); // { kind, cards }
  const [reveal, setReveal] = useState(null); // mutación del Frasco extraño, que se enseña antes del mapa
  const [howTo, setHowTo] = useState(false);
  const [freeMini, setFreeMini] = useState(null); // minigame played from the menu, outside a run
  const [freeKey, setFreeKey] = useState(0);
  const [miniKey, setMiniKey] = useState(0); // remonta el minijuego del mapa al cambiar de dificultad
  const [shopFrom, setShopFrom] = useState('zen'); // a dónde vuelve la tienda
  const [achFrom, setAchFrom] = useState({ back: 'menu' }); // a dónde vuelven los Logros y qué logro enfocar
  const [settings, setSettings] = useState(loadSettings);
  const curtain = useRef(null);
  const busy = useRef(false);

  const setRun = useCallback((next) => setRunState((prev) => {
    const v = typeof next === 'function' ? next(prev) : next;
    v ? saveRun(v) : clearRun();
    return v;
  }), []);

  // En el cuerpo, antes de montar: el diorama del menú construye su mesa en un efecto hijo
  // y necesita data-art (y las variables) ya puestos para pintar las piezas a píxel.
  applyTheme(settings.theme);
  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { setSfxEnabled(settings.sound); setSfxVolume(settings.volume); }, [settings.sound, settings.volume]);
  // El navegador no deja sonar sin un gesto: el fondo arranca con el primer toque. El listener
  // se queda puesto: startAmbient() es idempotente y así vuelve al reactivar Sonidos.
  useEffect(() => {
    const wake = () => startAmbient();
    window.addEventListener('pointerdown', wake);
    return () => window.removeEventListener('pointerdown', wake);
  }, []);
  // La música sigue a la pantalla y a la mesa (applyTheme ya puso data-art en este render).
  useEffect(() => { setMusicScene(screen === 'zen'); }, [screen, settings.theme]);
  // Una mesa guardada que no se compró vuelve a la de serie.
  useEffect(() => { if (!themeOwned(settings.theme)) setSettings((s) => ({ ...s, theme: DEFAULT_SETTINGS.theme })); }, []);
  // Hitos que dependen del avance de la run: se revisan al guardarla, en un solo lugar.
  useEffect(() => {
    if (!run) return;
    if (run.currentFloor >= 10) award('deep_run');
    if (run.currentFloor >= 4) award('floor_5');
    if ((run.mutations || []).length >= 5) award('mut_5');
    if ((run.mutations || []).some((id) => MUTATIONS[id]?.rarity === 'epic')) award('mut_epic');
    if ((run.minisWon || 0) >= 3) award('minis_3');
    if ((run.cards || []).length >= HAND_LIMIT) award('full_hand');
  }, [run]);

  // Curtain wipe between screens.
  const goTo = useCallback(async (next) => {
    if (busy.current) return;
    busy.current = true;
    playSfx('tap');
    await motion(curtain.current, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 0.28, ease: [0.7, 0, 0.84, 0] });
    setScreen(next);
    await motion(curtain.current, { clipPath: ['inset(0% 0 0 0)', 'inset(100% 0 0 0)'] }, { duration: 0.36, delay: 0.05, ease: [0.16, 1, 0.3, 1] });
    busy.current = false;
  }, []);

  // La primera run de todas es el tutorial; después se puede repetir desde el diorama.
  const newRun = (tutorial = !settings.tutorialSeen && !loadAchievements().length) => {
    if (tutorial) setSettings((s) => ({ ...s, tutorialSeen: true }));
    const r = createRun({ tutorial }); setRun(r); setNode(r.map.nodes[0]); setSeats(null); goTo('setup'); };
  // Partida local: la mesa (mecánica, tamaño, forma) se elige o sale al azar; una serie a 3 o 5
  // rondas sube de piso en cada una, como una run corta, y gana quien llegue antes a la mitad.
  const VERSUS_MODS = ['none', ...RUN_MECHANICS.filter((id) => id !== 'elite')];
  const versusNode = (cfg, round = 0) => {
    const seed = Math.floor(Math.random() * 1e6);
    const modifier = cfg.mod === 'random' ? VERSUS_MODS[seed % VERSUS_MODS.length] : cfg.mod;
    const board = { size: cfg.size === 'random' ? undefined : cfg.size, shape: cfg.shape === 'random' ? undefined : cfg.shape };
    return { id: `versus-${seed}`, seed, floor: round, versus: true, modifier, board };
  };
  const versusRun = (cfg) => ({ seed: 0, map: { floors: Math.max(cfg.rounds, 1) }, mutations: [], bonuses: {}, cards: [], completed: {} });
  const newVersus = (cfg = versus?.cfg || { game: 'chess', mod: 'random', size: 'random', shape: 'random', rounds: 1, goals: 5 }) => {
    setVersus({ key: 0, cfg, score: {}, round: 0, run: versusRun(cfg), node: versusNode(cfg) });
    goTo('versus-setup');
  };
  const setVersusCfg = (cfg) => setVersus((v) => ({ ...v, cfg, run: versusRun(cfg), node: versusNode(cfg) }));
  // Fin de una ronda: suma el punto y devuelve la nota de la ficha final.
  const versusRound = (r) => {
    const v = versus, score = { ...v.score }, name = (c) => v.seats.find((s) => s.color === c)?.name;
    if (r.winner) score[r.winner] = (score[r.winner] || 0) + 1;
    const need = Math.floor(v.cfg.rounds / 2) + 1, champ = Object.keys(score).find((c) => score[c] >= need);
    const done = v.cfg.rounds <= 1 || !!champ || v.round + 1 >= v.cfg.rounds;
    setVersus((x) => ({ ...x, prev: x.score, score, ended: true, done }));
    const head = r.tie ? 'Tablas.' : `Gana ${r.winnerName}.`;
    if (v.cfg.rounds <= 1) return head;
    const tally = v.seats.map((s) => `${s.name} ${score[s.color] || 0}`).join(' · ');
    return `${head} Serie: ${tally}.${champ ? ` ¡${name(champ)} gana la serie!` : done ? ' Serie terminada.' : ''}`;
  };
  const versusNext = () => {
    if (!versus?.ended || versus.done) return goTo('menu');
    setVersus((v) => ({ ...v, key: v.key + 1, round: v.round + 1, ended: false, node: versusNode(v.cfg, v.round + 1) }));
  };
  const openShop = (from) => () => { setShopFrom(from); goTo('shop'); };

  const enterNode = (n) => {
    setNode(n);
    if (n.modifier === 'rest') { setReward({ kind: 'rest', cards: REST_CARDS }); return goTo('reward'); }
    if (n.modifier === 'bag') { setReward({ kind: 'bag', cards: shuffle3(BAG_CARDS) }); return goTo('reward'); }
    if (MODIFIERS[n.modifier]?.mini) return goTo('mini');
    if (!seats) return goTo('setup');
    startGame(seats);
  };

  const startGame = (s) => {
    setSeats(s);
    setGameKey((k) => k + 1);
    if (settings.fullscreen) setFullscreen(true);
    goTo('game');
  };

  // One-shot bonuses are consumed once the board using them has been dealt.
  useEffect(() => {
    if (screen === 'game' && run?.bonuses && ONE_SHOT.some((k) => run.bonuses[k])) {
      const t = setTimeout(() => setRun((r) => ({ ...r, bonuses: {} })), 0);
      return () => clearTimeout(t);
    }
  }, [screen, gameKey]);

  const mutationReward = (r, coins = 0, seed = null) => {
    const choices = pickMutationChoices(Date.now(), r.mutations);
    if (!choices.length) return goTo('map');
    setReward({ kind: 'mutation', coins, seed, cards: choices.map((id) => ({ ...MUTATIONS[id], kind: 'mutation', stack: r.mutations.filter((x) => x === id).length + 1 })) });
    goTo('reward');
  };
  const cardReward = (coins = 0, seed = null) => {
    setReward({ kind: 'tactic', coins, seed, cards: pickCardChoices(Date.now()).map((id) => ({ ...CARDS[id], kind: 'tactic' })) });
    goTo('reward');
  };

  // Slay the Spire rhythm: normal fights give a tactic card, elites give a mutation; every win pays coins.
  const onWin = (bossId, { toMenu } = {}) => {
    award('first_win');
    const kind = node.isBoss ? 'boss' : node.isMiniBoss ? 'miniBoss' : node.modifier === 'elite' ? 'elite' : 'normal';
    const coins = COINS_PER_NODE[kind];
    addCoins(coins);
    const seed = pickSeed();
    addZenSeeds(seed, 1);
    if (node.isBoss || node.isMiniBoss) {
      unlockBoss(bossId);
      if (loadBosses().length >= BOSS_IDS.length) award('all_bosses');
    }
    if (node.isBoss) {
      award('boss_slain');
      { const runs = bump('runs'); if (runs >= 3) award('runs_3'); if (runs >= 10) award('runs_10'); }
      clearRun(); setRunState(null); return toMenu ? goTo('menu') : newRun();
    }
    if (node.isMiniBoss) { const next = completeNode(run, node); setRun(next); return mutationReward(next, coins, seed); }
    const next = completeNode(run, node);
    setRun(next);
    if (node.modifier === 'elite') return mutationReward(next, coins, seed);
    cardReward(coins, seed);
  };

  // Minigame inside the run: a win unlocks it and pays a prize; a loss just spends the node.
  const onMiniEnd = (won) => {
    if (!won) { setRun(completeNode(run, node)); return goTo('map'); }
    award('mini_won');
    if (floorTier(node.floor, run.map.floors) === 'dificil') award('mini_hard');
    unlockMini(node.modifier);
    if (loadUnlocked().length >= Object.values(MODIFIERS).filter((m) => m.mini).length) award('all_minis');
    setRun((r) => ({ ...r, minisWon: (r.minisWon || 0) + 1 }));
    const coins = COINS_PER_NODE.normal, seed = pickSeed();
    addCoins(coins);
    addZenSeeds(seed, 1);
    setReward({ kind: 'mini', coins, seed, cards: MINI_PRIZES });
    goTo('reward');
  };

  const onReward = (card) => {
    if (reward.kind === 'mutation') { setRun((r) => ({ ...r, mutations: [...r.mutations, card.id] })); return goTo('map'); }
    if (reward.kind === 'tactic' && (run.cards || []).length >= HAND_LIMIT) {
      const cards = [...run.cards, card.id].map((id, slot) => ({ ...CARDS[id], kind: 'tactic', id: `${id}#${slot}`, slot }));
      return setReward({ kind: 'swap', incoming: card.id, cards });
    }
    if (reward.kind === 'tactic') { setRun((r) => addToHand(r, [card.id])); return goTo('map'); }
    if (reward.kind === 'swap') {
      if (card.slot < run.cards.length) setRun((r) => addToHand(consumeCard(r, card.slot), [reward.incoming]));
      return goTo('map');
    }
    if (reward.kind === 'rest') {
      if (card.id === 'extra_mut') { const next = completeNode(run, node); setRun(next); return mutationReward(next); }
      setRun((r) => completeNode(r, node, { bonuses: { ...r.bonuses, [card.id === 'promote_one' ? 'promoteOne' : 'furyNow']: true } }));
      return goTo('map');
    }
    const drunk = card.id === 'mut' ? pickMutationChoices(Date.now(), run.mutations)[0] : null;
    setRun((r) => {
      let mutations = r.mutations;
      const bonuses = { ...r.bonuses };
      if (card.id === 'extra_pawn') bonuses.extraPawn = true;
      if (card.id === 'extra_rook') bonuses.extraRook = true;
      if (card.id === 'fury' && mutations.filter((m) => m === 'fury').length < 3) mutations = [...mutations, 'fury'];
      if (drunk) mutations = [...mutations, drunk];
      const withCards = card.id === 'deck' ? addToHand(r, pickCardChoices(Date.now(), 2)) : r;
      return completeNode(withCards, node, { mutations, bonuses });
    });
    if (drunk) setReveal(drunk);
    else goTo('map');
  };

  const REWARD_TEXT = {
    mutation: ['Elige una mutación', 'Se aplica a tu ejército durante el resto de la run.'],
    tactic: ['Elige una carta', `Va a tu mano y la juegas durante una partida, una por turno. Máximo ${HAND_LIMIT}: si está llena, eliges cuál sale.`],
    swap: ['Mano llena', `Caben ${HAND_LIMIT} cartas: elige la que sale (puede ser la nueva).`],
    rest: ['Un momento de calma', 'Elige un beneficio para el camino.'],
    bag: ['Encuentras una bolsa', 'Llévate un objeto.'],
    mini: ['¡Minijuego superado!', 'Elige tu premio. Ya puedes jugarlo cuando quieras desde el menú.'],
  };
  const Mini = MINIGAMES[node?.modifier]?.Screen;
  const FreeMini = MINIGAMES[freeMini]?.Screen;

  return html`
    ${screen === 'menu' && html`<${MenuScreen} hasRun=${!!run} onNew=${() => newRun()} onTutorial=${() => newRun(true)} onContinue=${() => goTo('map')} onHowTo=${() => setHowTo(true)} onSettings=${() => goTo('settings')} onMinis=${loadUnlocked().length ? () => goTo('minis') : null} onZen=${() => goTo('zen')} onShop=${openShop('menu')} onGallery=${() => goTo('gallery')} onAchievements=${() => { setAchFrom({ back: 'menu' }); goTo('achievements'); }} onVersus=${() => newVersus()} settings=${settings} setSettings=${setSettings} />`}
    ${screen === 'settings' && html`<${SettingsScreen} settings=${settings} setSettings=${setSettings} onBack=${() => goTo('menu')} />`}
    ${screen === 'map' && run && html`<${MapScreen} key=${run.lastNode || 'start'} run=${run} onBack=${() => goTo('menu')} onSelect=${enterNode} onShop=${openShop('map')} />`}
    ${screen === 'setup' && node && html`<${SetupScreen} node=${node} run=${run} settings=${settings} setSettings=${setSettings} defaultCount=${seats?.length} onHowTo=${() => setHowTo(true)} onBack=${() => goTo(run && Object.keys(run.completed).length ? 'map' : 'menu')} onStart=${startGame}
      onPrefs=${run && !run.tutorial && !Object.keys(run.completed).length ?(prefs) => { const r = withPrefs(run, prefs); setRun(r); setNode(r.map.nodes[0]); } : null} />`}
    ${screen === 'versus-setup' && versus && html`<${SetupScreen} versus node=${versus.node} run=${versus.run} settings=${settings} setSettings=${setSettings} onBack=${() => goTo('menu')}
      versusCfg=${versus.cfg} onVersusCfg=${setVersusCfg}
      onStart=${(s) => { setVersus((v) => ({ ...v, seats: s, score: {}, round: 0, ended: false, done: false, node: v.round ? versusNode(v.cfg) : v.node })); goTo(versus.cfg.game === 'hockey' ? 'versus-hockey' : 'versus'); }} />`}
    ${screen === 'versus-hockey' && versus?.seats && html`<${MINIGAMES.hockey.Screen} key=${'vh-' + versus.key} sub="Partida local" settings=${settings} setSettings=${setSettings}
      duo=${{ goals: versus.cfg.goals, names: versus.seats.map((s) => s.name) }} endLabel="Al menú" onBack=${() => goTo('menu')} onEnd=${() => goTo('menu')}
      onRestart=${() => setVersus((v) => ({ ...v, key: v.key + 1 }))} />`}
    ${screen === 'versus' && versus?.seats && html`<${GameScreen} key=${versus.node.id + '-' + versus.key}
      node=${versus.node} run=${versus.run} seats=${versus.seats} settings=${settings} setSettings=${setSettings} exitLabel=${versus.ended && !versus.done ? 'Siguiente ronda' : 'Al menú'}
      onRound=${versusRound} onExit=${versusNext} onMenu=${() => goTo('menu')} onAbandon=${() => goTo('menu')} onWin=${versusNext}
      onUseCard=${() => {}} onRestart=${() => setVersus((v) => ({ ...v, key: v.key + 1, ended: false, done: false, score: v.ended ? v.prev : v.score }))} onHowTo=${() => setHowTo(true)} />`}
    ${screen === 'reward' && reward && html`<${CardPick} key=${reward.kind + reward.cards.map((c) => c.id).join()}
      title=${REWARD_TEXT[reward.kind][0]}
      subtitle=${REWARD_TEXT[reward.kind][1] + (reward.coins ? ` La victoria paga ${reward.coins} monedas del jardín.` : '') + (reward.seed ? ` Cayó una semilla de ${ZEN_NAMES[reward.seed]}.` : '')}
      cards=${reward.cards} onConfirm=${onReward} confirmLabel=${reward.kind === 'swap' ? 'Que salga esta' : undefined} />`}
    ${screen === 'game' && node && seats && run && html`<${GameScreen} key=${node.id + '-' + gameKey}
      node=${node} run=${run} seats=${seats} settings=${settings} setSettings=${setSettings}
      onExit=${() => goTo('map')} onMenu=${() => goTo('menu')} onAbandon=${() => { setRun(null); goTo('menu'); }}
      onUseCard=${(i) => setRun((r) => consumeCard(r, i))}
      onWin=${onWin} onRestart=${() => setGameKey((k) => k + 1)} onHowTo=${() => setHowTo(true)} />`}
    ${screen === 'mini' && Mini && html`<${Mini} key=${node.id + '-' + miniKey} sub=${'Piso ' + (node.floor + 1) + ' · minijuego'} onBack=${() => goTo('map')} onEnd=${onMiniEnd}
      diff=${floorTier(node.floor, run.map.floors)}
      settings=${settings} setSettings=${setSettings} onRestart=${() => setMiniKey((k) => k + 1)} />`}
    ${screen === 'minis' && html`<${MinisScreen} unlocked=${loadUnlocked()} onBack=${() => goTo('menu')} onPlay=${(id) => { setFreeMini(id); setFreeKey((k) => k + 1); goTo('free-mini'); }} />`}
    ${screen === 'free-mini' && FreeMini && html`<${FreeMini} key=${freeKey} sub="Partida libre" onBack=${() => goTo('minis')}
      endLabel="Otra partida"
      onEnd=${() => setFreeKey((k) => k + 1)}
      settings=${settings} setSettings=${setSettings} onRestart=${() => setFreeKey((k) => k + 1)} />`}
    ${screen === 'zen' && html`<${ZenScreen} onBack=${() => goTo('menu')} onShop=${openShop('zen')} />`}
    ${screen === 'shop' && html`<${ShopScreen} run=${run} setRun=${setRun} settings=${settings} setSettings=${setSettings} onBack=${() => goTo(shopFrom)} />`}
    ${screen === 'gallery' && html`<${GalleryScreen} onBack=${() => goTo('menu')} onAchievements=${(focus) => { setAchFrom({ back: 'gallery', focus }); goTo('achievements'); }} />`}
    ${screen === 'achievements' && html`<${AchievementsScreen} focus=${achFrom.focus} onBack=${() => goTo(achFrom.back)} onGallery=${() => goTo('gallery')} />`}
    ${howTo && html`<${HowToOverlay} onClose=${() => setHowTo(false)} />`}
    ${reveal && html`<${MutationReveal} id=${reveal} onDone=${() => { takeNewDemos(run); setReveal(null); goTo('map'); }} />`}
    <div class="curtain" ref=${curtain}><span>Kure'iChaosChess</span></div>
    <${AchievementToast} />
  `;
}

// Frasco extraño: primero se usa la carta y después se enseña la mutación que tocó, como hace la
// partida con una mutación nueva; así la partida siguiente ya no la repite.
function MutationReveal({ id, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const m = new Moments(ref.current, { speed: loadSettings().speed || 1 });
    (async () => {
      await m.cinematic({ title: 'Frasco extraño', sub: 'Lo bebes de un trago y algo cambia en tu ejército…', icon: 'flask', anim: 'stomp' });
      await playDemo(m, mutationDemo(id));
      seeMutations([id]);
      onDone();
    })();
    return () => m.destroy();
  }, []);
  return html`<div class="overlay" ref=${ref}></div>`;
}

// Aviso de logro: se encola y sale uno por vez, sin interrumpir la mesa.
function AchievementToast() {
  const [queue, setQueue] = useState([]);
  const [show, setShow] = useState(null);
  useEffect(() => {
    const onAward = (e) => setQueue((q) => [...q, e.detail]);
    window.addEventListener('zugzwang:achievement', onAward);
    return () => window.removeEventListener('zugzwang:achievement', onAward);
  }, []);
  useEffect(() => {
    if (show || !queue.length) return;
    setShow(queue[0]);
    playSfx('achievement');
    setQueue((q) => q.slice(1));
  }, [queue, show]);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(null), 4200);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return html`<div class="ach-toast" role="status" onClick=${() => setShow(null)}>
    <span class="ach-stamp"><${Icon} name=${show.icon} size=${20} /></span>
    <div>
      <small>Logro desbloqueado</small>
      <b>${show.name}</b>
    </div>
  </div>`;
}
