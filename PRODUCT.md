# Zugzwang: producto

## Qué es

Ajedrez mutante en formato roguelike de mesa. Una run es una torre de 5 a 15 pisos; cada piso es
una partida en un tablero procedural con agujeros, piezas extra (guardia, consejero, elefante,
camello, cañón) y un modificador (coronación, terreno inestable, prisa, niebla). Ganar da
mutaciones que cambian cómo se mueven tus piezas. El último piso es un jefe de varias casillas.

## Para quién

Gente que ya sabe mover las piezas de ajedrez y quiere partidas cortas con sorpresas, en
móvil o escritorio, sola contra bots o con amigos en el mismo dispositivo.

## Escena de uso

Una partida de 5 a 10 minutos, a menudo en el móvil y a ratos sueltos. Por eso: textos cortos,
todo se puede hacer con un dedo, con ratón o con teclado, y la run se guarda sola.

## Superficie y modo

- Partida: **Operate**. El tablero es la tarea; la interfaz se aparta.
- Menú, mapa y recompensas: **Experience**. El objeto (el diorama, el tablero de la run, las
  cartas) manda desde el primer vistazo.

## Verdad del producto

- El modo local sigue guardando en `localStorage`. La versión web estática incorpora cuenta por correo, tres ranuras de guardado cloud y sincronización por revisión mediante llamadas directas a Supabase. Funciona en GitHub Pages y Netlify sin backend propio; el juego incrustado en itch.io permanece en modo local.
- Los números que se muestran (piezas, vidas, turnos) salen del estado real de la partida.
- No hay testimonios, estadísticas inventadas ni enlaces a páginas que no existan.

## Cuenta y sincronización

En cualquier página estática abierta directamente, **Ajustes → Cuenta y guardado en la nube** permite registrarse/iniciar sesión por OTP, comparar el dispositivo con tres ranuras remotas, subir, descargar y resolver conflictos. El navegador se conecta directamente a Supabase. La sincronización automática se activa al elegir un snapshot y se pausa ante cambios concurrentes. No se mezclan avances.

La fase de cuenta no incorpora todavía multijugador online. Matchmaking, salas e invitaciones todavía no están implementados; se pueden abordar con Supabase Realtime y funciones SQL/RPC, sin añadir un servidor propio.
