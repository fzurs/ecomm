# Ecommerce Demo

Monorepo dockerizado para desarrollo, hecho con Django y Next.js.

## Estructura del monorepo

```
|-  .devcontainer/  # Configuración de Docker para desarrollo
|
|-  apps/
|   |-  api/    # Django
|   |-  admin/  # Dashboard de administración
|   |-  web/    # Tienda web
|
|-  packages/
|   |-  api-client/ # openapi-ts@hey-api 
|   |-  ui/         # shadcn/ui
|   |-  otros paquetes...
```

## Puesta en marcha del monorepo (WSL + DevContainers)

### Requisitos

Antes de empezar, asegurate de tener instalado:

- WSL2 (Linux en Windows)
- Docker Desktop (con la integración con WSL habilitada)
- VSCode + la extensión Dev Containers

### Configuración de WSL (crítico)

#### ¡¡¡NO USAR EL SISTEMA DE ARCHIVOS DE WINDOWS!!!

**No** desarrolles dentro de:

```
/mnt/c/Users/...
```

Esto provoca:

- TypeScript lento
- Hot reload roto
- Uso alto de CPU

#### Usar el sistema de archivos de Linux

Trabajá siempre dentro de:

```
/home/<usuario>/<nombre-del-repositorio>
```

#### Clonar el repo

```bash
git clone <repo-url>
```

### Abrir VSCode desde Linux

```bash
code ./nombre-del-repo
```

### Dev Containers

Con el proyecto abierto:

1. Presioná `Ctrl + Shift + P`
2. Ejecutá: **Reopen in Container**

### Primer arranque

El contenedor solo instala los requirements de Python al iniciar. Después de eso:

1. Correr las migraciones
2. Instalar los paquetes de pnpm: correr `pnpm install` desde la raíz
3. Levantar todas las apps con `pnpm run dev`
