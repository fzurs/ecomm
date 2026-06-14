# Demo de Tienda Online

Monorepo dockerizado para el desarrollo, con Django y Nextjs.

## Estructura del monorepo

```
|-  .devcontainer/  # Docker Dev Opts
|
|-  apps/
|   |-  api/    # Django
|   |-  admin/  # Admin Dashboard
|   |-  web/    # Eccomerce Web
|
|-  packages/
|   |-  api-client/ # Zodios Gen
|   |-  ui/         # shadcn/ui
|   |-  other packages...
```

## Monorepo Setup (WSL + DevContainers)

### Requisitos

Antes de empezar, asegurate de tener instalado:

- WSL2 (Linux en Windows)
- Docker Desktop (con integración WSL activada)
- VSCode + extensión Dev Containers

### Setup de WSL (Crítico)

#### NO USAR EL FILE SYSTEM DE WINDOWS!!!

NO desarrolles en:

```/mnt/c/Users/...```

Esto Causa:
- Typescript Lento
- Hot reload roto
- Alto uso de CPU

#### Usar File System de Linux

Trabaja siempre en:

```/home/<usuario>/<nombre_del_repositorio>```

#### Clona el Repo

```git clone <url del repo>```

### Abrir VSCode desde Linux

```code ./nombre_del_repo```

### Dev Containers

Una vez abierto el proyecto:
1. ```Ctrl + Shift + p```
2. Ejecutar: **Reopen in Container**

### Primer Arranque
El container solo atiende a los requirimientos de Python

Lo que prosigue es:
1. Correr migraciones
2. Instalar paquetes de pnpm `pnpm install` desde el root
3. Ejecutar todas la apps con `pnpm run dev`

