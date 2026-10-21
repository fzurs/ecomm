# apps/admin (dashboard de administración en Next.js)

## Datos
- Usar los helpers de TanStack Query generados en `@workspace/api-client/query`
  (`ordersListOptions`, `ordersListQueryKey`, mutations...). No escribir llamadas axios a mano.
- El cliente se configura en `src/lib/api-setup.ts` (`baseURL`, `withCredentials`, header CSRF
  tomado de la cookie `csrftoken`).
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

## Estructura de las secciones
- **`src/app/(admin)/orders/` es el patrón de referencia**: `page.tsx`, `[number]/page.tsx`,
  `new/page.tsx`, y las carpetas privadas `_components/`, `_hooks/`, `_lib/`.
- `customers` y `products` también siguen este patrón, con row actions vía `RowActionsProvider`.
- Las demás secciones (`invoices`, `brands`, `categories`) todavía usan
  `columns.tsx` / `form.tsx` sueltos. Migrarlas al patrón nuevo solo cuando se pide.
- Las secciones nuevas necesitan una entrada en `src/components/app-sidebar.tsx`. `/new-admin-section` arma una.

## UI
- Componentes base de `@workspace/ui/components/*`. Los componentes nuevos de shadcn se agregan en
  `packages/ui`, no acá.
- Helpers en `src/lib/utils.ts` (`formatPrice` formatea en es-AR).

## Verificar
`pnpm --filter admin typecheck` y `pnpm --filter admin lint`.
