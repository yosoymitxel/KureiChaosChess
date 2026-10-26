// Muñeca Vampírica: losas de baldosa lila, fondo de noche y marcos violeta.
sprite("tile-a",{w:16,h:16},rect(0,0,16,16,"#c8bdc9"),hline(0,7,16,"#b2a4b5"),vline(7,0,7,"#b2a4b5"),px(3,3,"#eadfea"));
sprite("tile-a2",{w:16,h:16},rect(0,0,16,16,"#c8bdc9"),hline(0,7,16,"#b2a4b5"),vline(7,0,7,"#b2a4b5"),px(11,11,"#8d67bd"));
sprite("tile-a3",{w:16,h:16},rect(0,0,16,16,"#c8bdc9"),hline(0,7,16,"#b2a4b5"),vline(7,0,7,"#b2a4b5"),px(3,12,"#8d67bd"));
sprite("tile-b",{w:16,h:16},rect(0,0,16,16,"#514454"),hline(0,7,16,"#302638"),vline(7,0,7,"#302638"),px(11,11,"#78617e"));
sprite("tile-b2",{w:16,h:16},rect(0,0,16,16,"#514454"),hline(0,7,16,"#302638"),vline(7,0,7,"#302638"),px(3,3,"#8d67bd"));
sprite("tile-b3",{w:16,h:16},rect(0,0,16,16,"#514454"),hline(0,7,16,"#302638"),vline(7,0,7,"#302638"),px(3,12,"#8d67bd"));
sprite("table",{w:32,h:32},rect(0,0,32,32,"#100d16"),hline(0,15,32,"#1b1422"),vline(15,0,32,"#1b1422"),...[[4,5],[22,7],[8,25],[27,22],[16,17]].map(([x,y])=>px(x,y,"#302638")));
sprite("panel",{w:12,h:12},rect(0,0,4,4,"#514454"),rect(8,0,4,4,"#514454"),rect(0,8,4,4,"#514454"),rect(8,8,4,4,"#514454"),hline(4,0,4,"#8d67bd"),hline(4,11,4,"#8d67bd"),vline(0,4,4,"#8d67bd"),vline(11,4,4,"#8d67bd"));
sprite("boton",{w:12,h:12},rect(0,0,12,2,"#8d67bd"),rect(0,2,2,8,"#8d67bd"),rect(10,2,2,8,"#8d67bd"),rect(0,10,12,2,"#513c79"));
