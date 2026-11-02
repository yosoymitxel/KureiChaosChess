// Pantallas de los minis por turnos (lógica en src/game/<id>.js, pantalla común en turn-mini.js).
import { html } from '../lib.js';
import { TurnMini } from './turn-mini.js';
import * as race from '../../game/race.js';
import * as rampage from '../../game/rampage.js';
import * as feast from '../../game/feast.js';
import * as pdodge from '../../game/pdodge.js';
import * as parkour from '../../game/parkour.js';
import * as blaster from '../../game/blaster.js';
import * as horde from '../../game/horde.js';
import { t } from '../../i18n/index.js';

export const RaceScreen = (p) => html`<${TurnMini} ...${p} mini="race" G=${race} help=${t('race.help', 'Tres peones por bando, cada uno en su calle. Toca uno de los tuyos: se tira un dado de 1 a 4 y avanza. Turbo: dos más. Hielo: resbala una. Portal: salta tres. Estrella: escudo contra la próxima bomba. Bomba: vuelve tres atrás. Gana el primer peón que llega arriba.')} />`;
export const RampageScreen = (p) => html`<${TurnMini} ...${p} mini="rampage" G=${rampage} help=${t('rampage.help', 'Tu torre no frena: carga en línea recta hasta el borde o un hueco y aplasta todo lo que hay en medio. Toca uno de los cuatro finales de carga. Los peones bajan cada turno y comen en diagonal (lo rojo): que no te alcancen ni lleguen abajo. Aplasta a todos.')} />`;
export const FeastScreen = (p) => html`<${TurnMini} ...${p} mini="feast" G=${feast} help=${t('feast.help', 'Solo saltos de caballo. Cada gema vale tanto como tu racha: encadena gemas seguidas. La corona dorada da tres jugadas; los pinchos quitan tres y cortan la racha. Llega a los puntos antes de quedarte sin jugadas.')} />`;
export const PdodgeScreen = (p) => html`<${TurnMini} ...${p} mini="pdodge" G=${pdodge} help=${t('pdodge.help', 'Caen piezas desde arriba, cada una a su manera: el peón de a una, la torre de a dos, el caballo en L y el alfil en diagonal rebotando. Lo rojo es donde caerán. Mueve el rey (o tócalo para quedarte quieto). Rozarlas suma; la estrella aguanta un golpe.')} />`;
export const ParkourScreen = (p) => html`<${TurnMini} ...${p} mini="parkour" G=${parkour} help=${t('parkour.help', 'Sube con el caballo hasta la fila de arriba saltando en L entre las plataformas. La lava sube una fila cada pocos saltos: la fila roja es la siguiente. No caigas en los pinchos. Las monedas, de propina.')} />`;
export const BlasterScreen = (p) => html`<${TurnMini} ...${p} mini="blaster" G=${blaster} help=${t('blaster.help', 'Mueve el alfil en diagonal: al acabar dispara solo a los enemigos más cercanos de sus diagonales (marcados). Avanzan una casilla por turno y el caballo salta en L; si alguno llega a tu casilla, pierdes. Cada oleada limpia da un disparo más.')} />`;
export const HordeScreen = (p) => html`<${TurnMini} ...${p} mini="horde" G=${horde} help=${t('horde.help', 'La dama se mueve como siempre y, al caer, su onda derriba a todos los peones pegados. Los peones bajan cada turno y comen en diagonal (lo rojo). Si uno te alcanza o llega abajo, pierdes una vida. Derriba a toda la horda.')} />`;
