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
  - `STORE_URL` (la URL pública de la tienda, adonde apuntan los links de los mails de cuenta),
    `EMAIL_URL` (el SMTP, ej. `smtp+tls://usuario:clave@host:587`) y `DEFAULT_FROM_EMAIL`. Sin
    mails, los clientes no pueden confirmar su cuenta ni recuperar la contraseña.
  - `MEDIA_URL`: la URL pública de las imágenes (ver **Media**).
  - Opcionales: `STORE_NAME` (firma de los mails) y `GOOGLE_CLIENT_ID` (login con Google). El
    client ID es de tipo "Aplicación web", con el dominio de la tienda como origen autorizado de
    JavaScript; no hace falta el secret. `CUSTOMER_SESSION_AGE` cambia la sesión de los clientes
    (30 días por defecto).
  - Detrás de un proxy que termina TLS: `SECURE_PROXY_SSL_HEADER=true`.
- [ ] **Secretos**: van en el gestor de secretos del proveedor. Nunca en el repo ni en un `.env`
  commiteado. `apps/api/.env.example` lista todas las variables.
- [ ] **Chequeo**: `DJANGO_SETTINGS_MODULE=config.settings.prod python manage.py check --deploy`
  sin warnings, en el pipeline de deploy. El único silenciado es el preload de HSTS, que se activa
  a mano si se decide.
- [ ] **Admin y tienda**: se buildean con `API_URL`, la URL con la que el servidor de Next llega
  a Django. Los rewrites se calculan en el build: si cambia, hay que volver a buildear. La tienda
  además lee el catálogo y la sesión desde su servidor con esa URL, y el build necesita la API
  levantada (prerenderiza el catálogo).
  - Django recibe esos requests con el host de `API_URL`, que tiene que estar en `ALLOWED_HOSTS`.
  - El request tiene que llegar como HTTPS: o `API_URL` es la URL HTTPS de la API, o es una URL
    interna detrás de un proxy que manda `X-Forwarded-Proto` (`SECURE_PROXY_SSL_HEADER=true`). Si
    no, `SECURE_SSL_REDIRECT` lo redirige.
  - El navegador nunca habla con la API, así que no hace falta CORS: `CORS_ALLOWED_ORIGINS`
    queda vacío ([`docs/architecture/auth.md`](architecture/auth.md)).
- [ ] **Media**: las imágenes se sirven desde una URL pública, la de la API o un CDN: el
  `MEDIA_URL` de Django, absoluto, que la API exige en producción. No pasan por el `/api` de los
  frontends.
  - La tienda y el admin se buildean con el mismo `MEDIA_URL`: `next/image` solo optimiza
    imágenes de ahí (`images.remotePatterns`). El servidor de cada uno las baja y las achica, y
    guarda el resultado en su `.next/cache/images`, que conviene que persista entre deploys.
  - Si las sirve un CDN que ya las redimensiona, conviene un `loader` propio de `next/image`, así
    no hace ese trabajo el servidor de Next.
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
- **Clientes de la tienda**: se registran solos, con email (confirmado) o Google. No son staff ni
  tienen 2FA. Un login de Google nunca entra a una cuenta staff aunque coincida el email.
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

- **Pago de los pedidos de la tienda**: el checkout crea la orden `pending` y el mail dice que el
  pago se arregla por email. Falta integrar un medio de pago (ej. Mercado Pago) que la pase a
  `paid`. También falta el botón de arrepentimiento de verdad (hoy un placeholder en el footer).
- **Asistente**: manda datos de clientes (nombre, documento, montos) a la API de Anthropic
  (`apps/api/assistant/service.py`) y guarda las respuestas de las herramientas en
  `Message.content`. Antes de habilitarlo en producción, decidir si se usa y declararlo en la
  política de privacidad (transferencia internacional, Ley 25.326). Sin `ANTHROPIC_API_KEY` el
  asistente queda apagado.
- **Rate limiting del login**: allauth ya limita los intentos fallidos de login y de códigos
  (`ACCOUNT_RATE_LIMITS`, con su cache). El cache `default` es locmem, así que el límite es por
  proceso: con varios workers conviene que allauth use Redis.
