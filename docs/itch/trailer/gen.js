const fs=require('fs');
const b=n=>+(1.435+0.5495*n).toFixed(3);
const END=41;
let clips=[],tw=[],sfx=[];
let id=0;
function vid(name,s,e,{zoom=1,ox=50,oy=50,ms=0.3,push=0.06}={}){
  const i='v'+(id++);
  clips.push(`<video id="${i}m" class="clip shot" data-start="${s}" data-duration="${(e-s).toFixed(3)}" data-track-index="1" src="assets/clips/${name}.mp4" muted playsinline data-media-start="${ms}" style="transform-origin:${ox}% ${oy}%"></video>`);
  tw.push(`tl.fromTo("#${i}m",{scale:${zoom}},{scale:${(zoom*(1+push)).toFixed(3)},duration:${(e-s).toFixed(3)},ease:"none"},${s});`);
}
function label(txt,s,e,kicker=''){
  const i='l'+(id++);
  clips.push(`<div id="${i}" class="clip lab" data-start="${s}" data-duration="${(e-s).toFixed(3)}" data-track-index="3"><div class="labin" id="${i}i">${kicker?`<span class="k">${kicker}</span>`:''}<span class="t">${txt}</span></div></div>`);
  tw.push(`tl.fromTo("#${i}i",{xPercent:-110,opacity:0},{xPercent:0,opacity:1,duration:.35,ease:"expo.out"},${s+0.05});`);
}
function card(txt,s,e,cls=''){
  const i='c'+(id++);
  clips.push(`<div id="${i}" class="clip card ${cls}" data-start="${s}" data-duration="${(e-s).toFixed(3)}" data-track-index="2"><h2 id="${i}t">${txt}</h2></div>`);
  tw.push(`tl.fromTo("#${i}t",{scale:1.25,opacity:0},{scale:1,opacity:1,duration:.45,ease:"expo.out"},${s});`);
}
function snd(f,s,v=0.7){sfx.push(`<audio id="a${id++}" class="clip" src="assets/${f}.mp3" data-start="${s}" data-duration="0.9" data-volume="${v}" data-track-index="5"></audio>`);}
// cold open
card('Every game of chess<br>has rules.',0,1.75,'quiet');
card('What if every floor<br><em>broke one?</em>',1.75,b(4),'quiet');
// title
const v0='v'+id+'m';vid('menu_walnut',b(4),b(10),{zoom:1.0,push:0.08,ms:0});
clips.push(`<div id="logo" class="clip" data-start="${b(4)}" data-duration="${(b(10)-b(4)).toFixed(3)}" data-track-index="3"><img id="logoi" src="assets/logo.png"></div>`);
tw.push(`tl.fromTo("#logoi",{scale:2.4,opacity:0},{scale:1,opacity:1,duration:.32,ease:"power4.in"},${b(4)});tl.fromTo("#${v0}",{y:0},{y:14,duration:.06,yoyo:true,repeat:5,ease:"none"},${b(4)+0.32});tl.to("#logoi",{scale:.92,opacity:0,duration:.3,ease:"power2.in"},${b(10)-0.3});`);
snd('stomp-1',b(4)+0.3,1);
// matches
const M=[['match_portals','Portals','Floor rule'],['match_ice_pixel','Frozen lake','Floor rule'],['match_zombie','Zombie plague','Floor rule'],['match_meteor','Meteor shower','Floor rule'],['match_fog','Thick fog','Floor rule']];
const ms={match_portals:3,match_ice_pixel:3,match_zombie:3,match_meteor:4.5,match_fog:2.5};
const fx=['warp-1','shatter-1','zombie-1','bigboom-1','whoosh-1'];
M.forEach(([n,t,k],j)=>{const s=b(10+4*j),e=j==4?b(29):b(14+4*j);vid(n,s,e,{zoom:1.32,ox:40,oy:55,ms:ms[n]});label(t,s,e,k);snd(fx[j],s+0.15,0.6);});
card('Every floor bends the rules.',b(29),b(32),'red');
// minis
const N=['mini_witch','mini_outbreak','mini_giant','mini_hockey','mini_marcianos','mini_connect4','mini_bowling'];
const NT=['The witch','Outbreak','Giant hunt','Air hockey','Invaders','Connect 4','Bowling'];
card('28 minigames<br>between floors.',b(32),b(34));
N.forEach((n,j)=>{const s=b(34+2*j),e=b(36+2*j);vid(n,s,e,{zoom:n=='mini_giant'?1.25:n=='mini_hockey'?1.25:1.9,ox:n=='mini_hockey'?12:n=='mini_giant'?45:42,oy:55,ms:0.6});label(NT[j],s,e);});
card('26 tables.<br><em>17 in pixel art.</em>',b(48),b(51));
const T=['menu_goticas','menu_halloween','menu_marcianitos','menu_piratas','menu_vocaloid'];
T.forEach((n,j)=>vid(n,b(51+j),b(52+j),{zoom:1.15,ox:68,oy:55,ms:0.6}));
vid('zen',b(56),b(62),{zoom:1.25,ox:45,oy:45,ms:0,push:0.1});
label('A zen garden between runs',b(56),b(62));
snd('coin-1',b(58),0.5);
// end
clips.push(`<div id="end" class="clip card" data-start="${b(62)}" data-duration="${(END-b(62)).toFixed(3)}" data-track-index="2"><img id="endlogo" src="assets/logo.png"><p id="endt">Free · Play in your browser</p><p id="endu">yosoymitxel.itch.io/kurei-chaos-chess</p></div>`);
tw.push(`tl.fromTo("#endlogo",{scale:1.6,opacity:0},{scale:1,opacity:1,duration:.4,ease:"power4.in"},${b(62)});tl.fromTo("#endt",{y:30,opacity:0},{y:0,opacity:1,duration:.5,ease:"expo.out"},${b(64)});tl.fromTo("#endu",{y:30,opacity:0},{y:0,opacity:1,duration:.5,ease:"expo.out"},${b(65)});`);
snd('stomp-1',b(62)+0.38,1);
const html=`<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<script src="assets/gsap.min.js"></script>
<style>
@font-face{font-family:"Bricolage";src:url(assets/fonts/bricolage-grotesque-latin.woff2) format("woff2");font-weight:200 800}
:root{--ground:#140d08;--paper:#f6eedc;--red:#c12d00;--brass:#dcab53}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--ground)}
#root{width:1920px;height:1080px;position:relative;font-family:"Bricolage",sans-serif;color:var(--paper);overflow:hidden}
.shot,.card,#logo{position:absolute;inset:0;overflow:hidden}
.shot{width:100%;height:100%;object-fit:cover}
.card{display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ground);z-index:5}
.card h2{font-size:120px;font-weight:800;line-height:1;letter-spacing:-.02em;text-align:center}
.card.quiet h2{font-size:92px;font-weight:500}
.card h2 em{font-style:normal;color:var(--brass)}
.card.red{background:var(--red)}
#logo{display:flex;align-items:center;justify-content:center;z-index:6;background:radial-gradient(ellipse at center,rgba(20,13,8,.55),rgba(20,13,8,0) 60%)}
#logoi{width:1100px}
.lab{position:absolute;left:144px;bottom:120px;z-index:6}
.labin{display:flex;flex-direction:column;gap:6px;background:var(--paper);color:#1d140d;padding:18px 34px;border-left:12px solid var(--red)}
.labin .k{font-size:30px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--red)}
.labin .t{font-size:64px;font-weight:800;line-height:1}
#endlogo{width:1000px}
#endt{font-size:56px;font-weight:700;margin-top:30px}
#endu{font-size:38px;color:var(--brass);margin-top:14px}
#bars{position:absolute;inset:0;z-index:9;pointer-events:none;box-shadow:inset 0 0 220px rgba(0,0,0,.55)}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${END}" data-width="1920" data-height="1080">
${clips.join('\n')}
<div id="bars"></div>
<audio id="music" class="clip" src="assets/boss.mp3" data-start="0" data-duration="${END}" data-volume="0.9" data-fade-out="2.5" data-track-index="4"></audio>
${sfx.join('\n')}
</div>
<script>
const tl=gsap.timeline({paused:true});
${tw.join('\n')}
window.__timelines["main"]=tl;
</script></body></html>`;
fs.writeFileSync('hf/index.html',html);
