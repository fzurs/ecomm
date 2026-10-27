# apps/api (Django + DRF)

## Settings
- `config/settings.py` lee `/workspace/ecomm/db.env` (opcional) y `apps/api/.env` con
  django-environ. `ARCA_CUIT` es obligatorio; las rutas del certificado/clave y `ARCA_ENVIRONMENT`
  tienen valores por defecto.
- Facturación: `ARCA_POINT_OF_SALE` (1), `ARCA_ISSUER_VAT_CONDITION` (`responsable_inscripto`, que
  emite A/B, o `monotributo`, que emite C) y los datos del emisor para el PDF:
  `ARCA_ISSUER_LEGAL_NAME`, `ARCA_ISSUER_ADDRESS`, `ARCA_ISSUER_ACTIVITY_START` (AAAA-MM-DD) y
  `ARCA_ISSUER_GROSS_INCOME`. Sin estos últimos, `/invoices/{id}/pdf/` responde 400.
- Caches: `default` es locmem; `arca` es Redis (los tickets de acceso se comparten entre workers).

## Convenciones de la API
- Defaults de DRF: `SessionAuthentication` + `IsAuthenticated`, `LimitOffsetPagination` (100),
  `DjangoFilterBackend`. El admin se autentica con cookie de sesión + header CSRF.
- CORS y CSRF aceptan solo `FRONTEND_ORIGINS` (`config/settings.py`). Con credenciales habilitadas,
  nunca volver a `CORS_ALLOW_ALL_ORIGINS`: cualquier sitio podría leer la API con la sesión del
  admin. Un frontend nuevo se agrega a esa lista.
- dj-rest-auth corre solo con sesión (`REST_AUTH = {"TOKEN_MODEL": None}`): el login responde 204
  y no crea tokens. `config/schema.py` documenta ese 204 para drf-spectacular; sin esa extensión
  `generate:schema` falla, porque el `TokenSerializer` no tiene modelo.
- Los endpoints son `ModelViewSet` con un FilterSet en el `filters.py` de la app, más
  `ordering_fields` / `search_fields`. Referencia: `orders/views.py`.
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
  que arca-client 0.2.0 emite: **no hay notas B ni C** (se rechazan con 400); cuando arca-client
  las sume, agregarlas ahí y en el adapter.
- `billing/amounts.py` — los importes salen de las líneas, igual que los calcula arca-client
  (neto por alícuota, IVA half even); el adapter y el PDF usan los mismos ítems (`to_items`), así
  el PDF cuadra con lo autorizado. Con IVA incluido, el total puede diferir en 1 centavo del cobrado
  cuando ningún neto da exacto (ej. $173.400 al 21%).
- `billing/arca.py` — `get_wsfe()` arma el `WSFE` de arca-client de forma lazy (`@cache`) con
  `DjangoTicketCache` sobre `caches["arca"]`.
- `billing/adapter.py` — traduce `Invoice` a llamadas de arca-client (`create_invoice_a/b/c`,
  `create_credit_note_a`, `create_debit_note_a`, `get_voucher`).
- `billing/services.py` — `build_*` arma el comprobante sin guardarlo (lo usa `/invoices/preview/`);
  `emit` bloquea `InvoiceSequenceLock` (`select_for_update`) por punto de venta + tipo, relee el
  estado y guarda el resultado:
  - autorizado → `authorized`; rechazo de ARCA, validación local o corte con `safe_to_retry` →
    `rejected` (se puede reemitir con `/emit/`; una factura se rearma desde la orden y el cliente);
  - corte sin `safe_to_retry` → `unverified` con el número intentado: **nunca reemitirlo**, solo
    `verify` (`get_voucher`) lo pasa a `authorized` o `rejected`.
- Nunca reintentar una emisión a ciegas: puede duplicar el comprobante. Los importes son
  `Decimal`, nunca `float`. Solo se borra un comprobante `rejected`.

## Datos de desarrollo
- `python manage.py seed [path] [--reset]` carga `seed/dev.json` (brands, categorías, productos,
  customers y órdenes, referenciados por nombre) pasando por el ORM. No usar `loaddata`: se saltea
  los `save()` que arman slug, imagen, número de orden y `unit_price`.
- Es idempotente por nombre; las órdenes se crean solo si la tabla está vacía. Datos ficticios.
- Las `invoices` de `dev.json` se emiten junto con las órdenes con `billing.sample.SampleWSFE`
  (sin ARCA, CAE inventado) en el punto de venta `SAMPLE_POINT_OF_SALE` (99), para que su
  numeración no choque con la real: facturas A y B, notas, y los estados rechazado y sin verificar.
  Reemitir o verificar una desde el admin sí llama a ARCA.
- `--reset` borra todo antes, incluidos esos comprobantes de muestra, y se niega si hay alguno de
  otro punto de venta (emitido a ARCA).
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
