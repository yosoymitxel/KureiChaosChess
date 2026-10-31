# Seguridad de Kure'iChaosChess

**Estado:** endurecimiento inicial. No habilitar autenticación persistente ni guardados cloud hasta completar el aislamiento del origen, el BFF y las pruebas RLS.

## 1. Modelo de amenaza

El navegador y todo lo que ejecuta el jugador se consideran no confiables. Un atacante puede:
- inspeccionar y modificar JavaScript, estado, localStorage y peticiones HTTP;
- invocar directamente la API de Supabase sin usar la interfaz;
- enviar JSON inválido, sobredimensionado o con propiedades inesperadas;
- intentar leer, sobrescribir o borrar partidas de otro usuario;
- automatizar registro, login, recuperación y operaciones de guardado;
- aprovechar XSS, dependencias comprometidas, redirecciones abiertas o configuraciones CORS/CSP débiles.

### Activos que proteger

1. Identidad y sesiones de usuarios.
2. Confidencialidad y propiedad de cada partida cloud.
3. Disponibilidad del BFF y endpoints de Auth.
4. Integridad del formato de guardado y estabilidad del juego.
5. Secretos administrativos y credenciales de infraestructura.

## 2. Arquitectura objetivo

- Repositorio GitHub como fuente del código.
- Hosting con **origen exclusivo** para Kure'iChaosChess. No habilitar sesiones en yosoymitxel.github.io, porque otros repositorios bajo ese dominio comparten el mismo origen del navegador.
- BFF desplegado en una función de servidor (por ejemplo, Cloudflare Pages Functions/Workers).
- Supabase Auth y PostgreSQL dedicados exclusivamente a Kure'iChaosChess.
- Comunicación del BFF con Supabase usando el JWT del usuario y la clave publicable del proyecto, de modo que PostgreSQL aplique RLS.
- No usar Storage, Realtime, buckets ni multijugador durante esta fase.

El BFF debe validar cada operación, limitar tamaño y frecuencia, validar el origen, aplicar protección CSRF y no reutilizar estado autenticado entre solicitudes. No guardar sesiones de usuario en variables globales compartidas entre peticiones.

### Cookies y sesiones

La sesión del navegador debe usar una cookie opaca o cifrada gestionada por el BFF, con HttpOnly, Secure, Path=/, sin Domain y SameSite=Lax como punto de partida para permitir el retorno mediante enlace de correo. Verificar el flujo real antes de endurecer a Strict.

Todas las respuestas de autenticación y sesión deben usar Cache-Control: private, no-store. Validar Origin y usar un token CSRF ligado a la sesión para mutaciones. El servidor debe renovar y revocar sesiones; no confiar en claims leídos únicamente desde el cliente.

## 2.1. BFF y sesión del navegador

### Hosting

- Publicar el juego en un proyecto Cloudflare Pages exclusivo, por ejemplo `kurei-chaos-chess.pages.dev`, separado de `yosoymitxel.github.io`.
- Conectar Pages al repositorio GitHub y mantener despliegues de preview sin secretos de producción.
- Usar Pages Functions para las rutas `/api/*`; los archivos estáticos continúan servidos por CDN.
- Las Pages Functions pueden usar Durable Objects, pero el Durable Object debe desplegarse como un Worker independiente y enlazarse al proyecto Pages. No se debe asumir que Pages crea esa infraestructura automáticamente.

### Sesión

- El navegador recibe solo una cookie opaca aleatoria de 256 bits, nunca access token ni refresh token.
- Nombre previsto: `__Host-Http-kcc_session`; atributos `HttpOnly; Secure; Path=/; SameSite=Lax`, sin `Domain`.
- El identificador se genera de nuevo al autenticar correctamente; nunca se convierte una cookie previa en sesión autenticada.
- Un Durable Object por sesión guarda los tokens Supabase, cifrados con AES-GCM y una clave exclusiva del Worker guardada como Cloudflare Secret.
- El Durable Object serializa renovación y uso del refresh token, porque los refresh tokens rotan y son de un solo uso. No compartir sesiones ni clientes autenticados en variables de módulo.
- Expiración propia: 7 días de inactividad y 30 días de vida máxima, aunque el proveedor mantenga una sesión más larga.
- Logout revoca la sesión Supabase, borra el estado del Durable Object y expira la cookie.
- Todas las rutas autenticadas responden con `Cache-Control: private, no-store`.

### Protección CSRF y del origen

- El frontend y las rutas API viven en el mismo origen; no habilitar CORS comodín.
- Verificar `Origin` contra el origen de producción exacto en todas las mutaciones.
- Exigir un token CSRF ligado a la sesión en `X-CSRF-Token` para las mutaciones; `SameSite` es una defensa adicional, no la única.
- Rechazar content-types distintos de JSON donde corresponda y limitar el cuerpo antes de parsearlo.
- No incluir OTP, tokens, cookies ni datos de sesión en logs, query strings, analítica o mensajes de error.
- El BFF crea el cliente/proceso Supabase dentro del manejador de cada petición; nunca conserva estado de usuario en ámbito de módulo.

### Flujo de autenticación elegido

1. `POST /api/auth/request-code`: recibe email y token CAPTCHA, valida `Origin`, tamaño y frecuencia; solicita un OTP a Supabase Auth.
2. El correo contiene `{{ .Token }}`; el jugador introduce el código de seis dígitos en el propio juego.
3. `POST /api/auth/verify-code`: recibe email y OTP, comprueba el CAPTCHA/limitación de intentos y verifica con tipo `email`.
4. El BFF crea un nuevo identificador aleatorio, guarda access/refresh token cifrados en el Durable Object y responde con la cookie opaca.
5. Las llamadas posteriores pasan por Pages Functions; estas obtienen el access token del Durable Object y llaman a Supabase Data API con la clave publicable y el JWT del usuario, dejando que RLS aplique la propiedad.

Configurar la expiración OTP en 10 minutos, el intervalo de reenvío mínimo en 60 segundos y CAPTCHA de Supabase Auth con Cloudflare Turnstile. No habilitar proveedores OAuth ni contraseñas mientras no haya una necesidad concreta. Supabase documenta que los OTP de correo tienen expiración por defecto de una hora y limitación de envío por usuario de 60 segundos; el tiempo de expiración debe reducirse para este caso.

El BFF no debe enviar la clave secreta o `service_role` a los endpoints de datos. Para los guardados se utilizará siempre la clave publicable más el JWT del usuario.

## 3. Supabase / PostgreSQL

### Claves

- La clave publicable sb_publishable_ identifica el componente público; no es un secreto.
- Nunca incluir sb_secret_, service_role, contraseña de base de datos ni tokens administrativos en HTML, JavaScript, repositorio, logs o artefactos públicos.
- El BFF no debe usar una clave que omita RLS para las operaciones normales de jugador.

### Esquema de guardados previsto

Tabla dedicada public.game_saves:

| Campo | Tipo | Regla |
|---|---|---|
| id | uuid | Generado por PostgreSQL |
| owner_id | uuid | auth.uid(); no editable por el cliente |
| slot | smallint | 1–3; único por usuario |
| name | text | Longitud acotada |
| save_version | smallint | Versión del contrato JSON |
| state | jsonb | Objeto JSON; tamaño máximo 64 KiB |
| created_at | timestamptz | Generado por PostgreSQL |
| updated_at | timestamptz | Actualizado por PostgreSQL |

La definición SQL definitiva se realizará como migración versionada, no desde el cliente.

### Reglas RLS obligatorias

- RLS habilitado y comprobado en todas las tablas expuestas.
- Revocar acceso a anon.
- SELECT, UPDATE y DELETE restringidos mediante auth.uid() = owner_id.
- INSERT con WITH CHECK (auth.uid() = owner_id).
- UPDATE con ambos predicados USING y WITH CHECK, para impedir cambiar el propietario.
- No conceder al jugador permisos de actualización sobre id, owner_id, slot, created_at.
- Añadir restricciones SQL para tipo JSON, tamaño, longitud y slots.
- No usar SECURITY DEFINER salvo necesidad demostrada, documentada y revisada.
- No exponer vistas o funciones sin revisar grants y comportamiento RLS.

RLS protege el aislamiento entre cuentas, pero no convierte el estado del juego en verdad confiable: el usuario puede modificar sus propias partidas. No usar guardados cloud para validar rankings, recompensas competitivas o moneda de valor real.

## 4. Formato y validación de partidas

Cada guardado debe incluir un contrato versionado, por ejemplo:

    {
      "game": "kurei-chaos-chess",
      "saveVersion": 1,
      "savedAt": "fecha ISO 8601",
      "run": {},
      "settings": {}
    }

Antes de persistir o restaurar:
- limitar el cuerpo de petición antes de parsear JSON;
- aceptar solo objeto JSON plano y propiedades conocidas;
- validar tipos, límites, IDs y enumeraciones;
- rechazar prototipos especiales y estructuras demasiado profundas;
- migrar versiones explícitamente y rechazar versiones desconocidas;
- no renderizar cadenas del guardado como HTML;
- no usar datos de progreso del cliente para conceder privilegios.

La validación debe ejecutarse en el BFF. La interfaz puede validar para experiencia de usuario, pero nunca sustituye al servidor.

## 5. Autenticación

Primera opción a evaluar: enlace mágico o OTP por correo, con URL de retorno exacta, expiración limitada y CAPTCHA en endpoints públicos cuando corresponda.

- Deshabilitar proveedores OAuth que no se utilicen.
- No admitir comodines amplios en URLs de redirección.
- Limitar intentos y peticiones de envío/verificación.
- No revelar si una dirección de correo está registrada.
- No registrar tokens, códigos OTP, cookies ni direcciones completas de correo.
- Validar la sesión en el servidor para operaciones sensibles.

## 6. Seguridad del frontend y cadena de suministro

- Dependencias principales servidas desde vendor/, con versiones registradas en el SBOM.
- Mantener lockfiles/inventario cuando se introduzcan dependencias gestionadas por npm.
- Fijar acciones de GitHub Actions a SHA completos.
- Ejecutar CodeQL, Gitleaks y OSV-Scanner en CI y con calendario. CodeQL excluye solo archivos `*.px.js`, que son DSL de arte y no JavaScript ejecutable.
- El escaneo Gitleaks de una PR valida los commits modificados; no equivale a una revisión forense completa del historial del repositorio.
- Implementar CSP y demás cabeceras en el hosting; empezar con Report-Only y ajustar a recursos locales reales antes de exigirla.
- Evitar HTML dinámico no confiable, eval, new Function e inserciones innerHTML con datos de usuario.
- Revisar dependencias y avisos de seguridad antes de cada actualización.

El SBOM actual enumera dependencias directas empaquetadas en vendor/. OSV-Scanner encontró cuatro paquetes en ese inventario y no informó problemas para ellos. Como el repositorio no tiene lockfile, OSV advirtió que no podía encontrar orígenes de paquetes ni analizar dependencias transitivas. El resultado es una revisión de cuatro dependencias directas, no una auditoría completa del árbol de dependencias. Se debe incorporar un inventario reproducible de dependencias empaquetadas antes de afirmar cobertura transitiva.

## 7. Puertas de salida antes de activar guardados

| Control | Criterio de aprobación |
|---|---|
| Origen exclusivo | El juego ya no comparte origen con otras páginas del usuario |
| BFF | Tokens inaccesibles desde JS; CSRF, Origin y límites probados |
| RLS | Pruebas con dos cuentas reales y usuario anónimo |
| Propiedad | A no puede leer, cambiar, borrar ni reasignar partidas de B |
| Entrada | JSON inválido, profundo y sobredimensionado rechazado |
| Secretos | Ninguna clave privilegiada aparece en frontend, repositorio o artefactos |
| Dependencias | SBOM revisado y escaneo OSV sin vulnerabilidades críticas/altas sin resolver |
| Cabeceras | CSP, HSTS, Referrer-Policy, X-Content-Type-Options y Permissions-Policy probadas |
| Sesiones | Logout, expiración, renovación y revocación probados |
| Recuperación | Backup/exportación e importación con validación y migración probadas |

No habilitar guardados cloud mientras cualquier control de aislamiento o gestión de sesión esté fallando.

## 8. Referencias

- [OWASP ASVS 5.0.0](https://asvs.owasp.org/)
- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [Supabase: Securing your data](https://supabase.com/docs/guides/database/secure-data)
- [Supabase: Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [OSV.dev](https://osv.dev/)
- [CISA Known Exploited Vulnerabilities](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [FIRST EPSS](https://www.first.org/epss/)

## 9. Copias locales y paquete de itch.io

La versión de itch.io sigue siendo un paquete estático HTML/CSS/JavaScript. La seguridad local no debe introducir un servidor obligatorio, un bundler ni cambiar el flujo de exportación e importación que ya utiliza el jugador.

- Se conservan los formatos KCC1 y KCC2.
- La exportación solo incluye las claves de persistencia conocidas del juego; no captura cualquier clave que comparta el prefijo interno.
- La importación comprueba el formato, la lista de claves, el tipo raíz, JSON válido, profundidad, cantidad de nodos, longitudes y tamaño máximo.
- El límite de datos descomprimidos es 2 MiB; run y jardín tienen límites individuales de 768 KiB.
- KCC2 se descomprime mediante un lector con límite de bytes para detener bombas de descompresión antes de materializar el texto completo.
- Todas las entradas se validan antes de escribir. Si una escritura de localStorage falla, se intenta restaurar el contenido previo de las claves afectadas. localStorage no ofrece transacciones multi-clave, por lo que esta reversión es una defensa de mejor esfuerzo, no atomicidad garantizada.
- El test de regresión cubre KCC1/KCC2, claves desconocidas, JSON inválido, propiedades sensibles al prototipo, estructuras profundas, entrada demasiado grande, descompresión excesiva y fallo durante la escritura.
- CI construye el ZIP de itch.io, verifica su integridad y comprueba que el punto de entrada y las dependencias siguen siendo locales.

Esta validación mejora la robustez ante copias dañadas o manipuladas y evita consumos descontrolados de memoria. No convierte el progreso local en información confiable ni impide que el propio jugador modifique sus datos desde las herramientas del navegador. No se utilizará para acreditar rankings, monedas competitivas ni resultados de multijugador. Tampoco se introduce una firma o MAC: un secreto de verificación incluido en un cliente público dejaría de ser secreto.

El cliente de itch.io mantiene el guardado local. Las sesiones y los guardados cloud solo se habilitarán en el origen web independiente, donde el BFF puede aplicar controles del lado servidor y PostgreSQL puede aislar cuentas mediante RLS.
