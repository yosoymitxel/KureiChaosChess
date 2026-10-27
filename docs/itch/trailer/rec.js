// Graba tomas del juego: fotogramas por CDP screencast → mp4 30 fps con ffmpeg.
const {chromium}=require('playwright');const fs=require('fs');const {execFileSync}=require('child_process');
const OUT=__dirname+'/clips/';const URL='http://localhost:8124/';
const W=1920,H=1080;
async function take(b,name,{theme='walnut',lang='en',path='',viewport=[W,H],before,act,ms=6000,settle=0,speed=0.5}={}){
  const ctx=await b.newContext({viewport:{width:viewport[0],height:viewport[1]},deviceScaleFactor:W/viewport[0]});const p=await ctx.newPage();
  await p.addInitScript(([t,l,sp])=>{localStorage.setItem('zugzwang.settings.v2',JSON.stringify({theme:t,lang:l,sound:false,coin:false,speed:sp,moments:true}));},[theme,lang,speed]);
  await p.addInitScript(()=>addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent='.turn-banner{display:none!important}';document.head.appendChild(st);}));
  await p.goto(URL+path);
  if(before)await before(p);
  if(settle)await p.waitForTimeout(settle);
  const cdp=await ctx.newCDPSession(p);const frames=[];
  cdp.on('Page.screencastFrame',async f=>{frames.push({t:f.metadata.timestamp,d:f.data});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:W,maxHeight:H,everyNthFrame:1});
  const t0=Date.now();const run=act?act(p).catch(e=>console.log(name,'act err',e.message)):null;
  while(Date.now()-t0<ms)await p.waitForTimeout(100);
  await cdp.send('Page.stopScreencast');await ctx.close();
  const dir=OUT+name+'_f/';fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
  let list='';frames.forEach((f,i)=>{fs.writeFileSync(dir+i+'.jpg',Buffer.from(f.d,'base64'));const dur=i<frames.length-1?frames[i+1].t-f.t:1/30;list+=`file '${i}.jpg'\nduration ${Math.max(dur,0.001).toFixed(4)}\n`;});
  list+=`file '${frames.length-1}.jpg'\n`;fs.writeFileSync(dir+'list.txt',list);
  execFileSync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',dir+'list.txt','-vf',`setpts=PTS*${speed},scale=${W}:${H}:flags=lanczos,fps=30,format=yuv420p`,'-c:v','libx264','-crf','16','-preset','medium',OUT+name+'.mp4']);
  fs.rmSync(dir,{recursive:true,force:true});
  console.log(name,frames.length,'frames');
}
// Juega: toca una pieza propia con jugadas y una casilla marcada (prefiere capturas).
async function play(p,moves=6,pause=1600,prefer=[]){
  for(let m=0;m<moves;m++){
    const side=await p.evaluate(()=>document.querySelector('.seat.cur .token')?.className.match(/side-(\w+)/)?.[1]||'light');
    const pcs=p.locator(`.pc.side-${side} .pc-base`);const n=await pcs.count();let ok=false;
    const order=[...Array(n).keys()].sort(()=>Math.random()-.5);
    for(const i of order){await pcs.nth(i).click({force:true}).catch(()=>{});await p.waitForTimeout(120);
      const cap=p.locator('.tile.cap'),mv=p.locator('.tile.mv');
      for(const c of prefer){const t=p.locator(`.tile.mv.${c}, .tile.cap.${c}`);if(await t.count()){await t.first().click({force:true});ok=true;break;}}if(ok)break;
      if(await cap.count()){await cap.first().click({force:true});ok=true;break;}
      if(await mv.count()&&Math.random()<(prefer.length?.15:.5)){const k=await mv.count();await mv.nth(Math.floor(Math.random()*k)).click({force:true});ok=true;break;}}
    if(!ok)break;await p.waitForTimeout(pause);
  }
}
module.exports={take,play,chromium};
