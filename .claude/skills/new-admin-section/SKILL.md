---
name: new-admin-section
description: Arma una sección nueva en apps/admin (listado, detalle, formulario de alta, row actions, entrada en el sidebar) siguiendo el patrón de orders/. Recibe el nombre del recurso, ej. "/new-admin-section suppliers".
---

# Sección nueva del admin

Argumento: el nombre del recurso (en plural, como en la URL de la API, ej. `suppliers`).

1. **Verificar que la API exista.** Buscar en `packages/api-client/src/@tanstack/react-query.gen.ts`
   `<resource>ListOptions`, `<resource>RetrieveOptions` y las mutations de create/update/destroy. Si
   faltan, el endpoint no existe todavía o el cliente está desactualizado: correr el flujo de
   `/regen-api`, o preguntar si hay que crear primero el endpoint en Django.
2. **Leer la referencia, no copiar de memoria.** Leer los archivos actuales de
   `apps/admin/src/app/(admin)/orders/` (`page.tsx`, `[number]/page.tsx`, `new/page.tsx`,
   `_components/`, `_hooks/`, `_lib/`): el patrón va cambiando, así que hay que copiar lo que hay hoy.
3. **Preguntar lo que haga falta** si no está claro: qué columnas, qué filtros (faceted o búsqueda),
   si tiene página de detalle, formulario de alta/edición, acción de borrar.
4. **Armar** `apps/admin/src/app/(admin)/<resource>/` con la misma estructura:
   - `page.tsx` — listado con `useDataTable`, `usePagination`, `useOrdering`, `useFilters` y búsqueda con `nuqs`
   - `_components/<resource>-columns.tsx`, `<resource>-row-actions.tsx`, `<resource>-form.tsx` y el alert dialog de borrado
   - `_lib/` para listas de opciones / constantes, `_hooks/` para hooks propios de la sección
   - páginas de detalle y `new/` solo si se piden; el segmento dinámico usa el lookup field de la API
5. **Sidebar**: agregar la entrada al grupo que corresponda (`Sales`, `Catalog`...) en `groups` de
   `apps/admin/src/components/app-sidebar.tsx`; si no encaja en ninguno, crear un grupo nuevo.
6. **Verificar**: `pnpm --filter admin typecheck` y `pnpm --filter admin lint`; corregir lo que falle.

Reusar los componentes de `@workspace/ui` y `@workspace/data-table`; no agregar componentes
compartidos nuevos salvo que no haya ninguno que sirva.
