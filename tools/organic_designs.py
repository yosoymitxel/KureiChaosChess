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

def tb_hydra(s):  # tres ciempiés de un nido
    for pts in ([(14, 36), (8, 26), (10, 16), (6, 9)], [(24, 36), (24, 22), (22, 12), (25, 4)],
                [(34, 36), (40, 26), (38, 16), (43, 10)]):
        s.stroke(pts, 3.6, 2.6)
        for i in range(1, 3):
            x, y = pts[i]
            s.line([(x - 3, y), (x + 3, y)], 4)
        x, y = pts[-1]
        s.ell(x, y, 4, 3.4).dot(x - 1.5, y - 1, 'e').dot(x + 1.5, y - 1, 'e')
        s.stroke([(x - 2, y + 2.5), (x - 3.5, y + 5)], 0.6).stroke([(x + 2, y + 2.5), (x + 3.5, y + 5)], 0.6)
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

def pb_hydra(s):  # plesiosaurio de tres cuellos
    s.ell(24, 37, 16, 6.5)
    for pts in ([(16, 34), (8, 22), (6, 10)], [(24, 33), (25, 18), (22, 5)], [(32, 34), (40, 22), (42, 11)]):
        s.stroke(pts, 2.6, 1.5)
        x, y = pts[-1]
        s.ell(x + 1.5, y, 4, 2.6)
        s.cut(x + 1, y - 0.5, 0.9, 0.9)
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
