// Jardín de Agua: estanque solo de agua, plantas acuáticas, koi como centro de experiencia
// y barquitos (papel y varios tipos) con carreras de minijuego. Pantalla que reusa Pond y koi.
import { html, useState, useEffect, useRef, useCallback } from '../lib.js';
import { Icon } from '../icons.js';
import {
  loadWaterGarden, saveWaterGarden,
  waterPlant, waterPlantWater, waterHarvest, waterPlantStage,
  buyKoi, feedKoi, koiPassiveXP, breedKoi,
  buyBoat, moveBoat, setBoatTarget, boatsStep, useNet, useBait, addWaterTool,
  startRace, expandWater, buyWaterItem,
  takePhoto, playWaterSound,
} from '../../game/watergarden.js';
import {
  WATER_PLANTS, KOI_KINDS_DATA, BOAT_KINDS_DATA, WATER_TOOLS,
  blankWaterGarden, waterCellKey, parseWaterKey, inWaterGrid, isWater,
  WATER_LEVEL_COST, WATER_MAX_SIZE, WATER_BASE_SIZE, KOI_HUNGER_MS, RACE_ENTRY_COST, RACE_WIN_PRIZE,
  waterLevelFor, xpToNext,
  KOI_BREED_COST, KOI_BREED_SUCCESS_CHANCE, GALLERY_MAX_PHOTOS, PHOTO_COST, WATER_SOUNDS,
} from '../../data/watergarden.js';
import { award } from '../../game/achievements.js';
import { Pond } from '../../view/pond.js';
import { t } from '../../i18n/index.js';

const CELL = 16;

const plantInfo = (kind) => {
  const p = WATER_PLANTS[kind];
  return p ? { name: p.name, price: p.price, color: p.rarity === 'Épica' ? '#c084fc' : p.rarity === 'Legendaria' ? '#fbbf24' : '#34d399' } : null;
};
const koiInfo = (kind) => {
  const k = KOI_KINDS_DATA[kind];
  return k ? { name: k.name, price: k.price, color: k.color, rarity: k.rarity } : null;
};
const boatInfo = (kind) => {
  const b = BOAT_KINDS_DATA[kind];
  return b ? { name: b.name, price: b.price, speed: b.speed } : null;
};

// Ruta del sprite píxel de cada tipo.
const spritePath = (name) => `assets/zen/${name}.png`;

export function WaterGardenScreen({ onBack, onShop }) {
  const [z, setZ] = useState(loadWaterGarden);
  const [tab, setTab] = useState('estanque'); // estanque | tienda | barcos | galeria
  const [mode, setMode] = useState(null); // 'plant' | 'water' | 'harvest' | 'feed' | 'move' | 'net' | 'bait' | 'breed'
  const [selected, setSelected] = useState(null); // key de planta/koi/barco seleccionado
  const [breedSel, setBreedSel] = useState([]); // ids de koi seleccionados para cría
  const [msg, setMsg] = useState(null);
  const canvasRef = useRef(null);
  const pondRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => { saveWaterGarden(z); }, [z]);

  // ---------- Sonido ----------
  useEffect(() => {
    const onSound = (e) => {
      const { src } = e.detail;
      try {
        const au = new Audio(src);
        au.volume = 0.6;
        au.play().catch(() => {});
      } catch {}
    };
    window.addEventListener('zugzwang:water:sound', onSound);
    return () => window.removeEventListener('zugzwang:water:sound', onSound);
  }, []);

  // ---------- Estanque y bucle ----------
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = z.size * CELL, H = z.size * CELL;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    const inside = (x, y) => {
      const r = Math.floor(y / CELL), c = Math.floor(x / CELL);
      return inWaterGrid(z, r, c) && isWater(z, waterCellKey(r, c));
    };

    const pads = Object.entries(z.plants || {}).map(([key, plant]) => {
      const [r, c] = parseWaterKey(key);
      return [c * CELL + CELL / 2, r * CELL + CELL / 2, CELL * 0.35];
    });

    const pond = new Pond(cv, { size: [W, H], inside, count: z.kois.length || 2, len: 6, speed: 2, pads, lotus: null, duckweed: 0 });
    pondRef.current = pond;

    const kois = z.kois.map((k) => {
      if (k.key && isWater(z, k.key)) {
        const [r, c] = parseWaterKey(k.key);
        return { ...k, x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 };
      }
      return k;
    });

    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        const next = koiPassiveXP(z, dt);
        setZ(next);
        const next2 = boatsStep(next, dt);
        setZ(next2);
        pond.step(dt, now / 1000);
        pond.draw(now / 1000, false);
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [z.size]);

  // ---------- Acciones del estanque ----------
  const onTapCanvas = useCallback((ev) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    const r = Math.floor(y / CELL), c = Math.floor(x / CELL);
    const key = waterCellKey(r, c);
    if (!inWaterGrid(z, r, c) || !isWater(z, key)) return;

    if (mode === 'plant' && selected) {
      const nz = waterPlant(z, key, selected);
      if (nz === z) { setMsg('No se puede plantar aquí o no tienes monedas.'); return; }
      setZ(nz); setMode(null); setSelected(null);
      return;
    }
    if (mode === 'water') {
      const nz = waterPlantWater(z, key);
      if (nz === z) { setMsg('No hay planta que regar o ya tiene agua.'); return; }
      setZ(nz); return;
    }
    if (mode === 'harvest') {
      const nz = waterHarvest(z, key);
      if (nz === z) { setMsg('No hay flor lista para cortar.'); return; }
      setZ(nz); if (Object.keys(nz.harvested || {}).length >= Object.keys(WATER_PLANTS).length) award('agua_flora_all');
      setMsg('Flor cosechada.');
      return;
    }
    if (mode === 'net') {
      const idx = (z.leaves || []).findIndex((l) => Math.hypot(l.x * CELL - x, l.y * CELL - y) < CELL * 0.6);
      if (idx >= 0) { const nz = useNet(z, idx); setZ(nz); if (nz.leavesCleaned >= 10) award('agua_red'); setMsg('Hoja limpiada: +1 moneda.'); return; }
      setMsg('No hay hoja aquí.');
      return;
    }
    if (mode === 'bait') {
      setZ(useBait(z)); playWaterSound('feed');
      setMsg('Cebo lanzado: los koi vendrán a comer.');
      return;
    }
    if (mode === 'breed') {
      // Seleccionar dos koi para cría.
      const koi = z.kois.find((k) => k.key === key);
      if (!koi) { setMsg('No hay koi aquí.'); return; }
      const sel = [...breedSel];
      if (sel.includes(koi.id)) {
        setBreedSel(sel.filter((id) => id !== koi.id));
        return;
      }
      if (sel.length >= 2) { setMsg('Ya seleccionaste dos koi.'); return; }
      setBreedSel([...sel, koi.id]);
      if ([...sel, koi.id].length === 2) {
        const [idA, idB] = [...sel, koi.id];
        const nz = breedKoi(z, idA, idB);
        setZ(nz.z);
        setBreedSel([]);
        setMode(null);
        setMsg(nz.msg);
        if (nz.bred) { award('agua_koi_crianza'); playWaterSound('breed'); }
        return;
      }
      setMsg(`Koi seleccionado: ${koiInfo(koi.kind).name}. Selecciona otro del mismo tipo.`);
      return;
    }
    // Tap normal: alimentar koi si hay uno aquí.
    const koi = z.kois.find((k) => k.key === key);
    if (koi) {
      const nz = feedKoi(z, koi.id);
      setZ(nz);
      setMsg(`${koiInfo(koi.kind).name} comió: +5 XP`);
      return;
    }
    setMsg('Toca el agua para interactuar.');
  }, [z, mode, selected, breedSel]);

  // ---------- Compras ----------
  const buyPlant = (kind) => {
    const p = WATER_PLANTS[kind];
    if (z.coins < p.price) { setMsg('No tienes suficientes monedas.'); return; }
    setMode('plant'); setSelected(kind); setMsg(`Toca una casilla de agua para plantar ${p.name}.`);
  };
  const buyKoiKind = (kind) => {
    const nz = buyKoi(z, kind);
    if (nz === z) { setMsg('No hay espacio en el agua o no tienes monedas.'); return; }
    setZ(nz); award('agua_koi_1');
    const kinds = new Set(nz.kois.map((k) => k.kind));
    if (kinds.size >= Object.keys(KOI_KINDS_DATA).length) award('agua_koi_all');
  };
  const buyBoatKind = (kind) => {
    const nz = buyBoat(z, kind);
    if (nz === z) { setMsg('No tienes suficientes monedas.'); return; }
    setZ(nz);
    if (kind === 'papel') {
      const papeles = nz.boats.filter((b) => b.kind === 'papel').length;
      if (papeles >= 3) award('agua_barco_papel');
    }
  };
  const buyTool = (id) => {
    const t = WATER_TOOLS[id];
    if (z.coins < t.price) { setMsg('No tienes suficientes monedas.'); return; }
    setZ({ ...z, coins: z.coins - t.price, tools: { ...z.tools, [id]: (z.tools[id] || 0) + 1 } });
    setMode(id === 'red' ? 'net' : id === 'cebo' ? 'bait' : id === 'camara' ? null : null);
    if (id === 'red') setMsg('Modo red: toca una hoja flotante para limpiarla.');
    else if (id === 'cebo') setMsg('Modo cebo: toca el agua para atraer koi.');
    else if (id === 'camara') { setZ(takePhoto(z)); setMsg('Foto tomada.'); }
    else setMsg('Herramienta comprada.');
  };
  const expand = () => {
    const nz = expandWater(z);
    if (nz === z) { setMsg('El estanque está al máximo o no tienes monedas.'); return; }
    setZ(nz);
    if (nz.size >= WATER_MAX_SIZE) award('agua_estanque_max');
  };

  // ---------- Carreras ----------
  const onRace = (boatId) => {
    if (z.coins < RACE_ENTRY_COST) { setMsg(`Se necesitan ${RACE_ENTRY_COST} monedas para correr.`); return; }
    const { z: nz, raced, won, timeSec } = startRace(z, boatId);
    if (!raced) { setMsg('No se pudo iniciar la carrera.'); return; }
    setZ(nz);
    playWaterSound('race');
    setMsg(won ? `¡Ganaste en ${timeSec.toFixed(1)} s! +${RACE_WIN_PRIZE} monedas.` : `Perdiste la carrera.`);
    if (won) {
      award('agua_carrera_1');
      if (nz.racesWon >= 10) award('agua_carrera_10');
    }
  };

  // ---------- Galería ----------
  const onPhoto = () => {
    const nz = takePhoto(z);
    if (nz.photo) {
      setZ(nz.z);
      playWaterSound('camera');
      award('agua_foto_1');
      if ((z.photos || []).length + 1 >= GALLERY_MAX_PHOTOS) award('agua_galeria_llena');
      setMsg('Foto guardada en la galería.');
    } else {
      setMsg(nz.msg);
    }
  };

  const coins = z.coins | 0;
  const xp = z.xp | 0;
  const level = z.level || 1;
  const xpNext = xpToNext(level);

  return html`
    <section class="screen watergarden" tabindex="0">
      <header class="watergarden-head">
        <button class="icon-btn" onClick=${onBack}><${Icon} name="back" size=${20} /></button>
        <h1>${t('menu.agua', 'Jardín de Agua')}</h1>
        <div class="watergarden-stats">
          <div class="stat"><span class="label">Monedas</span><span class="value">${coins}</span></div>
          <div class="stat"><span class="label">Nivel</span><span class="value">${level}</span></div>
          <div class="stat"><span class="label">XP</span><span class="value">${xp} / ${xpNext}</span></div>
          <div class="stat"><span class="label">Koi</span><span class="value">${z.kois.length}</span></div>
          <div class="stat"><span class="label">Barcos</span><span class="value">${z.boats.length}</span></div>
          <div class="stat"><span class="label">Fotos</span><span class="value">${(z.photos || []).length} / ${GALLERY_MAX_PHOTOS}</span></div>
        </div>
      </header>

      <nav class="watergarden-tabs">
        <button class=${'tab ' + (tab === 'estanque' ? 'active' : '')} onClick=${() => { setTab('estanque'); setMode(null); setSelected(null); setBreedSel([]); }}>
          <${Icon} name="drop" size=${18} /> Estanque
        </button>
        <button class=${'tab ' + (tab === 'tienda' ? 'active' : '')} onClick=${() => setTab('tienda')}>
          <${Icon} name="seed" size=${18} /> Tienda
        </button>
        <button class=${'tab ' + (tab === 'barcos' ? 'active' : '')} onClick=${() => setTab('barcos')}>
          🚤 Barcos
        </button>
        <button class=${'tab ' + (tab === 'galeria' ? 'active' : '')} onClick=${() => setTab('galeria')}>
          <${Icon} name="bag" size=${18} /> Galería
        </button>
      </nav>

      ${tab === 'estanque' && html`
        <div class="watergarden-pond-wrap">
          <canvas ref=${canvasRef} class="watergarden-canvas" onPointerdown=${onTapCanvas}></canvas>
          ${mode && html`<div class="watergarden-mode-hint">Modo: ${mode}</div>`}
          ${msg && html`<div class="watergarden-msg">${msg}</div>`}
        </div>

        <div class="watergarden-actions">
          ${Object.entries(WATER_PLANTS).map(([kind, p]) => html`
            <button class="btn plant" title=${p.name} onClick=${() => buyPlant(kind)}>
              <img src=${spritePath(`plant_${kind}`)} class="sprite" alt=${p.name} />
              ${p.name} <span class="price">${p.price}</span>
            </button>
          `)}
          ${Object.entries(KOI_KINDS_DATA).map(([kind, k]) => html`
            <button class="btn koi" title=${k.name} onClick=${() => buyKoiKind(kind)}>
              <img src=${spritePath(`koi_${kind}`)} class="sprite" alt=${k.name} />
              ${k.name} <span class="price">${k.price}</span>
            </button>
          `)}
          <button class="btn breed" onClick=${() => {
            setMode('breed'); setSelected(null);
            setMsg('Selecciona dos koi del mismo tipo en el estanque para criar.');
          }}>
            <${Icon} name="drop" size=${18} /> Cría de koi (${KOI_BREED_COST})
          </button>
          <button class="btn water" onClick=${() => setMode('water')}>
            <${Icon} name="drop" size=${18} /> Regar
          </button>
          <button class="btn harvest" onClick=${() => setMode('harvest')}>
            <${Icon} name="shears" size=${18} /> Cosechar
          </button>
          <button class="btn photo" onClick=${onPhoto}>
            <${Icon} name="bag" size=${18} /> Foto (${PHOTO_COST})
          </button>
          <button class="btn expand" onClick=${expand}>
            <${Icon} name="expand" size=${18} /> Agrandar estanque (${WATER_LEVEL_COST(z.size)})
          </button>
        </div>

        ${breedSel.length > 0 && html`
          <div class="breed-select">
            <strong>Seleccionados para cría:</strong>
            ${breedSel.map((id) => {
              const k = z.kois.find((x) => x.id === id);
              return k ? html`<span class="chip">${koiInfo(k.kind).name}</span>` : null;
            })}
            ${breedSel.length === 2 && html`<button class="btn confirm" onClick=${() => {
              const [idA, idB] = breedSel;
              const nz = breedKoi(z, idA, idB);
              setZ(nz.z);
              setBreedSel([]);
              setMode(null);
              setMsg(nz.msg);
              if (nz.bred) { award('agua_koi_crianza'); playWaterSound('breed'); }
            }}>Criar</button>`}
          </div>
        `}

        <div class="watergarden-kois">
          <h3>Koi del estanque</h3>
          <div class="koi-list">
            ${z.kois.map((k) => {
              const ki = koiInfo(k.kind);
              const hungry = Date.now() - (k.hungerT || 0) >= KOI_HUNGER_MS;
              const isBreedSel = breedSel.includes(k.id);
              return html`
                <div class="koi-item ${hungry ? 'hungry' : ''} ${isBreedSel ? 'breed-sel' : ''}" onClick=${() => {
                  if (mode === 'breed') {
                    const sel = [...breedSel];
                    if (sel.includes(k.id)) { setBreedSel(sel.filter((id) => id !== k.id)); return; }
                    if (sel.length >= 2) { setMsg('Ya seleccionaste dos koi.'); return; }
                    setBreedSel([...sel, k.id]);
                    if ([...sel, k.id].length === 2) {
                      const [idA, idB] = [...sel, k.id];
                      const nz = breedKoi(z, idA, idB);
                      setZ(nz.z);
                      setBreedSel([]);
                      setMode(null);
                      setMsg(nz.msg);
                      if (nz.bred) { award('agua_koi_crianza'); playWaterSound('breed'); }
                    }
                    return;
                  }
                  const nz = feedKoi(z, k.id);
                  setZ(nz);
                  setMsg(`${ki.name} comió: +5 XP`);
                }}>
                  <img src=${spritePath(`koi_${k.kind}`)} class="sprite koi-sprite" alt=${ki.name} />
                  <div class="koi-info">
                    <div class="koi-name">${ki.name}</div>
                    <div class="koi-stats">Nivel ${k.level || 1} · XP ${(k.xp | 0)}</div>
                    ${hungry && html`<div class="koi-hungry">Tiene hambre</div>`}
                  </div>
                  <button class="btn feed" onClick=${(ev) => { ev.stopPropagation(); const nz = feedKoi(z, k.id); setZ(nz); setMsg(`${ki.name} comió: +5 XP`); }}>
                    <${Icon} name="drop" size=${16} />
                  </button>
                </div>
              `;
            })}
          </div>
          ${z.kois.length === 0 && html`<p class="empty">Aún no hay koi. Compra uno en la tienda.</p>`}
        </div>
      `}

      ${tab === 'tienda' && html`
        <div class="watergarden-shop">
          <h3>Plantas acuáticas</h3>
          <div class="shop-grid">
            ${Object.entries(WATER_PLANTS).map(([kind, p]) => html`
              <div class="shop-item">
                <img src=${spritePath(`plant_${kind}`)} class="sprite" alt=${p.name} />
                <div class="info">
                  <div class="name">${p.name}</div>
                  <div class="desc">${p.desc}</div>
                </div>
                <button class="btn buy" onClick=${() => buyPlant(kind)}>${p.price} <${Icon} name="coin" size=${16} /></button>
              </div>
            `)}
          </div>

          <h3>Peces koi</h3>
          <div class="shop-grid">
            ${Object.entries(KOI_KINDS_DATA).map(([kind, k]) => html`
              <div class="shop-item">
                <img src=${spritePath(`koi_${kind}`)} class="sprite" alt=${k.name} />
                <div class="info">
                  <div class="name">${k.name} <span class="rarity">${k.rarity}</span></div>
                  <div class="desc">XP pasivo: ${k.xpPerSec} / seg</div>
                </div>
                <button class="btn buy" onClick=${() => buyKoiKind(kind)}>${k.price} <${Icon} name="coin" size=${16} /></button>
              </div>
            `)}
          </div>

          <h3>Barquitos</h3>
          <div class="shop-grid">
            ${Object.entries(BOAT_KINDS_DATA).map(([kind, b]) => html`
              <div class="shop-item">
                <img src=${spritePath(`boat_${kind}`)} class="sprite" alt=${b.name} />
                <div class="info">
                  <div class="name">${b.name}</div>
                  <div class="desc">${b.desc}</div>
                </div>
                <button class="btn buy" onClick=${() => buyBoatKind(kind)}>${b.price} <${Icon} name="coin" size=${16} /></button>
              </div>
            `)}
          </div>

          <h3>Herramientas</h3>
          <div class="shop-grid">
            ${Object.entries(WATER_TOOLS).map(([id, tool]) => html`
              <div class="shop-item">
                <div class="chip">🛠️</div>
                <div class="info">
                  <div class="name">${tool.name}</div>
                  <div class="desc">${tool.desc}</div>
                </div>
                <button class="btn buy" onClick=${() => buyTool(id)}>${tool.price} <${Icon} name="coin" size=${16} /></button>
              </div>
            `)}
          </div>
        </div>
      `}

      ${tab === 'barcos' && html`
        <div class="watergarden-boats">
          <h3>Tus barquitos</h3>
          <div class="boat-list">
            ${z.boats.map((b) => {
              const bi = boatInfo(b.kind);
              return html`
                <div class="boat-item" onClick=${() => {
                  setMode('move'); setSelected(b.id);
                  setMsg('Toca el agua para mover este barco.');
                }}>
                  <img src=${spritePath(`boat_${b.kind}`)} class="sprite boat-sprite" alt=${bi.name} />
                  <div class="boat-info">
                    <div class="boat-name">${bi.name}</div>
                    <div class="boat-stats">Velocidad ${bi.speed} · Desgaste ${(b.wear || 0)} / ${BOAT_WEAR_MAX}</div>
                  </div>
                  <button class="btn race" onClick=${(ev) => { ev.stopPropagation(); onRace(b.id); }}>
                    <${Icon} name="ship" size=${16} /> Correr
                  </button>
                </div>
              `;
            })}
          </div>
          ${z.boats.length === 0 && html`<p class="empty">No tienes barquitos. Compra uno en la tienda.</p>`}

          <h3>Comprar barcos</h3>
          <div class="shop-grid">
            ${Object.entries(BOAT_KINDS_DATA).map(([kind, b]) => html`
              <div class="shop-item">
                <img src=${spritePath(`boat_${kind}`)} class="sprite" alt=${b.name} />
                <div class="info">
                  <div class="name">${b.name}</div>
                  <div class="desc">${b.desc}</div>
                </div>
                <button class="btn buy" onClick=${() => buyBoatKind(kind)}>${b.price} <${Icon} name="coin" size=${16} /></button>
              </div>
            `)}
          </div>

          <div class="race-banner">
            <h3>Carreras de barquitos</h3>
            <p>Elige un barco y pulsa "Correr". Gana la carrera para obtener ${RACE_WIN_PRIZE} monedas. Entrada: ${RACE_ENTRY_COST} monedas.</p>
          </div>
        </div>
      `}

      ${tab === 'galeria' && html`
        <div class="watergarden-gallery">
          <h3>Galería del estanque</h3>
          <p>Toca "Foto" en la pestaña Estanque para guardar una instantánea (${PHOTO_COST} monedas cada una).</p>
          <div class="photo-grid">
            ${(z.photos || []).slice().reverse().map((photo) => html`
              <div class="photo-item">
                <img src=${spritePath('estanque')} class="photo" alt="Foto del estanque" />
                <div class="photo-info">
                  <div class="photo-date">${new Date(photo.takenT).toLocaleDateString()}</div>
                  <div class="photo-stats">${photo.koiCount} koi · ${photo.plantCount} plantas · ${photo.boatCount} barcos</div>
                </div>
              </div>
            `)}
            ${(z.photos || []).length === 0 && html`<p class="empty">Aún no hay fotos. Toma una en la pestaña Estanque.</p>`}
          </div>
        </div>
      `}

      <footer class="watergarden-foot">
        <button class="btn back" onClick=${onBack}><${Icon} name="back" size=${18} /> Volver al menú</button>
      </footer>
    </section>
  `;
}
