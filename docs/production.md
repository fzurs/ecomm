# Producción: acceso y operación

Checklist para poner la API en producción y operarla sin dar más acceso del necesario. No
depende del hosting: lo que pide es un proceso que corra `gunicorn`, variables de entorno
secretas, un Postgres y un Redis.

## Antes del primer deploy

- [ ] **Settings**: el proceso corre `gunicorn config.wsgi` con `config.settings.prod`, que es el
  default de `wsgi.py`. Prod no arranca si falta alguna de estas variables:
  - `SECRET_KEY`: nueva, generada con
    `python -c "import secrets; print(secrets.token_urlsafe(50))"`. Nunca reusar la de dev.
  - `ALLOWED_HOSTS`: el dominio de la API.
  - `DATABASE_URL`, `REDIS_URL` y `FRONTEND_ORIGINS` (los dominios del admin y la tienda, que
    Django acepta como orígenes de CSRF).
  - `ARCA_ENVIRONMENT=produccion`, `ARCA_CERTIFICATE_PATH` y `ARCA_PRIVATE_KEY_PATH`.
  - Detrás de un proxy que termina TLS: `SECURE_PROXY_SSL_HEADER=true`.
- [ ] **Secretos**: van en el gestor de secretos del proveedor. Nunca en el repo ni en un `.env`
  commiteado. `apps/api/.env.example` lista todas las variables.
- [ ] **Chequeo**: `DJANGO_SETTINGS_MODULE=config.settings.prod python manage.py check --deploy`
  sin warnings, en el pipeline de deploy. El único silenciado es el preload de HSTS, que se activa
  a mano si se decide.
- [ ] **Admin**: se buildea con `API_URL`, la URL con la que el servidor de Next llega a Django.
  Los rewrites se calculan en el build: si cambia, hay que volver a buildear.
  - Django recibe esos requests con el host de `API_URL`, que tiene que estar en `ALLOWED_HOSTS`.
  - El request tiene que llegar como HTTPS: o `API_URL` es la URL HTTPS de la API, o es una URL
    interna detrás de un proxy que manda `X-Forwarded-Proto` (`SECURE_PROXY_SSL_HEADER=true`). Si
    no, `SECURE_SSL_REDIRECT` lo redirige.
  - El navegador nunca habla con la API, así que no hace falta CORS: `CORS_ALLOWED_ORIGINS`
    queda vacío ([`docs/architecture/auth.md`](architecture/auth.md)).
- [ ] **Media**: las imágenes se sirven desde una URL pública (la de la API o un CDN). Sus URLs
  apuntan al host de Django, no pasan por el `/api` del admin.
- [ ] **Estáticos**: `python manage.py collectstatic --noinput` en el build. Los sirve whitenoise.
- [ ] **Migraciones**: `python manage.py migrate` en cada deploy. Crea los triggers que protegen
  los comprobantes y sincroniza los roles.

## Certificado de ARCA

- Se genera en el servidor (`arca-setup`) o se sube solo ahí, a una carpeta fuera del repo, por
  ejemplo `/etc/ecomm/arca/`. Permisos `600`, del usuario que corre la API.
- Prod exige rutas absolutas fuera de `apps/api`. La clave de producción no pasa por la máquina
  de desarrollo; en dev se sigue usando el certificado de homologación.
- Si la clave se filtra, revocar el certificado en ARCA y generar uno nuevo.

## Cuentas

- **Día a día**: una cuenta personal por persona, creada con
  `python manage.py create_operator <usuario> [--role Administración|Facturación|"Solo lectura"]`.
  Es staff y no es superusuario. En el primer login el admin pide configurar el 2FA, que en prod
  es obligatorio. Guardar los códigos de respaldo en un gestor de contraseñas.
- **Superusuario de emergencia**: solo para lo que un rol no cubre, por ejemplo recuperar una
  cuenta sin 2FA ni códigos. Se crea en el momento con `createsuperuser` desde el servidor, se
  anota quién y para qué, y se borra al terminar. No hay superusuarios permanentes.
- **Recuperar el 2FA** (teléfono y códigos perdidos): desde el servidor,
  `python manage.py shell -c "from allauth.mfa.models import Authenticator; Authenticator.objects.filter(user__username='<usuario>').delete()"`.
  Desde el shell no pasa por las señales de allauth, así que no queda en el logger `audit`:
  anotar quién y por qué. En el próximo login vuelve a pedir el setup.
- **Passkeys**: quedan atadas al dominio del admin. Si el dominio cambia, dejan de servir y cada
  persona entra con la app de autenticación o un código de recuperación, y registra passkeys
  nuevas.
- **Roles**: los define `apps/api/accounts/roles.py` y se reescriben en cada `migrate`. Un
  cambio de permisos se hace en el código, no en el Django admin.
- **Django admin**: apagado por defecto en prod. Si hace falta, se monta con
  `DJANGO_ADMIN_URL=<ruta-no-adivinable>/`, pide 2FA y muestra los comprobantes de solo lectura.

## Base de datos

- La app se conecta con un usuario dueño de sus tablas, sin `SUPERUSER`. Un superusuario de
  Postgres puede deshabilitar los triggers que protegen los comprobantes.
- Para diagnósticos hay un rol de solo lectura, creado con
  [`docs/sql/readonly_role.sql`](sql/readonly_role.sql). Se usa con un usuario personal que lo
  hereda; nunca con el de la app.
- Backups automáticos del proveedor, con restauración probada al menos una vez.
- **Nunca copiar la base de producción a una máquina local.** Tiene datos personales de clientes
  (Ley 25.326) y comprobantes reales. Para desarrollar está el seed. Si alguna vez hace falta
  reproducir un caso, se anonimiza en el servidor antes de sacar nada.
- Los comprobantes con CAE no se borran ni se editan: los triggers lo impiden, también por SQL.
  Un error se corrige con una nota de crédito o débito desde el admin.

## Auditoría

- Los cambios hechos desde la API quedan en `auditlog_logentry`, con el usuario y el diff.
  Los logins, los fallos de login, el 2FA y las autorizaciones de ARCA van a stdout por los
  loggers `audit` y `billing`. El proveedor tiene que guardar esos logs con retención.
- Revisar de vez en cuando los `login failed` repetidos y el uso de códigos de respaldo.

## Decisiones pendientes

- **Asistente**: manda datos de clientes (nombre, documento, montos) a la API de Anthropic
  (`apps/api/assistant/service.py`) y guarda las respuestas de las herramientas en
  `Message.content`. Antes de habilitarlo en producción, decidir si se usa y declararlo en la
  política de privacidad (transferencia internacional, Ley 25.326). Sin `ANTHROPIC_API_KEY` el
  asistente queda apagado.
- **Rate limiting del login**: allauth ya limita los intentos fallidos de login y de códigos
  (`ACCOUNT_RATE_LIMITS`, con su cache). El cache `default` es locmem, así que el límite es por
  proceso: con varios workers conviene que allauth use Redis.
