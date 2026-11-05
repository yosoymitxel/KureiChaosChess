# Casillas y mesa del tema liminal: moqueta y papel pintado amarillos, techo de tubos. Escribe en dibujos/fondos.
import os, random
from PIL import Image
D = 'art/temas/liminal/dibujos/fondos'; os.makedirs(D, exist_ok=True)
hx = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def tile(name, base, dark, light, seed, stain=False):
    r = random.Random(seed); im = Image.new('RGB', (16, 16), hx(base)); px = im.load()
    for y in range(16):
        for x in range(16):
            if (x + y * 3) % 7 == 0 and r.random() < 0.6: px[x, y] = hx(dark)
            elif r.random() < 0.05: px[x, y] = hx(light)
    if stain:
        cx, cy = r.randint(4, 11), r.randint(4, 11)
        for y in range(16):
            for x in range(16):
                if (x - cx) ** 2 + (y - cy) ** 2 * 1.6 < 9: px[x, y] = hx(dark)
    im.save(f'{D}/{name}.png')
tile('tile-a', '#d9c98a', '#cdbb79', '#e6d9a3', 1); tile('tile-a2', '#d9c98a', '#cdbb79', '#e6d9a3', 2)
tile('tile-a3', '#d9c98a', '#c4b16e', '#e6d9a3', 3, stain=True)
tile('tile-b', '#a8934f', '#9a8545', '#b5a15e', 4); tile('tile-b2', '#a8934f', '#9a8545', '#b5a15e', 5)
tile('tile-b3', '#a8934f', '#8d7a3e', '#b5a15e', 6, stain=True)
im = Image.new('RGB', (32, 32), hx('#1c1a12')); px = im.load()
for y in range(32):
    for x in range(32):
        if x % 16 == 0 or y % 16 == 0: px[x, y] = hx('#24211a')
for x in range(3, 13): px[x, 7] = hx('#3b3828'); px[x, 8] = hx('#4a4632')
for x in range(19, 29): px[x, 23] = hx('#3b3828'); px[x, 24] = hx('#4a4632')
im.save(f'{D}/table.png')
