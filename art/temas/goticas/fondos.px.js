// Gótico Sepulcral: losas de pizarra con juntas, fondo de sillería nocturna y marcos de hierro.
pal({
  k: "#121318",
  w: "#a9a6ae", W: "#9c99a2", o: "#7d7a85", O: "#57535e", b: "#343541",
  g: "#8e8a94", G: "#6f6b76", X: "#25282d"
});
sprite("tile-a", { w: 16, h: 16 }, rect(0, 0, 16, 16, "g"), hline(0, 7, 16, "G"), vline(5, 0, 7, "G"), vline(12, 8, 8, "G"), px(2, 3, "w"), px(10, 12, "W"), line(7, 9, 9, 11, "O"));
sprite("tile-a2", { w: 16, h: 16 }, rect(0, 0, 16, 16, "g"), hline(0, 7, 16, "G"), vline(5, 0, 7, "G"), vline(12, 8, 8, "G"), line(2, 2, 4, 4, "O"), px(13, 11, "o"));
sprite("tile-a3", { w: 16, h: 16 }, rect(0, 0, 16, 16, "g"), hline(0, 7, 16, "G"), vline(5, 0, 7, "G"), vline(12, 8, 8, "G"), px(2, 12, "o"), line(8, 9, 10, 11, "O"));
sprite("tile-b", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 7, 16, "b"), vline(5, 0, 7, "b"), vline(12, 8, 8, "b"), px(2, 3, "o"), line(7, 9, 9, 11, "b"));
sprite("tile-b2", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 7, 16, "b"), vline(5, 0, 7, "b"), vline(12, 8, 8, "b"), line(2, 2, 4, 4, "b"), px(13, 11, "o"));
sprite("tile-b3", { w: 16, h: 16 }, rect(0, 0, 16, 16, "O"), hline(0, 7, 16, "b"), vline(5, 0, 7, "b"), vline(12, 8, 8, "b"), px(2, 12, "b"), line(8, 9, 10, 11, "b"));
sprite("table", { w: 32, h: 32 }, rect(0, 0, 32, 32, "k"), hline(0, 0, 32, "b"), hline(0, 16, 32, "b"), vline(0, 0, 32, "b"), vline(16, 0, 16, "b"), vline(16, 16, 16, "b"), ...[[4,4],[10,11],[23,5],[28,22],[7,26],[20,29],[25,14],[13,20]].map(([x,y]) => px(x,y,"X")));
sprite("panel", { w: 12, h: 12 }, rect(0, 0, 4, 4, "b"), rect(8, 0, 4, 4, "b"), rect(0, 8, 4, 4, "b"), rect(8, 8, 4, 4, "b"), hline(4, 0, 4, "O"), hline(4, 11, 4, "O"), vline(0, 4, 4, "O"), vline(11, 4, 4, "O"));
sprite("boton", { w: 12, h: 12 }, rect(0, 0, 12, 2, "O"), rect(0, 2, 2, 8, "O"), rect(10, 2, 2, 8, "O"), rect(0, 10, 12, 2, "b"), hline(2, 1, 8, "w"));
