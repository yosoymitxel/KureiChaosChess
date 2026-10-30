// Inventario independiente de Chess Mayhem (APK). Prototipos fijados en dificultad Normal.
// Las entradas son un catálogo de laboratorio; nunca se registran en las partidas del juego principal.
const APK_BASE_CATALOG = [
  { id:'race', name:'Pawn Race', family:'mini', description:'Carrera de peones por turnos: elige un peón, tira 1–4 y avanza por casillas con turbos, hielo, bombas, portales, estrellas y monedas.', overlap:'Mecánica nueva para Kure’i: carrera con dado y losetas de efecto.' },
  { id:'dodge', name:'Bomb Dodge', family:'mini', description:'Cuatro reyes sobreviven a rondas de bombas: las casillas rojas anuncian el impacto, las explosiones dejan cráteres y aparecen escudos.', overlap:'Se apoya en los reyes, el tablero y VFX actuales; añade supervivencia por rondas.' },
  { id:'feast', name:"Knight's Feast", family:'mini', description:'Festín de 45 segundos: solo saltos de caballo, recoge gemas y encadénalas para combos; las doradas dan tiempo y los pinchos lo quitan.', overlap:'Reutiliza el caballo, la rejilla y los efectos; objetivo, reloj y puntuación aislados.' },
  { id:'chaos', name:'Chaos Chess', family:'mode', description:'Cada pieza obtiene un poder: rey teletransportador, dama que empuja, torre que atraviesa, alfil que deja rastro maldito y caballo que vuelve a saltar tras capturar; un augurio altera cada partida.', overlap:'Hay piezas especiales y mutaciones en Kure’i; falta reunir esos poderes en un modo.' },
  { id:'battle', name:'Battle Chess', family:'mode', description:'Las piezas tienen HP, ataque y defensa. Una captura abre un duelo con tirada de daño, críticos y contraataque si el defensor sobrevive.', overlap:'Los jefes ya usan HP; esto muestra el duelo aplicado a una pieza normal.' },
  { id:'zombie', name:'Zombie Chess', family:'mode', description:'Tras cada ronda los zombis persiguen la pieza viva más cercana e infectan piezas adyacentes. El rey resiste una mordida; la segunda puede matarlo. Cada cinco turnos llega un evento de horda.', overlap:'Plaga zombi y Contagio ya existen; aquí se aísla la transformación, los efectos y la idea de persecución por rondas.' },
  { id:'bomb', name:'Bomb Chess', family:'mode', description:'Las piezas con mecha explotan al ser capturadas en un área 3×3, pudiendo alcanzar al atacante y a un rey. Las bombas encadenan explosiones y se encienden nuevas mechas cada ocho turnos.', overlap:'Bomberman y Campo minado tienen explosiones; este patrón liga la bomba a capturas.' },
  { id:'gravity', name:'Gravity Chess', family:'mode', description:'Después de cada movimiento las piezas se deslizan con la gravedad hasta bloquearse. Plataformas doradas las anclan; agujeros negros absorben piezas y la dirección cambia durante la partida.', overlap:'Derrumbe y hielo son parciales; la gravedad global sería una mecánica aparte.' },
  { id:'boss', name:'Boss Chess', family:'mode', description:'Un ejército se enfrenta a un demonio 2×2 con 45 HP: aplasta piezas, lanza fuego, invoca esbirros y entra en furia por debajo de media vida.', overlap:'Kure’i ya tiene jefes de varias casillas y HP; el prototipo muestra golpes, vida y respuesta visual.' },
  { id:'arena', name:'Chaos Arena', family:'mode', description:'Cada tres turnos un evento global altera la partida: tablero que se derrite, agujeros negros, terremotos, espejo, intercambio de reyes o piezas enfurecidas.', overlap:'Ya existen meteoritos, derrumbes y varios modificadores; falta un director de eventos combinado.' },
  { id:'cards', name:'Card Chess', family:'mode', description:'Mazo de hechizos: empiezas con tres cartas, robas periódicamente y juegas una por turno antes de mover, sin gastar el movimiento.', overlap:'Comparte la idea central con las cartas tácticas de Kure’i.' },
  { id:'micro', name:'Micro Chess', family:'mode', description:'Ajedrez tradicional de tablero 5×5, 6×6 o 7×7, con jaque y mate reales y sin enroque.', overlap:'Kure’i admite tableros pequeños; aquí se muestra el formato compacto, no se duplica el motor de reglas.' },
  { id:'infinite', name:'Infinite Chess', family:'mode', description:'Supervivencia en solitario sin rey rival: hordas, portales, trampas, lava y reglas que cambian. Puntuación por capturas y turnos; objetivo de 40 turnos.', overlap:'Comparte ideas con Última resistencia y Yo, Zombi; aquí se estudia la oleada infinita.' },
  { id:'mayhem', name:'Mayhem Mode', family:'mode', description:'Fusiona tres conjuntos de reglas aleatorios —poderes, HP, bombas, gravedad, eventos, cartas e infección— para crear una partida distinta.', overlap:'Se parece a combinar modificadores, pero los tres sistemas combinados son el modo en sí.' },
  { id:'pdodge', name:'Pawn Dodge', family:'arcade', description:'Esquiva piezas de ajedrez que caen siguiendo sus propios patrones; los roces cercanos dan puntos extra y hay potenciadores.', overlap:'Prototipo Arcade de acción, reutiliza piezas y VFX, no el motor por turnos.' },
  { id:'parkour', name:'Knight Parkour', family:'arcade', description:'Escala una torre saltando en L entre plataformas; evita pinchos y vacío mientras sube la lava, y recoge monedas.', overlap:'Reutiliza saltos de caballo y marcadores del tablero, con un bucle de acción separado.' },
  { id:'blaster', name:'Bishop Blaster', family:'arcade', description:'Sobrevive a oleadas con un alfil que dispara hechizos diagonales automáticamente al enemigo cercano; el espacio entre oleadas permite mejorar.', overlap:'Reutiliza ataques diagonales y oleadas como ideas, no una partida de ajedrez.' },
  { id:'rampage', name:'Rook Rampage', family:'arcade', description:'La torre carga por filas o columnas hasta el acero y aplasta todo en su camino; cadenas largas multiplican la puntuación.', overlap:'Reutiliza patrones lineales y VFX de captura; los combos son propios del Arcade.' },
  { id:'panic', name:'King Panic', family:'arcade', description:'Mueve un rey una casilla para esquivar ataques anunciados de torres, alfiles, caballos y dama; sobrevivir y esquivar cerca suma puntos.', overlap:'Tiene relación con el aviso de peligro de Campo minado, pero los patrones de ataque son nuevos.' },
  { id:'queen', name:'Queen Mode', family:'arcade', description:'La dama carga por líneas y diagonales y aplasta peones con ondas de choque. La horda se acerca; cada contacto agota una vida.', overlap:'Reutiliza la pieza dama y los efectos actuales, con objetivo Arcade y vidas.' },

];

export const APK_MISSING_MODES = [
  { id:'boss2', name:'Boss Chess 2.0', family:'mode', description:'Duelo normal mientras un jefe ataca a ambos ejércitos. Cada cuatro turnos marca una zona (fila, columna, cruz o 3×3) y ataca en el siguiente. Pisa puntos débiles dorados para dañarlo.', source:'BOSS2 · BOSS2_ATK · Boss2.tick' },
  { id:'horde', name:'Horde Mode', family:'mode', description:'Prototipo jugable: rey + 3 piezas elegidas frente a cinco oleadas de CPU. Limpia cada oleada para elegir 1 de 3 mejoras; los jefes requieren varios golpes.', source:'HORDE_DRAFT · HORDE_UP · Horde.setup/spawnWave' },
  { id:'randarmy', name:'Random Army', family:'mode', description:'Una selección aleatoria forma cada ejército con valor exacto de 39 puntos y un rey obligatorio. Puedes dar el mismo ejército a ambos bandos o sortear uno distinto para cada uno.', source:'RandArmy.gen/place/setup' },
  { id:'giant', name:'Giant Board', family:'mode', description:'Tablero 12×12 con dos filas de peones por bando y cuatro piezas especiales: arzobispo (alfil+caballo), canciller (torre+caballo), camello (salto 3+1) y cañón (captura saltando exactamente una pieza).', source:'Giant.setup · MX_MODE_DEFS.giant' },
  { id:'potato', name:'Rey Patata Caliente', family:'mode', description:'Cada cinco turnos la corona salta a otra pieza del mismo ejército. La pieza coronada es el rey para jaque y mate, pero conserva sus movimientos. El nuevo dueño se anuncia un turno antes.', source:'Potato.tick · Engine.king · MX_MODE_DEFS.potato' },
  { id:'pqueen', name:'Todos son dama', family:'party', description:'Quince damas y un rey por bando. Captura el rey rival para ganar.', source:'MX_MODE_DEFS.pqueen' },
  { id:'ppawn', name:'Todos son peón', family:'party', description:'Quince peones y un rey por bando. Los peones coronan normalmente; hay jaque y mate reales.', source:'MX_MODE_DEFS.ppawn' },
  { id:'horse', name:'Caballo', family:'party', description:'Quince caballos y un rey por bando. Los caballos pitan como coches.', source:'MX_MODE_DEFS.horse' },
  { id:'speed', name:'Ajedrez relámpago', family:'party', description:'Partida contra CPU con tres segundos por turno. En este prototipo el reloj agotado cuenta como derrota, en vez de ejecutar una jugada automática.', source:'MX_MODE_DEFS.speed' },
  { id:'invis', name:'Ajedrez invisible', family:'party', description:'Después de moverse, una pieza se vuelve invisible, también las propias. La pieza que captura queda revelada hasta volver a moverse.', source:'MX_MODE_DEFS.invis' },
  { id:'drunk', name:'Ajedrez borracho', family:'party', description:'Cada movimiento sin captura tiene un 15 % de probabilidad de desviarse una casilla vecina legal. Las capturas siempre aciertan.', source:'MX_MODE_DEFS.drunk' },
  { id:'chicken', name:'Ajedrez gallina', family:'party', description:'Cada pieza capturada se convierte en una gallina neutral junto a donde cayó. No se puede capturar; deambula y bloquea casillas.', source:'Chickens · MX_MODE_DEFS.chicken' },
  { id:'bullet', name:'Ajedrez balacera', family:'party', description:'Después de moverse, la pieza dispara en la dirección del movimiento. La bala destruye la primera pieza que encuentra, incluso si es un rey o una pieza del mismo bando.', source:'Bullet.fire · MX_MODE_DEFS.bullet' },
  { id:'anti', name:'Ajedrez al revés', family:'party', description:'Antiajedrez: las capturas son obligatorias, el rey es una pieza normal y no existe jaque. Gana quien se queda primero sin piezas.', source:'MX_MODE_DEFS.anti' },
  { id:'p4', name:'Ajedrez de 4 jugadores', family:'mode', description:'Tablero en cruz de 14×14 y cuatro ejércitos que avanzan desde cuatro direcciones. Turnos rojo, azul, amarillo y verde; gana el último rey en pie.', source:'P4.setup · registro MODES separado' },
];

export const APK_MODIFIERS = [
  { id:'ktele', name:'Caballos teleportadores', family:'modifier', description:'Los caballos pueden teletransportarse a cualquier casilla vacía situada hasta a tres casillas.', daily:true, source:'DAILY_RULES.ktele' },
  { id:'boom', name:'Todas las capturas explotan', family:'modifier', description:'Cada captura detona un área 3×3. Los reyes también pueden quedar dentro de la explosión.', daily:true, source:'DAILY_RULES.boom' },
  { id:'php', name:'Peones con 3 HP', family:'modifier', description:'Los peones resisten golpes y contraatacan. Las demás piezas mueren de un solo impacto.', daily:true, source:'DAILY_RULES.php' },
  { id:'enr', name:'Damas furiosas', family:'modifier', description:'Las damas también se mueven como caballos durante toda la partida.', daily:true, source:'DAILY_RULES.enr' },
  { id:'grav', name:'Gravedad activa', family:'modifier', description:'Las piezas se deslizan después de moverse. Cuidado con los agujeros.', daily:true, source:'DAILY_RULES.grav' },
  { id:'fast', name:'Todo más rápido', family:'modifier', description:'Los reyes y los peones siempre pueden avanzar dos casillas.', daily:true, source:'DAILY_RULES.fast' },
  { id:'dk', name:'Doble salto de caballo', family:'modifier', description:'Cada movimiento del caballo puede encadenar dos saltos.', daily:true, source:'DAILY_RULES.dk' },
  { id:'abil', name:'Poder para todos', family:'modifier', description:'Todas las piezas reciben los superpoderes de Chaos Chess.', daily:true, source:'DAILY_RULES.abil' },
  { id:'ev', name:'Evento cada dos turnos', family:'modifier', description:'Chaos Arena se activa a doble velocidad: un evento global cada dos turnos.', daily:true, source:'DAILY_RULES.ev' },
  { id:'zc', name:'Noche zombi', family:'modifier', description:'La horda zombi camina por el tablero durante la partida.', daily:true, source:'DAILY_RULES.zc' },
  { id:'sudden', name:'Muerte súbita', family:'modifier', description:'La primera captura gana la partida.', price:300, source:'MX_MODS.sudden' },
  { id:'fog', name:'Niebla de guerra', family:'modifier', description:'Solo ves las casillas cercanas a tus propias piezas.', price:600, source:'MX_MODS.fog' },
  { id:'randpromo', name:'Coronación al azar', family:'modifier', description:'Los peones que coronan se convierten en una pieza aleatoria, incluidos los camellos.', price:400, source:'MX_MODS.randpromo' },
  { id:'extrapawns', name:'Peones extra', family:'modifier', description:'Una tercera fila de peones para cada bando.', price:300, source:'MX_MODS.extrapawns' },
  { id:'ice', name:'Hielo resbaladizo', family:'modifier', description:'Torres, alfiles y damas no pueden frenar: se deslizan hasta chocar.', price:800, source:'MX_MODS.ice' },
  { id:'hotfloor', name:'Suelo ardiente', family:'modifier', description:'Cada turno cuatro casillas se ponen al rojo. Terminar ahí quema la pieza.', price:700, source:'MX_MODS.hotfloor' },
  { id:'royalswap', name:'Cambio real', family:'modifier', description:'Cada seis turnos cada rey intercambia su posición con su dama.', price:500, source:'MX_MODS.royalswap' },
  { id:'ducks', name:'Lluvia de patos', family:'modifier', description:'Cada cinco turnos cae un pato que bloquea una casilla durante dos turnos.', price:777, source:'MX_MODS.ducks' },
  { id:'lowgrav', name:'Gravedad baja', family:'modifier', description:'La pieza que acaba de moverse flota durante un turno: nadie puede capturarla.', price:500, source:'MX_MODS.lowgrav' },
  { id:'bighead', name:'Modo cabezones', family:'modifier', description:'Cosmético: piezas enormes y bamboleantes.', price:200, source:'MX_MODS.bighead' },
  { id:'narrator', name:'Narrador', family:'modifier', description:'Cosmético: un narrador comenta tus jugadas.', price:400, source:'MX_MODS.narrator' },
  { id:'disco', name:'Disco', family:'modifier', description:'Cosmético: luces de discoteca y piezas que bailan.', price:300, source:'MX_MODS.disco' },
];

export const APK_RECIPES = [
  { id:'moon', name:'El desastre del alunizaje', family:'recipe', description:'Gravedad baja + todas las capturas explotan + modo cabezones.', requirements:['lowgrav','boom','bighead'], reward:'Título NASA', source:'RECIPES.moon' },
  { id:'iceage', name:'La era de hielo', family:'recipe', description:'Hielo resbaladizo + niebla de guerra + tablero Frost.', requirements:['ice','fog'], extra:'Tablero Frost', reward:'600 monedas', source:'RECIPES.iceage' },
  { id:'duckapoc', name:'Apocalipsis pato', family:'recipe', description:'Lluvia de patos + coronación al azar.', requirements:['ducks','randpromo'], reward:'777 monedas', source:'RECIPES.duckapoc' },
  { id:'lava', name:'El suelo es lava', family:'recipe', description:'Suelo ardiente + tablero Volcano.', requirements:['hotfloor'], extra:'Tablero Volcano', reward:'500 monedas', source:'RECIPES.lava' },
  { id:'corporate', name:'Infierno corporativo', family:'recipe', description:'Narrador + todo más rápido + tablero Office.', requirements:['narrator','fast'], extra:'Tablero Office', reward:'Título Middle', source:'RECIPES.corporate' },
  { id:'overdrive', name:'Máxima potencia', family:'recipe', description:'Siete o más modificadores activos simultáneamente.', requirements:[], anySeven:true, reward:'Título Why', source:'RECIPES.overdrive' },
];

export const APK_CHAOS_EVENTS = [
  { id:'wall', name:'El muro', color:'#8d86bd', description:'Levanta un muro temporal; si hay una pieza vulnerable en la casilla, la aplasta.' },
  { id:'hole', name:'El agujero', color:'#29e3ff', description:'Abre un vacío temporal y hace caer una pieza vulnerable.' },
  { id:'giant', name:'Pieza gigante', color:'#ffc83d', description:'Una pieza que no sea rey ni peón crece durante seis plies; los peones no pueden tocarla.' },
  { id:'swap', name:'El cambiazo', color:'#9b4dff', description:'Dos piezas del mismo tipo, una por bando, intercambian posiciones.' },
  { id:'hop', name:'Clases de equitación', color:'#3dff8e', description:'Un peón de cada bando aprende un salto de caballo.' },
  { id:'neutral', name:'El peón neutral', color:'#c2bed0', description:'Aparece un peón gris; el primero que lo toca lo recluta.' },
  { id:'bombs', name:'Lluvia de bombas', color:'#ff6a00', description:'Tres bombas caen en casillas aleatorias y destruyen piezas vulnerables.' },
  { id:'portals', name:'Portales', color:'#29e3ff', description:'Dos portales temporales conectan casillas vacías durante diez plies.' },
  { id:'duck', name:'Pato inspector', color:'#ffc83d', description:'Un pato inspecciona una casilla y la bloquea temporalmente.' },
  { id:'freeze', name:'Congelación', color:'#29e3ff', description:'Una pieza no rey de cada bando queda congelada durante dos plies.' },
  { id:'lava', name:'Fuga de lava', color:'#ff6a00', description:'Dos casillas expulsan lava y queman las piezas vulnerables.' },
  { id:'promote', name:'Ascenso exprés', color:'#ffc83d', description:'Un peón de cada bando se transforma directamente en dama.' },
];

export const APK_HORDE_UPGRADES = [
  { id:'knight', name:'+1 caballo', description:'Un caballo nuevo se une a tu ejército.', piece:'knight', weight:10 },
  { id:'bishop', name:'+1 alfil', description:'Un alfil nuevo se une a tu ejército.', piece:'bishop', weight:10 },
  { id:'rook', name:'+1 torre', description:'Una torre nueva se une a tu ejército.', piece:'rook', weight:8 },
  { id:'pawns', name:'+2 peones', description:'Dos peones nuevos se unen a tu ejército.', piece:'pawn', count:2, weight:10 },
  { id:'queen', name:'+1 dama', description:'Mejora rara: una dama se une a tu ejército.', piece:'queen', weight:2 },
  { id:'cannon', name:'+1 cañón', description:'Se mueve como torre y captura saltando sobre una pieza.', piece:'cannon', weight:6 },
  { id:'camel', name:'+1 camello', description:'Salta 3+1 casillas por encima de piezas.', piece:'camel', weight:6 },
  { id:'archbishop', name:'+1 arzobispo', description:'Mejora rara: alfil y caballo en una pieza.', piece:'bishop', hybrid:'archbishop', weight:2 },
  { id:'fwdcap', name:'Peones lanceros', description:'Tus peones también capturan hacia delante.', once:true, weight:6 },
  { id:'boomrook', name:'Torre explosiva', description:'Tus torres explotan al morir y solo dañan enemigos.', once:true, weight:5 },
  { id:'queen2', name:'Dama con dos vidas', description:'Tus damas reciben un escudo ahora y en cada oleada.', once:true, weight:5 },
  { id:'vampire', name:'Ejército vampiro', description:'Cada cuatro bajas vuelve tu última pieza caída.', once:true, weight:5 },
  { id:'promo6', name:'Ascenso rápido', description:'Tus peones coronan en la fila seis.', once:true, weight:5 },
  { id:'archer', name:'Alfiles saltarines', description:'Tus alfiles también saltan como caballos.', once:true, weight:5 },
  { id:'dknight', name:'Doble salto', description:'Tus caballos pueden saltar dos veces en un movimiento.', once:true, weight:5 },
  { id:'kingrun', name:'Sprint real', description:'Tu rey se mueve hasta dos casillas.', once:true, weight:5 },
  { id:'shieldwall', name:'Muro de escudos', description:'Todos tus peones reciben un escudo.', weight:6 },
  { id:'cold', name:'Entrada helada', description:'Cada oleada nueva llega congelada un turno.', once:true, weight:5 },
  { id:'zap', name:'Invocatormentas', description:'Un rayo fulmina dos enemigos al empezar cada oleada.', once:true, weight:5 },
  { id:'gold', name:'Coronas avaras', description:'Doble de Coronas de Horda por cada baja.', once:true, weight:4 },
  { id:'revive', name:'Segunda oportunidad', description:'Vuelven tus dos últimas piezas caídas.', weight:6 },
  { id:'rage', name:'Damas furiosas', description:'Tus damas también se mueven como caballos.', once:true, weight:4 },
  { id:'ghost', name:'Caballería fantasma', description:'Un caballo fantasma se une en cada oleada durante seis turnos.', once:true, weight:4 },
  { id:'bombpawn', name:'Peones volátiles', description:'Los peones enemigos que capturas explotan y solo dañan enemigos.', once:true, weight:4 },
];

export const APK_CATALOG = Object.freeze([
  ...APK_BASE_CATALOG,
  ...APK_MISSING_MODES,
  ...APK_MODIFIERS,
  ...APK_RECIPES,
]);
export const APK_BY_ID = Object.fromEntries(APK_CATALOG.map((entry) => [entry.id, entry]));

