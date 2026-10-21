// Jefes del festival holográfico: titán idol, ariete de graves, hidra de cables y devorador de sonido.
pal({
  k:"#08282e",w:"#e4fffa",W:"#b8f4e9",o:"#79ded4",O:"#36bcb7",b:"#147f83",
  s:"#f4c7bd",S:"#bf817f",g:"#f5ffff",G:"#a8c6cc",
  c:"#56e9f0",C:"#218caa",p:"#ff79cd",P:"#aa3e91",y:"#eaff81",Y:"#9ccc42",
  m:"#7eaeb8",M:"#355e6b",X:"#1b3548",r:"#ffb7e4",R:"#8b3e80",t:"#344f70",T:"#1c304d",e:"#e3a8e9",E:"#734f99"
});
ramps("bOoWw","Pp","Yy","Gg","Mm","Ee","Tt","Cc","Rr");
const boss=(n,o,...items)=>sprite(n,{...o,outline:"k"},...items.flat(Infinity));
const mikuFace=(x,y,s=1)=>[
  rect(x-4*s,y-3*s,8*s,7*s,"s"),rect(x+2*s,y-2*s,2*s,5*s,"S"),
  poly([x-4*s,y-3*s,x-5*s,y-7*s,x-2*s,y-5*s,x,y-8*s,x+2*s,y-5*s,x+5*s,y-7*s,x+4*s,y-2*s],"O"),
  rect(x-3*s,y-1*s,2*s,2*s,"k"),rect(x+1*s,y-1*s,2*s,2*s,"k"),
  px(x-3*s,y-1*s,"c"),px(x+1*s,y-1*s,"c"),hline(x-2*s,y+2*s,5*s,"P"),px(x,y+2*s,"p")
];
const twinTails=(x,y,len=15)=>[
  poly([x-5,y,x-10,y+2,x-12,y+len-4,x-9,y+len,x-6,y+len-5,x-6,y+6,x-3,y+4],"O"),
  poly([x+5,y,x+10,y+2,x+12,y+len-4,x+9,y+len,x+6,y+len-5,x+6,y+6,x+3,y+4],"o"),
  line(x-9,y+4,x-8,y+len-6,"W",1),line(x+9,y+4,x+8,y+len-6,"W",1),
  rect(x-7,y+1,3,3,"M"),rect(x+4,y+1,3,3,"M"),px(x-6,y+2,"p"),px(x+5,y+2,"p")
];
const star=(x,y,c="p")=>[px(x,y-2,c),px(x-1,y-1,c),px(x+1,y-1,c),hline(x-1,y,3,c),px(x,y+1,c)];

// Titán: gigantesca Miku en traje de concierto, dos coletas, armadura de altavoces y un halo LED.
boss("boss-titan",{w:46,h:44},
  poly([4,17,10,13,36,13,42,17,40,36,32,40,14,40,6,36],"X"),
  poly([10,19,36,19,34,36,12,36],"t"),rect(13,21,20,8,"k"),
  circ(17,25,5,"M"),circ(17,25,3,"X"),circ(17,25,1,"c"),
  circ(29,25,5,"M"),circ(29,25,3,"X"),circ(29,25,1,"p"),
  ...twinTails(23,9,20),...mikuFace(23,10,1.35),
  poly([14,13,19,12,23,16,27,12,32,13,29,18,17,18],"c"),poly([19,14,23,18,27,14,25,21,21,21],"O"),
  poly([10,8,12,2,17,6,23,0,29,6,34,2,36,9],"c"),hline(14,8,18,"M"),
  ...[15,19,23,27,31].map(x=>px(x,5,"p")),rect(16,33,6,6,"M"),rect(25,33,6,6,"M"),
  hline(11,39,24,"c"),...[11,16,21,26,31,36].map((x,i)=>px(x,41,i%2?"p":"c")),
  line(5,18,1,29,"M",3),line(41,18,45,29,"M",3),poly([1,28,7,26,9,32,5,35,1,32],"O"),poly([39,32,41,26,45,28,45,32,41,35],"O")
);

// Ariete: monstruo de frecuencias, dos grandes subwoofers, cuernos de onda sonora y cables colgantes.
boss("boss-ram",{w:46,h:34},
  line(38,12,43,17,"M",2),line(43,17,40,22,"M",2),px(40,23,"p"),
  ellipse(26,20,13,8,"t"),ellipse(23,17,10,5,"O"),rect(15,20,22,7,"X"),
  rect(18,22,6,7,"M"),rect(29,22,6,7,"M"),circ(21,22,3,"k"),circ(32,22,3,"k"),
  circ(21,22,2,"c"),circ(32,22,2,"p"),px(21,22,"g"),px(32,22,"g"),
  rect(17,27,5,3,"X"),rect(29,27,5,3,"X"),hline(16,29,20,"M"),
  poly([7,10,14,7,19,12,17,20,8,22,3,17],"t"),poly([3,14,0,10,1,5,4,9,7,11],"c"),
  poly([15,11,20,5,24,12,20,16],"c"),poly([26,12,31,5,35,11,31,16],"p"),
  rect(6,12,12,5,"M"),rect(7,13,10,3,"X"),hline(8,14,8,"c"),hline(8,15,8,"p"),
  ...[9,12,15,18].map(x=>px(x,18,"g")),line(12,20,9,26,"s",2),line(9,26,6,27,"s",2)
);

// Hidra: tres voces holográficas que salen de un rack, cada pantalla con su propia cara y color.
boss("boss-hydra",{w:46,h:42},
  rect(3,26,40,12,"X"),rect(5,28,36,8,"t"),hline(6,29,34,"M"),
  ...[5,18,31].map((x,i)=>[
    line(x+5,28,x+3,18,"O",3),rect(x,5,10,14,i===1?"t":"X"),
    rect(x+1,6,8,11,"k"),hline(x+2,8,6,i===1?"c":"p"),
    rect(x+2,10,2,3,"s"),rect(x+6,10,2,3,"s"),
    px(x+2,11,i===1?"c":"p"),px(x+6,11,i===1?"c":"p"),
    hline(x+3,15,4,"P"),poly([x+2,5,x+3,1,x+5,4,x+7,1,x+8,5],"c"),
    ...[x+2,x+5,x+8].map((tx,j)=>px(tx,22,j%2?"p":"c"))
  ]),
  ...[8,21,34].map(x=>circ(x,32,3,"M")),...[8,21,34].map((x,i)=>circ(x,32,1,i===1?"p":"c")),
  ...[6,11,16,21,26,31,36,41].map(x=>px(x,38,"p")),hline(7,40,32,"c")
);

// Gólem: avatar de software corrupto, cubierto con placas negras y un núcleo de audio agrietado.
boss("boss-golem",{w:42,h:42},
  poly([8,5,34,5,39,14,35,36,7,36,3,14],"t"),rect(9,10,24,24,"X"),rect(12,13,18,18,"k"),
  poly([11,11,21,7,31,11,29,15,13,15],"M"),rect(13,17,5,4,"c"),rect(24,17,5,4,"p"),
  hline(14,18,3,"g"),hline(25,18,3,"g"),poly([17,23,25,23,22,28,19,28],"R"),px(20,24,"y"),px(22,25,"c"),
  ...[16,20,24,28].map(y=>hline(12,y,18,y%2?"M":"X")),line(14,24,18,28,"p",1),line(18,28,15,32,"c",1),
  rect(1,17,9,14,"M"),rect(32,17,9,14,"M"),...[20,24,28].map(y=>[hline(2,y,7,"X"),hline(33,y,7,"X")]),
  rect(12,34,6,5,"t"),rect(24,34,6,5,"t"),hline(12,38,6,"M"),hline(24,38,6,"M"),
  poly([6,7,10,1,15,6,21,0,27,6,32,1,36,7],"O"),hline(10,7,22,"c"),...[12,17,22,27,32].map(x=>px(x,4,"p"))
);

// Jinete: diva virtual montada en un hoverboard, con cabello-cable y bastón de luz.
boss("boss-rider",{w:38,h:44},
  poly([3,31,10,25,28,25,35,31,31,36,7,36],"X"),rect(8,31,6,3,"M"),rect(24,31,6,3,"M"),
  ...twinTails(19,10,17),poly([7,16,12,9,24,9,29,16,27,29,10,29],"O"),poly([12,17,23,17,26,28,10,28],"X"),
  ...mikuFace(19,11,1.1),poly([9,15,15,13,19,17,23,13,29,15,25,20,13,20],"c"),
  poly([14,19,19,22,24,19,26,28,12,28],"t"),rect(16,22,6,3,"p"),hline(16,22,6,"c"),
  line(29,7,33,39,"M",2),line(30,7,34,39,"c",1),circ(31,5,3,"p"),circ(31,5,1,"g"),
  poly([7,6,9,1,14,5,18,0,22,5,27,1,30,7],"c"),hline(10,7,17,"M"),
  ...[12,17,22,27].map(x=>px(x,4,"p")),line(4,25,9,22,"s",2),circ(9,21,2,"g")
);

// Muralla: pared de pantallas y torres de sonido con líneas de ecualizador.
boss("boss-wall",{w:48,h:37},
  rect(2,10,44,25,"X"),rect(4,12,40,20,"t"),hline(4,12,40,"c"),hline(4,31,40,"k"),
  ...[5,18,31].map((x,i)=>[
    rect(x,14,11,15,"k"),rect(x+1,15,9,12,"M"),
    circ(x+5,20,4,"X"),circ(x+5,20,2,"c"),circ(x+5,20,1,"p"),
    ...[0,1,2,3].map(j=>rect(x+2+j*2,25-(j%2),1,3+(j%2),"p"))
  ]),
  ...[4,14,24,34,44].map(x=>rect(x,7,3,5,"M")),
  poly([2,10,7,2,13,9,20,1,27,9,35,2,46,10],"O"),hline(7,10,34,"c"),
  ...[7,17,27,37].map(x=>px(x,5,"p")),rect(1,33,46,4,"k"),hline(2,33,44,"M")
);

// Devorador: una enorme boca de altavoz con dientes de neón y núcleo de graves.
boss("boss-devourer",{w:44,h:43},
  poly([8,10,15,4,29,4,36,10,41,24,35,35,28,40,16,40,8,35,3,24],"X"),
  poly([11,10,17,7,27,7,33,11,36,23,31,31,25,35,18,35,12,31,7,23],"M"),
  rect(10,14,24,13,"k"),poly([11,14,17,18,21,14,25,18,33,14,31,24,26,27,20,24,13,27],"R"),
  ...[12,16,20,24,28,32].map(x=>poly([x,14,x+2,14,x+1,18],"g")),
  ...[14,18,22,26,30].map(x=>poly([x,27,x+2,27,x+1,23],"w")),
  px(17,19,"c"),px(26,19,"p"),circ(22,21,2,"y"),px(22,21,"g"),
  line(9,18,2,24,"M",4),line(35,18,42,24,"M",4),poly([1,23,6,22,8,29,4,31,0,28],"X"),poly([38,22,43,23,43,29,39,31,36,28],"X"),
  rect(14,34,5,6,"t"),rect(25,34,5,6,"t"),rect(12,40,8,2,"X"),rect(24,40,8,2,"X"),
  poly([12,5,15,0,19,5,22,1,25,5,30,0,33,6],"c"),...[16,21,26].map(x=>px(x,4,"p"))
);
