# Ecommerce Demo

Monorepo de una tienda online argentina: API en Django, panel de administración y tienda en Next.js,
con facturación electrónica de ARCA (ex AFIP) y un asistente de IA en el panel.

## Qué incluye

- **Tienda** (`apps/web`): catálogo por categoría y marca, y página de producto.
- **Panel de administración** (`apps/admin`): productos, marcas, categorías, clientes y pedidos, con
  listados filtrables, detalle y formularios.
- **Facturación electrónica**: Facturas A, B y C y sus notas de crédito y débito, emitidas a ARCA con
  [arca-client](https://github.com/fzurs/arca-client), con CAE, PDF y código QR. Contempla los cortes
  de conexión: un comprobante que quedó sin verificar se consulta en ARCA, nunca se reemite.
- **Asistente**: chat con Claude dentro del panel, que consulta pedidos, productos, clientes,
  comprobantes y ventas (solo lectura).

## Stack

| | |
|---|---|
| API | Python 3.14, Django 5.2, Django REST Framework, drf-spectacular, PostgreSQL 18, Redis |
| Frontends | Next.js 16, React 19, TanStack Query/Table/Form, Tailwind, shadcn/ui (Base UI) |
| Cliente de la API | Generado desde el schema OpenAPI con `@hey-api/openapi-ts` (axios + zod + TanStack Query) |
| Monorepo | pnpm workspaces + Turborepo, en un Dev Container |

## Estructura

```
.devcontainer/          # Contenedores de desarrollo: api (Python + Node), Postgres y Redis
apps/
  api/                  # Django: apps store, orders, billing y assistant (puerto 8000)
  admin/                # Panel de administración en Next.js (puerto 3001)
  web/                  # Tienda en Next.js (puerto 3000)
packages/
  api-client/           # Cliente de la API generado (no se edita a mano)
  ui/                   # Componentes de shadcn/ui
  data-table/           # Tablas compartidas (TanStack Table)
  eslint-config/, prettier-config/, typescript-config/
```

## Puesta en marcha (WSL + Dev Containers)

### Requisitos

- WSL2 (Linux en Windows)
- Docker Desktop, con la integración con WSL habilitada
- VS Code con la extensión Dev Containers

### Trabajar en el sistema de archivos de Linux

**No** desarrolles dentro de `/mnt/c/Users/...`: TypeScript se vuelve lento, el hot reload no
funciona y el uso de CPU se dispara. Trabajá siempre dentro de `/home/<usuario>/...`.

### Clonar y abrir el proyecto

```bash
cd ~
git clone <repo-url> ecomm
# Opcional: el código de arca-client al lado, para consultarlo desde el contenedor
# (se monta de solo lectura en /workspace/arca-client; la API lo instala desde GitHub).
git clone https://github.com/fzurs/arca-client
code ecomm
```

En VS Code: `Ctrl + Shift + P` → **Dev Containers: Reopen in Container**. El contenedor instala las
dependencias de Python al construirse y levanta Postgres y Redis, accesibles por `localhost`.

### Primer arranque

Dentro del contenedor, desde la raíz del repo:

```bash
# 1. Configuración (ver los comentarios de cada archivo)
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env.local   # opcional

# 2. Dependencias de Node
pnpm install

# 3. Base de datos y usuario del panel (tiene que ser staff: createsuperuser lo es)
python apps/api/manage.py migrate
python apps/api/manage.py createsuperuser

# 4. Datos de prueba (opcional): catálogo, clientes, pedidos y comprobantes de muestra,
#    y conversaciones de ejemplo del asistente
python apps/api/manage.py seed
python apps/api/manage.py seed_conversations

# 5. Levantar todo
pnpm dev
```

| App | URL |
|---|---|
| Tienda | http://localhost:3000 |
| Panel | http://localhost:3001 |
| API | http://localhost:8000 (admin de Django en `/admin/`) |

Los comprobantes del seed son de mentira: no pasan por ARCA y usan el punto de venta 99, así que no
chocan con la numeración real. `seed --reset` recrea todo y se niega a correr si hay comprobantes
emitidos a ARCA.

## Configuración

Todas las variables están en [`apps/api/.env.example`](apps/api/.env.example) y
[`apps/admin/.env.example`](apps/admin/.env.example), con sus valores por defecto. Lo principal:

### Facturación (ARCA)

1. Generá el certificado con el asistente de arca-client (pide los datos por teclado):

   ```bash
   arca-setup
   ```

   Usá como carpeta base `apps/api/certs` y como alias `ecomm`: quedan en
   `apps/api/certs/<ambiente>/ecomm.crt` y `.key`, que es donde los busca la API.
2. En `apps/api/.env`: el ambiente (`ARCA_ENVIRONMENT`, `homologacion` por defecto), el punto de
   venta, la condición del emisor (`responsable_inscripto` emite A y B; `monotributo`, C) y los datos
   del emisor que se imprimen en el PDF.

En homologación los comprobantes no tienen validez fiscal, pero cada emisión consume numeración.

### Asistente

Necesita `ANTHROPIC_API_KEY` en `apps/api/.env`. Sin ella, el panel funciona igual pero el asistente
responde con un error.

### Producción

`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, la conexión a Postgres y los orígenes permitidos
(`FRONTEND_ORIGINS`) están fijos en `apps/api/config/settings.py` con valores de desarrollo: hay que
cambiarlos antes de desplegar.

## Comandos frecuentes

Desde la raíz del repo:

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta las tres apps (`pnpm --filter admin dev` para una sola) |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Lint, tipos y formato de los frontends |
| `python apps/api/manage.py test <app>` | Tests de una app de la API (sin `<app>`, correrlo desde `apps/api`) |
| `python apps/api/manage.py makemigrations` / `migrate` | Migraciones |
| `python apps/api/manage.py seed [--reset]` | Datos de prueba desde `apps/api/seed/dev.json` |
| `python apps/api/manage.py seed_conversations [--reset]` | Conversaciones de ejemplo del asistente |

### Cambios en la API

Después de cambiar modelos, serializers o vistas que afecten a la API, regenerá el cliente y corregí
lo que se rompa en los frontends:

```bash
pnpm generate:schema   # escribe packages/api-client/schema.yml
pnpm generate:api      # regenera packages/api-client/src (se commitea)
pnpm typecheck
```

Nunca edites a mano los archivos `*.gen.ts` del cliente.

### Tests contra ARCA

Los tests usan un WSFE falso. `ARCAHomologacionTests` emite comprobantes reales en homologación y
solo corre de forma explícita:

```bash
cd apps/api
ARCA_INTEGRATION_TESTS=1 python manage.py test billing.tests.ARCAHomologacionTests
```

Se niega a correr si `ARCA_ENVIRONMENT` no es `homologacion`. No pongas `ARCA_INTEGRATION_TESTS` en
el `.env`.

## Más detalles

Las convenciones de cada parte del código están en [`CLAUDE.md`](CLAUDE.md),
[`apps/api/CLAUDE.md`](apps/api/CLAUDE.md) y [`apps/admin/CLAUDE.md`](apps/admin/CLAUDE.md).
