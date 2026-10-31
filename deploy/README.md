# Deploy: API y admin en un VPS, detrás de Cloudflare

Producción en modo solo admin (`STORE_ENABLED=false`): las órdenes se cargan y se facturan desde
el admin. Los checklists de configuración, cuentas y base están en
[`docs/production.md`](../docs/production.md). Acá está cómo se arma la infraestructura.

```
navegador ──HTTPS──> Cloudflare (Access) ──Tunnel──> cloudflared ──> admin (Next, :3000)
                                                                        │ /api/* (rewrite)
                                                                        ▼
                                             Postgres, Redis <── api (gunicorn, :8000) ──> ARCA
                                                                        │
                                                        R2 (media.<dominio>, imágenes)
```

- El VPS no abre puertos web: cloudflared sale hacia Cloudflare y publica solo el admin.
- La API no tiene hostname público. El admin le habla por la red de Docker
  (`API_URL=http://api:8000`, fijado en el build).
- Las imágenes van a un bucket R2 público. El admin las muestra con next/image.
- Archivos de este directorio:

  | Archivo | Para qué |
  | --- | --- |
  | `compose.yml` | Los servicios. |
  | `deploy.sh` | Cada deploy. |
  | `postgres/init.sh` | Crea el rol de la app, sin superusuario. |
  | `backup/` | Dump cifrado a R2 y restauración. |

## 1. Cloudflare

1. **Dominio:** agregar la zona.
   - Un `.com.ar` se registra en NIC.ar y se le ponen los nameservers que da Cloudflare.
   - Un `.com` se puede registrar directo en Cloudflare Registrar.
2. **SSL/TLS:**
   - Modo **Full**.
   - *Always Use HTTPS* activado.
   - *Minimum TLS Version* 1.2.
   - HSTS lo manda Django; no hace falta activarlo acá.
3. **R2:**
   - **`ecomm-media`:**
     - En *Settings > Custom Domains*, agregar `media.<dominio>`. Es la `MEDIA_URL`.
     - Crear un *API token* de R2 con *Object Read & Write* solo sobre este bucket. Da
       `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY`.
     - El *Account ID* (`R2_ACCOUNT_ID`) está en la página de R2.
   - **`ecomm-backups`:**
     - Privado, sin dominio.
     - Una *Object lifecycle rule* que borre los objetos de más de 90 días.
     - Un token propio, también *Object Read & Write* solo sobre este bucket.
4. **Tunnel** (*Zero Trust > Networks > Tunnels*):
   - Crear uno de tipo *Cloudflared* y copiar su token a `cloudflared.env`.
   - En *Public hostnames*: `admin.<dominio>` → servicio `HTTP` → `admin:3000`.
5. **Access** (*Zero Trust > Access > Applications*, gratis hasta 50 usuarios):
   - Una *Self-hosted application* sobre `admin.<dominio>`.
   - Política *Allow*: los emails del staff, con *One-time PIN* (o Google).
   - Otra aplicación sobre `admin.<dominio>/api/health/`, con una política *Bypass* para
     *Everyone*, así llega el monitor.
   - Es una capa delante del login con 2FA, no lo reemplaza. Las passkeys siguen atadas a
     `admin.<dominio>`.
6. **Mail:** cargar en el DNS los registros SPF, DKIM y DMARC que dé el proveedor de SMTP (Resend,
   Postmark, Brevo, SES). Cloudflare Email Routing solo recibe.
7. **Monitor:** un chequeo HTTP cada 5 minutos contra `https://admin.<dominio>/api/health/` en
   UptimeRobot, Better Stack o similar, con alerta por mail. Responde 200 si la API llega a
   Postgres y a Redis, y 503 si no.

## 2. VPS

Ubuntu 24.04 LTS, 2 vCPU y 4 GB de RAM.

1. **Acceso:**
   - un usuario propio con `sudo` y clave SSH;
   - en `/etc/ssh/sshd_config`: `PasswordAuthentication no` y `PermitRootLogin no`;
   - `ufw default deny incoming`, `ufw allow OpenSSH` y `ufw enable`. Nada más: la web entra por
     el túnel.
   - `apt install unattended-upgrades`.
2. **Docker:** Docker Engine con el plugin de compose (repo oficial de Docker). Agregar el
   usuario al grupo `docker`.
3. **Repo:** `git clone https://github.com/fzurs/ecomm.git /srv/ecomm`, o la URL que corresponda.
4. **Secretos:** van en `/etc/ecomm/`, carpeta `750` del usuario. Cada archivo con `chmod 600`.
   Las claves nuevas se generan con
   `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`.

   `compose.env` tiene las variables del build del admin:
   ```
   MEDIA_URL=https://media.<dominio>/
   ```

   `db.env`:
   ```
   POSTGRES_PASSWORD=<clave nueva>      # superusuario: solo para administrar
   ECOMM_DB_PASSWORD=<otra clave nueva> # el rol de la app, sin SUPERUSER (postgres/init.sh)
   ```

   `api.env` (ver también [`apps/api/.env.example`](../apps/api/.env.example)):
   ```
   SECRET_KEY=<clave nueva>
   STORE_ENABLED=false
   ALLOWED_HOSTS=api
   FRONTEND_ORIGINS=https://admin.<dominio>
   SECURE_PROXY_SSL_HEADER=true
   DATABASE_URL=postgres://ecomm:<ECOMM_DB_PASSWORD>@db:5432/ecomm
   REDIS_URL=redis://redis:6379
   MEDIA_URL=https://media.<dominio>/
   R2_ACCOUNT_ID=...
   R2_BUCKET=ecomm-media
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   ARCA_ENVIRONMENT=produccion
   ARCA_CERTIFICATE_PATH=/run/arca/produccion/ecomm.crt
   ARCA_PRIVATE_KEY_PATH=/run/arca/produccion/ecomm.key
   ARCA_POINT_OF_SALE=<punto de venta para web services>
   ARCA_ISSUER_VAT_CONDITION=responsable_inscripto   # o monotributo
   ARCA_ISSUER_LEGAL_NAME=...
   ARCA_ISSUER_ADDRESS=...
   ARCA_ISSUER_ACTIVITY_START=AAAA-MM-DD
   ARCA_ISSUER_GROSS_INCOME=...
   EMAIL_URL=smtp+tls://<usuario>:<clave>@<host>:587
   DEFAULT_FROM_EMAIL=<Nombre> <no-reply@<dominio>>
   STORE_NAME=<Nombre>
   ```
   Notas sobre `api.env`:
   - `ALLOWED_HOSTS=api`: el rewrite del admin llega a Django con el host de `API_URL`.
   - `SECURE_PROXY_SSL_HEADER=true`: el `X-Forwarded-Proto: https` de Cloudflare pasa por Next.

   `cloudflared.env`:
   ```
   TUNNEL_TOKEN=<token del túnel>
   ```

   `backup.env`:
   ```
   PGPASSWORD=<ECOMM_DB_PASSWORD>
   AGE_RECIPIENT=age1...                # clave pública (ver Backups)
   R2_BACKUP_BUCKET=ecomm-backups
   RCLONE_CONFIG_R2_TYPE=s3
   RCLONE_CONFIG_R2_PROVIDER=Cloudflare
   RCLONE_CONFIG_R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
   RCLONE_CONFIG_R2_ACCESS_KEY_ID=<token de ecomm-backups>
   RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=...
   RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true
   ```
5. **Carpeta del certificado de ARCA:** la escribe el contenedor de la API (uid 10001):
   `sudo install -d -o 10001 -g 10001 -m 700 /etc/ecomm/arca`.

## 3. Certificado de ARCA (producción)

Se genera en el servidor: la clave nunca pasa por otra máquina. El asistente es interactivo.

```bash
cd /srv/ecomm
docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env build api
docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env run --rm --no-deps \
  -v /etc/ecomm/arca:/run/arca -w /run/arca api arca-setup
```

1. Responder ambiente `produccion`, la CUIT, el alias `ecomm` y la carpeta base `/run/arca`.
   - La clave va **sin contraseña**: la API no la soporta.
   - Los archivos quedan en `/etc/ecomm/arca/produccion/ecomm.{key,crt}`.
2. Pegar el CSR en *Administración de Certificados Digitales* (con clave fiscal) y pegar el
   certificado emitido.
3. En *Administrador de Relaciones de Clave Fiscal*, asociar el certificado al servicio `wsfe`.
4. Dar de alta un punto de venta para **web services** (*Administración de puntos de venta y
   domicilios*, sistema "RECE para aplicativo y web services") y ponerlo en `ARCA_POINT_OF_SALE`.

Si la clave se filtra: revocar el certificado en ARCA y generar otro.

## 4. Primer deploy

```bash
/srv/ecomm/deploy/deploy.sh
```

Hace `git pull` y el build de las imágenes, levanta Postgres y Redis, corre `migrate` y
`check --deploy` (falla con cualquier warning), y levanta todo esperando los healthchecks.

Después, una sola vez:

1. **Rol de solo lectura:** se crea con las tablas ya hechas, como el dueño de la base.
   ```bash
   docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env exec -T db \
     psql -U ecomm ecomm < docs/sql/readonly_role.sql
   ```
2. **Cuentas del staff:** una por persona. En su primer login, cada una configura el 2FA.
   ```bash
   docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env exec api \
     python manage.py create_operator <usuario> --role Administración
   ```
   Además, agregar su email a la política de Access.
3. **Verificación:**
   - `https://admin.<dominio>` pide Access y después el login. El login no tiene que entrar en
     loop: si redirige a sí mismo, Django no está viendo HTTPS (`SECURE_PROXY_SSL_HEADER`).
   - Registrar una passkey, subir la imagen de un producto y verla en el listado.
   - Despachar una orden de prueba a un email propio: el mail llega y pasa SPF y DKIM.
   - `/api/cart/` responde 404 (modo solo admin).
4. **Primera factura, con cuidado:** consume numeración real y un comprobante con CAE no se borra.
   - Hacer una orden real de monto chico, emitirla y buscarla en *Comprobantes en línea*.
   - Si era de prueba, se anula con una nota de crédito desde el admin.

## Deploys siguientes

`deploy/deploy.sh`. Las migraciones corren antes de reemplazar los contenedores.

`compose.env` (`MEDIA_URL`) entra en el build del admin: si cambia, el script lo rebuildea solo,
porque cambian los build args.

## Backups

1. **Par de claves de age** (en tu máquina, no en el servidor): `age-keygen -o ecomm-backups.key`.
   - La clave privada va al gestor de contraseñas.
   - La pública (`age1...`) va en `AGE_RECIPIENT`.
2. **Cron del servidor** (`crontab -e`), todos los días a las 4 (UTC):
   ```
   0 4 * * * docker compose -f /srv/ecomm/deploy/compose.yml --env-file /etc/ecomm/compose.env run --rm backup >> /var/log/ecomm-backup.log 2>&1
   ```
3. **Restauración, probada al menos una vez antes de cargar datos reales.**
   - Se hace en una base aparte. **Nunca se copia la base de producción a una máquina local**
     (`docs/production.md`).
   - Para listar los backups:
     ```bash
     docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env run --rm \
       --entrypoint restore.sh backup
     ```
   - Para bajar uno y restaurarlo en una base nueva:
     ```bash
     mkdir -m 700 /tmp/restore && cp ecomm-backups.key /tmp/restore/key.txt  # la privada, solo un rato
     docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env run --rm \
       -v /tmp/restore:/restore --entrypoint restore.sh backup <nombre>.dump.age
     docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env exec db \
       createdb -U postgres ecomm_restore
     docker compose -f deploy/compose.yml --env-file /etc/ecomm/compose.env exec -T db \
       pg_restore -U postgres -d ecomm_restore --no-owner < /tmp/restore/ecomm.dump
     # revisar, y después: dropdb ecomm_restore y rm -rf /tmp/restore
     ```

## Logs

Van a stdout y Docker los guarda en el servidor, rotados (`local`: 20 archivos de 50 MB por
servicio). Para leerlos: `docker compose ... logs api`.

Los loggers que importan son `audit` (logins, 2FA, operadores) y `billing` (autorizaciones de
ARCA).
