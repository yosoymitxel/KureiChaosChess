# Seguridad de Kure'iChaosChess

Estado al 31/10/2026: el juego estático está conectado directamente al proyecto Supabase. La base tiene RLS y permisos SQL mínimos. El envío real de OTP a usuarios públicos todavía requiere SMTP propio y una prueba de correo.

## Arquitectura

- HTML, CSS y JavaScript estáticos, sin servidor de aplicación.
- Supabase JS se carga desde CDN con versión fija 2.118.0 y se ejecuta en el navegador.
- El cliente llama directamente a Supabase Auth y a PostgREST/Data API.
- La clave publishable es pública por diseño. No se usa ni se publica service_role o una secret key.
- Netlify y GitHub Pages sirven los mismos archivos; no necesitan rewrites, funciones, Workers ni variables de servidor.
- Supabase JS conserva la sesión en el almacenamiento local del navegador y renueva los tokens automáticamente.

## Auth y OTP

1. El jugador solicita un código con auth.signInWithOtp(); shouldCreateUser diferencia registro e inicio de sesión.
2. Supabase Auth envía el OTP por correo.
3. auth.verifyOtp({ email, token, type: 'email' }) valida el código y crea la sesión.
4. Supabase JS persiste y renueva la sesión en el navegador.
5. Logout utiliza auth.signOut().

La plantilla Magic Link debe mostrar {{ .Token }} para recibir un código de seis dígitos. La entrega pública requiere SMTP propio. No se ha validado todavía un correo real; no anunciar el envío de OTP como operativo hasta completar esa prueba.

## Guardados y aislamiento

La tabla public.game_saves está creada, con RLS habilitado y forzado. Las políticas SELECT/INSERT/UPDATE/DELETE aplican owner_id = auth.uid(). El rol anon no puede acceder a los guardados. El usuario autenticado solo puede modificar sus propios snapshots.

| Campo | Uso |
|---|---|
| owner_id | Propietario asignado por auth.uid() |
| slot | Una de tres ranuras |
| save_version | Formato KCC1/KCC2 |
| state | Snapshot completo, máximo 2 MiB |
| summary | Datos para comparar, máximo 64 KiB |
| revision | Revisión incremental controlada por trigger |
| created_at / updated_at | Auditoría |

El cliente no puede escribir owner_id, revisión ni timestamps. Las actualizaciones usan revisión esperada para evitar sobrescrituras silenciosas. El borrado llama a una función SECURITY INVOKER con revisión esperada; RLS sigue aplicándose.

Los snapshots son manipulables por su propietario. No deben utilizarse para validar torneos, recompensas competitivas ni autoridad de juego.

## Guardado local y recuperación

El juego mantiene el guardado local y el formato de exportación KCC1/KCC2. La nube guarda un snapshot completo, no mezcla logros, monedas o jardín entre dispositivos. Si hay escrituras concurrentes, se devuelve conflicto y se solicita elegir entre el estado local y el remoto.

## Fuera de alcance

No están implementados matchmaking, invitaciones, salas ni movimientos en vivo. Una fase futura puede usar Supabase Realtime para presencia y eventos, y funciones SQL/RPC para validar turnos de manera atómica. No hace falta introducir un Worker ni un backend propio separado.

## Referencias

- https://supabase.com/docs/reference/javascript/installing
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/deployment/going-into-prod
