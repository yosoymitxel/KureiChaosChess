// Panteón de noche: lápidas con relieves intencionales, losas de cantera y mesa de ataúdes lacados.
pal({
  k:"#211a1d",a:"#d9d0c2",A:"#f1e6d5",c:"#b9a995",C:"#83756c",
  d:"#a89a90",D:"#c8b4a1",e:"#6f5c59",E:"#493d3a",
  r:"#302027",R:"#49313a",z:"#24191f",J:"#1a1117",j:"#110c10",
  y:"#d2a84a",Y:"#806020",v:"#6d8a62",V:"#3d5b43",p:"#9b667e",P:"#684052"
});
const slab=(name,[base,hi,lo,deep],...marks)=>sprite(name,{w:16,h:16},
  rect(0,0,16,16,base),hline(0,0,15,hi),vline(0,0,15,hi),
  hline(1,14,14,lo),vline(14,1,13,lo),hline(0,15,16,deep),vline(15,0,16,deep),
  ...marks.flatMap(f=>f({base,hi,lo,deep}))
);
const light=["a","A","c","C"], dark=["d","D","e","E"];
const grain=t=>[hline(3,3,5,t.lo),hline(7,4,3,t.hi),hline(5,10,7,t.lo),px(12,9,t.hi),px(10,11,t.deep)];
const crack=t=>[px(12,1,t.deep),px(11,2,t.deep),px(11,3,t.deep),px(9,4,t.deep),px(9,5,t.lo),px(7,6,t.deep),px(8,7,t.hi),px(5,10,t.deep)];
const epitaph=t=>[hline(4,4,8,t.lo),hline(4,5,8,t.hi),hline(5,7,6,t.lo),hline(5,8,6,t.hi),px(4,9,t.lo),px(11,9,t.lo)];
const marigold=()=>[px(7,4,"y"),px(6,5,"Y"),px(7,5,"y"),px(8,5,"Y"),px(6,6,"y"),px(7,6,"Y"),px(8,6,"y"),px(7,7,"v"),line(7,7,6,10,"v",1),px(5,9,"V")];
const moss=()=>[rect(1,11,3,3,"V"),rect(1,12,2,2,"v"),px(4,13,"V"),px(1,10,"V"),px(2,11,"v")];
slab("tile-a",light,grain);
slab("tile-a2",light,crack);
slab("tile-a3",light,epitaph);
slab("tile-b",dark,grain);
slab("tile-b2",dark,moss);
slab("tile-b3",dark,marigold);
// Cantera irregular: joints are staggered so the 32×32 texture joins on all edges.
const rows=[[12,10,10],[7,13,12],[10,12,10],[14,9,9]], offsets=[0,5,9,3], stones=[];
rows.forEach((widths,row)=>{
 const y=row*8; let x=offsets[row];
 widths.forEach((wd,i)=>{
  const base=(row+i)%3===1?"z":"r";
  for(const dx of [0,-32]){
   const sx=x+dx;
   stones.push(rect(sx,y,wd-1,7,base),hline(sx,y,wd-1,"R"),hline(sx,y+6,wd-1,"J"),vline(sx+wd-1,y,7,"j"));
  }
  x+=wd;
 });
 stones.push(hline(0,y+7,32,"j"));
});
sprite("table",{w:32,h:32},rect(0,0,32,32,"j"),...stones,
  ...[[5,4],[20,13],[10,28]].flatMap(([x,y])=>[px(x,y,"Y"),px(x+1,y,"y"),px(x,y+1,"Y")]),
  line(4,18,7,15,"P",1),line(7,15,10,18,"P",1),line(10,18,7,21,"P",1),line(7,21,4,18,"P",1)
);
const H="#ffffff66",L="#00000040";
const frame=(name,...extra)=>sprite(name,{w:12,h:12},
 hline(2,0,8,"j"),hline(2,11,8,"j"),vline(0,2,8,"j"),vline(11,2,8,"j"),
 px(1,1,"j"),px(10,1,"j"),px(1,10,"j"),px(10,10,"j"),
 hline(2,1,8,H),vline(1,2,7,H),hline(2,10,8,L),vline(10,2,8,L),
 ...extra
);
frame("panel",px(2,2,"y"),px(9,2,"y"),px(2,9,"r"),px(9,9,"r"),px(5,2,"P"),px(6,9,"P"));
frame("boton",px(2,2,"Y"),px(9,2,"Y"),px(2,9,"P"),px(9,9,"P"));
