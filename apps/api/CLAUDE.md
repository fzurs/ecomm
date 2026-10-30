# apps/api (Django + DRF)

## Settings
- `config/settings/` tiene `base.py` (común), `dev.py` (default de `manage.py`: devcontainer y
  tests) y `prod.py` (default de `wsgi.py`/`asgi.py`; exige `SECRET_KEY`, `ALLOWED_HOSTS`,
  `ARCA_ENVIRONMENT` y rutas absolutas de certificado fuera del repo, y fuerza HTTPS). Un setting
  nuevo va en `base.py` salvo que dependa del entorno. `base.py` lee `/workspace/ecomm/db.env`
  (opcional) y `apps/api/.env` con django-environ.
- En dev, el certificado y la clave van en `certs/<ARCA_ENVIRONMENT>/ecomm.crt|.key`
  (`certificate_paths` de arca-client, donde los guarda `arca-setup` con carpeta base
  `apps/api/certs` y alias `ecomm`; `ARCA_CERTIFICATE_PATH` / `ARCA_PRIVATE_KEY_PATH` los pisan).
  `ARCA_CUIT` es opcional: `billing.arca.issuer_cuit()` la lee del certificado si falta.
- Facturación: `ARCA_POINT_OF_SALE` (1), `ARCA_ISSUER_VAT_CONDITION` (`responsable_inscripto`, que
  emite A/B, o `monotributo`, que emite C) y los datos del emisor para el PDF:
  `ARCA_ISSUER_LEGAL_NAME`, `ARCA_ISSUER_ADDRESS`, `ARCA_ISSUER_ACTIVITY_START` (AAAA-MM-DD) y
  `ARCA_ISSUER_GROSS_INCOME`. Sin estos últimos, `/invoices/{id}/pdf/` responde 400.
- Caches: `default` es locmem; `arca` es Redis (los tickets de acceso se comparten entre workers).

## Convenciones de la API
- Defaults de DRF: `SessionAuthentication` + `config.permissions.StaffModelPermissions`,
  `LimitOffsetPagination` (100), `DjangoFilterBackend`. El admin se autentica con cookie de
  sesión + header CSRF.
- Permisos: solo staff, con el permiso de modelo del método (`view_` para leer, `add_` para POST,
  también en las `@action`; emitir, reemitir, verificar y hacer notas es `billing.add_invoice`).
  La tienda lee sin sesión vía `PublicReadMixin`; sin sesión de staff, los productos son solo los
  de `Product.PUBLIC_STATUSES` (activos y sin stock), también en el detalle y en `choices`. Los
  roles son grupos definidos en `accounts/roles.py` (Administración, Facturación, Solo lectura) que `sync_roles` reescribe
  después de cada `migrate`; un permiso nuevo se asigna ahí, no a mano. Las cuentas del día a día
  se crean con `manage.py create_operator <user> [--role ...]` (staff, sin superusuario).
  `/auth/user/` expone `is_staff` y `permissions` (solo lectura) para que el admin oculte acciones.
- Cuentas: django-allauth headless (`HEADLESS_ONLY`, solo cliente `browser`), montado en
  `/_allauth/`: login, logout, 2FA (`allauth.mfa`: passkeys/WebAuthn, TOTP y códigos de
  recuperación) y reautenticación. Usa la sesión de Django, como el resto de la API, y exige CSRF también en el
  login.
  - El staff entra con username; los clientes de la tienda se registran y entran con email, y
    tienen que confirmarlo (`ACCOUNT_EMAIL_VERIFICATION = "mandatory"`). El staff no
    (`accounts.adapter.CustomerEmailVerificationStage`).
  - Sesión: la del staff dura `SESSION_COOKIE_AGE` (8 h) y se cierra con el navegador; la de los
    clientes, `CUSTOMER_SESSION_AGE` (30 días, `AccountAdapter.login`).
  - Contraseñas: 8 caracteres para clientes y 12 para staff
    (`accounts.validators.MinimumLengthValidator`; sin usuario, 12). El registro valida sin
    usuario: `AccountAdapter.clean_password` le pasa un cliente.
  - Los links de los mails (`HEADLESS_FRONTEND_URLS`) van a la tienda (`STORE_URL`), y los mails
    se firman con `STORE_NAME` (`AccountAdapter.send_mail`). En dev salen por consola; en los
    tests, `mail.outbox`.
  - Google (`allauth.socialaccount`) solo por ID token (`/auth/provider/token`), con
    `GOOGLE_CLIENT_ID`. El flujo por redirect responde 404 (`config/urls.py`): volvería al host de
    la API, fuera del `/api` de la tienda. Un login de Google nunca entra a una cuenta staff ni a
    una con el email sin verificar (`accounts.adapter.SocialAccountAdapter`). En tests se mockea
    `allauth.socialaccount.providers.google.views._verify_and_decode` (`GoogleTests`).
  - `/auth/user/` (`accounts.views.UserDetailsView`) es nuestro: el usuario, `is_staff`,
    `permissions`, `mfa_enabled` / `mfa_verified` / `mfa_required` y `has_usable_password`
    (false en una cuenta creada con Google). PATCH cambia solo `first_name` / `last_name`.
  - Con `REQUIRE_2FA` (True en base/prod, False en dev salvo `REQUIRE_2FA=true`) los permisos
    (`config.permissions.is_verified_staff`) rechazan sesiones staff que no pasaron el segundo
    factor (`accounts.mfa.passed_mfa`, de los registros de autenticación de allauth). Activar el
    TOTP marca la sesión como verificada (`authenticator_added`, que allauth manda on commit:
    los tests que lo necesitan son `APITransactionTestCase`).
  - allauth pide reautenticación (la contraseña otra vez) para activar o desactivar el 2FA,
    aunque el login sea reciente (`MFA_REAUTHENTICATION_REQUIRED`).
  - Una passkey queda atada al dominio del frontend, no al host de la API al que reenvía Next:
    `accounts.adapter.MFAAdapter` toma el RP ID de `X-Forwarded-Host`, solo si es un host de
    `FRONTEND_ORIGINS`. Agregar una passkey también marca la sesión como verificada.
  - Sus endpoints no salen de drf-spectacular: `manage.py allauth_schema` escribe su spec y el
    cliente se genera en `packages/api-client/src/allauth` (los dos con `pnpm generate:schema` y
    `generate:api`). En tests: `cache.clear()` antes (allauth guarda ahí los códigos usados y
    los rate limits).
- Auditoría: django-auditlog guarda cada cambio por ORM (no `update()` ni `bulk_create`) con el
  usuario del request (`AuditlogMiddleware`) en su `LogEntry`. Los modelos se registran en el
  `ready()` de cada app; uno nuevo con datos de negocio se registra ahí. Los logins, logouts y
  fallos (`accounts/audit.py`), el 2FA, `create_operator` y el purge del seed van al logger
  `audit` (también los registros de clientes, `signup:`); cada autorización de ARCA, al logger
  `billing`. El seed corre con `disable_auditlog()`.
- Tests: `config.testing.make_staff(role=...)` para loguear un usuario como los reales. El
  `TEST_RUNNER` (`config.testing.TestRunner`) calla los logs INFO de `billing` y `audit`.
- CSRF acepta escrituras solo desde `FRONTEND_ORIGINS` (`config/settings/base.py`); un frontend
  nuevo se agrega ahí. CORS está vacío (`CORS_ALLOWED_ORIGINS`): ningún navegador llama a la API
  desde otro origen (el admin pasa por su `/api`, la tienda hace fetch en su servidor). Si alguna
  vez hace falta, listar orígenes explícitos, nunca `CORS_ALLOW_ALL_ORIGINS`: con credenciales,
  cualquier sitio podría leer la API con una sesión.
- `/auth/user/` (`accounts.views.UserDetailsView`) repone la cookie `csrftoken` en cada GET
  (`ensure_csrf_cookie`); Django sola la pone solo al loguear. Los tests de DRF no chequean CSRF:
  `accounts.tests.CsrfTests` usa `APIClient(enforce_csrf_checks=True)`.
- Los endpoints son `ModelViewSet` con un FilterSet en el `filters.py` de la app, más
  `ordering_fields` / `search_fields`. Referencia: `orders/views.py`. En productos,
  `store.filters.ProductOrdering` valida contra `ordering_fields` y ordena `active_price` por la
  anotación `final_price` (`ProductViewSet.get_queryset`).
- Las `@action` propias llevan `@extend_schema(operation_id=...)` para que los nombres del cliente
  generado no cambien (ej. `customers_list_choices`). Las acciones `choices` sin paginar alimentan
  los selects del admin.
- Los enums que usa el frontend se registran en `SPECTACULAR_SETTINGS["ENUM_NAME_OVERRIDES"]`;
  si no, drf-spectacular genera nombres feos.
- Después de cualquier cambio en la API, regenerar el cliente (ver CLAUDE.md raíz / `/regen-api`).

## Facturación (billing)
- `Invoice` es cualquier comprobante (`VoucherType`, el CbteTipo de ARCA): facturas A/B/C y sus
  notas de crédito/débito, que apuntan a la factura con `associated_invoice`. Guarda una copia del
  receptor, sus líneas (`InvoiceLine`, precios con IVA incluido) y el IVA autorizado por alícuota
  (`InvoiceVat`). Los productos tienen `vat_rate` (`store.models.VatRate`, los Id de IVA de ARCA)
  y cada `OrderItem` lo copia al crearse, como `unit_price`.
- `billing/rules.py` — qué comprobante corresponde: emisor monotributo → C; emisor RI → A si el
  cliente está en `CONDICIONES_A` (RI, monotributo; exige CUIT) y B si no. `SUPPORTED_TYPES` es lo
  que arca-client emite: desde 0.4.0, facturas y notas de crédito/débito A, B y C. Un tipo nuevo
  va ahí y en el adapter. Las notas se hacen solo sobre facturas (`note_support`).
- `billing/amounts.py` — los importes salen de las líneas, igual que los calcula arca-client
  (neto por alícuota, IVA half even); el adapter y el PDF usan los mismos ítems (`to_items`), así
  el PDF cuadra con lo autorizado. Con IVA incluido, el total puede diferir en 1 centavo del cobrado
  cuando ningún neto da exacto (ej. $173.400 al 21%).
- `billing/arca.py` — `get_wsfe()` arma el `WSFE` de arca-client de forma lazy (`@cache`) con
  `DjangoTicketCache` sobre `caches["arca"]`.
- `billing/adapter.py` — traduce `Invoice` a llamadas de arca-client (`create_invoice_a/b/c`,
  `create_credit_note_a/b/c`, `create_debit_note_a/b/c`, `get_voucher`).
- `billing/services.py` — `build_*` arma el comprobante sin guardarlo (lo usa `/invoices/preview/`);
  `emit` bloquea `InvoiceSequenceLock` (`select_for_update`) por punto de venta + tipo, relee el
  estado y guarda el resultado:
  - autorizado → `authorized`; rechazo de ARCA, validación local o corte con `safe_to_retry` →
    `rejected` (se puede reemitir con `/emit/`; una factura se rearma desde la orden y el cliente);
  - corte sin `safe_to_retry` → `unverified` con el número intentado: **nunca reemitirlo**, solo
    `verify` (`get_voucher`) lo pasa a `authorized` o `rejected`.
- Una orden se factura en cualquier estado cobrado (`Order.PAID_STATUSES`: paid, shipped,
  delivered). Con factura vigente (`LIVE_STATUSES`) no vuelve a `pending`, ni aunque esté
  acreditada (la orden tiene una sola factura: no podría facturarse de nuevo), y no pasa a
  `cancelled` hasta que notas de crédito acrediten todas sus líneas. La regla está en
  `rules.order_status_locks`: `OrderSerializer` la valida y la expone en `status_locks`.
  Con factura vigente la orden tampoco se borra (409, `rules.order_delete_lock`, expuesto en
  `delete_lock`); sus comprobantes rechazados se borran con ella (`services.delete_order`).
- Nunca reintentar una emisión a ciegas: puede duplicar el comprobante. Los importes son
  `Decimal`, nunca `float`. Solo se borra un comprobante `rejected`.
- Un comprobante con CAE es inmutable en la base (triggers de la migración `0011`): no se borra,
  no cambia lo que autorizó ARCA (números, montos, receptor, estado, `arca_response`) y sus
  líneas e IVA quedan congelados; solo `error_message`, `arca_errors` y `observations` siguen
  editables. Por eso `authorize` guarda el IVA antes que el CAE. El Django admin lo muestra de
  solo lectura. `billing.purge.bypass_invoice_guard()` (`SET LOCAL`) lo saltea en la transacción
  actual: solo para el seed y fixtures de tests; dentro de un `TestCase` dura hasta el final del
  test.

## Datos de desarrollo
- `python manage.py seed [path] [--reset]` carga `seed/dev.json` (brands, categorías, productos,
  customers y órdenes, referenciados por nombre) pasando por el ORM. No usar `loaddata`: se saltea
  los `save()` que arman slug, imagen, número de orden y `unit_price`.
- Es idempotente por nombre; las órdenes se crean solo si la tabla está vacía. Datos ficticios.
- Las `invoices` de `dev.json` se emiten junto con las órdenes con `billing.sample.SampleWSFE`
  (sin ARCA, CAE inventado) en el punto de venta `SAMPLE_POINT_OF_SALE` (99), para que su
  numeración no choque con la real: facturas A y B, notas de crédito y débito A y B (parciales y totales), y los estados rechazado y sin verificar.
  Reemitir o verificar una desde el admin sí llama a ARCA.
- `--reset` borra todo antes, incluidos esos comprobantes de muestra, y se niega si hay alguno de
  otro punto de venta (emitido a ARCA). `--reset --purge-homologation` borra también esos, solo
  con `ARCA_ENVIRONMENT=homologacion` (`billing.purge.purge_invoices`).
- `python manage.py seed_conversations [path] [--user USER] [--reset]` carga `seed/conversations.json`
  para un usuario staff (`--user` hace falta si hay más de uno). El título es la clave: agrega las
  que le falten, `--reset` recrea las sembradas y las conversaciones propias del usuario no se tocan.
  Las respuestas citan los datos de `dev.json` (también los comprobantes de muestra): si cambia,
  revisarlas. Los pedidos van como `{order:23}` (el 23.º de `dev.json`) y se completan con el número
  real al cargar, porque los ids siguen después de un `seed --reset`. Los mensajes se guardan con el
  `<context>` de `user_content`, así una conversación sembrada se puede seguir con Claude.

## Tests
- `python manage.py test <app>`; los tests están en el `tests.py` de cada app. Sin `<app>` hay que
  correrlo desde `apps/api`: desde la raíz no descubre ningún test ("Ran 0 tests"). `--keepdb` reutiliza la base de tests entre corridas; si cambian las
  migraciones y algo falla raro, correr una vez sin `--keepdb`.
- `SimpleTestCase` cuando no hace falta base de datos, `TestCase` si no.
- Usar `@override_settings(MEDIA_ROOT=tempfile.mkdtemp())` cuando un test escribe archivos (PDFs, imágenes).
- Usar un WSFE falso en vez de llamar a ARCA (ver `billing/tests.py`). `ARCAHomologacionTests` solo
  corre con `ARCA_INTEGRATION_TESTS=1` y emite comprobantes reales en homologación: preguntar antes.
