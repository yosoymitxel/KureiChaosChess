# Casillas y mesa de los temas generados: textura suave de dos tonos, una variante con mancha y una mesa
# oscura en mosaico. Uso: python3 tools/theme-tiles.py <tema> ; escribe en art/temas/<tema>/dibujos/fondos.
import os, random, sys
from PIL import Image

# tema: (casilla clara base, oscura, luz), (casilla oscura ...), (mesa, junta, detalle)
PRESETS = {
    'liminal': (('#d9c98a', '#cdbb79', '#e6d9a3'), ('#a8934f', '#9a8545', '#b5a15e'), ('#1c1a12', '#24211a', '#3b3828')),
    'volcan': (('#c9a58a', '#b8927a', '#d8b9a0'), ('#5a4a4a', '#4c3e3f', '#6c5654'), ('#1a1212', '#241818', '#5a2a1a')),
    'toxico': (('#b9c49a', '#a9b588', '#c9d3ab'), ('#4f5e52', '#435146', '#5f6e5f'), ('#121a14', '#1a241c', '#2f5a2a')),
}
hx = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
th = sys.argv[1]
light, dark, table = PRESETS[th]
D = f'art/temas/{th}/dibujos/fondos'; os.makedirs(D, exist_ok=True)

def tile(name, base, shade, glint, seed, stain=False):
    r = random.Random(seed); im = Image.new('RGB', (16, 16), hx(base)); px = im.load()
    for y in range(16):
        for x in range(16):
            if (x + y * 3) % 7 == 0 and r.random() < 0.6: px[x, y] = hx(shade)
            elif r.random() < 0.05: px[x, y] = hx(glint)
    if stain:
        cx, cy = r.randint(4, 11), r.randint(4, 11)
        for y in range(16):
            for x in range(16):
                if (x - cx) ** 2 + (y - cy) ** 2 * 1.6 < 9: px[x, y] = hx(shade)
    im.save(f'{D}/{name}.png')

for i, (pre, c) in enumerate((('tile-a', light), ('tile-b', dark))):
    tile(pre, *c, 3 * i + 1); tile(pre + '2', *c, 3 * i + 2); tile(pre + '3', *c, 3 * i + 3, stain=True)
im = Image.new('RGB', (32, 32), hx(table[0])); px = im.load()
for y in range(32):
    for x in range(32):
        if x % 16 == 0 or y % 16 == 0: px[x, y] = hx(table[1])
for x in range(3, 13): px[x, 7] = hx(table[2]); px[x, 8] = hx(table[2])
for x in range(19, 29): px[x, 23] = hx(table[2]); px[x, 24] = hx(table[2])
im.save(f'{D}/table.png')
