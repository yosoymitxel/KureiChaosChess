// Tienda del jardín: las monedas que pagan tus flores se cambian por cartas y mesas.
import { html, useRef, useState } from '../lib.js';
import { Topbar, useEnter, CardFace, CardPick, RARITY_LABEL, ThemeLook } from '../components.js';
import { Icon } from '../icons.js';
import { CARDS, HAND_LIMIT } from '../../game/cards.js';
import { THEMES } from '../../data/themes.js';
import { award } from '../../game/achievements.js';
import { CARD_PRICE, COINS_PER_NODE, PENDING_LIMIT, THEME_SHOP, addPending, addToHand, consumeCard, charge, grantTheme, isShopCard, loadShop, themeOwned } from '../../game/shop.js';
import { ZEN_KINDS, ZEN_NAMES, addZenSeeds, addZenItem, loadZen } from '../../game/zen.js';
import { SEEDS, GARDEN_ITEMS } from '../../data/garden.js';
import { chipArt, ITEM_ART } from '../zen-art.js';
import { playSfx } from '../sfx.js';
import { t, tp } from '../../i18n/index.js';

const CARD_LIST = Object.values(CARDS);

export function ShopScreen({ run, setRun, settings, setSettings, onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const [shop, setShop] = useState(loadShop);
  const [seeds, setSeeds] = useState(() => loadZen().seeds);
  const [items, setItems] = useState(() => loadZen().items);
  const refresh = () => setShop(loadShop());

  const [swap, setSwap] = useState(null); // carta por comprar con la mano llena: antes se elige cuál sale
  // `drop`: la carta de la mano que sale para hacerle sitio.
  const buyCard = (card, drop) => {
    if (run && drop == null && (run.cards || []).length >= HAND_LIMIT) return setSwap(card);
    if (!charge(CARD_PRICE[card.rarity || 'common'])) return;
    award('buy_card');
    if (run) setRun((r) => addToHand(drop == null ? r : consumeCard(r, drop), [card.id], true));
    else addPending(card.id);
    playSfx('coin');
    refresh();
  };
  if (swap) {
    const cards = (run.cards || []).map((id, slot) => ({ ...CARDS[id], kind: 'tactic', id: `${id}#${slot}`, slot }));
    return html`<${CardPick} title=${t('reward.swap', 'Mano llena')} subtitle=${t('shop.swapSub', 'Para comprar {card} sale una de tu mano.', { card: swap.name })}
      cards=${cards} onBack=${() => setSwap(null)} confirmLabel=${t('reward.dropThis', 'Que salga esta')} onConfirm=${(c) => { setSwap(null); buyCard(swap, c.slot); }} />`;
  }
  const tapTheme = (id) => {
    if (themeOwned(id)) return setSettings((s) => ({ ...s, theme: id }));
    if (!charge(THEME_SHOP[id])) return;
    grantTheme(id);
    setSettings((s) => ({ ...s, theme: id }));
    playSfx('coin');
    refresh();
  };
  const buySeed = (kind) => {
    if (!charge(SEEDS[kind].price)) return;
    setSeeds(addZenSeeds(kind, 1));
    playSfx('coin');
    refresh();
  };
  const buyItem = (id) => {
    if (!charge(GARDEN_ITEMS[id].price)) return;
    setItems(addZenItem(id));
    playSfx('coin');
    refresh();
  };

  const pending = shop.pending;
  const hand = run?.cards || [];
  return html`<div class="screen mini shop" ref=${ref}>
    <${Topbar} title=${t('zen.shop', 'Tienda del jardín')} sub=${t('shop.sub', 'Las flores pagan las monedas')} onBack=${onBack}>
      <span class="coin-chip" title=${t('zen.coins', 'Monedas del jardín')}><${Icon} name="coin" size=${16} /><b>${shop.coins}</b></span>
    </${Topbar}>
    <div class="mini-body shop-body">
      <div class="shop-main">
        <p class="mini-help">${t('shop.help', 'Cada flor del Jardín Zen paga de {a} a {b} monedas y cada victoria de la travesía deja de {c} a {d}. Aquí se cambian por cartas, mesas y semillas.', { a: SEEDS.romero.pays, b: SEEDS.lavanda.pays, c: COINS_PER_NODE.normal, d: COINS_PER_NODE.boss })}</p>

        <section class="panel shop-card shop-pane-hand" data-enter>
          <h2>${run ? t('shop.yourHand', 'Tu mano en la run') : t('shop.nextRun', 'Para la próxima run')}</h2>
          ${run
            ? html`<p class="shop-note">${t('shop.handNote', 'Máximo {n} cartas: si la mano está llena, al comprar eliges cuál sale. Las compradas llevan la moneda en la esquina.', { n: HAND_LIMIT })}</p>
              <div class="shop-hand">
                ${hand.map((id, i) => html`<div class="hand-card" key=${id + '-' + i}><${CardFace} card=${{ ...CARDS[id], kind: 'tactic' }} mini shop=${isShopCard(run, i)} /></div>`)}
              </div>`
            : html`<p class="shop-note">${pending.length ? t('shop.pending', 'Tus compras esperan aquí y entran al empezar una run ({n} de {max}).', { n: pending.length, max: PENDING_LIMIT }) : t('shop.noRun', 'Sin run en curso: lo que compres queda apartado para la próxima.')}</p>
              ${pending.length > 0 && html`<div class="shop-hand">
                ${pending.map((id, i) => html`<div class="hand-card" key=${id + '-' + i}><${CardFace} card=${{ ...CARDS[id], kind: 'tactic' }} mini shop /></div>`)}
              </div>`}`}
        </section>

        <section class="panel shop-card shop-pane-cards" data-enter>
          <h2>${t('shop.cards', 'Cartas tácticas')}</h2>
          ${CARD_LIST.map((c) => {
            const price = CARD_PRICE[c.rarity || 'common'];
            const packed = !run && pending.length >= PENDING_LIMIT;
            const can = shop.coins >= price && !packed;
            return html`<div class="shop-row">
              <span class="hand-card shop-mini" aria-hidden="true"><${CardFace} card=${{ ...c, kind: 'tactic' }} mini /></span>
              <div class="shop-info"><strong>${c.name}</strong><small>${c.desc}</small></div>
              <span class=${'gem ' + (c.rarity || 'common')} role="img" aria-label=${'Rareza ' + RARITY_LABEL[c.rarity || 'common']} title=${'Rareza: ' + RARITY_LABEL[c.rarity || 'common']}></span>
              <span class="price"><${Icon} name="coin" size=${14} />${price}</span>
              <button class="btn sm" disabled=${!can} title=${packed ? t('shop.packed', 'El sobre ya tiene {n} cartas', { n: PENDING_LIMIT }) : can ? '' : t('zen.noCoins', 'Faltan monedas.')} onClick=${() => buyCard(c)}>${t('shop.buy', 'Comprar')}</button>
            </div>`;
          })}
        </section>

        <section class="panel shop-card shop-pane-seeds" data-enter>
          <h2>${t('zen.seeds', 'Semillas')}</h2>
          <p class="shop-note">${t('shop.seedNote', 'Una semilla por siembra en el Jardín Zen; también caen al ganar nodos de la travesía.')}</p>
          ${ZEN_KINDS.map((k) => {
            const can = shop.coins >= SEEDS[k].price;
            return html`<div class="shop-row">
              <span class=${'mod-icon seed-icon zn-k-' + k}>${chipArt(k)}</span>
              <div class="shop-info"><strong>${t('shop.seedOf', 'Semilla de {kind}', { kind: ZEN_NAMES[k] })} · ${SEEDS[k].rarity}</strong><small>${SEEDS[k].desc} ${t('shop.seedPays', 'Paga {n}. En la bolsa: {have}.', { n: SEEDS[k].pays, have: seeds[k] || 0 })}</small></div>
              <span class="price"><${Icon} name="coin" size=${14} />${SEEDS[k].price}</span>
              <button class="btn sm" disabled=${!can} title=${can ? '' : t('zen.noCoins', 'Faltan monedas.')} onClick=${() => buySeed(k)}>${t('shop.buy', 'Comprar')}</button>
            </div>`;
          })}
          <h2>${t('shop.garden', 'Para el jardín')}</h2>
          ${Object.values(GARDEN_ITEMS).map((it) => {
            const owned = !it.stack && items[it.id], can = !owned && shop.coins >= it.price;
            return html`<div class="shop-row">
              <span class="mod-icon seed-icon zn-item">${ITEM_ART[it.id]}</span>
              <div class="shop-info"><strong>${it.name}</strong><small>${it.desc}${it.stack && items[it.id] ? ' ' + t('shop.toPlace', 'Por poner: {n}.', { n: items[it.id] }) : ''}</small></div>
              ${owned ? html`<span class="price">${t('shop.owned', 'Tuya')}</span>` : html`<span class="price"><${Icon} name="coin" size=${14} />${it.price}</span>`}
              <button class="btn sm" disabled=${!can} title=${owned ? t('shop.have', 'Ya la tienes') : can ? '' : t('zen.noCoins', 'Faltan monedas.')} onClick=${() => buyItem(it.id)}>${t('shop.buy', 'Comprar')}</button>
            </div>`;
          })}
        </section>

        <section class="panel shop-card shop-pane-mesas" data-enter>
          <h2>${t('shop.tables', 'Mesas')}</h2>
          <p class="shop-note">${t('shop.tablesNote', 'Cada mesa con su pieza: las de arte píxel cambian también los sonidos. La comprada queda puesta.')}</p>
          <div class="theme-grid">
            ${Object.keys(THEME_SHOP).map((id) => {
              const th = THEMES[id], owned = themeOwned(id), on = settings.theme === id;
              return html`<button class=${'theme' + (on ? ' on' : '') + (owned ? ' owned' : '')} aria-pressed=${on} aria-label=${th.name}
                disabled=${!owned && shop.coins < THEME_SHOP[id]} title=${owned ? th.name : t('shop.themePrice', 'Se compra por {n} monedas', { n: THEME_SHOP[id] })} onClick=${() => tapTheme(id)}>
                <${ThemeLook} t=${th} />
                ${owned ? (on ? t('shop.inUse', 'En uso') : t('shop.use', 'Usar')) : html`<span class="price"><${Icon} name="coin" size=${13} />${THEME_SHOP[id]}</span>`}
              </button>`;
            })}
          </div>
        </section>
      </div>
    </div>
  </div>`;
}
