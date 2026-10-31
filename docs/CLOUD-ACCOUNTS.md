# Cuenta de jugador y guardado en la nube

## Uso

1. Abre Ajustes → Cuenta y guardado en la nube.
2. Regístrate o inicia sesión con correo y un código OTP de seis dígitos.
3. La pantalla muestra el estado local y las tres ranuras de tu cuenta.
4. Compara run, piso, nodos, jardín, monedas, desbloqueos, estadísticas y logros.
5. Decide qué snapshot conservar: subir el dispositivo o descargar la nube. Nunca se mezclan dos partidas.
6. Tras subir, descargar o confirmar que ambos snapshots son idénticos, se activa la sincronización automática de esa ranura.
7. Si otro dispositivo modifica la misma revisión, la operación devuelve un conflicto, se pausa la sincronización automática y se pide elegir el snapshot.

Cada ranura representa un snapshot completo e independiente. PostgreSQL incrementa la revisión y RLS limita las filas al usuario autenticado.

## Arquitectura

- El juego sigue siendo HTML, CSS y JavaScript estáticos. El guardado local KCC1/KCC2 no se reemplaza.
- La página carga @supabase/supabase-js desde jsDelivr con versión fija 2.118.0.
- El navegador llama directamente a Supabase Auth y a la Data API. No existe Worker, función intermedia, proxy, BFF ni endpoint propio.
- Funciona desde GitHub Pages, Netlify o cualquier host estático que sirva el HTML y sus archivos.
- La clave sb_publishable_... se incluye en el cliente porque es pública por diseño. La seguridad depende de RLS y permisos SQL mínimos. Nunca usar service_role ni una secret key en el navegador.
- Supabase JS conserva la sesión en el almacenamiento local y renueva el token automáticamente.
- El juego incrustado como iframe en itch.io mantiene el modo local; al abrir la web estática directamente, la cuenta está disponible.

## Supabase configurado

Proyecto: kurei-chaos-chess (fxjhuodttsbcyncpkcxb), región São Paulo.

La tabla public.game_saves existe y tiene RLS habilitado y forzado. Las políticas SELECT/INSERT/UPDATE/DELETE exigen owner_id = auth.uid(). El cliente no envía owner_id, revision ni timestamps: el propietario sale de auth.uid() y la revisión la incrementa el trigger de PostgreSQL.

| Campo | Uso |
|---|---|
| owner_id | Propietario por auth.uid() |
| slot | Ranuras 1–3 por usuario |
| name | Etiqueta de la partida |
| save_version | Formato KCC1/KCC2 |
| state | Snapshot JSON completo, máximo 2 MiB |
| summary | Resumen para comparar, máximo 64 KiB |
| revision | Revisión entera creciente |
| created_at / updated_at | Auditoría temporal |

El borrado se ejecuta mediante delete_game_save(slot, expected_revision), como función SECURITY INVOKER. El permiso DELETE está concedido a authenticated, pero la política RLS sigue limitando el borrado a filas propias.

Las migraciones versionadas están en supabase/migrations/ y coinciden con el historial aplicado al proyecto.

## Configuración pendiente de correo

La conexión directa con Supabase y las políticas de base de datos están creadas. Para que el registro por correo funcione con usuarios públicos, falta configurar un proveedor SMTP real en Supabase:

1. Abre Authentication → Email Templates → Magic Link.
2. Asegúrate de que la plantilla incluya el código {{ .Token }}, no únicamente el enlace mágico.
3. En Authentication → SMTP Settings, configura el proveedor SMTP, el remitente verificado y su dominio.
4. Confirma que el proveedor Email esté habilitado.

El SMTP de prueba de Supabase no es un servicio de entrega general para usuarios públicos. Hasta configurar SMTP y hacer una prueba real de recepción, no se debe dar por validado el envío de OTP. Esto es configuración del propio Supabase; no requiere desplegar ni mantener un servidor.

## Pruebas

El workflow de seguridad comprueba el cliente directo, la ausencia de Worker/rutas propias, la forma de las respuestas y las migraciones. La prueba de extremo a extremo de OTP necesita un correo real y el SMTP configurado. Para comprobar el aislamiento completo, probar con dos cuentas distintas y verificar que una no pueda leer, modificar ni eliminar las ranuras de la otra.

## Alcance

Incluido: cuenta por email OTP, tres ranuras, subida, descarga, comparación local/nube, sincronización automática por revisión y resolución explícita de conflictos.

No incluido todavía: matchmaking, invitaciones, salas ni sincronización de movimientos en vivo. Una fase multijugador puede usar Supabase Realtime y funciones SQL/RPC para validar movimientos sin añadir un servidor propio.
