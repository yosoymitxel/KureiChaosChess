# Genera piezas y jefes píxel "orgánicos" (formas por unión de elipses y trazos curvos, con volumen
# y contorno) para los temas paleontologia y terrario-vivo. Escribe en art/temas/<id>/dibujos/.
# Uso: python3 tools/organic-sprites.py && node tools/pixel-art.mjs
import json, math, os
import numpy as np
from PIL import Image

LIGHT = np.array([-0.55, -0.8])

def hexc(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

class Sprite:
    def __init__(s, w, h):
        s.w, s.h = w, h
        yy, xx = np.mgrid[0:h, 0:w]
        s.X, s.Y = xx + 0.5, yy + 0.5
        s.part = np.full((h, w), -1)
        s.mat = []
        s.n = 0
        s.marks = []

    def _put(s, m, mat):
        s.part[m] = s.n
        s.mat.append(mat)
        s.n += 1
        return s

    def ell(s, cx, cy, rx, ry, rot=0, mat='b'):
        a = math.radians(rot); c, si = math.cos(a), math.sin(a)
        dx, dy = s.X - cx, s.Y - cy
        u, v = dx * c + dy * si, -dx * si + dy * c
        return s._put((u / rx) ** 2 + (v / ry) ** 2 <= 1, mat)

    def stroke(s, pts, r0, r1=None, mat='b'):
        r1 = r0 if r1 is None else r1
        m = np.zeros((s.h, s.w), bool)
        P = curve(pts)
        for i, (x, y) in enumerate(P):
            r = r0 + (r1 - r0) * i / max(1, len(P) - 1)
            m |= (s.X - x) ** 2 + (s.Y - y) ** 2 <= r * r
        return s._put(m, mat)

    def cut(s, cx, cy, rx, ry, rot=0):
        a = math.radians(rot); c, si = math.cos(a), math.sin(a)
        dx, dy = s.X - cx, s.Y - cy
        u, v = dx * c + dy * si, -dx * si + dy * c
        s.part[(u / rx) ** 2 + (v / ry) ** 2 <= 1] = -1
        return s

    def dot(s, x, y, col):  # detalle fijo de 1 píxel (ojo, brillo)
        s.marks.append((int(x), int(y), col)); return s

    def line(s, pts, col, w=0.5):  # surco o dibujo encima, en curva
        for x, y in curve(pts, 0.35):
            s.marks.append((int(x), int(y), col))
        return s

    def render(s, ramp, out, fixed):
        h, w = s.h, s.w
        img = np.zeros((h, w, 4), np.uint8)
        inside = s.part >= 0
        # altura por parte: distancia al borde de su propia parte -> volumen redondo
        H = np.zeros((h, w))
        for p in range(s.n):
            m = s.part == p
            if m.any(): H[m] = dist_in(m)[m]
        gy, gx = np.gradient(np.sqrt(H))
        nrm = np.sqrt(gx ** 2 + gy ** 2) + 1e-6
        lit = -(gx * LIGHT[0] + gy * LIGHT[1]) / nrm
        flat = nrm < 0.05
        lit[flat] = 0.15
        for y in range(h):
            for x in range(w):
                p = s.part[y, x]
                if p < 0: continue
                mat = s.mat[p]
                l = lit[y, x] * 0.8 + min(H[y, x], 4) / 4 * 0.35 - (y / h) * 0.25
                k = 0 if l > 0.55 else 1 if l > 0.2 else 2 if l > -0.2 else 3
                # parte de atrás tapada: línea oscura donde toca una parte de encima
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    q = s.part[y + dy, x + dx] if 0 <= y + dy < h and 0 <= x + dx < w else -1
                    if q > p and s.mat[q] == mat: k = 4; break
                col = ramp[k] if mat == 'b' else fixed[mat][min(k, len(fixed[mat]) - 1)]
                img[y, x] = (*col, 255)
        for x, y, col in s.marks:
            if 0 <= x < w and 0 <= y < h and inside[y, x]:
                c = ramp[col] if isinstance(col, int) else fixed[col][0]
                img[y, x] = (*c, 255)
        # contorno de 1 píxel por fuera
        o = np.zeros((h, w), bool)
        o[1:] |= inside[:-1]; o[:-1] |= inside[1:]; o[:, 1:] |= inside[:, :-1]; o[:, :-1] |= inside[:, 1:]
        o &= ~inside
        img[o] = (*out, 255)
        im = Image.fromarray(img, 'RGBA')
        return im

def dist_in(m):
    h, w = m.shape
    ys, xs = np.nonzero(~m)
    edge = list(zip(ys, xs)) + [(-1, x) for x in range(w)] + [(h, x) for x in range(w)] + \
        [(y, -1) for y in range(h)] + [(y, w) for y in range(h)]
    E = np.array(edge, float)
    D = np.zeros((h, w))
    for y, x in zip(*np.nonzero(m)):
        D[y, x] = np.sqrt(((E[:, 0] - y) ** 2 + (E[:, 1] - x) ** 2).min())
    return D

def curve(pts, step=0.5):  # Catmull-Rom por los puntos
    if len(pts) < 2: return pts
    P = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = map(np.array, (P[i - 1], P[i], P[i + 1], P[i + 2]))
        n = max(2, int(np.linalg.norm(p2 - p1) / step))
        for j in range(n):
            t = j / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
                              (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(np.array(pts[-1], float))
    return [tuple(p) for p in out]

def save(im, path):
    bb = im.getbbox()
    w, h = im.size
    if bb:  # pies en la última fila, centrado horizontal
        c = im.crop((0, 0, w, bb[3]))
        im = Image.new('RGBA', (w, h)); im.alpha_composite(c, (0, h - c.height))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path)

from organic_designs import THEMES  # noqa: E402

for th, spec in THEMES.items():
    tema = json.load(open(f'art/temas/{th}/tema.json'))
    ramp = [hexc(c) for c in tema['bandos']['claro']]
    fixed = {k: [hexc(c) for c in v] for k, v in spec['fixed'].items()}
    out = hexc(spec['outline'])
    for name, fn in spec['sprites'].items():
        boss = name.startswith('boss')
        s = Sprite(48, 44) if boss else Sprite(36, 36)
        fn(s)
        save(s.render(ramp, out, fixed), f"art/temas/{th}/dibujos/{'jefes' if boss else 'piezas'}/{name}_l.png")
        print(th, name)
