# Autenticación: admin y tienda

Cómo se autentican el admin (`apps/admin`) y la tienda (`apps/web`) contra la API de Django
(`apps/api`), y hacia dónde va. Las fases 1 a 3 están implementadas; la 4 es el plan.

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
  - Login con username (el staff) o email (los clientes, desde la fase 3).
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

## Fase 3 (hecha): cuentas en la tienda

- **Same-origin, como el admin:** `apps/web/next.config.mjs` reenvía `/api/*` a `API_URL` con las
  mismas dos reglas y `skipTrailingSlashRedirect`.
  - `apps/web/src/proxy.ts` manda a `/login?next=<ruta>` si no hay `sessionid` en `/account/*`.
    El checkout se suma en la fase 4.
  - Las páginas validan la sesión de verdad (`getUser()`): una cookie vencida también termina en
    `/login`, y `/login` con sesión válida sigue a `next`. No hay loop porque ninguna de las dos
    decide solo por la cookie.
- **Cuentas de clientes** (`apps/api/config/settings/base.py`):
  - Registro con email y contraseña (`ACCOUNT_SIGNUP_FIELDS`); allauth inventa el username. El
    login acepta username (staff) o email (clientes).
  - Verificación de email obligatoria: el registro responde 401 con `verify_email` pendiente, y el
    link loguea solo en el navegador que se registró (`ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION`; allauth
    guarda ese login en la sesión). Un link filtrado no loguea a nadie.
  - El staff no la necesita: lo crea `create_operator`, muchas veces sin email.
    `accounts.adapter.CustomerEmailVerificationStage` lo saltea en el login.
  - Registrarse con un email que ya tiene cuenta responde lo mismo que uno nuevo; allauth le avisa
    al dueño por mail. Así no se puede averiguar qué emails tienen cuenta.
  - Los links de los mails (`HEADLESS_FRONTEND_URLS`) apuntan a la tienda (`STORE_URL`):
    `/verify-email/<key>`, `/password/reset/<key>`. La clave llega URL-encodeada.
  - Los mails se firman con `STORE_NAME`. Sin `django.contrib.sites`, allauth usaría el host del
    request, que es el de la API (`AccountAdapter.send_mail`).
  - Después de un reset de contraseña no queda logueado (el default de allauth): la tienda manda
    al login.
- **Google, por ID token y no por redirect:**
  - El botón de Google Identity Services le da a la tienda un ID token. La tienda se lo pasa a
    allauth (`/auth/provider/token`), que lo verifica y loguea o registra.
  - Es un request más al `/api` de la tienda, así que la cookie de sesión queda en su dominio.
  - El flujo por redirect volvería del lado de Google al host de la API, fuera del `/api` de la
    tienda: allauth arma la `redirect_uri` con el host y la ruta que ve Django. No está montado
    (`config/urls.py` lo responde con 404).
  - Solo hace falta `GOOGLE_CLIENT_ID` (sin secret). La tienda lo lee de `/_allauth/.../config` y
    sin él no muestra el botón.
  - Un email de Google que ya tiene cuenta entra a esa cuenta solo si la cuenta lo verificó y no
    es staff (`accounts.adapter.SocialAccountAdapter`). Si no, allauth deja el registro pendiente
    (`provider_signup`) y la tienda pide entrar con la contraseña.
- **Lecturas en server components:**
  - El catálogo sigue con `"use cache"` (`src/lib/cache.ts`), igual que la config de allauth.
  - Lo del usuario va en `src/lib/dal.ts` (`getUser()`): lee `/auth/user/` con las cookies del
    visitante (`asVisitor()` de `src/lib/django.ts`) y se cachea por request con `cache()`.
  - Se renderiza dentro de `<Suspense>`, así el shell queda cacheado y solo lo personal es
    dinámico (`cacheComponents`). El layout de `(shop)` pasa la sesión al header como promesa
    (`VisitorProvider`), y el menú del usuario la resuelve en su propio `<Suspense>`.
- **Mutaciones:**
  - Las de cuenta van del navegador a `/api/_allauth/...`, así Django pone las cookies
    directamente: login, registro, Google, verificación, reset y cambio de contraseña, logout.
  - El navegador puede no tener `csrftoken` todavía, porque la tienda lee la sesión en su
    servidor. El interceptor de `src/lib/allauth.ts` lo pide (GET `/api/auth/user/`) antes de la
    primera escritura.
  - Las demás van por Server Actions con `djangoFetch()` (`src/lib/django.ts`): reenvía las
    cookies, el header CSRF y el `Origin` de la action, y copia los `Set-Cookie` de la respuesta
    (también si falla).
  - Primera action: el nombre en `/account` (PATCH `/auth/user/`, que acepta solo
    `first_name`/`last_name`).
- **Sesión de los clientes:** 30 días (`CUSTOMER_SESSION_AGE`), y sobrevive al cierre del
  navegador. La del staff sigue igual: 8 horas (`SESSION_COOKIE_AGE`) y se cierra con el navegador.
  - `AccountAdapter.login` hace `set_expiry` si el usuario no es staff. Por ahí pasan todos los
    logins de allauth: contraseña, link de confirmación y Google.
  - Cuenta desde el login, o desde la última vez que Django guardó la sesión. Las lecturas de la
    tienda no la renuevan: van desde su servidor y no pueden poner cookies. Las escrituras de la
    fase 4 sí, porque `djangoFetch()` copia el `Set-Cookie`.
  - Sin "recordarme": `ACCOUNT_SESSION_REMEMBER` solo existe en los forms de allauth, no en
    headless.
- **Contraseñas:** 8 caracteres para los clientes y 12 para el staff
  (`accounts.validators.MinimumLengthValidator`), más las listas de Django (comunes, solo
  números, parecidas al usuario). Sin usuario aplica el mínimo del staff. El registro valida sin
  usuario, así que `AccountAdapter.clean_password` le pasa un cliente.

## Fase 4 (hecha): carrito y checkout

- **Carrito** (`apps/api/checkout`): `Cart` y `CartItem` en Django.
  - El de un invitado está en su sesión (`cart_id`). Crearlo le da a la sesión los 30 días de
    los clientes (`CUSTOMER_SESSION_AGE`), así el carrito sobrevive al cierre del navegador.
  - El de un cliente es de su cuenta (`Cart.user`). Al ingresar, el del invitado pasa a la cuenta,
    o se suma al que ya tenía (`user_logged_in` de Django, que allauth dispara en todos sus
    logins). Al salir, queda en la cuenta.
  - Solo entran productos a la venta: activos y con precio (`services.is_purchasable`). Uno que
    deja de estarlo queda en el carrito marcado como no disponible, fuera del total, y el
    checkout pide sacarlo.
- **Compra como invitado:** el checkout crea un `Customer` con los datos que se cargan, uno por
  compra. Un email escrito en el checkout no prueba nada, así que nunca se suma a la cuenta de
  otro. Con sesión, `Customer.user` vincula al cliente con su cuenta: se crea en la primera compra
  y las siguientes lo actualizan.
- **La orden** queda `pending`, con los precios del momento (`OrderItem` los copia) y
  `Order.shipping_address`. El cliente recibe un mail. La puede ver en `/orders/<número>` si es
  suya: la de su cuenta, o la de un invitado en la misma sesión (`placed_orders`). La de otro da
  404.
- **Todavía no hay pago:** el mail y la página dicen que se arregla por email. Integrar un medio
  de pago (ej. Mercado Pago) es lo que sigue.
- **API** (`/cart/`, `/cart/items/`, `/checkout/`, `/my/orders/`): acepta invitados y exige CSRF
  también sin sesión (`config.authentication.CsrfSessionAuthentication`; la de DRF lo hace solo
  con usuarios logueados).
- **Tienda:**
  - Las escrituras van por Server Actions con `djangoFetch()`: agregar, cambiar la cantidad,
    sacar y confirmar el pedido. Así Django pone las cookies del carrito en el dominio de la
    tienda, y cada cambio renueva la sesión.
  - La primera escritura de un invitado puede llegar sin token CSRF. `djangoFetch()` lo pide antes
    (GET `/auth/user/`) y se lo pasa al navegador.
  - Las lecturas (`getCart()`, `getMyOrders()`, `getMyOrder()`) están en `src/lib/dal.ts`. El
    header muestra la cantidad con una promesa, como la sesión.
  - `/checkout` no exige sesión, así que `proxy.ts` no lo protege.
