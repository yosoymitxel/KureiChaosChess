# Diseños de tools/organic-sprites.py. Lienzo 36×36 (jefes 48×44), suelo en la última fila.
# 'b' = color del bando (rampa de 5); el resto son colores fijos de cada tema.

# ---------- Terrario: bichos ----------
def legs(s, xs, y0, y1=35, spread=2.5, r=0.6):
    for x in xs:
        s.stroke([(x, y0), (x + spread, (y0 + y1) / 2 - 1), (x + spread * 1.4, y1 - 0.5)], r)

def t_pawn(s):  # cochinilla
    legs(s, [11, 15, 19, 23], 30, spread=-1)
    s.ell(17, 28, 11, 6.5)
    for x in (10, 14, 18, 22):
        s.line([(x, 22.5), (x + 0.6, 28), (x, 33)], 3)
    s.ell(28.5, 31, 3.2, 2.8).dot(29.5, 30, 'e')
    s.stroke([(30, 29), (33, 25), (34.5, 24)], 0.5)

def t_rook(s):  # caracol
    s.ell(19, 32, 14, 3.5)
    s.stroke([(29, 32), (31, 27), (31.5, 24)], 2.2, 1.8)
    s.stroke([(30.5, 24), (29.5, 19)], 0.5).stroke([(32.5, 24), (34, 19.5)], 0.5)
    s.ell(16, 19, 11, 11.5, mat='k')
    s.line([(16, 19), (18, 17), (19.5, 20), (16.5, 23.5), (12, 20), (14, 13.5), (21, 12), (25.5, 18),
            (23, 26), (16, 29)], 'kd')
    s.dot(29.5, 18.5, 'e').dot(34, 19, 'e')

def t_knight(s):  # araña saltarina
    for x0, x1 in ((14, 7), (17, 11), (21, 24), (24, 30)):
        s.stroke([(x0, 22), ((x0 + x1) / 2, 18 if x1 < x0 else 19), (x1, 35)], 0.7)
    s.ell(11, 25, 8, 6.5, rot=-15)
    s.ell(22, 18, 7.5, 6.5)
    s.stroke([(26, 20), (31, 13), (33, 15)], 0.8).stroke([(24, 21), (29, 15), (30.5, 17)], 0.7)
    s.ell(25.5, 18, 2.2, 2.2, mat='e').ell(21.5, 17, 1.8, 1.8, mat='e')
    s.dot(26, 18, 'o').dot(22, 17, 'o').dot(25, 17, 'w')

def t_bishop(s):  # mantis
    s.stroke([(15, 34.5), (17, 30), (18, 26)], 0.6).stroke([(22, 34.5), (20, 30), (19, 26)], 0.6)
    s.stroke([(16, 27), (18, 19)], 4, 2.5)
    s.stroke([(18, 19), (19, 9)], 1.6, 1.3)
    s.stroke([(19, 12), (24, 15), (22, 9), (25, 7)], 1.1, 0.7)
    s.ell(19.5, 6.5, 3.6, 2.6, rot=-10)
    s.dot(17, 6, 'e').dot(22.5, 6, 'e')
    s.stroke([(18, 4.5), (15, 1)], 0.4).stroke([(21, 4.5), (24, 0.8)], 0.4)

def t_queen(s):  # mariposa
    s.stroke([(18, 35), (18, 30)], 0.5)
    s.ell(11, 13, 8, 9, rot=-20).ell(25, 13, 8, 9, rot=20)
    s.ell(12, 25, 5.5, 5, rot=20).ell(24, 25, 5.5, 5, rot=-20)
    for x, y in ((10, 12), (26, 12), (12, 25), (24, 25)):
        s.ell(x, y, 2.4, 2.4, mat='e')
    s.stroke([(18, 10), (18, 30)], 1.6, 1.2, mat='o')
    s.stroke([(17.5, 9), (15, 4), (13, 3), (12.5, 4.5)], 0.5, mat='o')
    s.stroke([(18.5, 9), (21, 4), (23, 3), (23.5, 4.5)], 0.5, mat='o')

def t_king(s):  # escarabajo hércules con corona
    legs(s, [11, 16, 21], 30, spread=-2.5, r=0.7)
    s.ell(15, 25, 11, 8)
    s.line([(15, 18), (15.5, 25), (15, 32)], 3)
    s.ell(26, 27, 5, 4.5)
    s.stroke([(27, 24), (30, 16), (28, 9), (24, 6)], 1.8, 0.8)
    s.stroke([(28, 28), (33, 25), (34, 22)], 1, 0.5)
    s.dot(29, 26, 'e')
    s.ell(13, 15, 4.5, 2, mat='k')
    for x in (9.5, 13, 16.5):
        s.ell(x, 13, 1, 2.2, mat='k')

def t_guard(s):  # hormiga soldado
    for x in (14, 18, 22):
        s.stroke([(x, 24), (x - 2, 28), (x - 3, 35)], 0.6).stroke([(x, 24), (x + 3, 29), (x + 4, 35)], 0.6)
    s.ell(9, 25, 6.5, 5.5, rot=-25)
    s.ell(18, 22, 4, 3, rot=-10)
    s.ell(26, 15, 5, 4.5)
    s.stroke([(29, 18), (33, 20), (34, 17)], 0.9, 0.5)
    s.stroke([(24, 11), (22, 5), (25, 2)], 0.5)
    s.dot(28, 14, 'e')

def t_advisor(s):  # mariquita
    legs(s, [12, 17, 22], 31, spread=0, r=0.6)
    s.ell(17, 25, 11, 9)
    s.line([(17, 16.5), (17, 33.5)], 'o')
    for x, y in ((12, 22), (22, 22), (11, 28), (23, 28), (14, 31), (20, 31)):
        s.ell(x, y, 1.6, 1.6, mat='o')
    s.ell(29, 29, 4, 4, mat='o')
    s.dot(30.5, 28, 'e').dot(31.5, 28, 'e')

def t_elephant(s):  # escarabajo pelotero con su bola
    s.ell(10, 25, 9.5, 9.5, mat='k')
    s.line([(5, 21), (9, 19), (13, 22)], 'kd').line([(6, 29), (11, 31), (15, 28)], 'kd')
    legs(s, [22, 26, 30], 28, spread=1.5, r=0.7)
    s.stroke([(21, 26), (18, 22), (16, 20)], 0.8)
    s.ell(26, 24, 7.5, 5.5, rot=15)
    s.ell(20, 21, 3.5, 3, rot=15)
    s.dot(19, 20, 'e')

def t_camel(s):  # oruga
    pts = [(6, 32), (10, 26), (15, 31), (20, 25), (25, 30), (29, 22)]
    for i, (x, y) in enumerate(pts):
        if i < 5: s.stroke([(x, 33), (x, 35)], 0.7)
        s.ell(x, y, 4.5 if i < 5 else 5, 4.5 if i < 5 else 5)
    s.stroke([(28, 17), (26, 12)], 0.5).stroke([(31, 17.5), (33, 12.5)], 0.5)
    s.dot(30, 21, 'o').dot(31, 21, 'e')

def t_cannon(s):  # escarabajo bombardero
    legs(s, [15, 20, 25], 28, spread=1.5, r=0.7)
    s.ell(19, 24, 10, 6.5, rot=-10)
    s.ell(29.5, 25.5, 4, 3.5)
    s.dot(31, 24.5, 'e')
    s.stroke([(32, 23), (35, 19)], 0.5)
    for x, y, r in ((7, 18, 3.6), (3.5, 13, 2.8), (8, 11, 2.2), (2, 7.5, 1.6)):
        s.ell(x, y, r, r, mat='w')

# ---------- Paleontología: fósiles ----------
def p_pawn(s):  # huevo fósil
    s.ell(18, 25, 8, 10)
    s.line([(12, 22), (15, 24), (17, 21), (20, 25), (24, 23)], 3)
    s.dot(15, 19, 0)

def p_rook(s):  # caparazón de gliptodonte
    s.stroke([(10, 30), (9, 35)], 1.5).stroke([(25, 30), (26, 35)], 1.5)
    s.ell(17.5, 22, 14, 10.5)
    s.cut(17.5, 36, 20, 4)
    s.ell(31, 26, 3.5, 3)
    s.dot(32, 25, 'o')
    for y in (17, 22, 27):
        s.line([(5, y + 3), (17.5, y), (30, y + 3)], 3)
    for x in (10, 15, 20, 25):
        s.line([(x, 13), (x + 0.5, 31)], 3)

def p_knight(s):  # cráneo de raptor sobre vértebras
    s.stroke([(14, 35), (13, 28), (15, 21)], 3.2, 2.4)
    for y in (33, 29, 25):
        s.line([(11, y), (16.5, y - 0.6)], 3)
    s.ell(17, 15, 7.5, 6, rot=-15)
    s.stroke([(20, 13), (27, 15), (32, 18)], 3.2, 1.8)
    s.cut(16.5, 13.5, 2.4, 2.4).cut(25, 14.5, 1.8, 1.3)
    for x in (20, 23, 26, 29):
        s.dot(x, 18.5 - (x - 20) * 0.1, 0)
    s.stroke([(17, 20), (24, 21), (30, 20)], 0.9)

def p_bishop(s):  # amonite de canto
    s.ell(18, 21, 11, 12)
    s.line([(18, 21), (20, 19), (21.5, 22), (18, 25), (14, 21.5), (17, 16.5), (23, 17), (25, 24),
            (19, 29.5), (11, 26), (10, 17), (17, 11), (25.5, 12.5), (28.5, 19)], 4)
    for a in range(0, 360, 40):
        import math
        c, si = math.cos(math.radians(a)), math.sin(math.radians(a))
        s.dot(18 + c * 9.5, 21 + si * 10.5, 3)
    s.ell(18, 34, 6, 2, mat='r')

def p_queen(s):  # pterodáctilo
    s.stroke([(16, 35), (17, 29)], 0.6).stroke([(20, 35), (19, 29)], 0.6)
    s.stroke([(18, 20), (9, 14), (2, 18)], 1.3, 0.6).stroke([(18, 20), (27, 14), (34, 18)], 1.3, 0.6)
    s.stroke([(3, 18), (10, 18), (18, 24)], 0.6).stroke([(33, 18), (26, 18), (18, 24)], 0.6)
    s.ell(18, 24, 3, 6)
    s.stroke([(18, 18), (19, 12)], 1.4)
    s.ell(19.5, 10, 3.2, 2.6)
    s.stroke([(21, 10), (29, 11.5)], 1.1, 0.4).stroke([(18, 9), (13, 4)], 1, 0.4)
    s.cut(19.8, 9.6, 0.9, 0.9)
    for y in (22, 25):
        s.line([(16.5, y), (19.5, y)], 3)

def p_king(s):  # cráneo de T-rex con corona de ámbar
    s.ell(17, 22, 11, 8.5, rot=-8)
    s.stroke([(10, 26), (21, 30), (30, 27)], 2.6, 1.8)
    s.stroke([(15, 18), (26, 20), (32, 23)], 3.5, 2.2)
    s.cut(13, 19.5, 3, 3.2).cut(21.5, 22, 2.6, 1.7).cut(27.5, 24, 1.2, 1)
    for x in (17, 20, 23, 26, 29):
        s.stroke([(x, 25), (x, 27)], 0.5, mat='w')
    s.stroke([(14, 31), (12, 35)], 2).stroke([(20, 31), (21, 35)], 2)
    s.ell(13, 11, 6, 2.5, mat='a')
    for x in (8.5, 13, 17.5):
        s.ell(x, 8.5, 1.3, 2.6, mat='a')

def p_guard(s):  # trilobite
    s.ell(18, 23, 9, 12)
    s.ell(18, 14, 9.5, 4.5)
    s.line([(14, 15), (14, 34)], 3).line([(22, 15), (22, 34)], 3)
    for y in (19, 22.5, 26, 29.5, 32.5):
        s.line([(10, y - 1), (18, y + 0.5), (26, y - 1)], 3)
    s.dot(13, 13, 'o').dot(23, 13, 'o')

def p_advisor(s):  # ámbar engastado en hueso
    s.ell(18, 23, 9, 12)
    s.ell(18, 23.5, 6.5, 9.5, mat='a')
    s.line([(16, 19), (19, 23), (20.5, 27)], 'ad')
    s.line([(15, 22), (20, 21)], 'ad').line([(16, 25), (21, 24.5)], 'ad')
    s.dot(15, 17, 'w').dot(16, 16, 'w')
    s.stroke([(14, 35), (18, 33), (22, 35)], 1.3)

def p_elephant(s):  # cráneo de mamut con colmillos
    s.stroke([(10, 35), (11, 28)], 2).stroke([(20, 35), (19, 28)], 2)
    s.ell(15, 18, 9, 9.5)
    s.ell(19, 27, 7, 4)
    s.stroke([(21, 24), (29, 28), (33, 22), (31, 15)], 1.8, 1, mat='w')
    s.cut(17, 17, 2.3, 2.3)
    s.line([(9, 12), (14, 10), (20, 12)], 3)

def p_camel(s):  # braquiosaurio
    s.stroke([(8, 35), (9, 29)], 1.2).stroke([(20, 35), (19, 29)], 1.2)
    s.ell(14, 27, 9, 5)
    s.stroke([(6, 27), (2, 31), (1, 35)], 1.6, 0.6)
    s.stroke([(19, 25), (25, 15), (27, 6)], 2.6, 1.4)
    s.ell(29, 4.5, 3.5, 2.5)
    s.cut(29.5, 4, 0.9, 0.9)
    for x in (10, 13, 16, 19):
        s.line([(x, 23), (x + 0.5, 31)], 3)

def p_cannon(s):  # cráneo de tricerátops
    s.ell(14, 18, 10, 11, rot=-10)
    s.line([(6, 12), (11, 8), (17, 8)], 3)
    s.ell(22, 25, 8, 6)
    s.stroke([(27, 26), (32, 28), (34, 25)], 2, 1)
    s.stroke([(19, 21), (25, 13), (32, 11)], 1.3, 0.5, mat='w')
    s.stroke([(30, 23), (33, 19)], 1, 0.5, mat='w')
    s.cut(22, 23, 2.2, 2)
    s.stroke([(17, 30), (16, 35)], 2).stroke([(25, 30), (26, 35)], 2)
    for a in (8, 13, 18):
        s.dot(5, a + 2, 'w')

THEMES = {
    'terrario-vivo': {
        'outline': '#17251a',
        'fixed': {'e': ['#f1e7c9'], 'o': ['#2a2a24', '#1e1e1a'], 'w': ['#f4f1e3', '#d9d4c0', '#b8b29c'],
                  'k': ['#c99d63', '#a7784a', '#81592c', '#5e3f22', '#3f2a17'], 'kd': ['#5e3f22']},
        'sprites': {'pawn': t_pawn, 'rook': t_rook, 'knight': t_knight, 'bishop': t_bishop, 'queen': t_queen,
                    'king': t_king, 'guard': t_guard, 'advisor': t_advisor, 'elephant': t_elephant,
                    'camel': t_camel, 'cannon': t_cannon},
    },
    'paleontologia': {
        'outline': '#251b15',
        'fixed': {'o': ['#251b15'], 'w': ['#fff3d7', '#f2e4c4', '#d7c39a'],
                  'a': ['#f0bb53', '#e39a3a', '#c27a31', '#8c4d25', '#5c3018'], 'ad': ['#5c3018'],
                  'r': ['#8b755d', '#75624d', '#5e4c3b', '#4d3928']},
        'sprites': {'pawn': p_pawn, 'rook': p_rook, 'knight': p_knight, 'bishop': p_bishop, 'queen': p_queen,
                    'king': p_king, 'guard': p_guard, 'advisor': p_advisor, 'elephant': p_elephant,
                    'camel': p_camel, 'cannon': p_cannon},
    },
}

# ---------- Jefes (48×44) ----------
def tb_titan(s):  # escarabajo goliat
    legs(s, [12, 19, 26, 33], 36, y1=44, spread=-3, r=1)
    s.ell(22, 32, 16, 10)
    s.line([(22, 22.5), (22.5, 32), (22, 41.5)], 3)
    s.ell(38, 33, 7, 6)
    s.stroke([(39, 28), (43, 20), (40, 13)], 2.4, 1).stroke([(42, 31), (47, 27)], 1.2, 0.6)
    s.dot(41, 31, 'e').dot(42, 31, 'e')
    for x, y in ((14, 27), (20, 25), (28, 26)):
        s.ell(x, y, 2, 1.4, mat='w')

def tb_ram(s):  # ciervo volante embistiendo
    legs(s, [10, 17, 24], 34, y1=44, spread=-3, r=0.9)
    s.ell(17, 32, 13, 8.5, rot=-5)
    s.line([(17, 24), (17.5, 40)], 3)
    s.ell(33, 30, 6.5, 5.5)
    s.stroke([(37, 27), (43, 21), (47, 25), (44, 27)], 1.6, 0.8)
    s.stroke([(38, 33), (44, 35), (47, 31), (44, 30)], 1.6, 0.8)
    s.dot(35, 28, 'e')

def tb_hydra(s):  # tres ciempiés que se arquean hacia fuera desde el nido
    for pts, d in (([(14, 38), (10, 29), (9, 21), (5, 16)], -1), ([(34, 38), (38, 29), (39, 21), (43, 16)], 1),
                   ([(24, 38), (22, 26), (26, 15), (32, 9)], 1)):
        s.stroke(pts, 3.6, 2.6)
        for x, y in pts[1:3]:
            s.stroke([(x - 3.5, y), (x - 5.5, y + 1.5)], 0.5).stroke([(x + 3.5, y), (x + 5.5, y + 1.5)], 0.5)
            s.line([(x - 3, y), (x + 3, y)], 4)
        x, y = pts[-1]
        s.ell(x + d * 1.5, y, 3.8, 2.8, rot=-15 * d, mat='k')
        s.stroke([(x + d * 5.5, y + 1), (x + d * 7.5, y + 3)], 0.7, 0.4).stroke([(x + d * 5, y + 2.5), (x + d * 6, y + 4.5)], 0.6, 0.4)
        s.dot(x + d * 2.5, y - 0.8, 'e')
        s.stroke([(x, y - 2.5), (x - d * 2, y - 6)], 0.5)
    s.ell(24, 40, 20, 5, mat='k')

def tb_golem(s):  # termitero con ojos
    s.stroke([(10, 44), (9, 24), (11, 14)], 4.5, 2.2, mat='k')
    s.stroke([(38, 44), (39, 22), (37, 12)], 4.5, 2.2, mat='k')
    s.stroke([(24, 44), (23, 18), (25, 3)], 7, 2.6, mat='k')
    s.ell(24, 36, 19, 8, mat='k')
    s.cut(24, 47, 30, 3)
    for x, y in ((10, 22), (38, 20), (24, 12), (14, 38), (35, 38)):
        s.ell(x, y, 1.4, 1.2, mat='kd')
    s.ell(19.5, 26, 3, 2.6, mat='b').ell(28.5, 26, 3, 2.6, mat='b')
    s.dot(20, 26, 'o').dot(29, 26, 'o')
    s.stroke([(18, 33), (24, 34.5), (30, 33)], 0.9, mat='b')

def tb_rider(s):  # mantis orquídea erguida
    for x0, x1 in ((20, 14), (26, 32)):
        s.stroke([(x0, 34), ((x0 + x1) / 2, 37), (x1, 44)], 0.8)
    s.stroke([(22, 40), (24, 26)], 6, 3.6)
    s.stroke([(24, 26), (25, 10)], 2.2, 1.8)
    s.ell(14, 30, 5, 3, rot=30).ell(33, 30, 5, 3, rot=-30)
    s.stroke([(24.5, 15), (32, 20), (30, 10), (34, 6)], 1.5, 0.8)
    s.stroke([(24.5, 15), (17, 20), (19, 10), (15, 6)], 1.5, 0.8)
    s.ell(25, 6.5, 4.5, 3.2)
    s.dot(22, 6, 'e').dot(28, 6, 'e')

def tb_wall(s):  # milpiés enroscado a lo largo
    for i in range(9):
        x = 5 + i * 4.6
        s.stroke([(x, 38), (x - 1, 44)], 0.6).stroke([(x + 1.5, 38), (x + 2.5, 44)], 0.6)
    for i in range(9):
        x = 5 + i * 4.6
        s.ell(x, 33 - 2 * math.sin(i / 1.4), 3.6, 5.5)
    s.ell(45, 30, 3, 4).dot(45.5, 28.5, 'e')
    s.stroke([(46, 27), (47, 21)], 0.5)

def tb_devourer(s):  # planta carnívora
    s.stroke([(24, 44), (23, 34), (24, 26)], 2.2, 1.8, mat='g')
    s.ell(14, 40, 7, 2.5, rot=-15, mat='g').ell(34, 40, 7, 2.5, rot=15, mat='g')
    s.ell(24, 13, 17, 8, rot=-8).ell(24, 26, 16, 6.5, rot=6)
    s.ell(24, 20, 14, 4, mat='m')
    for x in range(10, 40, 3):
        s.stroke([(x, 16), (x + 0.5, 19)], 0.6, mat='w').stroke([(x + 1.5, 25), (x + 1, 22)], 0.6, mat='w')

def pb_titan(s):  # T-rex enorme
    s.ell(20, 22, 15, 12, rot=-8)
    s.stroke([(10, 30), (28, 36), (45, 31)], 3.4, 2.2)
    s.stroke([(16, 17), (34, 21), (46, 25)], 5, 3)
    s.cut(14, 19, 4, 4.4).cut(28, 24, 4, 2.6).cut(40, 26, 1.6, 1.2)
    for x in range(22, 44, 3):
        s.stroke([(x, 28.5), (x, 31.5)], 0.6, mat='w')
    s.stroke([(16, 36), (14, 44)], 2.6).stroke([(26, 37), (27, 44)], 2.6)

def pb_ram(s):  # paquicefalosaurio
    s.stroke([(4, 30), (12, 30)], 1.4, 2.5)
    s.ell(19, 30, 10, 7)
    s.stroke([(15, 36), (14, 44)], 2).stroke([(23, 36), (25, 44)], 2)
    s.stroke([(27, 27), (33, 21)], 2.6, 2)
    s.ell(38, 18, 8, 7.5)
    s.ell(42, 25, 5, 3)
    s.cut(40, 19, 1.6, 1.6)
    for a in range(-80, 90, 30):
        c, si = math.cos(math.radians(a)), math.sin(math.radians(a))
        s.dot(38 + c * 7.6, 18 - abs(si) * 7, 'w')
    for x in (10, 15, 20, 25):
        s.line([(x, 24), (x + 0.5, 35)], 3)

def pb_hydra(s):  # plesiosaurio de tres cuellos curvos con cráneos alargados
    s.ell(24, 37, 16, 6.5)
    for pts, d in (([(16, 34), (10, 27), (10, 19), (8, 14)], -1), ([(32, 34), (38, 27), (38, 19), (40, 14)], 1),
                   ([(24, 33), (23, 20), (27, 11), (32, 7)], 1)):
        s.stroke(pts, 2.6, 1.6)
        x, y = pts[-1]
        s.ell(x + d * 3, y, 5, 2.4, rot=-8 * d)
        s.cut(x + d * 1.5, y - 0.6, 0.9, 0.9)
        for k in (2, 4):
            s.dot(x + d * (k + 2), y + 2, 'w')
    s.ell(9, 42, 6, 2, rot=-20).ell(39, 42, 6, 2, rot=20)
    for x in (14, 19, 24, 29, 34):
        s.line([(x, 32), (x, 42)], 3)

def pb_golem(s):  # anquilosaurio
    s.stroke([(10, 33), (3, 30)], 2, 1.2)
    s.ell(3, 28, 3.6, 3.2)
    s.ell(22, 30, 15, 9.5)
    s.cut(22, 46, 24, 5)
    s.ell(38, 33, 5, 4)
    s.cut(39.5, 32, 1, 1)
    for x, y in ((12, 26), (18, 23), (24, 22), (30, 23), (35, 27), (15, 31), (22, 29), (29, 30)):
        s.ell(x, y, 2, 1.7, mat='w')
    for x in (13, 21, 29):
        s.stroke([(x, 37), (x, 44)], 2.2)

def pb_rider(s):  # raptor erguido
    s.stroke([(20, 30), (10, 36), (3, 33)], 2.2, 0.8)
    s.stroke([(21, 34), (17, 39), (19, 44)], 1.6, 1).stroke([(26, 34), (29, 39), (27, 44)], 1.6, 1)
    s.ell(24, 28, 6, 8, rot=-20)
    s.stroke([(27, 21), (30, 13)], 2, 1.6)
    s.ell(33, 9, 6.5, 4, rot=-10)
    s.cut(32, 8, 1.5, 1.5)
    s.stroke([(28, 24), (35, 27), (38, 24)], 1, 0.6)
    for y in (24, 28, 32):
        s.line([(20, y), (28, y - 1)], 3)

def pb_wall(s):  # estegosaurio
    s.stroke([(10, 34), (2, 38)], 2.4, 0.8)
    s.ell(23, 33, 15, 7)
    s.stroke([(36, 35), (43, 37)], 2, 1.5)
    s.ell(45, 37, 3, 2.4)
    for i, x in enumerate((12, 17, 22, 27, 32)):
        h = 7 if i in (1, 2, 3) else 5
        s.ell(x, 26 - h / 2, 2.6, h, mat='w')
    for x in (14, 21, 28, 34):
        s.stroke([(x, 38), (x, 44)], 1.8)

def pb_devourer(s):  # mosasaurio con fauces abiertas
    s.stroke([(4, 38), (16, 36), (26, 34)], 1.8, 5)
    s.stroke([(24, 28), (34, 18), (46, 15)], 4.5, 2.4)
    s.stroke([(25, 36), (36, 38), (46, 34)], 3.2, 1.8)
    s.cut(29, 26, 2.5, 2.2)
    for x in range(30, 46, 3):
        s.stroke([(x, 20.5 - (x - 30) * 0.25 + 2), (x, 24 - (x - 30) * 0.1 + 2)], 0.6, mat='w')
        s.stroke([(x, 33.5 - (x - 30) * 0.05), (x, 30.5)], 0.6, mat='w')
    s.ell(12, 42, 6, 2, rot=-10).ell(22, 41, 4.5, 1.8, rot=20)

import math  # noqa: E402
THEMES['terrario-vivo']['sprites'].update({'boss-titan': tb_titan, 'boss-ram': tb_ram, 'boss-hydra': tb_hydra,
    'boss-golem': tb_golem, 'boss-rider': tb_rider, 'boss-wall': tb_wall, 'boss-devourer': tb_devourer})
THEMES['terrario-vivo']['fixed'].update({'g': ['#6b8f4e', '#557a3e', '#40603a', '#2f4a2c'],
                                         'm': ['#b8394a', '#922d3c']})
THEMES['paleontologia']['sprites'].update({'boss-titan': pb_titan, 'boss-ram': pb_ram, 'boss-hydra': pb_hydra,
    'boss-golem': pb_golem, 'boss-rider': pb_rider, 'boss-wall': pb_wall, 'boss-devourer': pb_devourer})

# ---------- Quelonios: tortugas de perfil ----------
def tort(s, cx, gy, rx, ry, head=(0, 0), neck=None, hr=3, legs_=True, flip=1, scutes=True, plast=True):
    """Caparazón en cúpula sobre suelo gy; cabeza a la derecha."""
    top = gy - 3 - ry
    if legs_:
        for dx in (-rx * 0.55, rx * 0.45):
            s.stroke([(cx + dx, gy - 4), (cx + dx + 0.5, gy - 0.5)], 2, 2.3, mat='s')
    hx, hy = head
    if neck: s.stroke(neck, 2.2, 1.8, mat='s')
    s.ell(hx, hy, hr * 1.25, hr, mat='s')
    s.dot(hx + hr * 0.5, hy - hr * 0.35, 'o')
    s.ell(cx, gy - 3, rx, ry)
    s.cut(cx, gy + 1.5, rx + 2, 4.3)
    if plast: s.ell(cx, gy - 3.4, rx - 0.5, 1.4, mat='p')
    if scutes:
        n = max(3, int(rx / 3.4))
        for i in range(1, n):
            x = cx - rx + 2 * rx * i / n
            s.line([(x, top + 1.5 + abs(x - cx) * 0.15), (x + (x - cx) * 0.12, gy - 5)], 3)
        s.line([(cx - rx + 2, gy - 3 - ry * 0.45), (cx, top + ry * 0.5), (cx + rx - 2, gy - 3 - ry * 0.45)], 3)

def q_pawn(s):  # cría de tortuga verde con aletas
    s.stroke([(11, 33), (7, 35)], 1.6, 0.8, mat='s').stroke([(23, 32), (28, 35)], 1.8, 0.8, mat='s')
    tort(s, 17, 35, 8, 6, head=(27, 28.5), neck=[(23, 30), (26, 29)], hr=2.6, legs_=False)

def q_rook(s):  # tortuga de caja: domo alto
    tort(s, 17, 35, 11, 13, head=(30.5, 30), neck=[(26, 32), (29, 31)], hr=2.8)

def q_knight(s):  # tortuga caimán: pico ganchudo, quillas
    tort(s, 15, 35, 11, 8, head=(29, 26), neck=[(24, 30), (27, 27)], hr=4, scutes=False)
    for x in (9, 14, 19):
        s.ell(x, 35 - 3 - 8 + (abs(x - 15) * 0.3), 1.6, 2.5)
    s.stroke([(32, 26), (35, 28), (33.5, 30)], 1.1, 0.6, mat='k')
    s.stroke([(4, 32), (1, 34)], 1, 0.4, mat='s')

def q_bishop(s):  # mata mata: cabeza triangular, cuello con flecos, erguido
    tort(s, 13, 35, 9, 6, head=(25, 8), neck=[(19, 30), (23, 22), (22, 14), (24, 9)], hr=3)
    s.stroke([(27, 7), (32, 6)], 1, 0.4, mat='s')
    for y in (26, 21, 16):
        s.stroke([(20.5, y), (18, y + 1)], 0.6, mat='s').stroke([(24.5, y), (27, y + 1)], 0.6, mat='s')

def q_queen(s):  # carey: aletas largas, pico fino, escudos superpuestos
    s.stroke([(20, 25), (28, 18), (33, 17)], 1.8, 0.6, mat='s')
    s.stroke([(10, 31), (4, 34)], 1.5, 0.6, mat='s')
    tort(s, 15, 35, 11, 8, head=(30, 26), neck=[(25, 29), (28, 27)], hr=2.6, legs_=False)
    s.stroke([(32, 26), (35, 27)], 0.7, 0.4, mat='k')
    s.stroke([(21, 33), (28, 35)], 1.6, 0.8, mat='s')
    for x in (9, 14, 19):
        s.line([(x - 2, 27), (x, 23), (x + 2, 27)], 4)
    s.ell(15, 22.5, 3.5, 1.6, mat='a')
    for x in (12, 15, 18):
        s.ell(x, 20.5, 0.9, 1.8, mat='a')

def q_king(s):  # tortuga radiada con corona
    tort(s, 16, 35, 12, 11, head=(30.5, 29), neck=[(26, 31), (29, 30)], hr=2.8, scutes=False)
    for cx in (9, 16, 23):
        cy = 25 if cx == 16 else 27
        s.ell(cx, cy, 1.4, 1.4, mat='a')
        for a in range(0, 360, 60):
            import math as m
            s.dot(cx + 2.6 * m.cos(m.radians(a)), cy + 2.6 * m.sin(m.radians(a)), 'av')
    s.ell(16, 18, 5, 2, mat='a')
    for x in (12, 16, 20):
        s.ell(x, 15.5, 1.1, 2.4, mat='a')

def q_guard(s):  # tortuga mapa: quilla dentada
    tort(s, 16, 35, 11, 8, head=(29.5, 29), neck=[(25, 31), (28, 30)], hr=2.7, scutes=False)
    for x in (10, 14, 18, 22):
        s.ell(x, 23.5 - (2 if x in (14, 18) else 0), 1.2, 2.4)
    for y in (27, 30):
        s.line([(7, y), (12, y - 1.5), (17, y), (22, y - 1.5), (26, y)], 'a')

def q_advisor(s):  # tortuga pintada: borde rojo, rayas amarillas en el cuello
    tort(s, 16, 35, 11, 7.5, head=(29.5, 27), neck=[(24, 31), (28, 28)], hr=2.8)
    s.line([(5.5, 31), (16, 33.5), (26.5, 31)], 'm')
    s.line([(25, 29.5), (29, 27.5)], 'a').line([(26, 31), (31, 28.5)], 'a')

def q_elephant(s):  # Galápagos: domo y patas columnares, cuello alto
    tort(s, 15, 35, 12, 12, head=(31, 13), neck=[(24, 26), (28, 19), (30, 14)], hr=3, legs_=False)
    for x in (7, 22):
        s.stroke([(x, 29), (x, 35)], 2.6, 3, mat='s')
    s.dot(32, 15, 'k')

def q_camel(s):  # laúd: sin escudos, crestas, aletas enormes
    s.stroke([(18, 24), (26, 16), (33, 14)], 2.4, 0.6, mat='s')
    s.ell(16, 28, 13, 6.5, rot=-6)
    s.cut(16, 37, 16, 3)
    for y in (24.5, 28):
        s.line([(4, y + 2), (16, y - 1), (28, y + 1)], 3)
    s.stroke([(27, 28), (31, 27)], 2.4, mat='s')
    s.ell(32, 27, 3.2, 2.7, mat='s').dot(33, 26, 'o')
    s.stroke([(8, 32), (3, 35)], 1.6, 0.6, mat='s').stroke([(21, 32), (27, 35)], 1.6, 0.6, mat='s')

def q_cannon(s):  # caparazón blando: plano, hocico tubular
    tort(s, 15, 35, 12, 4.5, head=(28, 31), neck=[(24, 32), (27, 31)], hr=2.4, scutes=False)
    s.stroke([(30, 30.5), (35, 30)], 0.8, 0.6, mat='s')
    for x, y in ((9, 28), (14, 27), (19, 27.5), (12, 30), (18, 30.5)):
        s.dot(x, y, 4)

def qb_titan(s):  # gigante anciana
    tort(s, 20, 44, 18, 16, head=(42, 33), neck=[(34, 39), (39, 35)], hr=4, legs_=False)
    for x in (8, 30):
        s.stroke([(x, 38), (x, 44)], 3.4, 4, mat='s')
    s.stroke([(43, 37), (44, 41)], 0.7, 0.4, mat='w')

def qb_ram(s):  # caimán con mandíbula abierta, embistiendo
    tort(s, 17, 44, 15, 10, head=(37, 31), neck=[(30, 37), (34, 33)], hr=4.5, scutes=False)
    for x in (9, 15, 21, 27):
        s.ell(x, 30 - (2 if x in (15, 21) else 0), 1.8, 3)
    s.stroke([(40, 34), (46, 38), (45, 40)], 1.6, 0.8, mat='s').stroke([(40, 30), (47, 30), (46, 33)], 1.4, 0.7, mat='k')
    s.ell(42, 35, 2.5, 1.4, mat='m')

def head(s, x, y, dirx=1, r=3.2, open_=False):  # cabeza de tortuga: alargada, con pico y ojo
    s.ell(x, y, r * 1.6, r, rot=-10 * dirx, mat='s')
    s.stroke([(x + dirx * r * 1.3, y + r * 0.2), (x + dirx * r * 2, y + r * 0.7)], 1, 0.5, mat='k')
    s.dot(x + dirx * r * 0.5, y - r * 0.4, 'o')
    if open_: s.stroke([(x + dirx * r * 0.6, y + r * 0.6), (x + dirx * r * 1.7, y + r * 0.6)], 0.6, mat='m')

def qb_hydra(s):  # tres cuellos que se abren en abanico, cabezas mirando afuera
    tort(s, 20, 44, 16, 11, head=(0, 0), neck=None, hr=0.01, scutes=True)
    s.stroke([(30, 37), (37, 31), (40, 24)], 3.4, 2.4, mat='s'); head(s, 42, 21, 1, open_=True)
    s.stroke([(10, 37), (5, 30), (5, 22)], 3.4, 2.4, mat='s'); head(s, 5, 19, -1, open_=True)
    s.stroke([(20, 31), (22, 22), (21, 13)], 3.4, 2.4, mat='s'); head(s, 23, 10, 1)

def qb_golem(s):  # tortuga pétrea con musgo y cristales
    tort(s, 22, 44, 19, 14, head=(43, 36), neck=[(38, 40), (41, 37)], hr=3.6, scutes=False)
    for x, y, r in ((12, 32, 3), (22, 27, 3.6), (32, 32, 3), (17, 38, 2.4), (28, 38, 2.4)):
        s.ell(x, y, r, r * 0.8, mat='r')
    for x, h in ((14, 6), (22, 9), (29, 5)):
        s.stroke([(x, 22), (x + 1, 22 - h)], 1.8, 0.6, mat='c')
    s.ell(8, 30, 3, 1.4, mat='g').ell(36, 30, 3.5, 1.4, mat='g')

def qb_rider(s):  # cuello de serpiente en S, cabeza horizontal
    tort(s, 17, 44, 14, 9, head=(0, 0), neck=None, hr=0.01)
    s.stroke([(28, 38), (36, 33), (35, 24), (29, 18), (32, 11)], 3.4, 2.2, mat='s')
    head(s, 36, 9, 1)

def qb_wall(s):  # caparazón como escudo monumental, ancho y bajo
    tort(s, 24, 44, 23, 10, head=(46, 39), neck=[(44, 41), (45, 40)], hr=2.4)
    for x in (6, 16, 32, 42):
        s.ell(x, 30, 1.6, 1.6, mat='a')

def qb_devourer(s):  # caimán colosal con señuelo
    tort(s, 16, 44, 15, 12, head=(37, 30), neck=[(28, 37), (33, 32)], hr=5, scutes=False)
    for x in (8, 14, 20, 26):
        s.ell(x, 27 - (2 if x in (14, 20) else 0), 2, 3.2)
    s.stroke([(38, 32), (47, 40), (45, 42)], 2.2, 1, mat='s').stroke([(39, 27), (47, 25), (46, 29)], 2, 1, mat='k')
    s.ell(42, 33, 3.5, 2.2, mat='m')
    s.stroke([(43, 34), (44, 36)], 0.6, mat='m2')
    for x in (41, 44):
        s.stroke([(x, 29), (x, 31)], 0.5, mat='w')

THEMES['quelonios'] = {
    'outline': '#152325',
    'fixed': {'o': ['#101a1b'], 's': ['#9fae8a', '#7f8f6d', '#617053', '#46523e', '#2f382b'],
              'p': ['#e3d2a3', '#c9b383'], 'k': ['#cbb98e', '#a99568'], 'w': ['#f2ecd8'],
              'a': ['#f0cf62', '#d8a93e', '#a97a28', '#7a5320', '#4f3518'], 'av': ['#f0cf62'],
              'r': ['#8d8f86', '#74766e', '#5c5e57', '#45473f'], 'c': ['#a6e3e0', '#6fbcc0', '#4a8d96'],
              'g': ['#6b9a4e', '#4f7a3c'], 'm': ['#c45a5a', '#9a3e45'], 'm2': ['#f3d36b']},
    'sprites': {'pawn': q_pawn, 'rook': q_rook, 'knight': q_knight, 'bishop': q_bishop, 'queen': q_queen,
                'king': q_king, 'guard': q_guard, 'advisor': q_advisor, 'elephant': q_elephant,
                'camel': q_camel, 'cannon': q_cannon, 'boss-titan': qb_titan, 'boss-ram': qb_ram,
                'boss-hydra': qb_hydra, 'boss-golem': qb_golem, 'boss-rider': qb_rider, 'boss-wall': qb_wall,
                'boss-devourer': qb_devourer},
}

# ---------- Pizzería: comida con colores propios; el bando va en envoltorios y bandejas ----------
def tray(s, cx, rx, gy=35, h=2.6):
    s.ell(cx, gy - h, rx, h)

def burger(s, cx, gy, rx, layers=1, crown=False):
    y = gy
    s.ell(cx, y - 2, rx - 1, 2.4, mat='bun')
    y -= 3.5
    for _ in range(layers):
        s.ell(cx, y, rx, 2.2, mat='meat')
        s.stroke([(cx - rx + 1, y - 2), (cx - rx / 3, y - 0.5), (cx + rx / 3, y - 2), (cx + rx - 1, y - 0.6)], 1.1, mat='ch')
        y -= 3.4
    s.stroke([(cx - rx, y + 1), (cx - rx / 2, y + 2.2), (cx, y + 0.8), (cx + rx / 2, y + 2.2), (cx + rx, y + 1)], 1.1, mat='let')
    s.ell(cx, y - 2.5, rx, rx * 0.62, mat='bun')
    for dx in (-rx / 2, 0, rx / 2):
        s.dot(cx + dx, y - 2.5 - rx * 0.35, 'w')
    return y - 2.5 - rx * 0.62

def crown(s, cx, top, w=4.5):
    s.ell(cx, top, w, 1.8)
    for dx in (-w * 0.75, 0, w * 0.75):
        s.ell(cx + dx, top - 2.2, 1.1, 2.3)

def ff_pawn(s):  # porción de pizza en papel
    s.stroke([(18, 30), (18, 8)], 8.5, 1.2, mat='ch')
    s.stroke([(10, 30), (18, 31.5), (26, 30)], 2.6, mat='dough')
    for x, y in ((16, 24), (20, 19), (17.5, 14)):
        s.ell(x, y, 1.9, 1.7, mat='pep')
    s.stroke([(12, 33), (18, 34.5), (24, 33)], 2)

def ff_rook(s):
    tray(s, 18, 13)
    burger(s, 18, 32.5, 11)

def ff_knight(s):  # pancho en barquita
    s.stroke([(6, 25), (18, 20), (31, 13)], 4.4, 4, mat='bun')
    s.stroke([(4, 24), (18, 18), (33, 10.5)], 2.4, mat='saus')
    s.line([(7, 22), (10, 21), (13, 22), (16, 19), (19, 20), (22, 17), (25, 17), (28, 13), (31, 12)], 'mus')
    s.stroke([(7, 32), (18, 30), (29, 23)], 3.8, 3.2)

def ff_bishop(s):  # vaso con tapa y sorbete
    s.stroke([(18, 32), (18, 12)], 6, 7.5)
    s.ell(18, 10.5, 8.5, 2.2, mat='cup')
    s.stroke([(20, 9), (23, 2), (26, 0.8)], 0.8, mat='straw')
    s.stroke([(11.5, 21), (18, 22), (24.5, 21)], 1.2, mat='cup')

def ff_queen(s):  # pizza entera con corona, en su tabla
    tray(s, 18, 11)
    s.ell(18, 19, 12, 12, mat='dough')
    s.ell(18, 19, 9.8, 9.8, mat='ch')
    for x, y in ((14, 15), (22, 16), (18, 21), (13, 23), (23, 24)):
        s.ell(x, y, 2, 1.8, mat='pep')
    crown(s, 18, 5.5)

def ff_king(s):
    tray(s, 18, 13)
    top = burger(s, 18, 32.5, 11, layers=2)
    crown(s, 18, top + 1, 5)

def ff_guard(s):  # caja de papas
    for i, x in enumerate((11, 14, 17, 20, 23, 26)):
        s.stroke([(x, 22), (x + (i % 2) * 1.2 - 0.6, 3 + (i % 3) * 2.5)], 1.3, mat='fry')
    s.stroke([(18, 33), (18, 24)], 7.5, 9.5)
    s.ell(18, 28, 2.6, 2.4, mat='ch')

def ff_advisor(s):  # taco
    tray(s, 18, 12)
    s.ell(18, 24, 12, 7, mat='let')
    for x in (10, 15, 20, 25):
        s.ell(x, 19.5 + abs(x - 17.5) * 0.25, 2.2, 1.8, mat='tom')
    s.ell(18, 27, 13, 6.5, mat='nacho')
    s.cut(18, 37, 16, 4)

def ff_elephant(s):  # nachos en cuenco
    for x, y, r in ((10, 22, 5), (17, 19, 5.5), (24, 21, 5), (14, 24, 4.5), (21, 25, 4.5)):
        s.stroke([(x - r, y + 2), (x, y - r), (x + r, y + 2)], 1.6, mat='nacho')
    s.stroke([(9, 24), (14, 26), (18, 23), (23, 26), (27, 24)], 1.6, mat='ch')
    s.ell(18, 30, 13, 5)
    s.cut(18, 23, 14, 3)

def ff_camel(s):  # torre de aros de cebolla
    tray(s, 18, 11)
    for i, y in enumerate((29, 23.5, 18, 12.5)):
        x = 18 + (1 if i % 2 else -1)
        s.ell(x, y, 9 - i * 0.6, 3.4, mat='ring')
        s.ell(x, y, 4.5 - i * 0.4, 1.3, mat='ringd')

def ff_cannon(s):  # botella de kétchup con etiqueta del bando
    s.stroke([(18, 33), (18, 15)], 7, 6, mat='ket')
    s.stroke([(18, 13), (18, 7)], 3.2, 2, mat='ket')
    s.ell(18, 5, 2.4, 2, mat='cap')
    s.ell(18, 24, 6, 4.5)
    s.dot(14, 16, 'w').dot(14, 17, 'w')

def ffb_titan(s):
    tray(s, 24, 21, 44, 3)
    top = burger(s, 24, 41, 18, layers=3)
    crown(s, 24, top + 1.5, 7)

def ffb_ram(s):  # pancho acorazado con cuernos de aros
    s.stroke([(6, 33), (24, 30), (42, 27)], 6.5, 6, mat='bun')
    s.stroke([(3, 31), (24, 28), (45, 24)], 3.6, mat='saus')
    s.line([(6, 29), (10, 27), (14, 29), (18, 26), (22, 28), (26, 25), (30, 27), (34, 24), (38, 26), (42, 23)], 'mus')
    for x in (34, 43):
        s.ell(x, 15, 5, 5, mat='ring').ell(x, 15, 2, 2, mat='ringd')
    s.stroke([(6, 41), (24, 39), (42, 37)], 4.5, 4.5)
    s.ell(42, 26, 1.4, 1.4, mat='w').dot(42, 26, 'o')

def ffb_hydra(s):  # tres porciones que salen de una caja
    s.ell(24, 38, 19, 6)
    s.ell(24, 33, 17, 2.2, mat='dough')
    for base, tip in (((14, 32), (5, 10)), ((24, 32), (24, 5)), ((34, 32), (43, 10))):
        s.stroke([base, tip], 6, 1.2, mat='ch')
        bx, by = base; tx, ty = tip
        for t in (0.35, 0.65):
            s.ell(bx + (tx - bx) * t, by + (ty - by) * t, 1.8, 1.6, mat='pep')
        s.dot(bx + (tx - bx) * 0.82 - 1, by + (ty - by) * 0.82, 'o').dot(bx + (tx - bx) * 0.82 + 1, by + (ty - by) * 0.82, 'o')

def ffb_golem(s):  # horno de pizza con ojos de brasa y brazos de papas
    for x0, x1 in ((7, 2), (41, 46)):
        s.stroke([(x0, 30), (x1, 22)], 1.6, mat='fry')
    s.ell(24, 26, 18, 16, mat='brick')
    s.cut(24, 50, 24, 8)
    s.ell(24, 33, 9, 7, mat='o')
    s.ell(24, 36, 6, 3, mat='fire')
    s.ell(17, 20, 2.8, 2.4, mat='fire').ell(31, 20, 2.8, 2.4, mat='fire')
    s.ell(24, 41.5, 20, 2.5)
    s.stroke([(24, 10), (24, 3)], 2.2, mat='brick')

def ffb_rider(s):  # moto de reparto con caja de pizza
    s.ell(10, 39, 5, 5, mat='o').ell(38, 39, 5, 5, mat='o')
    s.ell(10, 39, 2, 2, mat='cap').ell(38, 39, 2, 2, mat='cap')
    s.stroke([(8, 32), (24, 34), (36, 30), (40, 20)], 4, 3)
    s.stroke([(40, 20), (44, 18)], 1.2, mat='cap')
    s.ell(14, 22, 10, 5)
    s.ell(14, 18, 10, 2, mat='dough')
    s.ell(14, 22, 3, 2, mat='ch')

def ffb_wall(s):  # barricada de cajas de pizza
    for row, y in enumerate((40, 34, 28)):
        n = 3 - row
        for i in range(n):
            x = 24 + (i - (n - 1) / 2) * 14
            s.ell(x, y, 7.4, 3)
            s.ell(x, y - 1, 2.6, 1.2, mat='ch')
    s.stroke([(8, 25), (6, 19)], 1, mat='fry').stroke([(40, 25), (42, 18)], 1, mat='fry')

def ffb_devourer(s):  # hamburguesa monstruo con fauces
    tray(s, 24, 20, 44, 3)
    s.ell(24, 37, 18, 4, mat='bun')
    s.ell(24, 22, 19, 13, mat='bun')
    s.ell(24, 28, 17, 6, mat='o')
    for x in range(10, 39, 4):
        s.stroke([(x, 22.5), (x + 1, 26)], 1, 0.4, mat='ch').stroke([(x + 2, 33), (x + 2.5, 30)], 1, 0.4, mat='ch')
    s.ell(17, 15, 3, 3, mat='tom').ell(31, 15, 3, 3, mat='tom')
    s.dot(17, 15, 'o').dot(31, 15, 'o')
    s.stroke([(7, 33), (24, 35), (41, 33)], 1.1, mat='let')

THEMES['fast-food'] = {
    'outline': '#2a1a1c',
    'fixed': {'o': ['#2a1a1c', '#22151a'], 'w': ['#fff6dc'],
              'bun': ['#f6cf7c', '#e9ab55', '#c98439', '#93582a', '#5e3720'],
              'meat': ['#9a5338', '#7a3c29', '#58291f', '#3d1c17'], 'ch': ['#ffe27a', '#f6c443', '#d79a2c', '#a5701f'],
              'let': ['#a6d86b', '#78b448', '#548a36'], 'tom': ['#ea5c4c', '#c23a33', '#8f2629'],
              'pep': ['#c8463b', '#a13230', '#76232a'], 'dough': ['#f3cd85', '#dda45a', '#b77b3a', '#86532a'],
              'saus': ['#d86c45', '#b54e33', '#863524'], 'mus': ['#ffd84a'],
              'cup': ['#f6f1e6', '#ddd5c4', '#b8ad97'], 'straw': ['#e8574a', '#b83a33'],
              'fry': ['#ffe07a', '#f4c048', '#d59a2e'], 'nacho': ['#f8cf60', '#e1a73f', '#b9792b'],
              'ring': ['#f2c06a', '#d89746', '#ab6a2e', '#7a4523'], 'ringd': ['#5b3420'],
              'ket': ['#e5453c', '#c22f2e', '#931f26', '#661a22'], 'cap': ['#f6f1e6', '#c8c0ae'],
              'brick': ['#c97a52', '#a65d3f', '#7f432f', '#5a2f24'], 'fire': ['#ffd25a', '#ff9a3a', '#e5553a']},
    'sprites': {'pawn': ff_pawn, 'rook': ff_rook, 'knight': ff_knight, 'bishop': ff_bishop, 'queen': ff_queen,
                'king': ff_king, 'guard': ff_guard, 'advisor': ff_advisor, 'elephant': ff_elephant,
                'camel': ff_camel, 'cannon': ff_cannon, 'boss-titan': ffb_titan, 'boss-ram': ffb_ram,
                'boss-hydra': ffb_hydra, 'boss-golem': ffb_golem, 'boss-rider': ffb_rider, 'boss-wall': ffb_wall,
                'boss-devourer': ffb_devourer},
}

# ---------- Niveles liminales: agentes y anomalías ----------
def agent(s, cx, gy=35, tall=1.0, face=1, tank=True, prop=None):
    """Agente de contención: botas, traje del bando con franja de peligro, cinturón, guantes, casco y tanque."""
    u = tall
    hy, ty = gy - 22 * u, gy - 13 * u
    if tank:
        s.stroke([(cx - face * 5.5, ty - 5), (cx - face * 5.5, ty + 4)], 2.6, 2.6, mat='metal')
        s.stroke([(cx - face * 5, ty - 7), (cx - face * 1, hy + 3)], 0.6, mat='hose')
    for dx in (-2.6, 2.6):
        s.stroke([(cx + dx, ty + 3), (cx + dx * 1.1, gy - 3)], 2.3, 2.1)
        s.ell(cx + dx * 1.15 + face * 0.8, gy - 1.6, 2.8, 1.8, mat='boot')
    s.ell(cx, ty, 6.2, 6.6 * u)
    s.line([(cx + face * 0.5, ty - 5.5), (cx + face * 0.5, ty + 4)], 3)
    s.stroke([(cx - 5.6, ty + 2.2), (cx + 5.6, ty + 2.2)], 0.9, mat='belt')
    s.ell(cx + face * 3.5, ty + 3.6, 1.6, 1.3, mat='belt')
    for i in range(-5, 6, 2):
        s.dot(cx + i, ty - 2, 'haz')
    s.ell(cx, hy, 5.2, 5)
    s.ell(cx + face * 1.4, hy + 0.4, 3.4, 2.6, mat='vis')
    s.dot(cx + face * 2.4, hy - 0.8, 'w').dot(cx + face * 1.4, hy - 1.2, 'w')
    s.stroke([(cx - face * 3, hy - 4), (cx - face * 1, hy - 5.2)], 0.5, mat='light')
    if prop: prop(s, cx, gy, hy, ty, face)
    else:
        s.stroke([(cx + face * 5.5, ty - 3), (cx + face * 7, ty + 3)], 1.5)
    s.ell(cx + face * 7, ty + 4, 1.4, 1.3, mat='glove')
    s.stroke([(cx - face * 5.5, ty - 3), (cx - face * 6.5, ty + 3)], 1.5)
    s.ell(cx - face * 6.5, ty + 4, 1.4, 1.3, mat='glove')

def li_pawn(s):  # agente con linterna
    def torch(s, cx, gy, hy, ty, f):
        s.stroke([(cx + 5.5, ty - 3), (cx + 8, ty - 1)], 1.5)
        s.stroke([(cx + 8, ty - 1.5), (cx + 11, ty - 3)], 1.2, mat='torch')
        s.ell(cx + 12.2, ty - 3.5, 1.4, 1.6, mat='light')
        for k in range(3):
            s.dot(cx + 14 + k, ty - 4 - k * 0.6, 'light')
    agent(s, 15, tall=0.95, prop=torch)

def li_rook(s):  # cápsula de contención con algo dentro
    s.ell(18, 33.5, 12, 2.4, mat='haz2')
    for x in range(8, 29, 3):
        s.dot(x, 33, 'o')
    s.stroke([(18, 31), (18, 9)], 9.8, 9.2, mat='metal')
    s.stroke([(18, 29), (18, 11)], 7.6, 7.2)
    s.ell(18, 18, 5.4, 7.2, mat='glass')
    s.ell(18, 20, 2.6, 4.6, mat='o').ell(18, 15, 2.2, 2.2, mat='o')
    s.dot(17, 14.5, 'red').dot(19, 14.5, 'red')
    s.dot(15, 13, 'w').dot(15, 14, 'w').dot(16, 12, 'w')
    for x, y in ((11, 9), (25, 9), (11, 29), (25, 29)):
        s.dot(x, y, 'w')
    s.ell(18, 2.6, 2.6, 2, mat='red')
    s.dot(17.5, 2, 'w')
    s.ell(18, 27.5, 3.4, 1.2, mat='paper')

def li_knight(s):  # corredor famélico de cuatro patas
    for x0, xm, x1, ph in ((9, 6, 4, 1), (13, 12, 11, 0), (22, 25, 24, 0), (25, 30, 31, 1)):
        s.stroke([(x0, 19), (xm, 26), (x1, 33)], 1.1, 0.7)
        s.stroke([(x1, 33), (x1 + 1.6, 35)], 0.6, mat='claw')
    s.stroke([(6, 18), (2, 14), (1, 10)], 0.9, 0.4)
    s.ell(16, 18, 10, 3.8, rot=-8)
    for x in (11, 14, 17, 20):
        s.line([(x, 15.5), (x + 0.8, 20.5)], 4)
    s.line([(8, 17), (24, 15)], 0)
    s.stroke([(24, 15), (27, 9), (30, 6)], 2.3, 1.6)
    s.ell(31.5, 6, 4.4, 2.7, rot=18)
    s.ell(31, 5.4, 1.2, 1, mat='o').dot(31, 5, 'red')
    s.line([(32, 7.5), (34, 8), (35.5, 7.4)], 'w')

def li_bishop(s):  # sonriente: alto, brazos larguísimos, sonrisa
    s.stroke([(15, 35), (16, 29), (16.5, 23)], 1.4, 1.2).stroke([(21, 35), (20, 29), (19.5, 23)], 1.4, 1.2)
    s.stroke([(18, 24), (18, 12)], 4.2, 3)
    s.line([(16.5, 15), (19.5, 15)], 3).line([(16.5, 18), (19.5, 18)], 3).line([(17, 21), (19, 21)], 3)
    for d in (-1, 1):
        s.stroke([(18 + d * 3, 13), (18 + d * 7, 20), (18 + d * 8, 30)], 1, 0.7)
        for k in (-1, 0, 1):
            s.stroke([(18 + d * 8, 30), (18 + d * (8 + k * 0.8), 33)], 0.4, mat='claw')
    s.ell(18, 7, 5.6, 6)
    s.ell(15.8, 5.5, 1.3, 1.6, mat='o').ell(20.2, 5.5, 1.3, 1.6, mat='o')
    s.stroke([(13.5, 8.5), (16, 11), (20, 11), (22.5, 8.5)], 1, mat='o')
    for x in (14.5, 16, 17.5, 19, 20.5, 22):
        s.dot(x, 9.6 + (0.6 if 15 < x < 21 else 0), 'w')

def li_queen(s):  # gran ojo con venas y tentáculos, coronado
    for x0, x1, c in ((11, 6, -2), (15, 13, 1), (21, 23, -1), (25, 30, 2)):
        s.stroke([(x0, 19), ((x0 + x1) / 2 + c, 27), (x1, 33), (x1 + c * 0.6, 35)], 1.4, 0.4)
    s.ell(18, 14, 10.5, 9.5)
    s.ell(18, 14, 7.6, 6.4, mat='eye')
    for pts in ([(11, 12), (13, 13), (14, 15)], [(24.5, 11), (23, 13)], [(12, 17.5), (14, 17)], [(24, 17), (22.5, 16)]):
        s.line(pts, 'vein')
    s.ell(19, 14, 3.6, 3.8, mat='iris')
    s.ell(19, 14, 1.5, 2.6, mat='o')
    s.dot(17.5, 12, 'w').dot(18, 12, 'w')
    s.ell(18, 3.4, 5, 1.6, mat='gold')
    for x in (14, 18, 22):
        s.ell(x, 1.4, 1, 1.8, mat='gold')
    s.dot(18, 1, 'red')

def li_king(s):  # director con máscara de gas, gabardina, corona y halo
    s.ell(15.5, 34, 2.4, 1.4, mat='boot').ell(21, 34, 2.4, 1.4, mat='boot')
    s.stroke([(18, 32), (18, 14)], 7.6, 5.4)
    s.line([(18, 15), (18, 31)], 4)
    s.stroke([(14, 15), (17, 21)], 0.7, mat='coatl').stroke([(22, 15), (19, 21)], 0.7, mat='coatl')
    s.stroke([(18, 15.5), (18, 22)], 0.6, mat='red')
    s.ell(21.5, 23, 1.2, 1.5, mat='gold')
    s.stroke([(12, 17), (11, 27)], 1.6).stroke([(24, 17), (25, 27)], 1.6)
    s.ell(11, 28, 1.4, 1.3, mat='glove').ell(25, 28, 1.4, 1.3, mat='glove')
    s.ell(18, 10, 4.6, 5, mat='mask')
    s.ell(16.4, 9, 1.4, 1.3, mat='vis').ell(19.8, 9, 1.4, 1.3, mat='vis')
    s.ell(18, 13, 2.2, 1.8, mat='metal')
    s.dot(18, 13, 'o')
    s.stroke([(11, 4.2), (25, 4.2)], 1.1, mat='light')
    s.ell(18, 1.8, 3.6, 1.1, mat='gold')
    for x in (15.5, 18, 20.5):
        s.ell(x, 0.6, 0.7, 1.2, mat='gold')

def li_guard(s):  # guardia con escudo antidisturbios y porra
    def shield(s, cx, gy, hy, ty, f):
        s.stroke([(cx + 8, gy - 4), (cx + 8, ty - 9)], 4.6, 4.4, mat='shield')
        s.line([(cx + 6.5, ty - 6), (cx + 9.5, ty - 6)], 'shd')
        s.line([(cx + 6.5, ty - 4), (cx + 9.5, ty - 4)], 'shd')
        s.dot(cx + 6.5, ty - 10, 'w').dot(cx + 6.5, ty - 9, 'w')
    agent(s, 14, tall=1.05, tank=False, prop=shield)

def li_advisor(s):  # investigador con bata, gafas y carpeta
    s.ell(15, 34, 2.4, 1.4, mat='boot').ell(20.5, 34, 2.4, 1.4, mat='boot')
    s.stroke([(15.5, 33), (15.5, 26)], 1.8, mat='pants').stroke([(20, 33), (20, 26)], 1.8, mat='pants')
    s.stroke([(18, 27), (18, 15)], 6.6, 5)
    s.stroke([(18, 16), (18, 27)], 3.2, 2.6, mat='coat')
    s.line([(18, 16), (18, 27)], 'shd')
    s.stroke([(13, 16), (12, 25)], 1.5)
    s.ell(12, 26, 1.3, 1.2, mat='skin')
    s.ell(18, 10, 4.4, 4.8, mat='skin')
    s.stroke([(13.6, 8), (18, 5.2), (22.4, 8)], 1.4, mat='hair')
    s.ell(16.6, 10.4, 1.4, 1.2, mat='vis').ell(20, 10.4, 1.4, 1.2, mat='vis')
    s.line([(15, 10.4), (21.4, 10.4)], 'o')
    s.dot(18.5, 13, 'shd')
    s.stroke([(23, 16), (25, 22)], 1.4)
    s.ell(25.5, 23, 3.4, 4.6, mat='board')
    s.ell(25.5, 23.4, 2.6, 3.6, mat='paper')
    for y in (21.5, 23, 24.5):
        s.line([(24, y), (27, y)], 'shd')
    s.ell(21.5, 17, 1.2, 1.5, mat='badge')

def li_elephant(s):  # masa de carne con ojos y bocas
    s.ell(18, 27, 14, 8)
    s.ell(9, 30, 6, 5).ell(27, 30, 6, 5).ell(18, 18, 9, 8).ell(25, 21, 5, 5).ell(11, 21, 5, 5)
    for x, y in ((6, 34), (14, 35), (23, 35), (30, 34)):
        s.stroke([(x, 33), (x + 0.3, 35)], 0.8)
    eyes = ((12, 21, 2.6), (19, 16, 3.4), (26, 22, 2.2), (16, 27, 2), (8, 29, 1.6), (28, 30, 1.8), (22, 25, 1.4))
    for x, y, r in eyes:
        s.ell(x, y, r, r * 0.9, mat='eye')
        s.ell(x + 0.4, y, r * 0.45, r * 0.6, mat='o')
        s.dot(x - r * 0.4, y - r * 0.4, 'w')
    s.stroke([(20, 31), (24, 32), (27, 31)], 0.7, mat='o')
    s.dot(21, 31.5, 'w').dot(23, 32, 'w').dot(25, 32, 'w')

def li_camel(s):  # lámpara de pie viva con raíces
    for x0, x1 in ((17, 10), (18, 15), (19, 23), (20, 27)):
        s.stroke([(18.5, 29), ((x0 + x1) / 2, 32), (x1, 35)], 0.8, 0.5, mat='root')
    s.stroke([(18.5, 30), (17, 22), (19, 15), (23, 11)], 1.2, mat='metal')
    s.ell(18.5, 28, 2.6, 1.4, mat='metal')
    s.ell(26, 9, 7.6, 5, rot=22)
    s.ell(28, 12.4, 5, 1.4, rot=22, mat='light')
    for k in range(5):
        s.dot(23 + k * 2, 14.5 + k * 0.8, 'light')
    for x in range(20, 33, 2):
        s.stroke([(x, 11 + (x - 20) * 0.35), (x, 13 + (x - 20) * 0.35)], 0.35, mat='fringe')
    s.ell(25, 7.5, 2.2, 1.8, mat='eye').dot(25.5, 7.5, 'o')

def li_cannon(s):  # cabeza de tele que dispara estática
    s.stroke([(15, 35), (15.5, 27)], 1.8, mat='pants').stroke([(20, 35), (19.5, 27)], 1.8, mat='pants')
    s.ell(15, 34.5, 2.3, 1.3, mat='boot').ell(20.5, 34.5, 2.3, 1.3, mat='boot')
    s.ell(17.5, 24, 5.6, 5.4)
    s.stroke([(13, 21), (11, 27)], 1.4).stroke([(22, 21), (26, 18)], 1.4)
    s.stroke([(14, 6), (11, 1)], 0.4, mat='metal').stroke([(20, 6), (23, 1)], 0.4, mat='metal')
    s.ell(17.5, 12, 9, 7, mat='metal')
    s.ell(16.5, 12, 6.6, 5, mat='static')
    for x, y in ((14, 10), (18, 13), (15, 14), (19, 10), (13, 12), (20, 15)):
        s.dot(x, y, 'w')
    s.ell(24.5, 10, 1, 1, mat='red').ell(24.5, 14, 1, 1, mat='o')
    for x, r in ((29, 3), (32.5, 4.2)):
        s.stroke([(x, 12 - r), (x + 1.2, 12), (x, 12 + r)], 0.5, mat='static')

def lib_titan(s):  # sabueso enorme con costillas
    for x0, xm, x1 in ((11, 7, 8), (16, 18, 15), (30, 28, 31), (35, 39, 38)):
        s.stroke([(x0, 28), (xm, 36), (x1, 42)], 2.4, 1.6)
        s.stroke([(x1 - 1, 43), (x1 + 2, 44)], 0.6, mat='claw')
    s.stroke([(7, 25), (3, 18), (5, 12)], 1.6, 0.5)
    s.ell(23, 26, 17, 8.5)
    for x in range(12, 34, 3):
        s.line([(x, 20), (x + 1.4, 30)], 4)
    s.line([(8, 22), (38, 19)], 0)
    s.stroke([(36, 23), (39, 16)], 4, 3)
    s.ell(40, 13, 6.4, 5, rot=12)
    s.ell(40.5, 12.6, 1.6, 1.4, mat='o').dot(40.5, 12.3, 'red')
    s.stroke([(37, 17), (41, 18.5), (45, 16)], 1, mat='o')
    for x in (38.5, 40.5, 42.5):
        s.dot(x, 17.6, 'w')

def lib_ram(s):  # masa de carne que embiste
    for x in (10, 18, 26):
        s.stroke([(x, 36), (x - 2, 43)], 2.2).stroke([(x + 4, 36), (x + 6, 43)], 2.2)
    s.ell(21, 28, 17, 10)
    s.ell(12, 22, 7, 6).ell(24, 20, 8, 6)
    s.ell(37, 28, 8.5, 8.5)
    s.ell(41, 28, 3.8, 5, mat='o')
    for y in (24.5, 27, 29.5, 32):
        s.dot(39.5, y, 'w').dot(42.6, y, 'w')
    for x, y, r in ((12, 21, 2.2), (24, 19, 2.6), (18, 30, 1.8), (30, 25, 1.6)):
        s.ell(x, y, r, r, mat='eye').ell(x + 0.4, y, r * 0.45, r * 0.6, mat='o')
    for x in (8, 15, 28):
        s.stroke([(x, 37), (x + 0.3, 39)], 0.6, mat='drip')

def lib_hydra(s):  # tres tallos con ojo que salen de una grieta
    s.ell(24, 40.5, 19, 3.5, mat='carpet')
    s.ell(24, 40, 11, 2, mat='o')
    for pts, d in (([(17, 39), (10, 30), (8, 21), (6, 13)], -1), ([(24, 38), (25, 26), (22, 16), (24, 8)], 0),
                   ([(31, 39), (38, 30), (40, 21), (42, 13)], 1)):
        s.stroke(pts, 3, 1.8)
        for x, y in pts[1:3]:
            s.line([(x - 2, y + 0.5), (x + 2, y - 0.5)], 4)
        x, y = pts[-1]
        s.ell(x, y, 4.6, 4)
        s.ell(x + d * 0.5, y, 3, 2.7, mat='eye')
        s.ell(x + d * 0.8, y, 1.1, 1.8, mat='o')
        s.dot(x - 1, y - 1, 'w')

def lib_golem(s):  # pared de papel pintado que camina, con enchufe y cara
    s.stroke([(16, 35), (14, 43)], 3.2).stroke([(32, 35), (34, 43)], 3.2)
    s.ell(14, 43, 4, 1.6, mat='boot').ell(34, 43, 4, 1.6, mat='boot')
    s.stroke([(9, 16), (3, 26), (4, 33)], 2.6, 2).stroke([(39, 16), (45, 26), (44, 33)], 2.6, 2)
    s.stroke([(24, 34), (24, 8)], 15, 14, mat='wall')
    for x in (13, 19, 25, 31, 37):
        s.line([(x, 6), (x + 0.4, 37)], 'walld')
    for x, y in ((15, 12), (21, 28), (33, 12), (29, 30)):
        s.ell(x, y, 1.4, 1.1, mat='stain')
    s.ell(18, 17, 3, 3, mat='o').ell(30, 17, 3, 3, mat='o')
    s.dot(18, 17, 'light').dot(30, 17, 'light')
    s.ell(24, 26, 5.5, 2.4, mat='o')
    for x in (20.5, 23, 25.5, 28):
        s.dot(x, 25, 'w')
    s.ell(24, 33, 2, 1.6, mat='plug').dot(23.4, 33, 'o').dot(24.6, 33, 'o')
    s.stroke([(10, 6.5), (38, 6.5)], 1.1)

def lib_rider(s):  # entidad encorvada sobre un carrito de supermercado
    s.ell(14, 42, 2, 2, mat='o').ell(32, 42, 2, 2, mat='o')
    s.ell(14, 42, 0.8, 0.8, mat='metal').ell(32, 42, 0.8, 0.8, mat='metal')
    s.stroke([(10, 29), (12, 39), (34, 39), (38, 29)], 0.9, mat='metal')
    s.stroke([(10, 29), (38, 29)], 0.8, mat='metal')
    for x in range(13, 36, 3):
        s.line([(x, 30), (x + 0.5, 38)], 'metal')
    s.stroke([(38, 29), (42, 26)], 0.8, mat='metal')
    s.stroke([(22, 30), (24, 19), (28, 11)], 3.6, 2.4)
    for y in (21, 24, 27):
        s.line([(21.5, y), (25.5, y - 0.6)], 4)
    s.stroke([(25, 20), (34, 24), (41, 26)], 1, 0.6).stroke([(25, 20), (17, 25), (12, 28)], 1, 0.6)
    s.ell(30, 7, 5.2, 6)
    s.ell(28, 6, 1.2, 1.5, mat='o').ell(32, 6, 1.2, 1.5, mat='o')
    s.stroke([(26.5, 9), (28.5, 11), (32, 11), (34, 9)], 0.9, mat='o')
    for x in (27.5, 29.5, 31.5, 33):
        s.dot(x, 10, 'w')

def lib_wall(s):  # tramo de pasillo vivo con puerta y ojos
    s.stroke([(3, 32), (45, 32)], 11, mat='wall')
    s.ell(24, 21.5, 22, 1.6, mat='light')
    for x in (5, 12, 36, 43):
        s.line([(x, 23), (x, 42)], 'walld')
    s.stroke([(24, 42), (24, 26)], 5.5, 5)
    s.ell(24, 34, 3.6, 7.2, mat='o')
    s.ell(27, 34, 0.9, 0.9, mat='gold')
    s.ell(14, 28, 2.4, 1.8, mat='eye').ell(34, 27, 2.4, 1.8, mat='eye')
    s.dot(14.5, 28, 'o').dot(34.5, 27, 'o')
    s.ell(8, 38, 1.6, 1.3, mat='stain').ell(40, 37, 1.4, 1.1, mat='stain')
    s.ell(24, 43, 23, 1.5, mat='carpet')

def lib_devourer(s):  # boca abierta en la moqueta
    s.ell(24, 37, 23.5, 7, mat='carpet')
    s.ell(24, 34.5, 16, 7)
    s.ell(24, 34, 12, 4.4, mat='o')
    s.ell(24, 35.5, 5, 2, mat='tongue')
    for x in range(14, 35, 3):
        s.stroke([(x, 30), (x + 0.6, 32.6)], 0.8, 0.3, mat='w').stroke([(x + 1.5, 38), (x + 1, 35.4)], 0.8, 0.3, mat='w')
    for pts in ([(9, 33), (4, 22), (8, 12), (6, 7)], [(39, 33), (44, 22), (40, 12), (42, 7)]):
        s.stroke(pts, 2.4, 0.6)
    s.ell(24, 17, 6.5, 5.5)
    s.ell(24, 17, 4.4, 3.6, mat='eye')
    s.ell(24, 17, 1.6, 2.8, mat='o')
    s.dot(22.6, 15.6, 'w')
    for x in (12, 36):
        s.ell(x, 40, 1.6, 1, mat='stain')

THEMES['liminal'] = {
    'outline': '#15130d',
    'fixed': {'o': ['#0f0e0a'], 'w': ['#fbf6e6'], 'vis': ['#7fd2d8', '#4f9fae', '#2f6c7c'],
              'light': ['#fffbe0', '#f4eba0'], 'torch': ['#5b5e63', '#3e4146'],
              'metal': ['#b7bcc0', '#959ba1', '#737a82', '#545a62'], 'glass': ['#8fd0c8', '#5ea79f', '#3d7a74'],
              'eye': ['#f6f1df', '#d9d2ba'], 'gold': ['#f0cf62', '#d4a73c'], 'skin': ['#d8c3a5', '#b89f80'],
              'shield': ['#a9c4d6', '#7f9fb6', '#5e7c94'], 'shd': ['#3a4752'], 'paper': ['#f4f0e2', '#d8d1bc'],
              'static': ['#c9ced2', '#8e959b', '#5d646b'], 'wall': ['#e3d38c', '#cbb76a', '#a9944c', '#7d6c35'],
              'walld': ['#a9944c'], 'door': ['#8a6a44', '#6c5034', '#4e3925'],
              'carpet': ['#b5a05a', '#978348', '#776636'], 'haz': ['#f2d23c'], 'haz2': ['#f2d23c', '#cfae22', '#9a7f17'],
              'hose': ['#4a4d52', '#34373b'], 'boot': ['#4d4a44', '#3a3833', '#2a2925'], 'belt': ['#5a4b36', '#433727'],
              'glove': ['#3e4a52', '#2c353b'], 'red': ['#ff5a4a', '#c8352f'], 'claw': ['#e8e2cf', '#bdb59c'],
              'vein': ['#d0504a'], 'iris': ['#6fc2b0', '#3f8f80', '#2b6358'], 'coatl': ['#2a2e33'],
              'mask': ['#6d7378', '#555b60', '#3f4448'], 'pants': ['#5c5a53', '#46443e'], 'coat': ['#f1efe7', '#d6d3c7', '#b3b0a3'],
              'hair': ['#5a4130', '#3f2d21'], 'board': ['#9a7550', '#7a5a3c'], 'badge': ['#f0cf62'],
              'root': ['#6c5a3c', '#4f4029'], 'fringe': ['#d9b65a'], 'drip': ['#b04848'], 'stain': ['#9a8644'],
              'plug': ['#f1efe7', '#cfcbbb'], 'tongue': ['#c4505a', '#963a44']},
    'fine': True,
    'sprites': {'pawn': li_pawn, 'rook': li_rook, 'knight': li_knight, 'bishop': li_bishop, 'queen': li_queen,
                'king': li_king, 'guard': li_guard, 'advisor': li_advisor, 'elephant': li_elephant,
                'camel': li_camel, 'cannon': li_cannon, 'boss-titan': lib_titan, 'boss-ram': lib_ram,
                'boss-hydra': lib_hydra, 'boss-golem': lib_golem, 'boss-rider': lib_rider, 'boss-wall': lib_wall,
                'boss-devourer': lib_devourer},
}

# ---------- Marino: arrecife y abismo ----------
def fish(s, cx, cy, rx, ry, tail=True, d=1, eye=True):
    if tail: s.stroke([(cx - d * rx * 0.8, cy), (cx - d * (rx + 3), cy - 3)], 1.6, 0.6).stroke([(cx - d * rx * 0.8, cy), (cx - d * (rx + 3), cy + 3)], 1.6, 0.6)
    s.ell(cx, cy, rx, ry)
    s.ell(cx + d * rx * 0.2, cy + ry * 0.45, rx * 0.7, ry * 0.4, mat='belly')
    if eye: s.ell(cx + d * rx * 0.6, cy - ry * 0.25, 1.3, 1.3, mat='eye').dot(cx + d * rx * 0.65, cy - ry * 0.25, 'o')

def m_pawn(s):  # pez payaso
    fish(s, 18, 27, 8, 6)
    for x in (15, 20):
        s.stroke([(x, 21.5), (x + 0.5, 32.5)], 1, mat='w')
    s.stroke([(16, 21.5), (19, 18.5), (22, 21.5)], 1.2)

def m_rook(s):  # coral cerebro
    s.ell(18, 26, 13, 9)
    s.cut(18, 37, 16, 3)
    for y in (21, 25, 29):
        s.line([(7, y), (10, y - 1.5), (13, y + 1), (16, y - 1.5), (19, y + 1), (22, y - 1.5), (25, y + 1), (28, y - 1)], 4)

def m_knight(s):  # pez espada
    s.stroke([(25, 24), (35, 17)], 0.8, 0.4, mat='w')
    s.stroke([(15, 26), (12, 18), (17, 24)], 1.5, 0.6)
    fish(s, 17, 30, 9, 5, d=1)

def m_bishop(s):  # caballito de mar
    s.stroke([(17, 33), (13, 30), (14, 26), (17, 27)], 1.6, 1)
    s.stroke([(18, 31), (19, 22), (16, 15), (17, 9)], 3.6, 2.6)
    s.ell(18.5, 7, 3.4, 3)
    s.stroke([(20, 7.5), (25, 9)], 1, 0.7)
    s.dot(19, 6, 'o')
    for y in (14, 18, 22, 26):
        s.line([(16, y), (20, y - 0.5)], 3)
    s.stroke([(15, 4), (16, 2)], 0.6).stroke([(18, 4), (18.5, 1.5)], 0.6)

def m_queen(s):  # pulpo con corona
    for x0, x1, c in ((12, 4, 2), (15, 10, -2), (21, 26, 2), (24, 32, -2)):
        s.stroke([(x0, 22), ((x0 + x1) / 2 + c, 29), (x1, 34)], 1.8, 0.6)
    s.ell(18, 15, 8, 9)
    s.ell(15, 17, 1.6, 1.8, mat='eye').ell(21, 17, 1.6, 1.8, mat='eye')
    s.dot(15.5, 17.5, 'o').dot(21.5, 17.5, 'o')
    s.ell(18, 5, 4.5, 1.6, mat='gold')
    for x in (14.5, 18, 21.5):
        s.ell(x, 3, 0.9, 1.8, mat='gold')

def m_king(s):  # tiburón blanco con corona
    s.stroke([(18, 22), (16, 12), (21, 20)], 2, 0.6)
    fish(s, 18, 26, 12, 6)
    s.line([(25, 29), (27, 30), (29, 29.5)], 'o')
    for x in (26, 28):
        s.dot(x, 30, 'w')
    s.stroke([(15, 30), (13, 35)], 1.4)
    s.ell(16, 8, 3.6, 1.4, mat='gold')
    for x in (13.5, 16, 18.5):
        s.ell(x, 6.4, 0.8, 1.5, mat='gold')

def m_guard(s):  # manta
    s.ell(18, 24, 15, 6, rot=-4)
    s.ell(18, 26, 11, 3, mat='belly')
    s.stroke([(13, 20), (11, 16)], 1, 0.5).stroke([(23, 20), (25, 16)], 1, 0.5)
    s.stroke([(18, 29), (18, 35)], 0.6)
    s.dot(13, 21, 'o').dot(23, 21, 'o')

def m_advisor(s):  # medusa luna
    s.ell(18, 17, 11, 8)
    s.cut(18, 27, 14, 3.5)
    for x in (12, 15, 18, 21, 24):
        s.stroke([(x, 22.5), (x + 1.5, 28), (x - 0.5, 35)], 0.5, mat='tent')
    for x, y in ((14, 16), (22, 16), (16, 13), (20, 13)):
        s.ell(x, y, 1.6, 1.4, mat='gold')

def m_elephant(s):  # tortuga verde
    s.stroke([(10, 30), (3, 35)], 2, 0.8, mat='skin').stroke([(23, 30), (31, 35)], 2, 0.8, mat='skin')
    s.ell(30, 25, 3.5, 2.8, mat='skin').dot(31, 24, 'o')
    s.ell(17, 28, 11, 7)
    for x in (12, 17, 22):
        s.line([(x - 2, 25), (x, 23), (x + 2, 25), (x + 2, 30), (x - 2, 30), (x - 2, 25)], 4)

def m_camel(s):  # pez luna
    s.stroke([(17, 12), (19, 2)], 2.4, 1).stroke([(17, 30), (19, 35)], 2.4, 1)
    s.ell(18, 21, 9, 10)
    s.ell(19, 24, 7, 4.5, mat='belly')
    s.ell(23, 17, 1.6, 1.6, mat='eye').dot(23.5, 17, 'o')
    s.ell(9, 21, 1.6, 4)

def m_cannon(s):  # nautilus
    for y in (26, 29, 32):
        s.stroke([(26, 26), (31, y), (34, y + 2)], 0.6, mat='tent')
    s.ell(17, 22, 11, 11)
    s.line([(17, 22), (19, 20), (20.5, 23), (17, 26), (13, 22.5), (16, 17), (22, 18), (24, 25), (18, 30.5), (10, 27), (9, 18), (16, 12)], 4)
    for a in (40, 80, 120, 160, 200):
        import math as mm
        s.line([(17 + 5 * mm.cos(mm.radians(a)), 22 - 5 * mm.sin(mm.radians(a))), (17 + 10 * mm.cos(mm.radians(a)), 22 - 10 * mm.sin(mm.radians(a)))], 2)
    s.ell(26, 25, 3, 2.5, mat='skin').dot(26.5, 24.5, 'o')

def mb_titan(s):  # ballena
    s.stroke([(6, 26), (1, 20)], 2.4, 1).stroke([(6, 26), (1, 32)], 2.4, 1)
    s.ell(25, 28, 19, 10)
    s.ell(28, 33, 14, 4.5, mat='belly')
    for x in range(18, 42, 3):
        s.line([(x, 31), (x + 1, 36)], 'shd')
    s.ell(38, 25, 1.6, 1.6, mat='eye').dot(38.5, 25, 'o')
    for x, y in ((31, 14), (29, 10), (33, 9), (31, 6)):
        s.ell(x, y, 1.2, 1.2, mat='foam')
    s.stroke([(24, 36), (20, 43)], 2, 1)

def mb_ram(s):  # tiburón martillo
    s.stroke([(10, 26), (4, 21)], 1.6, 0.6).stroke([(10, 26), (4, 31)], 1.6, 0.6)
    s.stroke([(22, 20), (20, 11), (26, 19)], 2.4, 0.6)
    s.ell(23, 26, 13, 6)
    s.ell(23, 29, 10, 2.5, mat='belly')
    s.stroke([(37, 20), (37, 32)], 2.6)
    s.ell(37, 19, 1.6, 1.6, mat='eye').ell(37, 33, 1.6, 1.6, mat='eye')
    s.dot(37, 19, 'o').dot(37, 33, 'o')
    s.stroke([(20, 31), (18, 42)], 1.4)

def mb_hydra(s):  # dragón marino de tres cabezas
    s.ell(24, 38, 15, 5)
    for pts, d in (([(17, 36), (11, 28), (10, 19), (7, 14)], -1), ([(24, 35), (24, 22), (26, 12), (29, 7)], 1), ([(31, 36), (37, 28), (38, 19), (40, 14)], 1)):
        s.stroke(pts, 2.6, 1.8)
        x, y = pts[-1]
        s.ell(x, y, 4, 2.6, rot=-10 * d)
        s.stroke([(x + d * 3, y + 1), (x + d * 5.5, y + 2)], 0.8, 0.4)
        s.dot(x + d * 0.8, y - 0.8, 'o')
        s.stroke([(x - d * 2, y - 2), (x - d * 4, y - 4)], 0.5, mat='fin')
    s.stroke([(9, 40), (2, 43)], 1.6, 0.6).stroke([(39, 40), (46, 43)], 1.6, 0.6)

def mb_golem(s):  # guardián de coral ramificado
    s.stroke([(16, 36), (14, 44)], 3).stroke([(32, 36), (34, 44)], 3)
    s.ell(24, 28, 13, 11, mat='rock')
    for pts in ([(15, 22), (9, 12), (6, 4)], [(9, 12), (14, 6)], [(33, 22), (39, 12), (42, 4)], [(39, 12), (34, 6)], [(24, 18), (24, 6)]):
        s.stroke(pts, 1.8, 1.2)
    s.ell(19, 26, 2.4, 2, mat='eye').ell(29, 26, 2.4, 2, mat='eye')
    s.dot(19, 26, 'o').dot(29, 26, 'o')
    for x, y in ((16, 33), (24, 35), (31, 32)):
        s.ell(x, y, 1.6, 1.3, mat='polyp')
    s.stroke([(11, 28), (5, 34)], 2.2).stroke([(37, 28), (43, 34)], 2.2)

def mb_rider(s):  # caballito abisal alto
    s.stroke([(24, 42), (19, 40), (19, 35), (23, 36)], 2, 1.2)
    s.stroke([(25, 40), (27, 28), (22, 18), (24, 9)], 5.5, 3.6)
    s.ell(25.5, 6, 5, 4)
    s.stroke([(29, 7), (36, 9)], 1.4, 0.9)
    s.dot(27, 5, 'glow')
    for y in (16, 21, 26, 31, 36):
        s.line([(22, y), (28, y - 0.5)], 3)
    s.stroke([(21, 3), (19, 0.5)], 0.6).stroke([(24, 2), (24, 0)], 0.6)
    s.stroke([(21, 20), (16, 22)], 1.4, 0.6, mat='fin')

def mb_wall(s):  # almeja gigante abierta
    s.ell(24, 36, 21, 7)
    s.ell(24, 26, 19, 9)
    s.cut(24, 33, 16, 4)
    s.ell(24, 33, 14, 3.4, mat='flesh')
    s.ell(24, 32, 3.4, 2.8, mat='pearl')
    for x in (10, 17, 24, 31, 38):
        s.line([(x, 19), (24 + (x - 24) * 1.2, 29)], 4)
        s.line([(x, 39), (24 + (x - 24) * 1.2, 42)], 4)

def mb_devourer(s):  # rape abisal
    s.stroke([(30, 14), (36, 5), (41, 6)], 0.8, 0.5)
    s.ell(42, 7, 2.4, 2.4, mat='glow')
    s.stroke([(8, 30), (2, 25)], 1.8, 0.6).stroke([(8, 30), (2, 35)], 1.8, 0.6)
    s.ell(24, 28, 16, 13)
    s.ell(32, 32, 9, 6, mat='o')
    for x in range(25, 40, 3):
        s.stroke([(x, 26.5), (x + 0.5, 29.5)], 0.7, 0.3, mat='w').stroke([(x + 1.5, 37.5), (x + 1, 34.5)], 0.7, 0.3, mat='w')
    s.ell(27, 19, 2.2, 2.2, mat='eye').dot(27.5, 19, 'o')
    s.stroke([(20, 40), (17, 44)], 1.8, 0.8)

THEMES['marino'] = {
    'outline': '#0e2a33', 'fine': True,
    'fixed': {'o': ['#0b1c22'], 'w': ['#f4f6ef'], 'eye': ['#f4f6ef', '#d6dcd4'], 'belly': ['#eef2e4', '#d3dccc', '#b4c1b2'],
              'sand': ['#d8cda9', '#b8ab84'], 'gold': ['#f2cf62', '#d4a63a', '#a57b26'], 'tent': ['#f2b6c8', '#d48aa4'],
              'skin': ['#c9b98a', '#a8986b', '#857750'], 'foam': ['#e8f6fb', '#bfe0ea'], 'fin': ['#e86a5a', '#b9473f'],
              'rock': ['#e48e7a', '#c66f61', '#9e5049', '#723637'], 'polyp': ['#ffd47a', '#e3a64a'],
              'glow': ['#fff3a0', '#ffd75a'], 'flesh': ['#f0a0a8', '#cf7884'], 'pearl': ['#fbf7ea', '#dcd6c4'], 'shd': ['#4a8e8d']},
    'sprites': {'pawn': m_pawn, 'rook': m_rook, 'knight': m_knight, 'bishop': m_bishop, 'queen': m_queen, 'king': m_king,
                'guard': m_guard, 'advisor': m_advisor, 'elephant': m_elephant, 'camel': m_camel, 'cannon': m_cannon,
                'boss-titan': mb_titan, 'boss-ram': mb_ram, 'boss-hydra': mb_hydra, 'boss-golem': mb_golem,
                'boss-rider': mb_rider, 'boss-wall': mb_wall, 'boss-devourer': mb_devourer},
}

# ---------- Naturaleza: solo el jinete (el PNG original venía roto) ----------
def nb_rider(s):  # ciervo del bosque, alto y estrecho
    for x0, x1 in ((19, 18), (23, 24), (27, 28)):
        s.stroke([(x0, 30), (x1, 43)], 1.2, 1)
    s.ell(23, 27, 7, 5)
    s.stroke([(27, 24), (29, 14)], 2.6, 2)
    s.ell(30.5, 12, 3.6, 2.6, rot=20)
    s.dot(31, 11, 'o')
    for d in (-1, 1):
        s.stroke([(29 + d, 10), (29 + d * 4, 4), (29 + d * 3, 0.8)], 0.7, mat='wood')
        s.stroke([(29 + d * 3, 6), (29 + d * 6, 5)], 0.5, mat='wood')
    s.ell(22, 25, 2, 1.4, mat='leaf').ell(25, 28, 1.6, 1.2, mat='leaf')

THEMES['naturaleza'] = {'outline': '#1f2a1c', 'fine': True,
    'fixed': {'o': ['#14140f'], 'wood': ['#9a7046', '#74512f'], 'leaf': ['#f2d46a', '#d1a63c']},
    'sprites': {'boss-rider': nb_rider}}
