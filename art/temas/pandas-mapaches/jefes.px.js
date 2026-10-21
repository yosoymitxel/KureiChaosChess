// Jefes del bosque de bambú: pandas, mapaches y pandas rojos con anatomía de oso y marcas de especie claras.
pal({
  k:"#202923",w:"#f5f0e2",W:"#ddd7c3",o:"#b2b5a5",O:"#858d7d",b:"#555e52",
  g:"#fff9ea",G:"#c3c3b2",p:"#d9754c",P:"#99462b",y:"#eac15b",Y:"#997736",
  t:"#6d9c63",T:"#355a3b",e:"#f6d7bd",E:"#b66e48",m:"#b7c9bd",M:"#687e73",
  r:"#c76a3b",R:"#74391f",c:"#91cdb8",C:"#477e68",q:"#6b5448",Q:"#3d302c",
  h:"#252a2b",H:"#3e4544",n:"#a75b32",N:"#71391e"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const boss=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const pandaHead=(x,y,s=1)=>[
  ellipse(x,y,6*s,5*s,"w"),ellipse(x-4*s,y-4*s,2*s,2*s,"h"),ellipse(x+4*s,y-4*s,2*s,2*s,"h"),
  ellipse(x-2.5*s,y,2.1*s,2.8*s,"h"),ellipse(x+2.5*s,y,2.1*s,2.8*s,"h"),
  px(x-3*s,y-1*s,"g"),px(x+2*s,y-1*s,"g"),ellipse(x,y+2*s,3*s,2*s,"W"),circ(x,y+1*s,1*s,"k"),
  line(x,y+2*s,x-1*s,y+3*s,"k",1),line(x,y+2*s,x+1*s,y+3*s,"k",1)
];
const raccoonHead=(x,y,s=1)=>[
  poly([x-5*s,y-1*s,x-6*s,y-6*s,x-2*s,y-4*s,x,y-5*s,x+4*s,y-4*s,x+6*s,y-6*s,x+5*s,y-1*s],"o"),
  ellipse(x,y,5.5*s,4.5*s,"O"),ellipse(x,y+2*s,4*s,2*s,"W"),
  poly([x-5*s,y-1*s,x-2*s,y-2*s,x,y,x+2*s,y-2*s,x+5*s,y-1*s,x+3*s,y+1*s,x-3*s,y+1*s],"h"),
  rect(x-3*s,y-1*s,2*s,2*s,"g"),rect(x+2*s,y-1*s,2*s,2*s,"g"),px(x-2*s,y-1*s,"k"),px(x+3*s,y-1*s,"k"),
  poly([x-1*s,y+1*s,x+1*s,y+1*s,x,y+3*s],"q"),line(x-3*s,y+2*s,x-6*s,y+2*s,"g",1),line(x+3*s,y+2*s,x+6*s,y+2*s,"g",1)
];
const redPandaHead=(x,y,s=1)=>[
  ellipse(x,y,5.5*s,4.5*s,"r"),
  poly([x-5*s,y-1*s,x-6*s,y-6*s,x-2*s,y-4*s,x,y-5*s,x+4*s,y-4*s,x+6*s,y-6*s,x+5*s,y-1*s],"R"),
  poly([x-5*s,y-3*s,x-3*s,y-5*s,x-1*s,y-2*s],"W"),poly([x+3*s,y-4*s,x+5*s,y-5*s,x+5*s,y-2*s],"W"),
  poly([x-5*s,y,x-3*s,y-2*s,x-1*s,y,x-2*s,y+2*s],"W"),poly([x+1*s,y,x+3*s,y-2*s,x+5*s,y,x+2*s,y+2*s],"W"),
  rect(x-3*s,y-1*s,2*s,2*s,"k"),rect(x+2*s,y-1*s,2*s,2*s,"k"),px(x-2*s,y-1*s,"g"),px(x+3*s,y-1*s,"g"),
  px(x,y+2*s,"k"),hline(x-2*s,y+3*s,4*s,"W")
];
const ringTail=(x,y)=>[
  line(x,y,x+4,y-4,"r",3),line(x+4,y-4,x+9,y-4,"R",3),line(x+9,y-4,x+12,y,"r",3),
  line(x+12,y,x+10,y+5,"R",3),line(x+10,y+5,x+5,y+6,"r",3),line(x+5,y+6,x+3,y+2,"R",3),
  line(x+3,y+2,x+5,y-1,"W",2),line(x+9,y-3,x+11,y,"W",2)
];

// Titán: panda guardián de bambú, gran masa de oso, brazos negros y una corona de hojas.
boss("boss-titan",{w:44,h:42},
  ellipse(22,27,15,11,"w"),ellipse(13,28,6,7,"h"),ellipse(31,28,6,7,"h"),
  poly([8,31,13,26,20,29,24,29,31,26,36,31,33,39,11,39],"W"),
  rect(13,35,6,5,"h"),rect(25,35,6,5,"h"),rect(11,40,8,2,"Q"),rect(25,40,8,2,"Q"),
  ...pandaHead(22,15,1.35),
  poly([6,11,10,5,15,10,20,2,24,9,29,4,35,11],"t"),...[10,16,22,28].map(x=>px(x,8,"c")),
  rect(9,24,6,2,"h"),rect(29,24,6,2,"h"),line(6,23,1,30,"h",4),line(38,23,43,30,"h",4),
  poly([1,29,5,27,8,34,5,37,1,34],"h"),poly([36,34,39,27,43,29,43,34,39,37],"h"),
  rect(16,25,12,3,"r"),hline(17,26,10,"y"),px(21,27,"W")
);

// Ariete: mapache musculoso, antifaz marcado, cola anillada y postura baja de embestida.
boss("boss-ram",{w:46,h:34},
  ...ringTail(30,17),ellipse(25,20,14,7,"O"),ellipse(24,18,11,5,"W"),poly([13,20,18,16,29,17,38,21,32,25,18,25],"q"),
  rect(19,23,4,6,"Q"),rect(28,22,4,7,"Q"),rect(18,28,5,2,"h"),rect(27,28,5,2,"h"),
  line(16,19,10,26,"o",3),line(10,26,6,26,"q",2),line(35,20,36,26,"o",3),line(36,26,40,27,"q",2),
  ...raccoonHead(12,13,1.05),poly([5,11,4,5,9,9,13,10],"o"),poly([13,10,18,5,18,12],"O"),
  line(7,12,1,8,"W",2),line(17,12,22,8,"W",2),px(1,7,"g"),px(22,7,"g"),
  rect(8,17,10,3,"M"),hline(9,17,8,"y"),px(12,18,"p")
);

// Hidra: tres guardianes distintos emergen entre bambú; orejas, antifaz y manchas bien separados.
boss("boss-hydra",{w:44,h:42},
  line(11,31,7,19,"t",5),line(23,31,23,17,"t",5),line(35,31,39,19,"t",5),
  line(7,20,5,11,"T",4),line(23,18,23,8,"T",4),line(39,20,41,11,"T",4),
  ...pandaHead(5,10,.8),...raccoonHead(23,7,.85),...redPandaHead(39,10,.8),
  poly([5,28,12,25,19,28,26,25,33,28,42,25,45,36,2,36],"q"),
  ellipse(23,31,11,5,"O"),...[14,18,22,26,30].map(x=>circ(x,30,2,"w")),
  ...[6,11,17,23,29,35,40].map((x,i)=>poly([x,34,x+3,34,x+2,39],"t")),
  ...[7,18,29,39].map(x=>px(x,36,"y"))
);

// Gólem: panda de piedra y bambú con hombreras redondeadas y grecas en el peto.
boss("boss-golem",{w:42,h:42},
  poly([7,8,13,4,29,4,35,8,38,29,33,37,9,37,4,29],"q"),poly([9,10,21,6,33,10,34,29,29,34,13,34,8,29],"O"),
  ellipse(11,18,6,6,"h"),ellipse(31,18,6,6,"h"),circ(11,18,3,"M"),circ(31,18,3,"M"),
  ...pandaHead(21,13,1.15),
  rect(11,22,20,10,"T"),poly([11,22,21,25,31,22,29,31,13,31],"t"),
  ...[14,18,22,26].map(y=>hline(14,y,14,"c")),...[15,19,23,27].map(x=>px(x,25,"y")),
  rect(1,20,8,12,"O"),rect(33,20,8,12,"O"),...[22,26,30].map(y=>[hline(2,y,6,"q"),hline(34,y,6,"q")]),
  rect(12,34,6,5,"h"),rect(24,34,6,5,"h"),hline(12,38,6,"M"),hline(24,38,6,"M"),
  poly([5,7,10,1,14,7,21,0,28,7,32,1,37,7],"t"),hline(10,7,22,"c")
);

// Jinete: panda rojo explorador, cola anillada, bufanda carmesí y lanza de guardabosques.
boss("boss-rider",{w:38,h:42},
  ...ringTail(25,30),poly([3,29,9,23,25,23,34,29,31,37,7,37],"R"),ellipse(19,31,12,5,"r"),
  rect(8,35,5,6,"R"),rect(25,35,5,6,"R"),rect(7,41,7,2,"Q"),rect(24,41,7,2,"Q"),
  poly([8,17,12,8,20,5,28,10,30,20,25,29,10,28],"O"),poly([12,17,24,17,25,28,12,28],"r"),
  ...redPandaHead(19,13,1.25),poly([7,13,9,6,14,10,20,4,26,10,31,7,31,14],"t"),hline(11,13,17,"y"),
  rect(13,23,12,4,"p"),hline(14,24,10,"W"),px(18,24,"y"),
  line(29,4,32,40,"q",2),line(30,4,33,40,"y",1),poly([28,5,30,0,34,5],"m"),px(31,2,"c")
);

// Muralla: fortín de bosque con tres ventanales de personajes: panda, mapache y panda rojo.
boss("boss-wall",{w:46,h:37},
  rect(2,12,44,23,"q"),poly([1,12,6,4,13,9,21,1,28,9,36,4,47,12],"O"),
  ...[5,18,31].map(x=>rect(x,14,12,17,"T")),
  ...[5,18,31].map(x=>[hline(x,14,12,"c"),rect(x+2,16,8,2,"M"),rect(x+2,25,8,2,"M"),hline(x+2,30,8,"q")]),
  ...pandaHead(11,20,.7),...raccoonHead(24,20,.7),...redPandaHead(37,20,.7),
  ...[9,22,35].map(x=>[rect(x,27,4,3,"h"),px(x+1,28,"y")]),
  rect(1,32,46,4,"h"),hline(2,32,44,"M"),...[4,10,16,22,28,34,40,46].map(x=>px(x,34,"y"))
);

// Devorador: panda rojo enorme royendo una vara de bambú; orejas, máscara blanca y boca abierta.
boss("boss-devourer",{w:44,h:42},
  ellipse(22,23,14,11,"r"),ellipse(22,22,11,8,"R"),poly([8,21,12,16,18,19,22,17,27,19,33,16,36,22,31,29,14,29],"W"),
  ...redPandaHead(22,13,1.25),
  rect(13,23,18,7,"k"),poly([14,24,18,25,22,23,26,25,30,24,29,29,15,29],"R"),
  ...[15,19,23,27].map(x=>poly([x,23,x+2,23,x+1,26],"g")),
  ...[16,20,24,28].map(x=>poly([x,30,x+2,30,x+1,27],"W")),
  line(5,20,1,28,"r",4),line(39,20,43,28,"r",4),poly([1,27,5,25,8,31,5,34,1,32],"R"),poly([36,31,39,25,43,27,43,32,39,34],"R"),
  rect(15,35,5,5,"R"),rect(24,35,5,5,"R"),rect(13,40,7,2,"Q"),rect(23,40,7,2,"Q"),
  line(5,5,37,5,"t",3),line(5,3,37,3,"c",1),px(10,4,"y"),px(24,4,"y"),px(34,4,"y")
);
