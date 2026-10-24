"""
Read-only tools the assistant can call. Each one queries the ORM and returns something
JSON-serializable; `run_tool` validates the input and serializes the result.
"""
import json
from datetime import date

import jsonschema
from django.db.models import Count, F, Q, Sum
from django.db.models.functions import Coalesce, TruncDate

from billing.models import Invoice
from orders.models import Customer, Order, OrderItem
from store.models import Product

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


def search_orders(status=None, customer=None, date_from=None, date_to=None):
    orders = Order.objects.select_related('customer').annotate(
        items_total=Coalesce(Sum(F('items__unit_price') * F('items__quantity')), 0),
    ).order_by('-created_at')
    if status:
        orders = orders.filter(status=status)
    if customer:
        orders = orders.filter(Q(customer__name__icontains=customer) | Q(customer__email__icontains=customer))
    orders = _date_range(orders, 'created_at', date_from, date_to)
    return {
        'count': orders.count(),
        'orders': [{
            'number': order.number,
            'customer': order.customer.name,
            'status': order.status,
            'total': order.items_total,
            'created_at': order.created_at.isoformat(),
        } for order in orders[:LIMIT]],
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
            'invoice_number': invoice.invoice_number,
            'status': invoice.status,
            'total_amount': str(invoice.total_amount),
        } for invoice in order.invoices.all()],
    }


def search_products(query=None, category=None, brand=None, status=None):
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
        } for product in products[:LIMIT]],
    }


def search_customers(query):
    customers = Customer.objects.filter(
        Q(name__icontains=query) | Q(email__icontains=query),
    ).annotate(order_count=Count('orders')).order_by('name')
    return {
        'count': customers.count(),
        'customers': [{
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'document_type': customer.get_document_type_display(),
            'document_number': customer.document_number,
            'order_count': customer.order_count,
        } for customer in customers[:LIMIT]],
    }


SALES_GROUPS = {
    'day': TruncDate('order__created_at'),
    'product': F('product__name'),
    'category': F('product__category__name'),
}


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
    groups = groups.order_by('group') if group_by == 'day' else groups.order_by('-revenue')
    return {
        'totals': totals,
        'groups': [{**group, 'group': str(group['group'])} for group in groups[:LIMIT]],
    }


def list_invoices(status=None, date_from=None, date_to=None):
    invoices = Invoice.objects.select_related('order').order_by('-created_at')
    if status:
        invoices = invoices.filter(status=status)
    invoices = _date_range(invoices, 'created_at', date_from, date_to)
    return {
        'count': invoices.count(),
        'invoices': [{
            'order': invoice.order.number,
            'point_of_sale': invoice.point_of_sale,
            'invoice_type': invoice.invoice_type,
            'invoice_number': invoice.invoice_number,
            'total_amount': str(invoice.total_amount),
            'status': invoice.status,
            'error_message': invoice.error_message,
            'created_at': invoice.created_at.isoformat(),
        } for invoice in invoices[:LIMIT]],
    }


DATE = {'type': 'string', 'format': 'date', 'description': 'YYYY-MM-DD, inclusive.'}


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
            'date_from': DATE,
            'date_to': DATE,
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
        }),
    }),
    (search_customers, {
        'name': 'search_customers',
        'description': f'Customers whose name or email contains the query (at most {LIMIT}), '
                       'with their contact details and order count.',
        'input_schema': _schema({
            'query': {'type': 'string', 'minLength': 1},
        }, required=['query']),
    }),
    (sales_summary, {
        'name': 'sales_summary',
        'description': 'Revenue (ARS), units and orders in a date range, leaving out cancelled orders, '
                       f'in total and grouped by day, product or category (at most {LIMIT} groups; '
                       'products and categories are sorted by revenue).',
        'input_schema': _schema({
            'date_from': DATE,
            'date_to': DATE,
            'group_by': {'type': 'string', 'enum': list(SALES_GROUPS)},
        }, required=['date_from', 'date_to', 'group_by']),
    }),
    (list_invoices, {
        'name': 'list_invoices',
        'description': f'Lists invoices, newest first (at most {LIMIT}), with the total count.',
        'input_schema': _schema({
            'status': {'type': 'string', 'enum': Invoice.Status.values},
            'date_from': DATE,
            'date_to': DATE,
        }),
    }),
]

FUNCTIONS = {definition['name']: function for function, definition in TOOLS}
SCHEMAS = {definition['name']: definition['input_schema'] for _, definition in TOOLS}


def tool_definitions():
    # With eager streaming the API sends the input as it's generated, without validating it:
    # run_tool validates it instead.
    return [{**definition, 'eager_input_streaming': True} for _, definition in TOOLS]


def run_tool(name, tool_input):
    """Returns (content, is_error), ready for a tool_result block."""
    if name not in FUNCTIONS:
        return f'Unknown tool {name}.', True
    try:
        jsonschema.validate(tool_input, SCHEMAS[name], format_checker=jsonschema.FormatChecker())
        result = FUNCTIONS[name](**tool_input)
    except jsonschema.ValidationError as error:
        return f'Invalid input: {error.message}', True
    except ToolError as error:
        return str(error), True
    return json.dumps(result, ensure_ascii=False), False
