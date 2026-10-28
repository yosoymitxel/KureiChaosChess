// Partidas guionizadas en el navegador: monta tests/bench.html con una configuración exacta y sigue
// unos pasos (jugadas por casilla, cartas, teclas, mando simulado, capturas, comprobaciones).
//   node tools/play.mjs tests/scenes/dash.json            (todas las combinaciones de la escena)
//   node tools/play.mjs tests/scenes/dash.json --pc --art pixel --lang en --headed
// Sirve el repo él mismo (no hace falta http-server) y cambia el CDN por vendor/ (funciona sin red).
// Capturas y resumen en artifacts/play/<escena>/. Sale con 1 si falla una comprobación o hay errores.
//
// Escena: { "cfg": {...tests/bench.js} | "mini": "blizzard" (minijuego, con "diff"), "viewports": ["mobile","pc"], "themes": ["walnut","pixelada"],
//           "langs": ["es"], "steps": [...] }
// Pasos (uno por objeto):
//   {"move": "6,4>4,4"}         toca la pieza y luego el destino, como el jugador; espera a que acabe
//   {"tap": "6,4"}              toca una casilla (o pieza) sola
//   {"bot": true}               espera a que vuelva a ser turno humano (juega el bot)
//   {"card": "Paso doble"}      pulsa la carta cuyo nombre accesible contiene ese texto
//   {"click": "texto"}          pulsa el botón con ese texto · {"key": "Escape"} pulsa una tecla
//   {"pad": "a" | "b" | "x" | "y" | "up" | "down" | "left" | "right" | "start" | "l1" …}  mando simulado
//   {"settings": {"vfx": true}} cambia ajustes en caliente (como desde la pausa)
//   {"spy": ["shield", "aura"]} cuenta llamadas a esos efectos de Fx desde aquí
//   {"wait": 800} · {"shot": "nombre"} · {"eval": "bench.match.turn"} (imprime el resultado)
//   {"expect": {"fx": {"shield": 1}, "afterimages": 1, "text": "Victoria", "noErrors": true, "eval": "…"}}
//                                (números = mínimo; eval debe dar verdadero)
//   {"i18n": true}             busca texto visible en español cuando el idioma no es es
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, basename, resolve } from 'node:path';

// require y no import: así también encuentra un Playwright instalado de forma global.
const { chromium } = createRequire(import.meta.url)('playwright');
const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const file = args.find((a) => a.endsWith('.json'));
if (!file) { console.log('Uso: node tools/play.mjs tests/scenes/<escena>.json [--pc|--mobile] [--art pixel|normal] [--theme id] [--lang en] [--headed]'); process.exit(2); }
const scene = JSON.parse(await readFile(file, 'utf8'));
const name = basename(file, '.json');
const out = opt('out') || join('artifacts', 'play', name);
await mkdir(out, { recursive: true });

const VIEWPORTS = { mobile: { width: 360, height: 800, hasTouch: true, isMobile: true }, pc: { width: 1366, height: 768 } };
let viewports = scene.viewports || ['mobile'];
if (flag('pc')) viewports = ['pc']; if (flag('mobile')) viewports = ['mobile'];
let themes = scene.themes || [scene.cfg?.theme || 'walnut'];
if (opt('theme')) themes = [opt('theme')];
if (opt('art')) themes = [opt('art') === 'pixel' ? 'pixelada' : 'walnut'];
const langs = opt('lang') ? [opt('lang')] : scene.langs || [scene.cfg?.lang || 'es'];

// Servidor estático mínimo del repo.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
const root = resolve('.');
const server = createServer(async (req, res) => {
  const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try { const body = await readFile(path.endsWith('/') ? join(path, 'index.html') : path); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const VENDOR = [['hooks', 'preact-hooks.module.js'], ['preact', 'preact.module.js'], ['htm', 'htm.module.js'], ['anime', 'anime.esm.min.js'], ['motion', 'motion.esm.js']];

// Mando falso: navigator.getGamepads devuelve uno cuyos botones pulsa window.pad.press(i).
const PAD_INIT = () => {
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
  const pad = { id: 'Xbox Wireless Controller (bench)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons, timestamp: 0 };
  let on = false;
  navigator.getGamepads = () => (on ? [pad] : []);
  window.pad = {
    async press(i, ms = 90) {
      if (!on) { on = true; dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: pad })); await new Promise((r) => setTimeout(r, 50)); }
      buttons[i].pressed = true; buttons[i].value = 1; pad.timestamp++;
      await new Promise((r) => setTimeout(r, ms));
      buttons[i].pressed = false; buttons[i].value = 0; pad.timestamp++;
      await new Promise((r) => setTimeout(r, 60));
    },
  };
};
const PAD = { a: 0, b: 1, x: 2, y: 3, l1: 4, r1: 5, l2: 6, r2: 7, select: 8, start: 9, up: 12, down: 13, left: 14, right: 15 };
// Palabras que delatan español sin traducir (con acento o muy comunes en la interfaz).
const SPANISH = /[áéíóúñ¿¡]|\b(el|los|las|tu|tus|una|turno|pieza|piezas|jugada|partida|carta|cartas|ganas|pierdes|volver|menú)\b/i;

const browser = await chromium.launch({ headless: !flag('headed') });
const report = [];
let failed = 0;
for (const vp of viewports) for (const theme of themes) for (const lang of langs) {
  const tag = `${vp}-${theme}-${lang}`;
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], viewport: { width: VIEWPORTS[vp].width, height: VIEWPORTS[vp].height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(PAD_INIT);
  await page.route(/cdn\.jsdelivr\.net/, (r) => { const u = r.request().url(); r.fulfill({ path: 'vendor/' + VENDOR.find(([k]) => u.includes(k))[1], contentType: 'text/javascript' }); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '', contentType: 'text/css' }));
  const errors = [], log = (m) => { report.push(`[${tag}] ${m}`); console.log(`[${tag}] ${m}`); };
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/favicon|404/.test(m.text()) && errors.push(m.text()));
  const fail = (m) => { failed++; log('FALLA ' + m); };

  const cfg = { ...scene.cfg, theme, lang };
  if (scene.mini) {
    // Minijuego: su banco (tests/visual.html). Valen los pasos de botones, teclas, mando, capturas y comprobaciones.
    await page.addInitScript((s) => localStorage.setItem('zugzwang.settings.v2', JSON.stringify(s)), { ...scene.cfg?.settings, lang });
    await page.goto(`${base}/tests/visual.html?mini=${scene.mini}&theme=${theme}&diff=${scene.diff || 'normal'}`);
    await page.waitForTimeout(1500);
  } else {
    await page.goto(`${base}/tests/bench.html?cfg=${encodeURIComponent(JSON.stringify(cfg))}`);
    await page.waitForFunction(() => window.bench?.view, null, { timeout: 15000 }).catch(() => fail('el banco no montó la partida'));
  }
  const idle = () => scene.mini ? page.waitForTimeout(300) : page.waitForFunction(() => window.bench && !window.bench.busy && window.bench.match.player.kind === 'human' && !window.bench.match.over, null, { timeout: 30000 }).catch(() => log('aviso: no volvió a ser turno humano'));
  const tapCell = async (cell) => {
    const [r, c] = cell.split(',').map(Number);
    const box = await page.evaluate(([r, c]) => {
      const v = window.bench.view, p = window.bench.match.pieceAt(r, c), el = (p && v.els.get(p)?.querySelector('.pc-fig')) || v.tiles.get(r + ',' + c);
      const b = el?.getBoundingClientRect(); return b && { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }, [r, c]);
    if (!box) return fail(`no hay casilla ${cell}`);
    if (VIEWPORTS[vp].hasTouch) await page.touchscreen.tap(box.x, box.y); else await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(120);
  };
  await idle();

  for (const step of scene.steps || []) {
    const [kind, val] = Object.entries(step)[0];
    try {
      if (kind === 'move') { const [a, b] = val.split('>'); await tapCell(a); await tapCell(b); await page.waitForTimeout(150); await idle(); }
      else if (kind === 'tap') await tapCell(val);
      else if (kind === 'bot') await idle();
      else if (kind === 'card') { await page.locator('.hand-card', { hasText: new RegExp(val, 'i') }).first().click(); await page.waitForTimeout(300); await idle(); }
      else if (kind === 'click') { await page.getByRole('button', { name: new RegExp(val, 'i') }).first().click(); await page.waitForTimeout(300); }
      else if (kind === 'key') { await page.keyboard.press(val); await page.waitForTimeout(200); }
      else if (kind === 'pad') { await page.evaluate((i) => window.pad.press(i), PAD[val]); await page.waitForTimeout(150); }
      else if (kind === 'settings') await page.evaluate((s) => { const v = window.bench.view; if ('vfx' in s) v.setVfx(s.vfx); if ('speed' in s) v.speed = s.speed; if ('shake' in s) v.shakeOn = s.shake; }, val);
      else if (kind === 'wait') await page.waitForTimeout(val);
      else if (kind === 'shot') { await page.screenshot({ path: join(out, `${tag}-${val}.png`) }); log('captura ' + val); }
      else if (kind === 'eval') log(`${val} → ${JSON.stringify(await page.evaluate(val))}`);
      else if (kind === 'spy') await page.evaluate(async (names) => {
        const { Fx } = await import('/src/view/fx.js');
        window.spy = { afterimages: 0 };
        for (const k of names) { const o = Fx.prototype[k]; Fx.prototype[k] = function (...a) { if (this.vfx) window.spy[k] = (window.spy[k] || 0) + 1; return o.apply(this, a); }; }
        new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.classList?.contains('afterimage') && window.spy.afterimages++))).observe(document.body, { childList: true, subtree: true });
      }, val);
      else if (kind === 'expect') {
        const spy = await page.evaluate(() => window.spy || {});
        for (const [k, min] of Object.entries(val.fx || {})) (spy[k] || 0) >= min ? log(`ok fx.${k} = ${spy[k]}`) : fail(`fx.${k} = ${spy[k] || 0} (mínimo ${min})`);
        if (val.afterimages != null) (spy.afterimages || 0) >= val.afterimages ? log(`ok estelas = ${spy.afterimages}`) : fail(`estelas = ${spy.afterimages || 0}`);
        if (val.text) (await page.getByText(val.text).count()) ? log(`ok texto «${val.text}»`) : fail(`no aparece «${val.text}»`);
        if (val.eval) (await page.evaluate(val.eval)) ? log(`ok ${val.eval}`) : fail(`falso: ${val.eval}`);
        if (val.noErrors) errors.length ? fail('errores: ' + errors.join(' | ')) : log('ok sin errores');
      } else if (kind === 'i18n') {
        if (lang === 'es') continue;
        const texts = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && e.offsetParent && e.textContent.trim()).map((e) => e.textContent.trim()));
        const bad = [...new Set(texts.filter((s) => SPANISH.test(s)))];
        bad.length ? fail(`texto sin traducir: ${bad.slice(0, 8).join(' · ')}`) : log('ok sin español visible');
      } else fail('paso desconocido: ' + kind);
    } catch (e) { fail(`${kind}: ${e.message.split('\n')[0]}`); }
  }
  if (errors.length) fail('errores de página: ' + [...new Set(errors)].slice(0, 5).join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
await writeFile(join(out, 'resumen.txt'), report.join('\n') + '\n');
console.log(failed ? `${failed} fallos · ${out}` : `todo ok · ${out}`);
process.exit(failed ? 1 : 0);
