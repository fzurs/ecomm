import json
import tempfile
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

from anthropic.types import Message as APIMessage, TextBlock, ToolUseBlock
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from billing.models import Invoice
from orders.models import Customer, Order
from store.models import Category, Product
from .models import Conversation, Message
from .tools import LIMIT, run_tool

User = get_user_model()


def create_orders():
    category = Category.objects.create(name='Auriculares')
    product = Product.objects.create(name='Auricular X', category=category, price=10000, status=Product.Status.ACTIVE)
    customer = Customer.objects.create(name='Juan Pérez', email='juan@example.com')
    paid = Order.objects.create_with_items(customer=customer, status=Order.Status.PAID,
                                           items=[{'product': product, 'quantity': 2}])
    Order.objects.create_with_items(customer=customer, status=Order.Status.CANCELLED,
                                    items=[{'product': product, 'quantity': 5}])
    return paid


def create_invoice(order):
    # A made-up CAE: never a real one in tests.
    return Invoice.objects.create(
        order=order, point_of_sale=1, invoice_type=11, invoice_number=1, net_amount='16528.93',
        vat_amount='3471.07', total_amount='20000.00', cae='70000000000001', cae_expiration_date='20261105',
        status=Invoice.Status.SUCCESS,
    )


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ToolTests(TestCase):
    def setUp(self):
        self.order = create_orders()

    def run_tool(self, name, tool_input):
        content, is_error = run_tool(name, tool_input)
        self.assertFalse(is_error, content)
        return json.loads(content)

    def test_search_orders_filters_by_status(self):
        result = self.run_tool('search_orders', {'status': 'paid'})
        self.assertEqual(result['count'], 1)
        self.assertEqual(result['orders'][0], {**result['orders'][0], 'number': self.order.number, 'total': 20000})

    def test_get_order_includes_the_items(self):
        result = self.run_tool('get_order', {'number': self.order.number})
        self.assertEqual(result['total'], 20000)
        self.assertEqual([item['product'] for item in result['items']], ['Auricular X'])

    def test_get_order_reports_a_missing_order(self):
        content, is_error = run_tool('get_order', {'number': 'ORD-999999'})
        self.assertTrue(is_error)
        self.assertIn('ORD-999999', content)

    def test_sales_summary_leaves_out_cancelled_orders(self):
        result = self.run_tool('sales_summary', {'date_from': '2000-01-01', 'date_to': '2100-01-01', 'group_by': 'category'})
        self.assertEqual(result['totals'], {'revenue': 20000, 'units': 2, 'orders': 1})
        self.assertEqual(result['groups'][0]['group'], 'Auriculares')

    def test_search_orders_filters_by_product(self):
        speaker = Product.objects.create(name='Parlante Y', sku='PAR-1', price=5000, status=Product.Status.ACTIVE)
        order = Order.objects.create_with_items(customer=self.order.customer, items=[
            {'product': speaker, 'quantity': 1}, {'product': self.order.items.get().product, 'quantity': 1},
        ])
        for query in ['parlante', 'PAR-1']:
            result = self.run_tool('search_orders', {'product': query})
            self.assertEqual(result['count'], 1)
            # The whole order's total, not only the matching item's.
            self.assertEqual(result['orders'][0], {**result['orders'][0], 'number': order.number, 'total': 15000})

    def test_lists_page_with_offset(self):
        for _ in range(LIMIT):
            Order.objects.create_with_items(customer=self.order.customer, items=[])
        result = self.run_tool('search_orders', {'offset': LIMIT})
        self.assertEqual(result['count'], LIMIT + 2)
        self.assertEqual(len(result['orders']), 2)

    def test_search_customers_by_document_number(self):
        Customer.objects.filter(pk=self.order.customer_id).update(document_number='20123456786')
        result = self.run_tool('search_customers', {'query': '20123456786'})
        self.assertEqual([customer['id'] for customer in result['customers']], [self.order.customer_id])

    def test_get_customer_leaves_out_cancelled_orders_from_the_total(self):
        result = self.run_tool('get_customer', {'id': self.order.customer_id})
        self.assertEqual(result['order_count'], 2)
        self.assertEqual(result['total_spent'], 20000)
        self.assertEqual(len(result['orders']), 2)

    def test_get_customer_reports_a_missing_customer(self):
        content, is_error = run_tool('get_customer', {'id': 999999})
        self.assertTrue(is_error)
        self.assertIn('999999', content)

    def test_get_invoice_includes_the_amounts_and_cae(self):
        invoice = create_invoice(self.order)
        result = self.run_tool('get_invoice', {'id': invoice.id})
        self.assertEqual(result, {
            **result, 'order': self.order.number, 'net_amount': '16528.93', 'vat_amount': '3471.07',
            'total_amount': '20000.00', 'cae': '70000000000001', 'cae_expiration_date': '20261105',
        })
        self.assertEqual(result['customer']['name'], 'Juan Pérez')

    def test_list_invoices_filters_by_order_and_customer(self):
        invoice = create_invoice(self.order)
        for tool_input in [{'order': self.order.number}, {'customer': 'juan@'}]:
            result = self.run_tool('list_invoices', tool_input)
            self.assertEqual([item['id'] for item in result['invoices']], [invoice.id])
        self.assertEqual(self.run_tool('list_invoices', {'order': 'ORD-999999'})['count'], 0)

    def test_sales_summary_groups_by_month_in_date_order(self):
        older = Order.objects.create_with_items(customer=self.order.customer, status=Order.Status.PAID,
                                                items=[{'product': self.order.items.get().product, 'quantity': 1}])
        Order.objects.filter(pk=older.pk).update(created_at=datetime(2026, 1, 15, 12, tzinfo=timezone.utc))
        result = self.run_tool('sales_summary', {'date_from': '2000-01-01', 'date_to': '2100-01-01', 'group_by': 'month'})
        groups = [group['group'] for group in result['groups']]
        self.assertEqual(groups[0], '2026-01-01')
        self.assertEqual(groups, sorted(groups))
        self.assertEqual(result['groups'][0]['revenue'], 10000)

    def test_sales_summary_groups_by_customer_and_brand(self):
        dates = {'date_from': '2000-01-01', 'date_to': '2100-01-01'}
        result = self.run_tool('sales_summary', {**dates, 'group_by': 'customer'})
        self.assertEqual(result['groups'], [{'group': 'Juan Pérez', 'revenue': 20000, 'units': 2, 'orders': 1}])
        # The product has no brand.
        result = self.run_tool('sales_summary', {**dates, 'group_by': 'brand'})
        self.assertEqual(result['groups'][0]['group'], None)

    def test_rejects_invalid_input(self):
        for tool_input in [{}, {'number': 1}, {'number': 'ORD-1', 'extra': True}]:
            content, is_error = run_tool('get_order', tool_input)
            self.assertTrue(is_error)
        content, is_error = run_tool('sales_summary', {'date_from': 'ayer', 'date_to': '2100-01-01', 'group_by': 'day'})
        self.assertTrue(is_error)

    def test_rejects_unknown_tools(self):
        self.assertTrue(run_tool('delete_order', {})[1])


class FakeStream:
    def __init__(self, message):
        self.message = message

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def __iter__(self):
        for block in self.message.content:
            if block.type == 'text':
                yield SimpleNamespace(type='text', text=block.text)
            elif block.type == 'tool_use':
                yield SimpleNamespace(type='content_block_start', content_block=block)

    def get_final_message(self):
        return self.message


def fake_client(*messages):
    """A client whose stream() returns `messages` in order, recording each request."""
    responses = iter(messages)
    client = SimpleNamespace(requests=[])

    def stream(**request):
        # A copy: the service keeps appending to the same history list.
        client.requests.append({**request, 'messages': list(request['messages'])})
        return FakeStream(next(responses))

    client.messages = SimpleNamespace(stream=stream)
    return client


def message(stop_reason, *content):
    return APIMessage.model_construct(content=list(content), stop_reason=stop_reason)


def parse_events(response):
    body = b''.join(response.streaming_content).decode()
    events = []
    for chunk in body.strip().split('\n\n'):
        event, data = chunk.split('\n')
        events.append((event.removeprefix('event: '), json.loads(data.removeprefix('data: '))))
    return events


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(), ANTHROPIC_API_KEY='test-key')
class ReplyTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(username='admin', is_staff=True)
        self.client.force_login(self.user)
        self.conversation = Conversation.objects.create(user=self.user)
        self.url = reverse('conversation-reply', args=[self.conversation.pk])
        self.order = create_orders()

    def post(self, client, text='¿Cómo viene el pedido?'):
        with patch('assistant.service.get_client', return_value=client):
            response = self.client.post(self.url, {'text': text, 'page': '/orders'}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response['Content-Type'], 'text/event-stream')
            return parse_events(response)

    def test_streams_the_answer_and_saves_it(self):
        client = fake_client(message('end_turn', TextBlock(type='text', text='Hola')))
        events = self.post(client)

        self.assertEqual(events, [('text', {'delta': 'Hola'}), ('done', {'conversation': self.conversation.pk})])
        self.assertEqual(list(self.conversation.messages.values_list('role', 'text')),
                         [('user', '¿Cómo viene el pedido?'), ('assistant', 'Hola')])
        self.conversation.refresh_from_db()
        self.assertEqual(self.conversation.title, '¿Cómo viene el pedido?')
        # The page goes in the user message, not in the cached system prompt.
        self.assertIn('Página: /orders', client.requests[0]['messages'][0]['content'][0]['text'])

    def test_runs_the_tools_and_sends_back_the_results(self):
        tool_use = ToolUseBlock(type='tool_use', id='toolu_1', name='get_order', input={'number': self.order.number})
        client = fake_client(
            message('tool_use', tool_use),
            message('end_turn', TextBlock(type='text', text='Está pagado.')),
        )
        events = self.post(client)

        self.assertEqual([event for event, _ in events], ['tool', 'text', 'done'])
        result = client.requests[1]['messages'][-1]['content'][0]
        self.assertEqual(result['tool_use_id'], 'toolu_1')
        self.assertFalse(result['is_error'])
        self.assertEqual(json.loads(result['content'])['number'], self.order.number)

    def test_resumes_the_saved_history(self):
        self.post(fake_client(message('end_turn', TextBlock(type='text', text='Hola'))))
        client = fake_client(message('end_turn', TextBlock(type='text', text='Chau')))
        self.post(client, 'Gracias')

        self.assertEqual([m['role'] for m in client.requests[0]['messages']], ['user', 'assistant', 'user'])
        self.assertEqual(client.requests[0]['messages'][1]['content'], [{'type': 'text', 'text': 'Hola'}])

    def test_answers_the_tool_uses_it_doesnt_run(self):
        tool_use = ToolUseBlock(type='tool_use', id='toolu_1', name='get_order', input={'number': 'ORD-0'})
        events = self.post(fake_client(message('max_tokens', tool_use)))

        self.assertEqual(events[-2][0], 'error')
        last = self.conversation.messages.last()
        self.assertEqual(last.content[0]['tool_use_id'], 'toolu_1')
        self.assertTrue(last.content[0]['is_error'])

    def test_requires_staff(self):
        self.user.is_staff = False
        self.user.save()
        response = self.client.post(self.url, {'text': 'Hola'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hides_other_users_conversations(self):
        other = User.objects.create(username='otro', is_staff=True)
        self.client.force_login(other)
        response = self.client.post(self.url, {'text': 'Hola'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @override_settings(ANTHROPIC_API_KEY='')
    def test_needs_an_api_key(self):
        response = self.client.post(self.url, {'text': 'Hola'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ConversationTests(APITestCase):
    def test_detail_shows_only_the_messages_with_text(self):
        user = User.objects.create(username='admin', is_staff=True)
        self.client.force_login(user)
        conversation = Conversation.objects.create(user=user, title='Ventas')
        conversation.messages.create(role=Message.Role.USER, content=[], text='¿Cuánto vendimos?')
        conversation.messages.create(role=Message.Role.ASSISTANT, content=[])
        conversation.messages.create(role=Message.Role.USER, content=[])
        conversation.messages.create(role=Message.Role.ASSISTANT, content=[], text='$ 20.000')

        response = self.client.get(reverse('conversation-detail', args=[conversation.pk]))
        self.assertEqual([m['text'] for m in response.json()['messages']], ['¿Cuánto vendimos?', '$ 20.000'])
