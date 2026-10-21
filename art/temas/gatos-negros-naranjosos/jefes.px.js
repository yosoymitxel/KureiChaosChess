// Jefes felinos: un gato montés, una pantera nocturna, tres gatos de azotea y un enorme rey de tejados.
pal({
  k:"#171923",w:"#fff0d2",W:"#e8d8b9",o:"#c7a37a",O:"#8b6547",b:"#4d392e",
  h:"#171923",H:"#323440",X:"#4b4d5d",r:"#e77927",R:"#a64218",c:"#f8d8a4",C:"#b48b5e",
  p:"#e7a0a0",P:"#a95664",y:"#f7c84e",Y:"#b96a22",e:"#c8f365",E:"#56872b",
  m:"#bfc6d0",M:"#747e8d",n:"#775039",N:"#432c24",g:"#fff9eb",G:"#cdb793",
  t:"#8b6eb2",T:"#50406c",q:"#c4d1c4",Q:"#758b7e"
});
ramps("bOoWw","Rr","Yy","Gg","Mm","Ee","Tt","Cc","Pp");
const boss=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const cat=(x,y,coat="h",muzzle="g",eye="e",s=1)=>[
  poly([x-5*s,y-1*s,x-6*s,y-7*s,x-2*s,y-4*s,x,y-5*s,x+4*s,y-4*s,x+6*s,y-7*s,x+5*s,y-1*s],coat),
  poly([x-5*s,y-3*s,x-5*s,y-6*s,x-3*s,y-4*s],"p"),poly([x+4*s,y-4*s,x+5*s,y-6*s,x+5*s,y-2*s],"p"),
  ellipse(x,y,5*s,4*s,coat),ellipse(x-2*s,y+2*s,3*s,2*s,muzzle),ellipse(x+2*s,y+2*s,3*s,2*s,muzzle),
  rect(x-3*s,y-1*s,2*s,2*s,eye),rect(x+2*s,y-1*s,2*s,2*s,eye),
  poly([x-1*s,y+1*s,x+1*s,y+1*s,x,y+3*s],"p"),
  line(x,y+3*s,x-2*s,y+4*s,"k",1),line(x,y+3*s,x+2*s,y+4*s,"k",1),
  line(x-3*s,y+2*s,x-7*s,y+1*s,"g",1),line(x+3*s,y+2*s,x+7*s,y+1*s,"g",1)
];
const tail=(x,y,col="h")=>[line(x,y,x+4,y-4,col,3),line(x+4,y-4,x+8,y-4,col,3),line(x+8,y-4,x+10,y,col,3),px(x+10,y+1,"g")];
const paw=(x,y)=>[rect(x,y,5,3,"h"),hline(x,y+2,5,"k"),px(x+1,y+1,"g"),px(x+4,y+1,"g")];

// Titán: gato montés gigantesco, hombros fuertes, mechones de oreja y ojos verde lima.
boss("boss-titan",{w:44,h:42},
  ellipse(22,27,15,10,"h"),ellipse(22,25,12,8,"H"),ellipse(22,31,9,5,"w"),
  poly([8,19,12,14,17,17,22,14,27,17,32,14,36,20,32,27,12,27],"h"),
  poly([12,23,32,23,33,36,11,36],"H"),poly([17,24,27,24,29,35,15,35],"r"),
  ...cat(22,13,"h","g","e",1.25),
  poly([9,11,11,4,16,9,22,2,28,9,33,4,35,12],"r"),
  ...[11,16,22,28,33].map(x=>px(x,8,"Y")),
  ...paw(8,35),...paw(31,35),rect(14,37,5,3,"h"),rect(25,37,5,3,"h"),
  ...tail(31,27,"h"),line(8,24,2,29,"H",4),line(36,24,42,29,"H",4),
  poly([2,28,7,27,9,33,5,36,1,33],"h"),poly([35,33,37,27,42,28,43,33,39,36],"h"),
  rect(17,28,10,3,"y"),hline(18,29,8,"R")
);

// Ariete: gato callejero naranja arremetiendo, espalda arqueada, patas extendidas y cola levantada.
boss("boss-ram",{w:45,h:34},
  ...tail(33,16,"r"),ellipse(26,19,13,7,"r"),ellipse(25,17,10,4,"c"),
  ...[18,22,26,30].map(x=>line(x,14,x-2,19,"R",1)),
  line(17,21,12,27,"r",3),line(12,27,7,28,"R",2),line(32,21,34,27,"r",3),line(34,27,38,27,"R",2),
  line(16,16,12,11,"r",3),...cat(10,11,"r","c","e",1),
  poly([7,7,9,2,13,6,17,2,20,8],"R"),px(10,10,"y"),px(14,10,"y"),hline(8,14,5,"k"),
  poly([12,16,18,14,23,17,21,21,14,22],"O"),rect(15,16,9,3,"M"),hline(16,17,7,"y"),px(18,17,"p"),
  line(5,16,1,14,"g",1),line(6,18,1,19,"g",1)
);

// Hidra: tres expresiones felinas, gato negro, gato naranja y gato tuxedo; colas serpenteantes.
boss("boss-hydra",{w:44,h:42},
  line(10,32,7,23,"H",4),line(7,23,4,17,"h",4),line(23,32,23,20,"r",4),line(36,32,37,23,"M",4),line(37,23,39,17,"H",4),
  ...cat(6,14,"h","g","e",.9),...cat(23,11,"r","c","e",1),...cat(39,14,"H","w","y",.9),
  poly([3,29,10,25,17,29,24,25,31,29,39,25,44,30,42,37,4,37],"H"),
  ellipse(23,33,10,4,"r"),...[14,18,22,26,30].map(x=>px(x,32,"y")),
  rect(17,35,12,3,"M"),hline(18,35,10,"c")
);

// Gólem: guardián de rascador hecho de postes de sisal, cajas de madera y un rostro felino.
boss("boss-golem",{w:42,h:42},
  rect(7,10,28,28,"N"),rect(9,12,24,24,"n"),rect(12,15,18,17,"o"),rect(14,17,14,13,"H"),
  ...cat(21,15,"h","g","e",1.25),
  ...[20,24,28,32].map(y=>hline(11,y,20,"C")),...[13,17,21,25,29].map(x=>px(x,25,"y")),
  rect(1,17,8,14,"n"),rect(33,17,8,14,"n"),circ(5,21,3,"M"),circ(37,21,3,"M"),px(5,21,"y"),px(37,21,"y"),
  rect(11,36,7,5,"h"),rect(24,36,7,5,"h"),...paw(11,38),...paw(25,38),
  poly([6,8,9,1,15,6,21,0,27,6,33,1,36,8],"r"),hline(10,8,22,"y"),...tail(30,29,"h")
);

// Jinete: gata negra con capa al viento, montada en un corcel atigrado.
boss("boss-rider",{w:38,h:42},
  poly([3,30,10,23,27,23,35,30,32,37,7,37],"r"),ellipse(20,31,12,5,"O"),
  rect(8,35,5,6,"h"),rect(25,35,5,6,"h"),rect(7,41,7,2,"H"),rect(24,41,7,2,"H"),
  ...tail(30,28,"h"),ellipse(20,28,9,4,"r"),...[16,20,24].map(x=>line(x,25,x+1,29,"R",1)),
  poly([6,17,10,7,19,4,27,9,30,20,26,30,9,29],"H"),poly([11,17,23,17,25,29,11,29],"h"),
  ...cat(19,13,"h","g","e",1.1),poly([8,13,10,6,15,10,20,4,25,10,30,6,29,15],"H"),
  hline(12,16,13,"r"),rect(13,19,12,3,"R"),hline(14,19,10,"y"),
  line(29,6,32,40,"M",2),line(30,6,33,40,"m",1),poly([28,7,30,1,34,7],"m"),
  line(11,20,6,24,"g",2),circ(5,25,2,"M"),px(5,24,"y")
);

// Muralla: torre de tejado con ventanales de gato, vigas oscuras y tejas.
boss("boss-wall",{w:46,h:37},
  rect(2,12,44,23,"N"),poly([1,12,7,4,13,9,21,1,29,9,37,4,47,12],"n"),
  rect(5,14,12,17,"H"),rect(18,14,12,17,"t"),rect(31,14,12,17,"H"),
  ...cat(11,20,"h","g","e",.7),...cat(24,20,"r","c","e",.7),...cat(37,20,"H","w","y",.7),
  ...[6,19,32].map(x=>[rect(x,15,2,15,"M"),rect(x+9,15,2,15,"M"),hline(x,16,11,"O"),hline(x,28,11,"O")]),
  rect(1,32,46,4,"H"),hline(2,32,44,"M"),...[5,11,17,23,29,35,41].map(x=>px(x,34,"y"))
);

// Devorador: gato de Cheshire enorme, mandíbula abierta, colmillos largos y ojos desparejados.
boss("boss-devourer",{w:44,h:42},
  ellipse(22,22,15,12,"h"),ellipse(22,20,12,9,"H"),...cat(22,13,"H","g","e",1.2),
  rect(10,18,24,11,"k"),poly([10,18,16,20,21,18,26,20,34,18,31,28,25,31,18,28,12,31],"r"),
  ...[12,16,20,24,28,32].map(x=>poly([x,18,x+2,18,x+1,22],"g")),
  ...[14,18,22,26,30].map(x=>poly([x,31,x+2,31,x+1,27],"W")),
  line(9,20,3,27,"h",4),line(35,20,41,27,"h",4),poly([1,25,7,24,9,31,4,34,0,30],"H"),poly([35,31,38,24,43,25,44,30,40,34],"H"),
  rect(14,34,5,6,"h"),rect(25,34,5,6,"h"),rect(12,40,8,2,"H"),rect(24,40,8,2,"H"),
  line(14,7,17,2,"r",2),line(30,7,27,2,"r",2),px(17,2,"y"),px(27,2,"y")
);
