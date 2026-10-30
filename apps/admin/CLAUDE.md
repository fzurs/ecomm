# apps/admin (dashboard de administración en Next.js)

## Datos
- Usar los helpers de TanStack Query generados en `@workspace/api-client/query`
  (`ordersListOptions`, `ordersListQueryKey`, mutations...). No escribir llamadas axios a mano.
- Same-origin: el cliente (`src/lib/api-setup.ts`) llama a `/api/...` en el origen del admin, y
  `next.config.mjs` lo reenvía a Django (`API_URL`, `http://localhost:8000` por defecto; se lee en
  el build). Las cookies de Django quedan en el dominio del admin; el header CSRF sale de la cookie
  `csrftoken`. Una URL a la API (PDF, stream del asistente) se arma con
  `client.getConfig().baseURL`, nunca con el host de Django. Ver `docs/architecture/auth.md`.

## Autenticación
- Sesión de Django vía django-allauth headless (`/api/_allauth/browser/v1/...`, cliente generado en
  `@workspace/api-client/allauth`). Todo pasa por `src/hooks/use-auth.ts`: `useSession()`
  (`/auth/user/`: `loading` / `authenticated` / `unauthenticated` / `error`), `useLogin()`,
  `useSecondFactor()` y `useLogout()`, más los del 2FA. No usar las funciones de auth generadas
  directamente. allauth responde distinto que DRF: los pasos pendientes son un 401 con `flows`
  (`src/lib/allauth.ts`) y los errores `{ errors: [{ param, message }] }`, que `applyServerErrors`
  también entiende.
- `src/proxy.ts` redirige a `/login?next=<ruta>` antes de renderizar si no hay cookie `sessionid`
  (chequeo optimista, sin llamar a la API); `useLogin` vuelve a `next` (`afterLoginPath`). No
  redirige `/login` a home con cookie: una vencida haría un loop con `AuthGuard`.
- `(admin)/layout.tsx` envuelve todo en `AuthGuard` (`src/components/auth-guard.tsx`), que redirige
  a `/login` solo ante 401/403; otros errores muestran un estado de error con reintento. Un usuario
  logueado que no es staff ve "No access" y puede cerrar sesión.
- 2FA: si el login queda pendiente de `mfa_authenticate`, el formulario pasa a un paso propio
  para el código (6 casillas con `OtpField`, que envía solo al completarse, o un código de
  recuperación). Si la API exige 2FA (`user.mfa_required`) y la sesión no lo pasó, `AuthGuard`
  muestra el setup (`src/components/two-factor.tsx`) antes del admin. Se activa o desactiva en
  `/account/security` (menú del usuario). Activar y desactivar piden la contraseña otra vez
  cuando allauth responde `reauthenticate` (`useWithReauthentication`), y después reintentan.
  El QR se dibuja en el navegador (`qrcode`) con la `totp_url` de allauth.
- Passkeys: `@simplewebauthn/browser` traduce las opciones de allauth (`{ publicKey }`, JSON
  base64url, `src/lib/allauth.ts`) a `navigator.credentials`. El navegador solo abre su diálogo
  en respuesta directa a un clic: el desafío se pide antes (`usePasskeyLoginOptions`,
  `usePasskeyCreationOptions`) y el clic llama a `startAuthentication` / `startRegistration` sin
  esperar la red. Un desafío sirve para un intento: después de usarlo (o de un error) se vuelve a
  pedir. En el login se ofrece primero si la cuenta tiene una (`types` del flujo pendiente).
- Permisos: `useCan("app.codename")` (de `user.permissions`) oculta acciones que la API rechazaría,
  ej. emitir comprobantes (`billing.add_invoice`). La API es la que valida; esto es solo UI.
- Login y logout hacen `queryClient.clear()` para no mostrar datos de otra sesión, y redirigen
  con `router.replace`.
- El `QueryClient` (`src/components/react-query-provider.tsx`) vuelve a pedir la sesión ante
  cualquier 401/403, así una sesión vencida termina en `/login`.
- Los tipos de request/response vienen de `@workspace/api-client`; los enums y la validación de
  `@workspace/api-client/zod`.

## Páginas de listado
- Estado en la URL con `nuqs` (`useQueryState`, `parseAs*`).
- Hooks compartidos en `src/hooks/`: `usePagination`, `useOrdering`, `useFilters`, `useDebounce`,
  `useSearch` (param `search` de la URL; al cambiar vuelve a la página 1).
- Búsqueda: `SearchInput` con `value`/`onValueChange` de `useSearch()` y `count={data?.count}`
  para mostrar el total de resultados.
- Tablas: `@workspace/data-table` (`useDataTable`, `DataTable`, `DataTableAdvancedToolbar`,
  `DataTableSelectFilter` / `DataTableMultiSelectFilter`, `DataTableSortMenu`) + `SearchInput` de
  `src/components/`.
- Las row actions y sus diálogos pasan por `RowActionsProvider` (`src/context/row-actions-provider.tsx`).

## Formularios
- TanStack Form con `useAppForm` / `withForm` de `src/hooks/form.ts`; los componentes de campo
  (`TextField`, `SelectField`, `NumberField`...) están en `src/components/form.tsx`.
- Convención (la siguen todos los forms de recursos; orders solo tiene create):
  - Un form por operación: `<resource>-create-form.tsx` y `<resource>-edit-form.tsx`, cada uno
    con su hook (`useXCreateForm({ onSuccess })`, `useXEditForm({ x, onSuccess })`) y su `withForm`.
    Sin `variant` ni ramas `if (x)` dentro del hook.
  - `_lib/<resource>-schema.ts`: schema del form que extiende el zod generado con las reglas de
    UX, su tipo, y `toXFormValues(x)` para mapear la entidad a los valores editables.
  - Los hooks reciben `onSuccess`, no `setOpen`; quien contiene el form decide cómo cerrarse.
  - `onSubmit` hace `try { await mutateAsync } catch { applyServerErrors(formApi, error) }`
    (`src/lib/utils.ts`): los errores de DRF van a cada campo, y el resto (`non_field_errors`,
    `detail`, red, 500) a un error del form que `form.Form` muestra arriba (`FormError`).

## Estructura de las secciones
- **`src/app/(admin)/orders/` es el patrón de referencia**: `page.tsx`, `[number]/page.tsx`,
  `new/page.tsx`, y las carpetas privadas `_components/`, `_hooks/`, `_lib/`.
- `customers`, `products`, `brands` y `categories` también siguen este patrón, con row actions
  vía `RowActionsProvider`.
- `invoices` no tiene alta: las facturas se emiten desde las row actions de una orden pagada (con
  vista previa, `order-invoice-dialog.tsx`) y las notas desde una factura autorizada
  (`invoices/[id]/credit-note`, `debit-note`). Emitir devuelve 2xx también si ARCA rechaza: el
  resultado está en el `status` del comprobante (`toastEmission`).
- Las etiquetas de los códigos de ARCA (documento, condición de IVA, alícuota) están en
  `src/lib/fiscal.ts`; `SelectField` acepta opciones numéricas para esos enums.
- Las secciones nuevas necesitan una entrada en `src/components/app-sidebar.tsx`. `/new-admin-section` arma una.

## UI
- Componentes base de `@workspace/ui/components/*`. Los componentes nuevos de shadcn se agregan en
  `packages/ui`, no acá.
- Helpers en `src/lib/utils.ts` (`formatPrice` formatea en es-AR).
- Statuses: label y color de cada valor en `_lib/<resource>-status` como
  `<resource>Statuses: Record<XStatus, StatusDefinition>` (el tipo generado), con los labels escritos
  a mano; nunca derivados del valor. Se muestran con `StatusBadge` / `StatusDot` de
  `src/components/status.tsx` (badge outline con un dot de color), que es el único lugar con las
  clases de cada color. Las opciones de selects, menús y filtros salen de
  `statusOptions(zXStatus.options, xStatuses)`, con el dot como ícono. Al regenerar la API, el
  typecheck marca los statuses nuevos que falten.

## Verificar
`pnpm --filter admin typecheck` y `pnpm --filter admin lint`.
