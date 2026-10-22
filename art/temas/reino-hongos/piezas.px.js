// Reino de los Hongos: piezas de setas feéricas, cada rol tiene silueta y ornamento propios.
pal({
 k:"#18231d",
 w:"#f7efce", W:"#e2d59d", o:"#c1b878", O:"#8d9c5c", b:"#526b45",
 r:"#d95777", R:"#9d315a", p:"#f6b7c9", P:"#b65b89",
 g:"#8ee6c0", G:"#3f9f7d", v:"#bd83e8", V:"#75469c",
 y:"#f6d66b", Y:"#c49b3b", z:"#b5d8ef", Z:"#6599b8"
});
ramps("bOoWw","RrPp","Vv","Gg","Yy","Zz");

const cap = (cx,cy,rx,ry,top="r",mid="R",shine="p") => [
  ellipse(cx,cy,rx,ry,top), ellipse(cx,cy+2,Math.max(1,rx-2),Math.max(1,ry-2),mid),
  hline(cx-rx+3,cy-1,Math.max(1,rx-3),shine), px(cx-rx+2,cy,shine),
  px(cx+rx-2,cy+2,"k"), px(cx+rx-3,cy+3,"k")
];
const stem = (cx,y,w,h,fill="w",shade="O") => [
  rect(cx-Math.floor(w/2),y,w,h,fill), vline(cx+Math.floor(w/2),y+1,h-1,shade),
  hline(cx-Math.floor(w/2),y+h-1,w,shade)
];
const freckles = (cx,cy,dx=0) => [
  px(cx-3+dx,cy,"y"),px(cx+2+dx,cy-1,"y"),px(cx+5+dx,cy+2,"z")
];
const draw = (name,w,h,role=0,boss=false) => {
  const cx=Math.floor(w/2), foot=h-2, capY=boss?Math.floor(h*.32):Math.floor(h*.28);
  const rx=boss?Math.floor(w*.42):Math.max(6,Math.floor(w*.38));
  const ry=boss?Math.max(5,Math.floor(h*.19)):Math.max(4,Math.floor(h*.19));
  const sh=boss?Math.floor(h*.4):Math.floor(h*.43);
  const items=[
    // micelio y pequeñas raíces
    hline(cx-5,foot,w>28?11:9,"G"),px(cx-6,foot-1,"g"),px(cx+5,foot-2,"g"),
    ...stem(cx,capY+ry-1,Math.max(5,Math.floor(w*.24)),sh),
    ...cap(cx,capY,rx,ry,role%3===0?"r":role%3===1?"v":"R",role%2===0?"R":"V",role%2===0?"p":"z"),
    // rostro amable, con ojos de luciérnaga
    px(cx-3,capY+ry+Math.floor(sh*.28),"k"),px(cx+2,capY+ry+Math.floor(sh*.28),"k"),
    px(cx-3,capY+ry+Math.floor(sh*.28)-1,"y"),px(cx+2,capY+ry+Math.floor(sh*.28)-1,"y"),
    hline(cx-1,capY+ry+Math.floor(sh*.28)+3,3,"R"),
    ...freckles(cx,capY-1,role%2),
  ];
  if(role%4===1) items.push(rect(cx-rx+1,capY-1,2,Math.max(3,ry),"z"),px(cx-rx+2,capY-3,"y"));
  if(role%4===2) items.push(poly([cx-2,capY+ry+sh-3,cx-7,capY+ry+sh-8,cx-5,capY+ry+sh-1],"g"),poly([cx+2,capY+ry+sh-3,cx+7,capY+ry+sh-8,cx+5,capY+ry+sh-1],"g"));
  if(role%4===3) items.push(px(cx,capY+ry+Math.floor(sh*.28)+1,"z"),px(cx+1,capY+ry+Math.floor(sh*.28)+2,"z"));
  if(boss){
    items.push(ellipse(cx,capY+ry+4,rx+3,2,"G"),hline(cx-rx-1,capY+ry+4,rx*2+3,"g"));
    items.push(px(cx-rx+2,capY+2,"z"),px(cx+rx-2,capY+1,"z"),px(cx,capY-ry+1,"y"));
  }
  sprite("_"+name,{w,h},...items);
  sprite(name,{base:"_"+name,outline:"k"});
};
const pieces=[
 ["pawn",20,24],["rook",24,28],["knight",26,28],["bishop",22,30],
 ["queen",28,32],["king",28,34],["guard",24,28],["advisor",23,29],
 ["elephant",28,28],["camel",27,29],["cannon",26,27]
];
pieces.forEach(([n,w,h],i)=>draw(n,w,h,i));
const bosses=[
 ["boss-titan",44,42],["boss-ram",42,38],["boss-hydra",46,42],
 ["boss-golem",44,42],["boss-rider",30,44],["boss-wall",48,34],["boss-devourer",46,42]
];
bosses.forEach(([n,w,h],i)=>draw(n,w,h,i+11,true));
