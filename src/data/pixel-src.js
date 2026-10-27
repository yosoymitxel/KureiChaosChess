// Dirección de un PNG de las mesas píxel, desde la raíz del juego. El paquete de itch.io
// (tools/build-itch.mjs) cambia este archivo por uno con los PNG incrustados: itch admite como
// mucho 1000 archivos y las mesas píxel traen más de mil.
export const pixelSrc = (pack, name) => `assets/pixel/${pack}/${name}.png`;
