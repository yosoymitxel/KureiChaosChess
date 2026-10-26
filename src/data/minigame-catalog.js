// Registro único de minijuegos del banco de pruebas.
// Al incorporar un minijuego nuevo, registrá su id, nombre y pantalla solamente aquí.
// El selector y la vista de prueba consumen este mismo registro.
import { CaceriaScreen, BodyguardScreen, GiantHuntScreen, MinefieldScreen, KingImpostorScreen, EscapeScreen, ContrabandScreen, LaboratoryScreen, CollapsingFloorScreen, KnightScreen } from '../ui/screens/scenario.js';
import { Connect4Screen } from '../ui/screens/connect4.js';
import { BomberScreen } from '../ui/screens/bomber.js';
import { BarrierScreen } from '../ui/screens/barrier.js';
import { IZombieScreen } from '../ui/screens/izombie.js';
import { BowlingScreen } from '../ui/screens/bowling.js';
import { LastStandScreen } from '../ui/screens/laststand.js';
import { MatesScreen } from '../ui/screens/mates.js';
import { QueensScreen } from '../ui/screens/queens.js';
import { MarcianosScreen } from '../ui/screens/marcianos.js';
import { CheckersScreen } from '../ui/screens/checkers.js';
import { FusionScreen } from '../ui/screens/fusion.js';
import { DuelScreen } from '../ui/screens/duel.js';
import { HockeyScreen } from '../ui/screens/hockey.js';

import { MODIFIERS } from './modifiers.js';

// El nombre sale de modifiers.js (registro único); aquí solo se ata cada id a su pantalla.
const SCREENS = {
  caceria: CaceriaScreen, escape: EscapeScreen, bodyguard: BodyguardScreen, giantHunt: GiantHuntScreen,
  minefield: MinefieldScreen, contraband: ContrabandScreen, laboratory: LaboratoryScreen,
  collapsingFloor: CollapsingFloorScreen, kingImpostor: KingImpostorScreen, connect4: Connect4Screen,
  bomber: BomberScreen, barrier: BarrierScreen, izombie: IZombieScreen, bowling: BowlingScreen,
  laststand: LastStandScreen, mates: MatesScreen, knight: KnightScreen, queens: QueensScreen,
  marcianos: MarcianosScreen, checkers: CheckersScreen, fusion: FusionScreen, duel: DuelScreen, hockey: HockeyScreen,
};
export const MINIGAMES = Object.fromEntries(Object.entries(SCREENS).map(([id, Screen]) => [id, { name: MODIFIERS[id].name, Screen }]));
