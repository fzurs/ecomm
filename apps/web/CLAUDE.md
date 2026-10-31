# apps/web (tienda en Next.js)

`cacheComponents` está activo: lo que lee cookies, `params` o `searchParams` va dentro de un
`<Suspense>`, así el resto de la página queda prerenderizado. Ver `docs/architecture/auth.md`.

## Datos
- Same-origin, como el admin: el navegador llama a `/api/...` y `next.config.mjs` lo reenvía a
  Django (`API_URL`, `http://localhost:8000` por defecto; se lee en el build). El servidor de
  Next llama directo a `API_URL` (`src/lib/django.ts`).
- Las funciones del cliente generado comparten un `client` global: del lado del servidor siempre
  se les pasa `baseURL` (`API_URL`). `src/lib/allauth.ts` configura el de allauth para el
  navegador (`/api` y el header CSRF) y lo importan solo client components; nunca un server
  component.
- **Público** (catálogo, config de allauth): `src/lib/cache.ts`, con `"use cache"` y `cacheLife`.
  Nunca lee cookies.
- **Del visitante**: `src/lib/dal.ts` (`getUser()`), con sus cookies (`asVisitor()`) y `cache()`
  de React por request. Devuelve null sin sesión.
  - El layout de `(shop)` no la espera: pasa `getVisitor()` como promesa a `VisitorProvider`, y
    `UserNav` la resuelve en su `<Suspense>`. Al header le llega solo nombre y email.
- **Escrituras**:
  - Las de cuenta, desde el navegador a allauth (`@workspace/api-client/allauth`), así Django pone
    las cookies.
  - Las demás, Server Actions con `djangoFetch()` (`src/lib/django.ts`), que reenvía cookies,
    CSRF y `Origin`, y copia los `Set-Cookie`. Ejemplo: `src/app/(shop)/account/actions.ts`.
- Listados (home, categoría): `ProductList` (`src/components/product-list.tsx`) recibe el
  `pathname` y los `searchParams`. Va dentro de `<Suspense fallback={<ProductGridSkeleton />}>`.
  - La URL tiene búsqueda, orden, filtros ("In stock", "On sale") y página, con los parsers de
    `src/lib/product-params.ts`. El servidor los lee con `loadProductParams`; `ProductFilters` y
    el buscador los escriben con los mismos parsers (`shallow: false`) y vuelven a la página 1.
  - `productsQuery()` los traduce a la API: 12 por página, y el orden por precio es por
    `active_price`, el precio con descuento. La API ya filtra los productos que no están a la
    venta.
  - La paginación son links (`productsHref`), así cada página queda en caché.
  - La marca es un filtro y no una página: los menús llevan a `/?brand=<slug>` (`brandHref`), y
    `next.config.mjs` redirige las viejas `/brands/...`. `ActiveFilters` muestra lo que filtra,
    con un click para sacarlo. En una categoría, su filtro le gana a la URL
    (`{ ...productsQuery(params), ...filters }`).
  - La categoría, en cambio, es una página (`/<slug>`), con su URL, título y prerender. El selector
    de la barra y su chip navegan entre categorías conservando la búsqueda y los filtros
    (`useListingCategory`); no hay `?category=`, así cada categoría tiene una sola URL.
  - En un listado el buscador del header filtra mientras se escribe (`listsProducts()` de
    `src/lib/navigation.ts`, por la ruta). En las demás páginas, Enter busca en la home.
- Layout de `(shop)`: `SiteHeader` (logo, `MainNav` con los menús de categorías y marcas y "On
  sale", el buscador y `UserNav`; en el celular, `MobileNav` en un `Sheet`) y `SiteFooter` (con
  `"use cache"`). No hay sidebar ni breadcrumbs. Cada página pone su título en el contenido.
  El producto linkea a su marca y categoría. Los links de ayuda y los legales del footer (botón
  de arrepentimiento, Data fiscal) son placeholders.
- Bloques de texto (el `h1` y la descripción de cada página, la descripción del producto,
  páginas de contenido) en `<div className="typeset">`, como el admin
  (`packages/ui/src/styles/typeset.css`). Los componentes (tarjetas, precios, header, footer,
  filtros, forms, `Empty`) no: tienen su propia tipografía, y `typeset` les sumaría márgenes y
  subrayados (`not-typeset` excluye uno que quede adentro).
- Las páginas con slug (categoría, producto) tienen `generateStaticParams` (se
  prerenderizan en el build) y `generateMetadata` (título "%s · Acme Store").
- Precios con `formatPrice` (`src/lib/format.ts`, es-AR como el admin).
- Imágenes con `ProductImage`: cuadradas, con un placeholder si no hay. Usa `next/image`, y cada
  uso pasa `sizes` con el ancho en que se muestra (ej. `"48px"`). Así el navegador pide una versión
  achicada, en WebP o AVIF.
  - Las URLs son el `MEDIA_URL` absoluto de Django. `next.config.mjs` arma
    `images.remotePatterns` con la misma variable, que se lee en el build.
  - En dev, `dangerouslyAllowLocalIP`: Next no baja imágenes de `localhost` si no se lo
    permite.

## Cuentas
- `src/proxy.ts` manda `/account/*` a `/login?next=...` sin cookie `sessionid` (chequeo
  optimista). Las páginas validan con `getUser()`: `/account` redirige a `/login` si la sesión
  venció, y `/login` y `/signup` siguen a `next` si ya hay sesión. `next` pasa siempre por
  `safeNext()` (`src/lib/navigation.ts`).
- Páginas en `(auth)` (sin header ni footer): `/login`, `/signup`, `/password/reset`,
  `/password/reset/[key]` y `/verify-email/[key]`. Las dos últimas son los links de los mails de
  allauth (`HEADLESS_FRONTEND_URLS` en la API): validan la clave en el servidor
  (`src/lib/account-links.ts`, con `decodeKey`, porque llega URL-encodeada) antes de mostrar el
  form. Confirmar el email es un botón y no se hace al cargar, porque los scanners de mail abren
  los links.
- allauth responde distinto que DRF: un paso pendiente es un 401 con `flows` (`pendingFlow()`), y
  los errores son `{ errors: [{ param, message }] }` (`formErrors()`, que los pone por campo).
- Después de loguear (password, Google, email confirmado): `useFinishLogin()` vuelve a `next` y
  hace `router.refresh()` para que los server components lean la cookie nueva. El logout es
  `useLogout()`.
- La sesión de un cliente dura 30 días y sobrevive al cierre del navegador; la contraseña pide 8
  caracteres (`minLength={8}` en los forms). Las dos reglas son de la API.
- Google: `GoogleLogin` (`src/components/google-button.tsx`) aparece solo si la API tiene
  `GOOGLE_CLIENT_ID` (`getGoogleClientId()`). Usa el botón de Google Identity Services y le pasa
  el ID token a allauth; no hay redirect.

## Carrito y checkout
- El carrito vive en Django (`apps/api/checkout`). Se lee con `getCart()` (`src/lib/dal.ts`), y se
  cambia con las Server Actions de `src/app/(shop)/cart/actions.ts` (`djangoFetch()`), que hacen
  `refresh()` para que el header se actualice. El layout pasa `getCart()` como promesa a
  `CartProvider`, y `CartButton` muestra la cantidad en su `<Suspense>`.
- `djangoFetch()` pide un token CSRF a Django (GET `/auth/user/`) si el visitante todavía no
  tiene: un invitado puede escribir antes de haber pasado por allauth.
- Producto: `AddToCart` (cantidad y botón, con un toast de sonner) solo si está activo y tiene
  precio, como exige la API. `/cart`: líneas con `useOptimistic` para la cantidad; un producto
  que dejó de estar a la venta se marca y bloquea el checkout.
- `/checkout` (sin sesión también): `CheckoutForm` con contacto, envío y facturación (los códigos
  de ARCA que ofrece están en `src/lib/fiscal.ts`). `placeOrder` muestra los errores de DRF por
  campo y, si sale bien, redirige a `/orders/<número>`, que también es la confirmación.
- Pago con Mercado Pago (`docs/architecture/payments.md`): `placeOrder` redirige al
  `payment_url` que devuelve la API, o al pedido si no hay. En `/orders/<número>`,
  `PaymentStatus` muestra en qué está el pago:
  - pagar, reintentar (`payOrder`, `/my/orders/<n>/pay/`) o esperar la confirmación, con
    `RefreshWhileWaiting`, porque la confirma el webhook y no la vuelta de Mercado Pago;
  - "Download invoice" (`/api/my/orders/<n>/invoice/`).
- `/account` lista los pedidos de la cuenta (`getMyOrders()`); los labels de los estados están en
  `src/lib/order-status.ts`.

## Formularios
- `useActionState` con `<form action>`: la action devuelve un `FormState` (`src/lib/form-state.ts`)
  con `fieldErrors` por nombre de input, `formError` y `values`. React resetea el form después de
  la action, así que los valores vuelven por `defaultValue={state.values?.x}`. El `Input` de Base UI
  no acepta que cambie el `defaultValue`: `TextField` lo remonta con un `key`.
- `TextField` y `SubmitButton` (`src/components/form.tsx`, con `useFormStatus`) sobre los `Field`
  de `@workspace/ui`. Textos de la UI en inglés, como el admin.

## Verificar
`pnpm --filter web typecheck`, `pnpm --filter web lint` y `pnpm --filter web build` (necesita la
API levantada: el build prerenderiza el catálogo, y falla si algo dinámico quedó fuera de un
`<Suspense>`).
