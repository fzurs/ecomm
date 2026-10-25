"""
Tools the assistant can call: read-only queries of the store through the ORM, plus set_title on
its own conversation. Each one returns something JSON-serializable; `run_tool` validates the
input and serializes the result.
"""
import json
from datetime import date

import jsonschema
from django.db.models import Count, DateField, F, Max, Q, Sum
from django.db.models.functions import Coalesce, TruncDate, TruncMonth, TruncWeek

from billing.models import Invoice
from orders.models import Customer, Order, OrderItem
from store.models import Brand, Category, Product

# Rows per list: enough to answer, few enough to keep the context small.
LIMIT = 20


class ToolError(Exception):
    """An error the model can act on (e.g. a wrong order number), sent back as the tool result."""


def _date_range(queryset, field, date_from, date_to):
    if date_from:
        queryset = queryset.filter(**{f'{field}__date__gte': date.fromisoformat(date_from)})
    if date_to:
        queryset = queryset.filter(**{f'{field}__date__lte': date.fromisoformat(date_to)})
    return queryset


def _orders_with_totals():
    return Order.objects.select_related('customer').annotate(
        items_total=Coalesce(Sum(F('items__unit_price') * F('items__quantity')), 0),
    ).order_by('-created_at')


def _order_summary(order):
    return {
        'number': order.number,
        'customer': order.customer.name,
        'status': order.status,
        'total': order.items_total,
        'created_at': order.created_at.isoformat(),
    }


def _invoice_summary(invoice):
    return {
        'id': invoice.id,
        'order': invoice.order.number,
        'customer': invoice.order.customer.name,
        'point_of_sale': invoice.point_of_sale,
        'invoice_type': invoice.invoice_type,
        'invoice_number': invoice.invoice_number,
        'total_amount': str(invoice.total_amount),
        'status': invoice.status,
        'error_message': invoice.error_message,
        'created_at': invoice.created_at.isoformat(),
    }


def search_orders(status=None, customer=None, product=None, date_from=None, date_to=None, offset=0):
    orders = _orders_with_totals()
    if status:
        orders = orders.filter(status=status)
    if customer:
        orders = orders.filter(Q(customer__name__icontains=customer) | Q(customer__email__icontains=customer))
    if product:
        # A subquery: filtering on items__ here would add a second join to the items and
        # multiply items_total.
        orders = orders.filter(pk__in=OrderItem.objects.filter(
            Q(product__name__icontains=product) | Q(product__sku__icontains=product),
        ).values('order'))
    orders = _date_range(orders, 'created_at', date_from, date_to)
    return {
        'count': orders.count(),
        'orders': [_order_summary(order) for order in orders[offset:offset + LIMIT]],
    }


def get_order(number):
    try:
        order = Order.objects.select_related('customer').get(number=number)
    except Order.DoesNotExist:
        raise ToolError(f'There is no order {number}.')
    items = order.items.select_related('product')
    return {
        'number': order.number,
        'status': order.status,
        'created_at': order.created_at.isoformat(),
        'updated_at': order.updated_at.isoformat(),
        'customer': {'name': order.customer.name, 'email': order.customer.email},
        'items': [{
            'product': item.product.name,
            'sku': item.product.sku,
            'quantity': item.quantity,
            'unit_price': item.unit_price,
            'subtotal': item.subtotal,
        } for item in items],
        'total': sum(item.subtotal for item in items),
        'invoices': [{
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'status': invoice.status,
            'total_amount': str(invoice.total_amount),
        } for invoice in order.invoices.all()],
    }


def search_products(query=None, category=None, brand=None, status=None, offset=0):
    products = Product.objects.select_related('category', 'brand')
    if query:
        products = products.filter(Q(name__icontains=query) | Q(sku__icontains=query))
    if category:
        products = products.filter(category__name__icontains=category)
    if brand:
        products = products.filter(brand__name__icontains=brand)
    if status:
        products = products.filter(status=status)
    return {
        'count': products.count(),
        'products': [{
            'name': product.name,
            'slug': product.slug,
            'sku': product.sku,
            'category': product.category and product.category.name,
            'brand': product.brand and product.brand.name,
            'status': product.status,
            'featured': product.featured,
            'price': product.price,
            'discount_percent': product.discount_percent,
            'active_price': product.active_price,
        } for product in products[offset:offset + LIMIT]],
    }


def _catalog_groups(model, key, offset):
    groups = model.objects.annotate(
        product_count=Count('product'),
        active_product_count=Count('product', filter=Q(product__status=Product.Status.ACTIVE)),
    ).order_by('name')
    return {
        'count': groups.count(),
        key: [{
            'name': group.name,
            'product_count': group.product_count,
            'active_product_count': group.active_product_count,
        } for group in groups[offset:offset + LIMIT]],
    }


def list_categories(offset=0):
    return _catalog_groups(Category, 'categories', offset)


def list_brands(offset=0):
    return _catalog_groups(Brand, 'brands', offset)


def search_customers(query, offset=0):
    customers = Customer.objects.filter(
        Q(name__icontains=query) | Q(email__icontains=query) | Q(document_number__icontains=query),
    ).annotate(order_count=Count('orders')).order_by('name')
    return {
        'count': customers.count(),
        'customers': [{
            'id': customer.id,
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'document_type': customer.get_document_type_display(),
            'document_number': customer.document_number,
            'order_count': customer.order_count,
        } for customer in customers[offset:offset + LIMIT]],
    }


def get_customer(id):
    try:
        customer = Customer.objects.get(pk=id)
    except Customer.DoesNotExist:
        raise ToolError(f'There is no customer {id}.')
    orders = _orders_with_totals().filter(customer=customer)
    invoices = Invoice.objects.filter(order__customer=customer).select_related('order__customer') \
        .order_by('-created_at')
    # Cancelled orders aren't spent.
    spent = OrderItem.objects.filter(order__customer=customer).exclude(order__status=Order.Status.CANCELLED) \
        .aggregate(total=Coalesce(Sum(F('unit_price') * F('quantity')), 0))['total']
    return {
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone,
        'document_type': customer.get_document_type_display(),
        'document_number': customer.document_number,
        'order_count': orders.count(),
        'total_spent': spent,
        'orders': [_order_summary(order) for order in orders[:LIMIT]],
        'invoices': [_invoice_summary(invoice) for invoice in invoices[:LIMIT]],
    }


# Dates come out as YYYY-MM-DD: the start of the day, week (Monday) or month.
SALES_GROUPS = {
    'day': TruncDate('order__created_at'),
    'week': TruncWeek('order__created_at', output_field=DateField()),
    'month': TruncMonth('order__created_at', output_field=DateField()),
    'product': F('product__name'),
    'category': F('product__category__name'),
    'brand': F('product__brand__name'),
    'customer': F('order__customer__name'),
}
DATE_GROUPS = ('day', 'week', 'month')


def sales_summary(date_from, date_to, group_by):
    # Cancelled orders aren't sales.
    items = _date_range(
        OrderItem.objects.exclude(order__status=Order.Status.CANCELLED),
        'order__created_at', date_from, date_to,
    )
    revenue = Sum(F('unit_price') * F('quantity'))
    totals = items.aggregate(revenue=Coalesce(revenue, 0), units=Coalesce(Sum('quantity'), 0),
                             orders=Count('order', distinct=True))
    groups = items.annotate(group=SALES_GROUPS[group_by]).values('group').annotate(
        revenue=revenue, units=Sum('quantity'), orders=Count('order', distinct=True),
    )
    groups = groups.order_by('group') if group_by in DATE_GROUPS else groups.order_by('-revenue')
    return {
        'totals': totals,
        # Products without a category or brand group under None.
        'groups': [{**group, 'group': group['group'] and str(group['group'])} for group in groups[:LIMIT]],
    }


def unsold_products(date_from, date_to, status=None, category=None, brand=None, offset=0):
    # Cancelled orders aren't sales, here and in the last sale.
    sales = OrderItem.objects.exclude(order__status=Order.Status.CANCELLED)
    sold = _date_range(sales, 'order__created_at', date_from, date_to).values('product')
    products = Product.objects.select_related('category', 'brand').exclude(pk__in=sold).annotate(
        last_sold_at=Max('order_items__order__created_at',
                         filter=~Q(order_items__order__status=Order.Status.CANCELLED)),
    ).order_by(F('last_sold_at').asc(nulls_first=True), 'name')
    if status:
        products = products.filter(status=status)
    if category:
        products = products.filter(category__name__icontains=category)
    if brand:
        products = products.filter(brand__name__icontains=brand)
    return {
        'count': products.count(),
        'products': [{
            'name': product.name,
            'sku': product.sku,
            'category': product.category and product.category.name,
            'brand': product.brand and product.brand.name,
            'status': product.status,
            'active_price': product.active_price,
            'created_at': product.created_at.isoformat(),
            'last_sold_at': product.last_sold_at and product.last_sold_at.isoformat(),
        } for product in products[offset:offset + LIMIT]],
    }


def list_invoices(status=None, order=None, customer=None, date_from=None, date_to=None, offset=0):
    invoices = Invoice.objects.select_related('order__customer').order_by('-created_at')
    if status:
        invoices = invoices.filter(status=status)
    if order:
        invoices = invoices.filter(order__number=order)
    if customer:
        invoices = invoices.filter(
            Q(order__customer__name__icontains=customer) | Q(order__customer__email__icontains=customer))
    invoices = _date_range(invoices, 'created_at', date_from, date_to)
    return {
        'count': invoices.count(),
        'invoices': [_invoice_summary(invoice) for invoice in invoices[offset:offset + LIMIT]],
    }


def get_invoice(id):
    try:
        invoice = Invoice.objects.select_related('order__customer').get(pk=id)
    except Invoice.DoesNotExist:
        raise ToolError(f'There is no invoice {id}.')
    customer = invoice.order.customer
    return {
        **_invoice_summary(invoice),
        'customer': {
            'id': customer.id,
            'name': customer.name,
            'document_type': customer.get_document_type_display(),
            'document_number': customer.document_number,
        },
        'net_amount': str(invoice.net_amount),
        'vat_amount': str(invoice.vat_amount),
        'cae': invoice.cae,
        'cae_expiration_date': invoice.cae_expiration_date,
        'updated_at': invoice.updated_at.isoformat(),
    }


def set_title(title, conversation):
    title = title.strip()
    if not title:
        raise ToolError('The title is blank.')
    conversation.title = title
    conversation.save(update_fields=['title'])
    return {'title': title}


DATE = {'type': 'string', 'format': 'date', 'description': 'YYYY-MM-DD, inclusive.'}
OFFSET = {'type': 'integer', 'minimum': 0,
          'description': f'Rows to skip, to page past the first {LIMIT} (e.g. {LIMIT}, {2 * LIMIT}).'}


def _schema(properties, required=()):
    return {'type': 'object', 'properties': properties, 'required': list(required),
            'additionalProperties': False}


# In a fixed order: the tool definitions are part of the cached prompt prefix.
TOOLS = [
    (search_orders, {
        'name': 'search_orders',
        'description': f'Lists orders, newest first (at most {LIMIT}), with the total count. Totals are in ARS.',
        'input_schema': _schema({
            'status': {'type': 'string', 'enum': Order.Status.values},
            'customer': {'type': 'string', 'description': 'Part of the customer name or email.'},
            'product': {'type': 'string', 'description': 'Part of the name or SKU of a product in the order.'},
            'date_from': DATE,
            'date_to': DATE,
            'offset': OFFSET,
        }),
    }),
    (get_order, {
        'name': 'get_order',
        'description': 'An order with its customer, items and invoices.',
        'input_schema': _schema({
            'number': {'type': 'string', 'description': 'The order number, e.g. ORD-000042.'},
        }, required=['number']),
    }),
    (search_products, {
        'name': 'search_products',
        'description': f'Lists products (at most {LIMIT}), with the total count. Prices are in ARS; '
                       'active_price is the price with the discount applied.',
        'input_schema': _schema({
            'query': {'type': 'string', 'description': 'Part of the name or SKU.'},
            'category': {'type': 'string', 'description': 'Part of the category name.'},
            'brand': {'type': 'string', 'description': 'Part of the brand name.'},
            'status': {'type': 'string', 'enum': Product.Status.values},
            'offset': OFFSET,
        }),
    }),
    (list_categories, {
        'name': 'list_categories',
        'description': f'Lists the product categories by name (at most {LIMIT}), with the total count and '
                       'how many products each has, in total and active. Use it to find the names to '
                       'filter by.',
        'input_schema': _schema({'offset': OFFSET}),
    }),
    (list_brands, {
        'name': 'list_brands',
        'description': f'Lists the brands by name (at most {LIMIT}), with the total count and how many '
                       'products each has, in total and active. Use it to find the names to filter by.',
        'input_schema': _schema({'offset': OFFSET}),
    }),
    (search_customers, {
        'name': 'search_customers',
        'description': f'Customers whose name, email or document number (CUIT, DNI...) contains the query '
                       f'(at most {LIMIT}), with their id, contact details and order count.',
        'input_schema': _schema({
            'query': {'type': 'string', 'minLength': 1},
            'offset': OFFSET,
        }, required=['query']),
    }),
    (get_customer, {
        'name': 'get_customer',
        'description': f'A customer with their total spent in ARS (leaving out cancelled orders) and their '
                       f'latest orders and invoices (at most {LIMIT} each).',
        'input_schema': _schema({
            'id': {'type': 'integer', 'description': 'The customer id, as in the page /customers/{id}.'},
        }, required=['id']),
    }),
    (sales_summary, {
        'name': 'sales_summary',
        'description': 'Revenue (ARS), units and orders in a date range, leaving out cancelled orders, '
                       f'in total and grouped (at most {LIMIT} groups): by day, week or month in date '
                       'order, or by product, category, brand or customer sorted by revenue. For long '
                       'ranges, group by week or month.',
        'input_schema': _schema({
            'date_from': DATE,
            'date_to': DATE,
            'group_by': {'type': 'string', 'enum': list(SALES_GROUPS)},
        }, required=['date_from', 'date_to', 'group_by']),
    }),
    (unsold_products, {
        'name': 'unsold_products',
        'description': f'Products with no sales in a date range, leaving out cancelled orders (at most '
                       f'{LIMIT}), with the total count and their last sale ever: never sold first, then '
                       'the longest without sales. Pass status active to leave out drafts and '
                       'discontinued products, and check created_at for products that came out later.',
        'input_schema': _schema({
            'date_from': DATE,
            'date_to': DATE,
            'status': {'type': 'string', 'enum': Product.Status.values},
            'category': {'type': 'string', 'description': 'Part of the category name.'},
            'brand': {'type': 'string', 'description': 'Part of the brand name.'},
            'offset': OFFSET,
        }, required=['date_from', 'date_to']),
    }),
    (list_invoices, {
        'name': 'list_invoices',
        'description': f'Lists invoices, newest first (at most {LIMIT}), with the total count.',
        'input_schema': _schema({
            'status': {'type': 'string', 'enum': Invoice.Status.values},
            'order': {'type': 'string', 'description': 'The order number, e.g. ORD-000042.'},
            'customer': {'type': 'string', 'description': 'Part of the customer name or email.'},
            'date_from': DATE,
            'date_to': DATE,
            'offset': OFFSET,
        }),
    }),
    (get_invoice, {
        'name': 'get_invoice',
        'description': 'An invoice with its customer, net, VAT and total amounts (ARS), and its CAE and '
                       'CAE expiration date (YYYYMMDD) once ARCA authorized it.',
        'input_schema': _schema({
            'id': {'type': 'integer', 'description': 'The invoice id, as in the page /invoices/{id}.'},
        }, required=['id']),
    }),
    (set_title, {
        'name': 'set_title',
        'description': 'Sets the title of this conversation, which the history shows: a few words '
                       'about its topic.',
        'input_schema': _schema({
            'title': {'type': 'string', 'minLength': 1, 'maxLength': 80},
        }, required=['title']),
    }),
]

FUNCTIONS = {definition['name']: function for function, definition in TOOLS}
SCHEMAS = {definition['name']: definition['input_schema'] for _, definition in TOOLS}
# The tools that act on the conversation they're called from: run_tool passes it.
CONVERSATION_TOOLS = {'set_title'}


def tool_definitions():
    # With eager streaming the API sends the input as it's generated, without validating it:
    # run_tool validates it instead.
    return [{**definition, 'eager_input_streaming': True} for _, definition in TOOLS]


def run_tool(name, tool_input, conversation=None):
    """Returns (content, is_error), ready for a tool_result block."""
    if name not in FUNCTIONS:
        return f'Unknown tool {name}.', True
    context = {'conversation': conversation} if name in CONVERSATION_TOOLS else {}
    try:
        jsonschema.validate(tool_input, SCHEMAS[name], format_checker=jsonschema.FormatChecker())
        result = FUNCTIONS[name](**tool_input, **context)
    except jsonschema.ValidationError as error:
        return f'Invalid input: {error.message}', True
    except ToolError as error:
        return str(error), True
    return json.dumps(result, ensure_ascii=False), False
