import { chromium } from 'playwright';

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:8123';
const turnGames = [
  'micro','battle','zombie','bomb','gravity','boss','arena','cards','infinite','mayhem',
  'boss2','randarmy','giant','potato','horde','speed','pqueen','ppawn','horse','invis','drunk',
  'chicken','bullet','anti'
];
const arcades = ['pdodge','parkour','blaster','rampage','panic','queen'];
const failures = [];
const browser = await chromium.launch({headless:true});

async function snapshot(page) {
  return page.locator('#apk-board .pc.side-light').evaluateAll(els =>
    els.map(el => [el.dataset.pid, el.style.transform])
  );
}

async function assertMoved(page, before, label) {
  await page.waitForFunction(previous => {
    const now = new Map([...document.querySelectorAll('#apk-board .pc')].map(el => [el.dataset.pid, el.style.transform]));
    return previous.some(([id, transform]) => !now.has(id) || now.get(id) !== transform);
  }, before, {timeout:8000});
  const status = await page.locator('.apk-status').textContent();
  if ((status || '').includes('Falló')) throw new Error(label + ': ' + status);
}

async function playTurn(page, id) {
  await page.goto(`${base}/tests/apk-lab.html?game=${id}&theme=walnut`, {waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.apk-proto').waitFor({timeout:15000});
  await page.locator('#apk-board .pc').first().waitFor({timeout:15000});

  if (id === 'horde') {
    for (const type of ['knight','bishop','rook']) {
      await page.getByRole('button', {name:`Elegir ${type}`}).click({timeout:7000});
    }
    await page.waitForFunction(() => /Partida lista/.test(document.querySelector('.apk-status')?.textContent || ''), undefined, {timeout:7000});
    await page.getByRole('button', {name:'Invocar oleada 1'}).click({timeout:7000});
    await page.locator('#apk-board .pc.side-dark').first().waitFor({timeout:7000});
  } else {
    await page.waitForFunction(() => /Partida lista/.test(document.querySelector('.apk-status')?.textContent || ''), undefined, {timeout:15000});
  }

  const pieces = page.locator('#apk-board .pc.side-light');
  const count = await pieces.count();
  for (let i=0; i<count; i++) {
    const piece = pieces.nth(i);
    const before = await snapshot(page);
    await piece.click({force:true,timeout:4000});
    await page.waitForTimeout(80);
    const targets = page.locator('#apk-board .tile.mv, #apk-board .tile.cap');
    if (await targets.count() > 0) {
      await targets.first().click({force:true,timeout:4000});
      await assertMoved(page,before,id);
      return;
    }
  }
  throw new Error(id + ': ninguna pieza del jugador mostró un movimiento seleccionable');
}

async function playArcade(page, id) {
  await page.goto(`${base}/tests/apk-lab.html?game=${id}&theme=walnut`, {waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.apk-proto').waitFor({timeout:15000});
  await page.locator('#apk-board .pc.side-light').first().waitFor({timeout:15000});
  const before = await snapshot(page);
  const target = page.locator('#apk-board .tile.mv').first();
  await target.waitFor({timeout:8000});
  await target.click({force:true,timeout:4000});
  await assertMoved(page,before,id);
}

async function playDodge(page) {
  await page.goto(`${base}/tests/apk-lab.html?game=dodge&theme=walnut`, {waitUntil:'domcontentloaded',timeout:45000});
  const safeMoves = page.locator('#apk-board .tile.mv:not(.doom):not(.block)');
  await safeMoves.first().waitFor({timeout:15000});
  await safeMoves.first().click({force:true});
  await page.waitForFunction(() => /Ronda 2/.test(document.querySelector('.apk-status')?.textContent || ''), {timeout:10000});
}

async function playFeast(page) {
  await page.goto(`${base}/tests/apk-lab.html?game=feast&theme=walnut`, {waitUntil:'domcontentloaded',timeout:45000});
  await page.getByRole('button',{name:'Iniciar reloj'}).waitFor({timeout:15000});
  await page.getByRole('button',{name:'Iniciar reloj'}).click();
  const before = await snapshot(page);
  await page.locator('#apk-board .tile.mv').first().click({force:true,timeout:7000});
  await assertMoved(page,before,'feast');
}

async function playRace(page) {
  await page.goto(`${base}/tests/apk-lab.html?game=race&theme=walnut`, {waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#apk-board .pc.side-light').first().waitFor({timeout:15000});
  const pawn = page.locator('#apk-board .pc.side-light').first();
  await pawn.click({force:true});
  const roll = page.getByRole('button',{name:/Tirar dado/});
  let ready = false;
  for (let attempt=0;attempt<4&&!ready;attempt++) {
    if (await roll.isDisabled()) await page.waitForTimeout(350);
    else await roll.click({timeout:5000});
    try { await page.locator('#apk-board .tile.mv').first().waitFor({timeout:2500});ready=true; }
    catch { ready=false; }
  }
  if (!ready) throw new Error('race: el dado no produjo un destino jugable en cuatro intentos');
  const before = await snapshot(page);
  await page.locator('#apk-board .tile.mv').first().click({force:true});
  await assertMoved(page,before,'race');
}

try {
  const page = await browser.newPage({viewport:{width:1366,height:900}});
  page.on('pageerror', error => failures.push({game:'browser',error:error.message}));
  for (const id of turnGames) {
    try { await playTurn(page,id); console.log('APK_TURN_OK '+id); }
    catch (error) { failures.push({game:id,error:String(error)}); console.error('APK_TURN_FAIL '+id+' '+error); }
  }
  for (const id of arcades) {
    try { await playArcade(page,id); console.log('APK_ARCADE_OK '+id); }
    catch (error) { failures.push({game:id,error:String(error)}); console.error('APK_ARCADE_FAIL '+id+' '+error); }
  }
  try { await playDodge(page); console.log('APK_MINI_OK dodge'); }
  catch (error) { failures.push({game:'dodge',error:String(error)}); console.error('APK_MINI_FAIL dodge '+error); }
  try { await playFeast(page); console.log('APK_MINI_OK feast'); }
  catch (error) { failures.push({game:'feast',error:String(error)}); console.error('APK_MINI_FAIL feast '+error); }
  try { await playRace(page); console.log('APK_MINI_OK race'); }
  catch (error) { failures.push({game:'race',error:String(error)}); console.error('APK_MINI_FAIL race '+error); }
  await page.close();
  const mobile = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  for (const id of ['pqueen','boss2','horde','pdodge','parkour','rampage','panic']) {
    try {
      if (['pdodge','parkour','rampage','panic'].includes(id)) await playArcade(mobile,id);
      else await playTurn(mobile,id);
      console.log('APK_MOBILE_OK '+id);
    } catch (error) { failures.push({game:id+'@mobile',error:String(error)}); console.error('APK_MOBILE_FAIL '+id+' '+error); }
  }
  await mobile.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error('APK_GAMEPLAY_FAILED '+JSON.stringify(failures));
  process.exitCode=1;
} else {
  console.log('APK_GAMEPLAY_OK: '+turnGames.length+' partidas contra CPU · '+arcades.length+' arcades · 3 minijuegos');
}
