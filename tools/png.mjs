// PNG mínimo para las herramientas de arte, sin dependencias: lee lo que exportan Aseprite,
// Piskel, LibreSprite o Pixel Studio (RGB, RGBA, gris o paleta indexada, 8 bits o menos, sin
// entrelazar) y escribe RGBA de 8 bits. Los píxeles van como Uint8Array RGBA, fila por fila.
import { inflateSync, deflateSync, crc32 } from 'node:zlib';

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

export function decodePNG(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('no es un PNG');
  let w, h, depth, type, interlace, palette, trns;
  const idat = [];
  for (let at = 8; at < buf.length;) {
    const len = buf.readUInt32BE(at), kind = buf.toString('latin1', at + 4, at + 8), data = buf.subarray(at + 8, at + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12]; }
    else if (kind === 'PLTE') palette = data;
    else if (kind === 'tRNS') trns = data;
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    at += 12 + len;
  }
  if (interlace) throw new Error('PNG entrelazado: expórtalo sin entrelazar');
  if (depth === 16) throw new Error('PNG de 16 bits: expórtalo a 8 bits');
  const ch = CHANNELS[type], bpp = Math.max(1, (ch * depth) >> 3), stride = (w * ch * depth + 7) >> 3;
  const raw = inflateSync(Buffer.concat(idat)), rows = new Uint8Array(stride * h);
  // Deshacer los filtros de fila (ninguno, sub, arriba, media, Paeth).
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride, up = row - stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? rows[row + i - bpp] : 0, b = y ? rows[up + i] : 0, c = y && i >= bpp ? rows[up + i - bpp] : 0;
      let v = raw[src + i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      rows[row + i] = v;
    }
  }
  const px = new Uint8Array(w * h * 4), max = (1 << depth) - 1;
  const sample = (y, i) => depth === 8 ? rows[y * stride + i] : (rows[y * stride + ((i * depth) >> 3)] >> (8 - depth - ((i * depth) & 7))) & max;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, s = (k) => sample(y, x * ch + k);
    if (type === 3) {
      const i = s(0);
      px.set([palette[i * 3], palette[i * 3 + 1], palette[i * 3 + 2], trns && i < trns.length ? trns[i] : 255], o);
    } else {
      const g = (v) => Math.round((v * 255) / max);
      if (type === 0 || type === 4) { const v = g(s(0)); px.set([v, v, v, type === 4 ? g(s(1)) : 255], o); }
      else px.set([g(s(0)), g(s(1)), g(s(2)), type === 6 ? g(s(3)) : 255], o);
      if (trns && type === 2 && s(0) === trns.readUInt16BE(0) && s(1) === trns.readUInt16BE(2) && s(2) === trns.readUInt16BE(4)) px[o + 3] = 0;
      if (trns && type === 0 && s(0) === trns.readUInt16BE(0)) px[o + 3] = 0;
    }
  }
  return { w, h, px };
}

export function encodePNG({ w, h, px }) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(px.buffer, px.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  const chunk = (kind, data) => {
    const head = Buffer.alloc(8); head.writeUInt32BE(data.length); head.write(kind, 4, 'latin1');
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
    return Buffer.concat([head, data, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

export const hex = (px, o) => '#' + [px[o], px[o + 1], px[o + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
export const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
