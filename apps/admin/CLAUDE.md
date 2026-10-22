# apps/admin (dashboard de administración en Next.js)

## Datos
- Usar los helpers de TanStack Query generados en `@workspace/api-client/query`
  (`ordersListOptions`, `ordersListQueryKey`, mutations...). No escribir llamadas axios a mano.
- El cliente se configura en `src/lib/api-setup.ts` (`baseURL` desde `NEXT_PUBLIC_API_URL`, con
  `http://localhost:8000` por defecto; `withCredentials`; header CSRF tomado de la cookie `csrftoken`).

## Autenticación
- Sesión de Django vía dj-rest-auth. Todo pasa por `src/hooks/use-auth.ts`: `useSession()`
  (`loading` / `authenticated` / `unauthenticated` / `error`), `useLogin()` y `useLogout()`. No
  usar `authUserRetrieveOptions` ni las mutations de auth directamente.
- `(admin)/layout.tsx` envuelve todo en `AuthGuard` (`src/components/auth-guard.tsx`), que redirige
  a `/login` solo ante 401/403; otros errores muestran un estado de error con reintento.
- Login y logout hacen `queryClient.clear()` para no mostrar datos de otra sesión, y redirigen
  con `router.replace`.
- El `QueryClient` (`src/components/react-query-provider.tsx`) vuelve a pedir la sesión ante
  cualquier 401/403, así una sesión vencida termina en `/login`.
- Los tipos de request/response vienen de `@workspace/api-client`; los enums y la validación de
  `@workspace/api-client/zod`.

## Páginas de listado
- Estado en la URL con `nuqs` (`useQueryState`, `parseAs*`).
- Hooks compartidos en `src/hooks/`: `usePagination`, `useOrdering`, `useFilters`, `useDebounce`.
- Tablas: `@workspace/data-table` (`useDataTable`, `DataTable`, `DataTableAdvancedToolbar`,
  `DataTableFacetedFilter`, `DataTableSortMenu`) + `SearchInput` de `src/components/`.
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
- `invoices` todavía usa `columns.tsx` suelto. Migrarla al patrón nuevo solo cuando se pide.
- Las secciones nuevas necesitan una entrada en `src/components/app-sidebar.tsx`. `/new-admin-section` arma una.

## UI
- Componentes base de `@workspace/ui/components/*`. Los componentes nuevos de shadcn se agregan en
  `packages/ui`, no acá.
- Helpers en `src/lib/utils.ts` (`formatPrice` formatea en es-AR).
- Playground en `/playground` (solo en desarrollo; `layout.tsx` hace `notFound()` en otros
  entornos) para armar y revisar componentes con los providers y datos reales. Una página por
  tema en `playground/<slug>/page.tsx`, con `PlaygroundSection`, y su entrada en
  `playground/_lib/playground-entries.ts`. No va en el sidebar.

## Verificar
`pnpm --filter admin typecheck` y `pnpm --filter admin lint`.
