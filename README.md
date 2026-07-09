# Ecommerce Demo

Dockerized monorepo for development, built with Django and Next.js.

## Monorepo Structure

```
|-  .devcontainer/  # Docker Dev Config
|
|-  apps/
|   |-  api/    # Django
|   |-  admin/  # Admin Dashboard
|   |-  web/    # Ecommerce Web
|
|-  packages/
|   |-  api-client/ # openapi-ts@hey-api 
|   |-  ui/         # shadcn/ui
|   |-  other packages...
```

## Monorepo Setup (WSL + DevContainers)

### Requirements

Before getting started, make sure you have the following installed:

- WSL2 (Linux on Windows)
- Docker Desktop (with WSL integration enabled)
- VSCode + Dev Containers extension

### WSL Setup (Critical)

#### DO NOT USE THE WINDOWS FILE SYSTEM!!!

Do **not** develop under:

```
/mnt/c/Users/...
```

This causes:

- Slow TypeScript
- Broken hot reload
- High CPU usage

#### Use the Linux File System

Always work under:

```
/home/<username>/<repository-name>
```

#### Clone the Repo

```bash
git clone <repo-url>
```

### Open VSCode from Linux

```bash
code ./repo-name
```

### Dev Containers

Once the project is open:

1. Press `Ctrl + Shift + P`
2. Run: **Reopen in Container**

### First Run

The container only handles Python requirements on startup. After that:

1. Run migrations
2. Install pnpm packages — run `pnpm install` from the root
3. Start all apps with `pnpm run dev`