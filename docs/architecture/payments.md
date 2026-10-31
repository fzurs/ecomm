# Pagos: Mercado Pago y facturación automática

Las órdenes de la tienda se pagan con **Mercado Pago Checkout Pro**: el cliente paga en la página
de Mercado Pago y vuelve a la tienda. Cuando el pago se acredita, la orden pasa a `paid` y se
factura sola en ARCA.

## El flujo

1. **Checkout** (`/checkout/`): crea la orden `pending` (fase 4, [`auth.md`](auth.md)) y una
   *preferencia* de Mercado Pago (`payments.services.start_payment`). La preferencia lleva:
   - los ítems y el email del cliente;
   - `external_reference` = el número de orden;
   - las URLs de vuelta a `/orders/<número>`;
   - la URL de avisos;
   - un vencimiento de `UNPAID_ORDER_HOURS`.

   Devuelve `payment_url`, y la Server Action de la tienda redirige ahí. Si Mercado Pago no
   responde o no está configurado, la orden queda creada igual y su página ofrece pagarla
   (`/my/orders/<n>/pay/`).
2. **Pago:** en Mercado Pago, con tarjeta, saldo o efectivo. Cada intento es un `Payment`: el
   link crea uno `created` y los avisos lo completan. Una tarjeta rechazada y después una aprobada
   son dos.
3. **Vuelta:** Mercado Pago devuelve al cliente a `/orders/<número>?status=...`. Ese `status` es
   solo para la interfaz: si la orden todavía no está paga, la página muestra "esperando la
   confirmación" y se refresca unos segundos.
4. **Aviso (webhook)** a `/payments/webhooks/mercadopago/`. **Es lo único que cambia el estado.**
   - Llega por el `/api` de la tienda (`MERCADOPAGO_NOTIFICATION_URL`), así que la API no
     necesita un dominio público propio.
   - Si hay `MERCADOPAGO_WEBHOOK_SECRET`, la firma `x-signature` se valida
     (`gateway.valid_signature`).
   - No se confía en el cuerpo del aviso: el pago se lee de Mercado Pago con nuestro token
     (`gateway.get_payment`), y la orden se busca por `external_reference`.
   - Es idempotente, porque Mercado Pago reintenta los avisos: la orden se bloquea
     (`select_for_update`) y `provider_payment_id` es único.
5. **Aprobado**, por el total de la orden y en ARS: la orden pasa a `paid`. Después del commit,
   `after_payment`:
   - **factura** la orden (`invoice_order`, que reusa `billing.services.create_invoice`);
   - **le manda un mail al cliente** con el PDF de la factura, si quedó autorizada.

   Un monto o una moneda distintos no pagan la orden: queda un `logger.critical`.

## Facturación automática (`AUTO_INVOICE`)
- **`arca`:** emite en ARCA. Es el único valor permitido en producción.
- **`sample`:** comprobantes inventados con `SampleWSFE`, en el punto de venta 99, como el seed.
  Nunca llama a ARCA. Es el default en dev, porque homologación consume numeración.
- **`off`:** no factura; se hace a mano desde el admin.

Un error de ARCA no deshace el pago: la factura queda `rejected` o `unverified`, como cuando se
emite desde el admin, y se resuelve con los botones de siempre. El checkout valida que los datos
del cliente alcancen para facturar (`billing.rules.receptor_for`), para no cobrar una orden que
después no se pueda facturar.

## Tareas periódicas (cron)
- **`manage.py cancel_unpaid_orders`**, por ejemplo cada hora:
  - Cancela las órdenes de la tienda (las que tienen link de pago) sin pagar después de
    `UNPAID_ORDER_HOURS` (72 por defecto).
  - No toca las que tienen un pago en proceso (efectivo hasta que se paga en caja), ni las que
    crea el admin a mano.
  - Si un pago se aprueba después de la cancelación, la orden vuelve a `paid`.
- **`manage.py invoice_paid_orders`**, por ejemplo cada 10 minutos: factura las órdenes pagadas
  por Mercado Pago que quedaron sin comprobante, si el webhook no pudo.

## Devoluciones
Un pago `refunded` o `charged_back` sobre una orden paga queda en el log `billing` y se ve en el
admin. La nota de crédito se hace a mano, como hasta ahora.

## Desarrollo
- **Credenciales de prueba** de la aplicación en `apps/api/.env`. Con un token `TEST-...` se usa
  el checkout del sandbox. Para pagar, se usan la cuenta compradora de prueba y las tarjetas de
  prueba.
- **Avisos:** Mercado Pago no llega a `localhost`. Hace falta un túnel a la tienda (por ejemplo
  `cloudflared tunnel --url http://localhost:3000`), con su URL en
  `MERCADOPAGO_NOTIFICATION_URL` y en los Webhooks de la aplicación.
- **Tests:** simulan `payments.gateway` (`payments/tests.py`).

## Pruebas contra Mercado Pago (estado al 2026-10-31, pendiente)

El flujo está probado con los tests y con un aviso simulado en dev: orden pagada, factura de
muestra, mail con el PDF, página del pedido y descarga de la factura. **Falta un pago real del
sandbox de punta a punta.** Esto es lo que se probó y cómo seguir.

**Funciona**, con el Access Token `APP_USR-` de una cuenta de prueba vendedora (`/users/me` la
marca `test_user`):
- Mercado Pago acepta la preferencia. El link abre el checkout con los ítems, el monto y las
  cuotas.
- El webhook es alcanzable: Mercado Pago → túnel → `/api` de la tienda → Django.

**Trabado:**
- En el checkout, con la compradora de prueba logueada, el botón "Pagar" queda deshabilitado
  aunque estén cargados la tarjeta, el CVV y las cuotas, y también con Pago Fácil.
- Crear el pago por la API (`sdk().payment().create`, tarjeta tokenizada con titular `APRO` o
  `pagofacil`, payer = email de la compradora de prueba) responde **401 "Unauthorized use of
  live credentials"**.
- Las credenciales de producción de esa aplicación ya estaban activas, así que no es eso.

**Próximo paso:**
1. Usar las **credenciales de prueba** de la aplicación (Access Token `TEST-...`) en
   `MERCADOPAGO_ACCESS_TOKEN`. Con ese token, `MERCADOPAGO_SANDBOX` pasa a `true` solo y los
   links van a `sandbox_init_point`.
2. Webhook en modo prueba, con la URL del túnel; su clave en `MERCADOPAGO_WEBHOOK_SECRET`.
3. Reiniciar la API (no relee el `.env` sola) y crear un pago por la API con la tarjeta de prueba
   para una orden `pending`:
   ```python
   # python manage.py shell
   from django.conf import settings
   from payments.gateway import sdk
   from orders.models import Order
   order = Order.objects.get(number="ORD-...")
   s = sdk()
   token = s.card_token().create({
       "card_number": "5031755734530604", "expiration_month": 11, "expiration_year": 2030,
       "security_code": "123",
       "cardholder": {"name": "APRO", "identification": {"type": "DNI", "number": "12345678"}},
   })["response"]["id"]
   s.payment().create({
       "transaction_amount": float(order.total), "token": token, "installments": 1,
       "payment_method_id": "master", "external_reference": order.number,
       "notification_url": settings.MERCADOPAGO_NOTIFICATION_URL,
       "payer": {"email": "<email de la compradora de prueba>"},
   })
   ```
4. Verificar:
   - en el log de la API, el POST a `/payments/webhooks/mercadopago/` con firma válida;
   - la orden en `paid`, con su `Payment` aprobado;
   - la factura de muestra (punto de venta 99) y el mail "Payment received" con el PDF.
5. Después, el pago desde el navegador con el link del sandbox.

**Lo que se aprendió en el camino** (ya está resuelto en el código o es del navegador):
- **`auto_return`:** Mercado Pago no lo acepta con una tienda `http://localhost` ("auto_return
  invalid"). Se manda solo con `STORE_URL` en HTTPS; en dev, su página muestra "Volver al sitio".
- **`payer.email`:** si es de una persona real con un vendedor de prueba, Mercado Pago rechaza el
  pago ("Una de las partes con la que intentás hacer el pago es de prueba"). Por eso la
  preferencia no manda `payer`.
- **Bloqueadores de anuncios** (`ERR_BLOCKED_BY_CLIENT` en la consola) y las cookies de terceros
  bloqueadas (incógnito de Chrome) cortan los scripts de seguridad del checkout: hay que probar
  sin bloqueador, en una ventana normal.
- **El link de sandbox con un token `APP_USR-`** da "no se pudo acceder": ese checkout es para
  tokens `TEST-`.
- **Túnel:** `cloudflared tunnel --url http://localhost:3000`, con el binario de
  `cloudflared-linux-amd64` de las releases de GitHub, sin instalar nada. La URL de un túnel
  rápido cambia cada vez que se levanta: hay que actualizarla en los Webhooks y en
  `MERCADOPAGO_NOTIFICATION_URL`.
- **Datos de prueba en la base de dev:** las órdenes `ORD-000186` a `ORD-000190` quedaron
  `pending`, con sus `Payment` en `created`. `cancel_unpaid_orders` las cancela a las 72 horas.
