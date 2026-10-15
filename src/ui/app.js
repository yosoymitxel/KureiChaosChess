// Root: screen routing + run progression. Screens are dumb; all run mutations happen here.
import { html, useState, useEffect, useRef, useCallback, motion } from './lib.js';
import { CardPick } from './components.js';
import { MenuScreen } from './screens/menu.js';
import { MapScreen } from './screens/map.js';
import { SetupScreen, SettingsScreen } from './screens/setup.js';
import { GameScreen } from './screens/game.js';
import { HowToOverlay } from './screens/overlays.js';
import { loadRun, saveRun, clearRun, createRun, completeNode, loadSettings, saveSettings } from '../game/run.js';
import { MUTATIONS, pickMutationChoices } from '../data/mutations.js';
import { applyTheme } from '../data/themes.js';

const REST_CARDS = [
  { id: 'extra_mut', name: 'Meditar', desc: 'Elige una mutación de entre tres.', icon: 'scroll' },
  { id: 'promote_one', name: 'Ascenso', desc: 'Un peón empieza el próximo nodo como reina.', icon: 'queen' },
  { id: 'fury_now', name: 'Impulso', desc: '+1 movimiento por turno en el próximo nodo.', icon: 'boot' },
];
const BAG_CARDS = [
  { id: 'mut', name: 'Frasco extraño', desc: 'Una mutación al azar, ahora mismo.', icon: 'flask', rarity: 'rare' },
  { id: 'extra_pawn', name: 'Recluta', desc: '+1 peón en tu formación en el próximo nodo.', icon: 'pawn' },
  { id: 'fury', name: 'Furia menor', desc: '+1 movimiento permanente (máx. 3).', icon: 'boot', rarity: 'rare' },
  { id: 'extra_rook', name: 'Torre mercenaria', desc: '+1 torre en tu última fila en el próximo nodo.', icon: 'rook' },
];
const shuffle3 = (arr) => arr.slice().sort(() => Math.random() - 0.5).slice(0, 3);
const ONE_SHOT = ['promoteOne', 'furyNow', 'extraPawn', 'extraRook'];

export function App() {
  const [screen, setScreen] = useState('menu');
  const [run, setRunState] = useState(loadRun);
  const [node, setNode] = useState(null);
  const [seats, setSeats] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [reward, setReward] = useState(null); // { kind, cards }
  const [howTo, setHowTo] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const curtain = useRef(null);
  const busy = useRef(false);

  const setRun = useCallback((next) => setRunState((prev) => {
    const v = typeof next === 'function' ? next(prev) : next;
    v ? saveRun(v) : clearRun();
    return v;
  }), []);

  useEffect(() => { applyTheme(settings.theme); saveSettings(settings); }, [settings]);

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

  const enterNode = (n) => {
    setNode(n);
    if (n.modifier === 'rest') { setReward({ kind: 'rest', cards: REST_CARDS }); return goTo('reward'); }
    if (n.modifier === 'bag') { setReward({ kind: 'bag', cards: shuffle3(BAG_CARDS) }); return goTo('reward'); }
    if (!seats) return goTo('setup');
    startGame(seats);
  };

  const startGame = (s) => {
    setSeats(s);
    setGameKey((k) => k + 1);
    if (settings.fullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    goTo('game');
  };

  // One-shot bonuses are consumed once the board using them has been dealt.
  useEffect(() => {
    if (screen === 'game' && run?.bonuses && ONE_SHOT.some((k) => run.bonuses[k])) {
      const t = setTimeout(() => setRun((r) => ({ ...r, bonuses: {} })), 0);
      return () => clearTimeout(t);
    }
  }, [screen, gameKey]);

  const mutationReward = (r) => {
    const choices = pickMutationChoices(Date.now(), r.mutations);
    if (!choices.length) return goTo('map');
    setReward({ kind: 'mutation', cards: choices.map((id) => ({ ...MUTATIONS[id], stack: r.mutations.filter((x) => x === id).length + 1 })) });
    goTo('reward');
  };

  const onWin = () => {
    if (node.isBoss) { clearRun(); setRunState(null); return newRun(); }
    const next = completeNode(run, node);
    setRun(next);
    if (Object.keys(run.completed).length === 0) return goTo('map');
    mutationReward(next);
  };

  const onReward = (card) => {
    if (reward.kind === 'mutation') { setRun((r) => ({ ...r, mutations: [...r.mutations, card.id] })); return goTo('map'); }
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
      return completeNode(r, node, { mutations, bonuses });
    });
    goTo('map');
  };

  const REWARD_TEXT = {
    mutation: ['Elige una mutación', 'Se aplica a tu ejército durante el resto de la run.'],
    rest: ['Un momento de calma', 'Elige un beneficio para el camino.'],
    bag: ['Encuentras una bolsa', 'Llévate un objeto.'],
  };

  return html`
    ${screen === 'menu' && html`<${MenuScreen} hasRun=${!!run} onNew=${newRun} onContinue=${() => goTo('map')} onHowTo=${() => setHowTo(true)} onSettings=${() => goTo('settings')} />`}
    ${screen === 'settings' && html`<${SettingsScreen} settings=${settings} setSettings=${setSettings} onBack=${() => goTo('menu')} />`}
    ${screen === 'map' && run && html`<${MapScreen} key=${run.lastNode || 'start'} run=${run} onBack=${() => goTo('menu')} onSelect=${enterNode} />`}
    ${screen === 'setup' && node && html`<${SetupScreen} node=${node} defaultCount=${seats?.length} onBack=${() => goTo(run && Object.keys(run.completed).length ? 'map' : 'menu')} onStart=${startGame} />`}
    ${screen === 'reward' && reward && html`<${CardPick} key=${reward.kind + reward.cards.map((c) => c.id).join()}
      title=${REWARD_TEXT[reward.kind][0]} subtitle=${REWARD_TEXT[reward.kind][1]}
      cards=${reward.cards} onConfirm=${onReward} />`}
    ${screen === 'game' && node && seats && run && html`<${GameScreen} key=${node.id + '-' + gameKey}
      node=${node} run=${run} seats=${seats} settings=${settings} setSettings=${setSettings}
      onExit=${() => goTo('map')} onAbandon=${() => { setRun(null); goTo('menu'); }}
      onWin=${onWin} onRestart=${() => setGameKey((k) => k + 1)} onHowTo=${() => setHowTo(true)} />`}
    ${howTo && html`<${HowToOverlay} onClose=${() => setHowTo(false)} />`}
    <div class="curtain" ref=${curtain}><span>Zugzwang</span></div>
  `;
}
