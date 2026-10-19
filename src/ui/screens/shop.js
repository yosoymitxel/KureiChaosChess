// Tienda del jardín: las monedas que pagan tus flores se cambian por cartas y mesas.
import { html, useRef, useState } from '../lib.js';
import { Topbar, useEnter, CardFace, RARITY_LABEL } from '../components.js';
import { Icon } from '../icons.js';
import { CARDS, HAND_LIMIT } from '../../game/cards.js';
import { THEMES } from '../../data/themes.js';
import { award } from '../../game/achievements.js';
import { CARD_PRICE, COINS_PER_FLOWER, COINS_PER_NODE, PENDING_LIMIT, SEED_PRICE, THEME_SHOP, addPending, addToHand, charge, grantTheme, isShopCard, loadShop, themeOwned } from '../../game/shop.js';
import { ZEN_KINDS, ZEN_NAMES, addZenSeeds, loadZen } from '../../game/zen.js';
import { chipArt } from '../zen-art.js';
import { playSfx } from '../sfx.js';

const CARD_LIST = Object.values(CARDS);

export function ShopScreen({ run, setRun, settings, setSettings, onBack }) {
  const ref = useRef(null);
  useEnter(ref);
  const [shop, setShop] = useState(loadShop);
  const [seeds, setSeeds] = useState(() => loadZen().seeds);
  const refresh = () => setShop(loadShop());

  const buyCard = (card) => {
    if (!charge(CARD_PRICE[card.rarity || 'common'])) return;
    award('buy_card');
    if (run) setRun((r) => addToHand(r, [card.id], true));
    else addPending(card.id);
    playSfx('coin');
    refresh();
  };
  const tapTheme = (id) => {
    if (themeOwned(id)) return setSettings((s) => ({ ...s, theme: id }));
    if (!charge(THEME_SHOP[id])) return;
    grantTheme(id);
    setSettings((s) => ({ ...s, theme: id }));
    playSfx('coin');
    refresh();
  };
  const buySeed = (kind) => {
    if (!charge(SEED_PRICE)) return;
    setSeeds(addZenSeeds(kind, 1));
    playSfx('coin');
    refresh();
  };

  const pending = shop.pending;
  const hand = run?.cards || [];
  return html`<div class="screen mini shop" ref=${ref}>
    <${Topbar} title="Tienda del jardín" sub="Las flores pagan las monedas" onBack=${onBack}>
      <span class="coin-chip" title="Monedas del jardín"><${Icon} name="coin" size=${16} /><b>${shop.coins}</b></span>
    </${Topbar}>
    <div class="mini-body shop-body">
      <div class="shop-main">
        <p class="mini-help">Cada flor del Jardín Zen paga ${COINS_PER_FLOWER} monedas y cada victoria de la travesía deja de ${COINS_PER_NODE.normal} a ${COINS_PER_NODE.boss}. Aquí se cambian por cartas, mesas y semillas.</p>

        <section class="panel shop-card shop-pane-hand" data-enter>
          <h2>${run ? 'Tu mano en la run' : 'Para la próxima run'}</h2>
          ${run
            ? html`<p class="shop-note">Máximo ${HAND_LIMIT} cartas: si la mano está llena, al comprar sale la más antigua. Las compradas llevan la moneda en la esquina.</p>
              <div class="shop-hand">
                ${hand.map((id, i) => html`<div class="hand-card" key=${id + '-' + i}><${CardFace} card=${{ ...CARDS[id], kind: 'tactic' }} mini shop=${isShopCard(run, i)} /></div>`)}
              </div>`
            : html`<p class="shop-note">${pending.length ? `Tus compras esperan aquí y entran al empezar una run (${pending.length} de ${PENDING_LIMIT}).` : 'Sin run en curso: lo que compres queda apartado para la próxima.'}</p>
              ${pending.length > 0 && html`<div class="shop-hand">
                ${pending.map((id, i) => html`<div class="hand-card" key=${id + '-' + i}><${CardFace} card=${{ ...CARDS[id], kind: 'tactic' }} mini shop /></div>`)}
              </div>`}`}
        </section>

        <section class="panel shop-card shop-pane-cards" data-enter>
          <h2>Cartas tácticas</h2>
          ${CARD_LIST.map((c) => {
            const price = CARD_PRICE[c.rarity || 'common'];
            const packed = !run && pending.length >= PENDING_LIMIT;
            const can = shop.coins >= price && !packed;
            return html`<div class="shop-row">
              <span class="hand-card shop-mini" aria-hidden="true"><${CardFace} card=${{ ...c, kind: 'tactic' }} mini /></span>
              <div class="shop-info"><strong>${c.name}</strong><small>${c.desc}</small></div>
              <span class=${'gem ' + (c.rarity || 'common')} role="img" aria-label=${'Rareza ' + RARITY_LABEL[c.rarity || 'common']} title=${'Rareza: ' + RARITY_LABEL[c.rarity || 'common']}></span>
              <span class="price"><${Icon} name="coin" size=${14} />${price}</span>
              <button class="btn sm" disabled=${!can} title=${packed ? `El sobre ya tiene ${PENDING_LIMIT} cartas` : can ? '' : 'Faltan monedas'} onClick=${() => buyCard(c)}>Comprar</button>
            </div>`;
          })}
        </section>

        <section class="panel shop-card shop-pane-seeds" data-enter>
          <h2>Semillas</h2>
          <p class="shop-note">Una semilla por siembra en el Jardín Zen; también caen al ganar nodos de la travesía.</p>
          ${ZEN_KINDS.map((k) => {
            const can = shop.coins >= SEED_PRICE;
            return html`<div class="shop-row">
              <span class=${'mod-icon seed-icon zn-k-' + k}>${chipArt(k)}</span>
              <div class="shop-info"><strong>Semilla de ${ZEN_NAMES[k]}</strong><small>En la bolsa del jardín: ${seeds[k] || 0}.</small></div>
              <span class="price"><${Icon} name="coin" size=${14} />${SEED_PRICE}</span>
              <button class="btn sm" disabled=${!can} title=${can ? '' : 'Faltan monedas'} onClick=${() => buySeed(k)}>Comprar</button>
            </div>`;
          })}
        </section>

        <section class="panel shop-card shop-pane-mesas" data-enter>
          <h2>Mesas</h2>
          <p class="shop-note">Cuatro mesas de la casa se venden aquí; la comprada queda puesta.</p>
          <div class="theme-grid">
            ${Object.keys(THEME_SHOP).map((id) => {
              const t = THEMES[id], owned = themeOwned(id), on = settings.theme === id;
              return html`<button class=${'theme' + (on ? ' on' : '') + (owned ? ' owned' : '')} aria-pressed=${on} aria-label=${t.name}
                disabled=${!owned && shop.coins < THEME_SHOP[id]} title=${owned ? t.name : `Se compra por ${THEME_SHOP[id]} monedas`} onClick=${() => tapTheme(id)}>
                <span class="swatch">${t.swatch.map((c) => html`<i style=${{ background: c }}></i>`)}</span>
                ${owned ? (on ? 'En uso' : 'Usar') : html`<span class="price"><${Icon} name="coin" size=${13} />${THEME_SHOP[id]}</span>`}
              </button>`;
            })}
          </div>
        </section>
      </div>
    </div>
  </div>`;
}
