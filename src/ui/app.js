// Root: screen routing + run progression. Screens are dumb; all run mutations happen here.
import { html, useState, useEffect, useRef, useCallback, motion } from './lib.js';
import { CardPick } from './components.js';
import { MenuScreen } from './screens/menu.js';
import { MapScreen } from './screens/map.js';
import { SetupScreen, SettingsScreen } from './screens/setup.js';
import { GameScreen } from './screens/game.js';
import { HowToOverlay } from './screens/overlays.js';
import { setFullscreen } from './fullscreen.js';
import { Connect4Screen } from './screens/connect4.js';
import { MinisScreen } from './screens/minis.js';
import { ZenScreen } from './screens/zen.js';
import { ShopScreen } from './screens/shop.js';
import { GalleryScreen } from './screens/gallery.js';
import { AchievementsScreen } from './screens/achievements.js';
import { BomberScreen } from './screens/bomber.js';
import { BarrierScreen } from './screens/barrier.js';
import { IZombieScreen } from './screens/izombie.js';
import { BowlingScreen } from './screens/bowling.js';
import { LastStandScreen } from './screens/laststand.js';
import { MatesScreen } from './screens/mates.js';
import { KnightScreen } from './screens/knight.js';
import { QueensScreen } from './screens/queens.js';
import { MarcianosScreen } from './screens/marcianos.js';
import { MODIFIERS } from '../data/modifiers.js';
import { loadRun, saveRun, clearRun, createRun, completeNode, loadSettings, saveSettings, loadUnlocked, unlockMini, unlockBoss, floorTier } from '../game/run.js';
import { COINS_PER_NODE, addCoins, addToHand, claimTheme, consumeCard } from '../game/shop.js';
import { ZEN_NAMES, addZenSeeds, pickSeed } from '../game/zen.js';
import { MUTATIONS, pickMutationChoices } from '../data/mutations.js';
import { award } from '../game/achievements.js';
import { applyTheme } from '../data/themes.js';
import { CARDS, HAND_LIMIT, pickCardChoices } from '../game/cards.js';

const REST_CARDS = [
  { id: 'extra_mut', name: 'Meditar', desc: 'Elige una mutación de entre tres.', icon: 'scroll', kind: 'boon' },
  { id: 'promote_one', name: 'Ascenso', desc: 'Un peón empieza el próximo nodo como reina.', icon: 'queen', kind: 'boon' },
  { id: 'fury_now', name: 'Impulso', desc: '+1 movimiento por turno en el próximo nodo.', icon: 'boot', kind: 'boon' },
];
const BAG_CARDS = [
  { id: 'mut', name: 'Frasco extraño', desc: 'Una mutación al azar, ahora mismo.', icon: 'flask', rarity: 'rare', kind: 'boon' },
  { id: 'deck', name: 'Mazo táctico', desc: 'Dos cartas tácticas al azar para tu mano.', icon: 'hand', rarity: 'rare', kind: 'boon' },
  { id: 'extra_pawn', name: 'Recluta', desc: '+1 peón en tu formación en el próximo nodo.', icon: 'pawn', kind: 'boon' },
  { id: 'fury', name: 'Furia menor', desc: '+1 movimiento permanente (máx. 3).', icon: 'boot', rarity: 'rare', kind: 'boon' },
  { id: 'extra_rook', name: 'Torre mercenaria', desc: '+1 torre en tu última fila en el próximo nodo.', icon: 'rook', kind: 'boon' },
];
const shuffle3 = (arr) => arr.slice().sort(() => Math.random() - 0.5).slice(0, 3);
// A won minigame pays a mutation or a piece the army already knows.
const MINI_PRIZES = BAG_CARDS.filter((c) => ['mut', 'extra_rook', 'extra_pawn'].includes(c.id));
const MINI_SCREENS = { connect4: Connect4Screen, bomber: BomberScreen, barrier: BarrierScreen, izombie: IZombieScreen, bowling: BowlingScreen, laststand: LastStandScreen, mates: MatesScreen, knight: KnightScreen, queens: QueensScreen, marcianos: MarcianosScreen };
const ONE_SHOT =['promoteOne', 'furyNow', 'extraPawn', 'extraRook'];

export function App() {
  const [screen, setScreen] = useState('menu');
  const [run, setRunState] = useState(loadRun);
  const [node, setNode] = useState(null);
  const [seats, setSeats] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [reward, setReward] = useState(null); // { kind, cards }
  const [howTo, setHowTo] = useState(false);
  const [freeMini, setFreeMini] = useState(null); // minigame played from the menu, outside a run
  const [freeKey, setFreeKey] = useState(0);
  const [miniKey, setMiniKey] = useState(0); // remonta el minijuego del mapa al cambiar de dificultad
  const [shopFrom, setShopFrom] = useState('zen'); // a dónde vuelve la tienda
  const [settings, setSettings] = useState(loadSettings);
  const curtain = useRef(null);
  const busy = useRef(false);

  const setRun = useCallback((next) => setRunState((prev) => {
    const v = typeof next === 'function' ? next(prev) : next;
    v ? saveRun(v) : clearRun();
    return v;
  }), []);

  useEffect(() => { applyTheme(settings.theme); saveSettings(settings); }, [settings]);
  // La mesa ya puesta al estrenar la tienda sigue siendo del jugador.
  useEffect(() => { claimTheme(settings.theme); }, []);

  // Curtain wipe between screens.
  const goTo = useCallback(async (next) => {
    if (busy.current) return;
    busy.current = true;
    await motion(curtain.current, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 0.28, ease: [0.7, 0, 0.84, 0] });
    setScreen(next);
    await motion(curtain.current, { clipPath: ['inset(0% 0 0 0)', 'inset(100% 0 0 0)'] }, { duration: 0.36, delay: 0.05, ease: [0.16, 1, 0.3, 1] });
    busy.current = false;
  }, []);

  const newRun = () => { const r = createRun(); setRun(r); setNode(r.map.nodes[0]); setSeats(null); goTo('setup'); };
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
  const onWin = (bossId) => {
    award('first_win');
    const kind = node.isBoss ? 'boss' : node.isMiniBoss ? 'miniBoss' : node.modifier === 'elite' ? 'elite' : 'normal';
    const coins = COINS_PER_NODE[kind];
    addCoins(coins);
    const seed = pickSeed();
    addZenSeeds(seed, 1);
    if (node.isBoss || node.isMiniBoss) unlockBoss(bossId);
    if (node.isBoss) { award('boss_slain'); clearRun(); setRunState(null); return newRun(); }
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
    unlockMini(node.modifier);
    setReward({ kind: 'mini', cards: MINI_PRIZES });
    goTo('reward');
  };

  const onReward = (card) => {
    if (reward.kind === 'mutation') { setRun((r) => ({ ...r, mutations: [...r.mutations, card.id] })); return goTo('map'); }
    if (reward.kind === 'tactic') { setRun((r) => addToHand(r, [card.id])); return goTo('map'); }
    if (reward.kind === 'rest') {
      if (card.id === 'extra_mut') { const next = completeNode(run, node); setRun(next); return mutationReward(next); }
      setRun((r) => completeNode(r, node, { bonuses: { ...r.bonuses, [card.id === 'promote_one' ? 'promoteOne' : 'furyNow']: true } }));
      return goTo('map');
    }
    setRun((r) => {
      let mutations = r.mutations;
      const bonuses = { ...r.bonuses };
      if (card.id === 'extra_pawn') bonuses.extraPawn = true;
      if (card.id === 'extra_rook') bonuses.extraRook = true;
      if (card.id === 'fury' && mutations.filter((m) => m === 'fury').length < 3) mutations = [...mutations, 'fury'];
      if (card.id === 'mut') { const [m] = pickMutationChoices(Date.now(), mutations); if (m) mutations = [...mutations, m]; }
      const withCards = card.id === 'deck' ? addToHand(r, pickCardChoices(Date.now(), 2)) : r;
      return completeNode(withCards, node, { mutations, bonuses });
    });
    goTo('map');
  };

  const REWARD_TEXT = {
    mutation: ['Elige una mutación', 'Se aplica a tu ejército durante el resto de la run.'],
    tactic: ['Elige una carta', `Va a tu mano y la juegas durante una partida, una por turno. Máximo ${HAND_LIMIT}: si está llena, sale la más antigua.`],
    rest: ['Un momento de calma', 'Elige un beneficio para el camino.'],
    bag: ['Encuentras una bolsa', 'Llévate un objeto.'],
    mini: ['¡Minijuego superado!', 'Elige tu premio. Ya puedes jugarlo cuando quieras desde el menú.'],
  };
  const Mini = MINI_SCREENS[node?.modifier];
  const FreeMini = MINI_SCREENS[freeMini];

  return html`
    ${screen === 'menu' && html`<${MenuScreen} hasRun=${!!run} onNew=${newRun} onContinue=${() => goTo('map')} onHowTo=${() => setHowTo(true)} onSettings=${() => goTo('settings')} onMinis=${loadUnlocked().length ? () => goTo('minis') : null} onZen=${() => goTo('zen')} onShop=${openShop('menu')} onGallery=${() => goTo('gallery')} onAchievements=${() => goTo('achievements')} settings=${settings} setSettings=${setSettings} />`}
    ${screen === 'settings' && html`<${SettingsScreen} settings=${settings} setSettings=${setSettings} onBack=${() => goTo('menu')} />`}
    ${screen === 'map' && run && html`<${MapScreen} key=${run.lastNode || 'start'} run=${run} onBack=${() => goTo('menu')} onSelect=${enterNode} onShop=${openShop('map')} />`}
    ${screen === 'setup' && node && html`<${SetupScreen} node=${node} run=${run} defaultCount=${seats?.length} onBack=${() => goTo(run && Object.keys(run.completed).length ? 'map' : 'menu')} onStart=${startGame} />`}
    ${screen === 'reward' && reward && html`<${CardPick} key=${reward.kind + reward.cards.map((c) => c.id).join()}
      title=${REWARD_TEXT[reward.kind][0]}
      subtitle=${REWARD_TEXT[reward.kind][1] + (reward.coins ? ` La victoria paga ${reward.coins} monedas del jardín.` : '') + (reward.seed ? ` Cayó una semilla de ${ZEN_NAMES[reward.seed]}.` : '')}
      cards=${reward.cards} onConfirm=${onReward} />`}
    ${screen === 'game' && node && seats && run && html`<${GameScreen} key=${node.id + '-' + gameKey}
      node=${node} run=${run} seats=${seats} settings=${settings} setSettings=${setSettings}
      onExit=${() => goTo('map')} onAbandon=${() => { setRun(null); goTo('menu'); }}
      onUseCard=${(i) => setRun((r) => consumeCard(r, i))}
      onWin=${onWin} onRestart=${() => setGameKey((k) => k + 1)} onHowTo=${() => setHowTo(true)} />`}
    ${screen === 'mini' && Mini && html`<${Mini} key=${node.id + '-' + miniKey} sub=${'Piso ' + (node.floor + 1) + ' · minijuego'} onBack=${() => goTo('map')} onEnd=${onMiniEnd}
      diff=${floorTier(node.floor, run.map.floors)}
      settings=${settings} setSettings=${setSettings} onRestart=${() => setMiniKey((k) => k + 1)} />`}
    ${screen === 'minis' && html`<${MinisScreen} unlocked=${loadUnlocked()} onBack=${() => goTo('menu')} onPlay=${(id) => { setFreeMini(id); setFreeKey((k) => k + 1); goTo('free-mini'); }} />`}
    ${screen === 'free-mini' && FreeMini && html`<${FreeMini} key=${freeKey} sub="Partida libre" onBack=${() => goTo('minis')}
      endLabel="Otra partida" onEnd=${() => setFreeKey((k) => k + 1)}
      settings=${settings} setSettings=${setSettings} onRestart=${() => setFreeKey((k) => k + 1)} />`}
    ${screen === 'zen' && html`<${ZenScreen} onBack=${() => goTo('menu')} onShop=${openShop('zen')} />`}
    ${screen === 'shop' && html`<${ShopScreen} run=${run} setRun=${setRun} settings=${settings} setSettings=${setSettings} onBack=${() => goTo(shopFrom)} />`}
    ${screen === 'gallery' && html`<${GalleryScreen} onBack=${() => goTo('menu')} />`}
    ${screen === 'achievements' && html`<${AchievementsScreen} onBack=${() => goTo('menu')} />`}
    ${howTo && html`<${HowToOverlay} onClose=${() => setHowTo(false)} />`}
    <div class="curtain" ref=${curtain}><span>Zugzwang</span></div>
  `;
}
