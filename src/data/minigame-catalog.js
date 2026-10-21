// Registro único de minijuegos del banco de pruebas.
// Al incorporar un minijuego nuevo, registrá su id, nombre y pantalla solamente aquí.
// El selector y la vista de prueba consumen este mismo registro.
import { CaceriaScreen } from '../ui/screens/caceria.js';
import { EscapeScreen } from '../ui/screens/escape.js';
import { BodyguardScreen } from '../ui/screens/bodyguard.js';
import { GiantHuntScreen } from '../ui/screens/giant-hunt.js';
import { MinefieldScreen } from '../ui/screens/minefield.js';
import { ContrabandScreen } from '../ui/screens/contraband.js';
import { LaboratoryScreen } from '../ui/screens/laboratory.js';
import { CollapsingFloorScreen } from '../ui/screens/collapsing-floor.js';
import { KingImpostorScreen } from '../ui/screens/king-impostor.js';
import { Connect4Screen } from '../ui/screens/connect4.js';
import { BomberScreen } from '../ui/screens/bomber.js';
import { BarrierScreen } from '../ui/screens/barrier.js';
import { IZombieScreen } from '../ui/screens/izombie.js';
import { BowlingScreen } from '../ui/screens/bowling.js';
import { LastStandScreen } from '../ui/screens/laststand.js';
import { MatesScreen } from '../ui/screens/mates.js';
import { KnightScreen } from '../ui/screens/knight.js';
import { QueensScreen } from '../ui/screens/queens.js';
import { MarcianosScreen } from '../ui/screens/marcianos.js';
import { CheckersScreen } from '../ui/screens/checkers.js';
import { FusionScreen } from '../ui/screens/fusion.js';
import { DuelScreen } from '../ui/screens/duel.js';
import { HockeyScreen } from '../ui/screens/hockey.js';

export const MINIGAMES = {
  caceria: { name: 'La cacería', Screen: CaceriaScreen },
  escape: { name: 'Escape del tablero', Screen: EscapeScreen },
  bodyguard: { name: 'El guardaespaldas', Screen: BodyguardScreen },
  giantHunt: { name: 'Caza de gigantes', Screen: GiantHuntScreen },
  minefield: { name: 'Campo minado', Screen: MinefieldScreen },
  contraband: { name: 'Contrabando dimensional', Screen: ContrabandScreen },
  laboratory: { name: 'El laboratorio', Screen: LaboratoryScreen },
  collapsingFloor: { name: 'El suelo se acaba', Screen: CollapsingFloorScreen },
  kingImpostor: { name: 'El rey impostor', Screen: KingImpostorScreen },
  connect4: { name: 'Conecta 4', Screen: Connect4Screen },
  bomber: { name: 'Bombardero', Screen: BomberScreen },
  barrier: { name: 'Barrera', Screen: BarrierScreen },
  izombie: { name: 'Yo, zombi', Screen: IZombieScreen },
  bowling: { name: 'Boliche', Screen: BowlingScreen },
  laststand: { name: 'Última resistencia', Screen: LastStandScreen },
  mates: { name: 'Mate en uno', Screen: MatesScreen },
  knight: { name: 'Ruta del caballo', Screen: KnightScreen },
  queens: { name: 'Reinas', Screen: QueensScreen },
  marcianos: { name: 'Marcianitos', Screen: MarcianosScreen },
  checkers: { name: 'Damas', Screen: CheckersScreen },
  fusion: { name: 'Fusión', Screen: FusionScreen },
  duel: { name: 'Duelo', Screen: DuelScreen },
  hockey: { name: 'Hockey de mesa', Screen: HockeyScreen },
};
