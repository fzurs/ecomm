# apps/api (Django + DRF)

## Settings
- `config/settings.py` lee `/workspace/ecomm/db.env` (opcional) y `apps/api/.env` con
  django-environ. `ARCA_CUIT` es obligatorio; las rutas del certificado/clave y `ARCA_ENVIRONMENT`
  tienen valores por defecto.
- Caches: `default` es locmem; `arca` es Redis (los tickets de acceso se comparten entre workers).

## Convenciones de la API
- Defaults de DRF: `SessionAuthentication` + `IsAuthenticated`, `LimitOffsetPagination` (100),
  `DjangoFilterBackend`. El admin se autentica con cookie de sesión + header CSRF.
- Los endpoints son `ModelViewSet` con un FilterSet en el `filters.py` de la app, más
  `ordering_fields` / `search_fields`. Referencia: `orders/views.py`.
- Las `@action` propias llevan `@extend_schema(operation_id=...)` para que los nombres del cliente
  generado no cambien (ej. `customers_list_choices`). Las acciones `choices` sin paginar alimentan
  los selects del admin.
- Los enums que usa el frontend se registran en `SPECTACULAR_SETTINGS["ENUM_NAME_OVERRIDES"]`;
  si no, drf-spectacular genera nombres feos.
- Después de cualquier cambio en la API, regenerar el cliente (ver CLAUDE.md raíz / `/regen-api`).

## Facturación (billing)
- `billing/arca.py` — `get_wsfe()` arma el `WSFE` de arca-client de forma lazy (`@cache`) con
  `DjangoTicketCache` sobre `caches["arca"]`.
- `billing/adapter.py` — traduce `Invoice` a llamadas de arca-client.
- `billing/services.py` — `emit_invoice` bloquea `InvoiceSequenceLock` (`select_for_update`)
  por punto de venta + tipo de comprobante, y después guarda el CAE o el error.
- Nunca reintentar una emisión a ciegas: puede duplicar el comprobante. Los importes son
  `Decimal`, nunca `float`.

## Tests
- `python manage.py test <app>`; los tests están en el `tests.py` de cada app. Sin `<app>` hay que
  correrlo desde `apps/api`: desde la raíz no descubre ningún test ("Ran 0 tests"). `--keepdb` reutiliza la base de tests entre corridas; si cambian las
  migraciones y algo falla raro, correr una vez sin `--keepdb`.
- `SimpleTestCase` cuando no hace falta base de datos, `TestCase` si no.
- Usar `@override_settings(MEDIA_ROOT=tempfile.mkdtemp())` cuando un test escribe archivos (PDFs, imágenes).
- Usar un WSFE falso en vez de llamar a ARCA (ver `billing/tests.py`). `ARCAHomologacionTests` solo
  corre con `ARCA_INTEGRATION_TESTS=1` y emite comprobantes reales en homologación: preguntar antes.
