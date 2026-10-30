# Autenticación: admin y tienda

Cómo se autentican el admin (`apps/admin`) y la tienda (`apps/web`) contra la API de Django
(`apps/api`), y hacia dónde va. La fase 1 está implementada en el admin; las demás son el plan.

## Principios

1. **Django es la única fuente de verdad** de usuarios, sesiones, MFA, permisos y, más adelante,
   carrito. En Next no hay librería de auth (Auth.js, Better Auth): duplicaría las sesiones.
2. **Cada frontend es same-origin con la API.** Next reenvía `/api/*` a Django con un rewrite del
   lado del servidor (`next.config.mjs`). El navegador solo ve el dominio de cada app, así que las
   cookies de Django (`sessionid`, `csrftoken`) quedan en ese dominio:
   - el CSRF funciona con cualquier dominio de deploy, porque el JS lee `csrftoken` de su propio
     origen;
   - las sesiones del staff (admin) y de los clientes (tienda) quedan separadas por dominio;
   - CORS no hace falta: `CORS_ALLOWED_ORIGINS` está vacío (la tienda hace fetch en su servidor,
     donde CORS no aplica).
3. **`proxy.ts` solo hace chequeos optimistas**, como recomienda la guía de autenticación de
   Next 16: mira si existe la cookie y redirige, sin consultar la API. La validación real
   (sesión válida, staff, 2FA, permisos) la hace Django en cada request.
4. **La sesión es la de Django**, con cookie y CSRF. DRF autentica la API con
   `SessionAuthentication`.

## Fase 1 (hecha): admin same-origin + `proxy.ts`

- `apps/admin/next.config.mjs`: `/api/:path*` → `API_URL` (variable del servidor de Next, que no
  llega al navegador).
  - Hay dos reglas para conservar la barra final de DRF, y `skipTrailingSlashRedirect` evita que
    Next redirija `/x/` a `/x`.
  - Los rewrites se calculan en el build: si cambia `API_URL`, hay que volver a buildear.
- `apps/admin/src/lib/api-setup.ts`: `baseURL: "/api"`. El asistente (SSE) y el PDF de los
  comprobantes usan ese mismo `baseURL`.
- `apps/admin/src/proxy.ts`: sin `sessionid`, cualquier ruta salvo `/login` redirige a
  `/login?next=<ruta>`, y después del login se vuelve ahí (`afterLoginPath` en `use-auth.ts`).
  - `/login` no redirige a home aunque haya cookie: una cookie vencida haría un loop (el proxy
    manda a home y `AuthGuard` devuelve a `/login`), y `sessionid` es HttpOnly, así que el
    navegador no puede borrarla. La página de login verifica la sesión de verdad.
- `AuthGuard` sigue resolviendo lo que necesita la API: sesión vencida (→ `/login?next=...`),
  cuenta que no es staff y 2FA pendiente.
- **Media**: las URLs de imágenes que arma la API apuntan al host de Django, no pasan por `/api`.
  En producción, media tiene que servirse desde una URL pública (la de la API o un CDN con
  `MEDIA_URL` absoluta).
- **CSRF**:
  - `/auth/user/` repone `csrftoken` en cada GET (`ensure_csrf_cookie`), así una cookie borrada o
    vencida no deja la sesión sin poder escribir.
  - El admin arma el header con `csrfHeader()` (`src/lib/csrf.ts`), lo use el cliente generado o
    un `fetch`.
  - `accounts.tests.CsrfTests` lo prueba con el chequeo activo: los tests de DRF lo saltean por
    defecto.
- **SameSite**: queda el default de Django, `Lax`. La misma API atiende al admin y a la tienda, y
  la tienda va a necesitar `Lax` para el login con Google.

## Fase 2 (hecha): django-allauth headless (API + admin)

Reemplaza a dj-rest-auth y al 2FA propio con django-otp.

- **Por qué:** dj-rest-auth es una capa REST sobre el auth de Django; su registro y su login social
  funcionan sobre allauth. allauth es el motor de cuentas completo:
  - registro, verificación de email, reset de contraseña y login por código;
  - proveedores sociales (Google);
  - MFA con TOTP, códigos de recuperación y passkeys;
  - rate limits, reautenticación y gestión de sesiones.

  Su modo **headless** expone todo eso como API REST para frontends (`/_allauth/browser/v1/...`),
  así que dj-rest-auth sobra.
- **Configuración** (`apps/api/config/settings/base.py`): `HEADLESS_ONLY`, solo el cliente
  `browser` (sesión con cookie y CSRF, como el resto de la API).
  - Login con username.
  - Registro cerrado hasta la fase 3 (`accounts.adapter.AccountAdapter`).
  - MFA con TOTP y códigos de recuperación.
- **Login en dos pasos:** con 2FA, el login con contraseña responde 401 con el flujo
  `mfa_authenticate` pendiente, y `/auth/2fa/authenticate` lo completa con el código del
  autenticador o uno de recuperación. El admin lo maneja en `useLogin` / `useSecondFactor`.
- **El staff sigue obligado a usar MFA** (`REQUIRE_2FA`):
  - `config.permissions` exige que la sesión tenga el registro `mfa` de allauth
    (`accounts.mfa.passed_mfa`), en lugar del `is_verified` de django-otp.
  - Activar el TOTP también marca la sesión, con la señal `authenticator_added`, así quien tuvo
    que configurarlo entra sin volver a loguearse.
- **Reautenticación:** allauth pide la contraseña otra vez para activar o desactivar el 2FA, aunque
  el login sea reciente. El admin muestra ese paso cuando la API responde con el flujo
  `reauthenticate`, y después reintenta la acción.
- **CSRF en el login (el pendiente de la fase 1), resuelto:** las vistas browser de allauth
  exigen el token también en el login.
  - El admin lee primero `/auth/user/`, que pone `csrftoken` aunque no haya sesión.
  - `CsrfTests.test_the_login_needs_the_token_too` lo prueba.
- **Cliente generado:** los endpoints de allauth no salen de drf-spectacular.
  - `manage.py allauth_schema` escribe su spec, con la configuración real.
  - `@hey-api/openapi-ts` genera el cliente en `packages/api-client/src/allauth`. Las dos cosas
    corren con `pnpm generate:schema` y `generate:api`.
- **Django admin:** si está montado y `REQUIRE_2FA`, `accounts.admin_site.MFAAdminSite` solo deja
  entrar a sesiones que pasaron el segundo factor.
- **Migración:** los usuarios con 2FA lo vuelven a configurar. Las tablas de django-otp quedan
  huérfanas en las bases que lo tuvieron y se pueden borrar a mano.
- **Passkeys (WebAuthn)** como segundo factor, además del TOTP:
  - Una passkey queda atada al dominio del navegador (el RP ID). Detrás del rewrite, allauth
    leería el host de la API. `accounts.adapter.MFAAdapter` toma el host del frontend de
    `X-Forwarded-Host`, que pone Next, y solo si está en `FRONTEND_ORIGINS`; un request directo a
    la API no puede elegirlo.
  - Si el dominio del admin cambia, las passkeys registradas dejan de servir: quedan el TOTP y
    los códigos de recuperación.
  - En el admin, `@simplewebauthn/browser` hace de puente con `navigator.credentials`. El desafío
    se pide antes del clic, porque el navegador solo abre su diálogo en respuesta directa a uno.
  - Por ahora no se usan para entrar sin contraseña (`MFA_PASSKEY_LOGIN_ENABLED`). Es una opción
    para la tienda o para más adelante.

## Fase 3: cuentas en la tienda

- La tienda pasa a same-origin, con su propio rewrite `/api` y su `proxy.ts` para `/account/*` y
  `/checkout`.
- Registro e ingreso con email y contraseña, y con Google. Verificación de email y reset de
  contraseña con los links de `HEADLESS_FRONTEND_URLS`, que apuntan a la tienda.
- **Lecturas en server components:**
  - el catálogo sigue con `"use cache"` (`src/lib/cache.ts`);
  - lo del usuario va en `src/lib/dal.ts`, que reenvía la cookie a Django con `cookies()` y se
    cachea por request con `cache()` de React;
  - se renderiza dentro de `<Suspense>`, así el shell queda cacheado y solo lo personal es
    dinámico (`cacheComponents`).
- **Mutaciones:**
  - las de cuenta van del navegador a `/api/_allauth/...`, así Django pone las cookies directamente;
  - las demás van por Server Actions con un helper `djangoFetch()`, que reenvía la cookie y el
    CSRF y copia los `Set-Cookie` de la respuesta.

## Fase 4: carrito y checkout

- Un modelo `Cart` en Django, asociado a la sesión (anónimo) o al usuario. Al ingresar, se fusiona
  con el del usuario (signal de login de allauth).
- **Compra como invitado:** el checkout crea el `Customer` con los datos que se cargan.
  `Customer.user` (OneToOne opcional) vincula al cliente con su cuenta cuando la tiene.
