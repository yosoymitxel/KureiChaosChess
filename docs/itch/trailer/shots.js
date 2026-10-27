const {take,play,chromium}=require('./rec.js');
const only=process.argv.slice(2);
const local=(mod)=>async(p)=>{await p.waitForTimeout(1800);await p.getByText('Local match').click();await p.waitForTimeout(900);if(mod)await p.getByRole('button',{name:mod,exact:true}).click().catch(()=>{});};
const deal=(moves=5,pause=1500,prefer=[])=>async(p)=>{await p.locator('button').last().click();await p.waitForTimeout(4500);await p.mouse.click(960,900);await p.waitForTimeout(2500);await play(p,moves,pause,prefer);};
const keys=(ks,gap=260)=>async(p)=>{await p.waitForTimeout(400);for(const k of ks){await p.keyboard.press(k);await p.waitForTimeout(gap);}};
const mini=(id,theme='walnut')=>({theme,path:`tests/visual.html?mini=${id}&theme=${theme==='walnut'?'walnut':'pixel'}`,before:async p=>{await p.waitForTimeout(1500);for(let i=0;i<4;i++){if(!(await p.locator('.moment.cine').count()))break;await p.mouse.click(960,540);await p.waitForTimeout(700);}await p.waitForTimeout(500);}});
const tapTiles=(n=6,gap=600)=>async p=>{for(let i=0;i<n;i++){const t=p.locator('.pc.side-light .pc-base');if(await t.count()){await t.nth(Math.floor(Math.random()*await t.count())).click({force:true}).catch(()=>{});await p.waitForTimeout(150);const mv=p.locator('.tile.mv, .tile.cap');if(await mv.count())await mv.nth(Math.floor(Math.random()*await mv.count())).click({force:true});}await p.waitForTimeout(gap);}};
const S={
  menu_walnut:{ms:6500},
  menu_goticas:{theme:'goticas',ms:4200},
  menu_halloween:{theme:'halloween',ms:4200},
  menu_marcianitos:{theme:'marcianitos',ms:4200},
  menu_piratas:{theme:'piratas',ms:4200},
  menu_vocaloid:{theme:'vocaloid-miku',ms:4200},
  menu_paraguay:{theme:'paraguay',ms:4200},
  match_portals:{before:local('Portals'),act:deal(8,1300,['portal']),ms:22000},
  match_ice_pixel:{theme:'pixelada',before:local('Frozen lake'),act:deal(8,1300,['ice']),ms:22000},
  match_zombie:{theme:'zombis',before:local('Zombie plague'),act:deal(10,1300),ms:24000},
  match_meteor:{theme:'noche',before:local('Meteor shower'),act:deal(12,1300),ms:26000},
  match_fog:{theme:'reino-hongos',before:local('Thick fog'),act:deal(8,1300),ms:20000},
  mini_witch:{...mini('witch'),act:tapTiles(6,700),ms:6000},
  mini_outbreak:{...mini('outbreak','pixel'),act:async p=>{for(let i=0;i<4;i++){const t=p.locator('.pc .pc-base');const n=await t.count();if(n){const e=t.nth((i*5+2)%n);await e.click({force:true}).catch(()=>{});await p.waitForTimeout(120);await e.click({force:true}).catch(()=>{});}await p.waitForTimeout(1100);}},ms:6000},
  mini_giant:{...mini('giantHunt'),act:tapTiles(5,800),ms:5500},
  mini_hockey:{...mini('hockey'),act:async p=>{for(let i=0;i<14;i++){await p.mouse.move(800+Math.random()*300,800-Math.random()*200,{steps:6});await p.waitForTimeout(200);}},ms:4500},
  mini_marcianos:{...mini('marcianos','pixel'),act:keys(['ArrowLeft','Space','ArrowLeft','Space','ArrowRight','ArrowRight','Space','ArrowRight','Space','ArrowLeft','Space'],350),ms:4500},
  mini_bomber:{...mini('bomber'),act:tapTiles(6,600),ms:4500},
  mini_connect4:{...mini('connect4','pixel'),act:async p=>{for(let i=0;i<4;i++){const c=p.locator('.bm-cell, .c4-col, button.cell');const n=await c.count();if(n)await c.nth(Math.floor(Math.random()*n)).click({force:true}).catch(()=>{});await p.waitForTimeout(900);}},ms:4500},
  mini_bowling:{...mini('bowling'),act:tapTiles(3,1200),ms:4500},
  zen:{path:'',before:async p=>{await p.evaluate(()=>localStorage.setItem('zugzwang.zen.v1',JSON.stringify({size:5,leaves:[{x:1.2,y:1.6,r:20},{x:3.1,y:3.4,r:-30},{x:4.2,y:1.1,r:60}],leafT:Date.now()})));await p.reload();await p.waitForTimeout(1500);await p.getByText('Zen Garden').first().click({force:true});await p.waitForTimeout(1800);},act:async p=>{await p.waitForTimeout(500);const l=p.locator('.zn-fallen');for(let i=0;i<await l.count();i++){await l.first().click().catch(()=>{});await p.waitForTimeout(1100);}const pond=p.locator('.zen-pond');if(await pond.count()){const b=await pond.boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);}},ms:6500},
};
(async()=>{const b=await chromium.launch();for(const [k,v] of Object.entries(S)){if(only.length&&!only.includes(k))continue;try{await take(b,k,v);}catch(e){console.log(k,'FALLO',e.message.split('\n')[0]);}}await b.close();})();
