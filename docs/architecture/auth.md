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
   - CORS no hace falta para el navegador.
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
- **SameSite**: queda el default de Django, `Lax`. La misma API atiende al admin y a la tienda, y
  la tienda va a necesitar `Lax` para el login con Google.

## Fase 2: django-allauth headless (API + admin)

Reemplaza a dj-rest-auth y al 2FA propio con django-otp.

- dj-rest-auth es una capa REST sobre el auth de Django; su registro y su login social funcionan
  sobre allauth. allauth es el motor de cuentas completo:
  - registro, verificación de email, reset de contraseña y login por código;
  - proveedores sociales (Google);
  - MFA con TOTP, códigos de respaldo y passkeys;
  - rate limits, reautenticación y gestión de sesiones.

  Su modo **headless** expone todo eso como API REST para frontends (`/_allauth/browser/v1/...`),
  así que dj-rest-auth sobra.
- Se usa en modo browser (sesión con cookie y CSRF), igual que hoy. El resto de la API no cambia.
- El staff sigue obligado a usar MFA: el permiso por defecto exige que la sesión se haya
  autenticado con MFA, en reemplazo del `is_verified` de django-otp.
- El cliente de auth se genera aparte, con `@hey-api/openapi-ts`, desde la spec OpenAPI de allauth
  (`HEADLESS_SERVE_SPECIFICATION`), porque no sale del schema de drf-spectacular. Hay que sumarlo a
  `/regen-api`.
- Los usuarios con 2FA lo vuelven a configurar.

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
