import json
import re
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from assistant.models import Conversation, Message
from assistant.service import user_content
from orders.models import Order

DEFAULT_PATH = settings.BASE_DIR / 'seed' / 'conversations.json'
# Between one message and the next, so they keep their order.
MESSAGE_GAP = timedelta(seconds=30)
# {order:23} is the 23rd order of seed/dev.json. Its number depends on the database (the ids go
# on after a `seed --reset`), so it's filled in on load.
ORDER = re.compile(r'\{order:(\d+)\}')


class Command(BaseCommand):
    help = "Loads example assistant conversations for a staff user from a JSON file (after `seed`)."

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='?', type=Path, default=DEFAULT_PATH)
        parser.add_argument('--user', help='The staff user they belong to (needed when there are several).')
        parser.add_argument('--reset', action='store_true',
                            help="Recreate the user's seeded conversations (the rest are kept).")

    def handle(self, *args, path, user, reset, **options):
        try:
            data = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError) as e:
            raise CommandError(f"Can't read {path}: {e}")
        user = self.get_user(user)

        rows = data.get('conversations', [])
        with transaction.atomic():
            # The title is the natural key: the user's own conversations are never touched.
            seeded = user.assistant_conversations.filter(title__in=[row['title'] for row in rows])
            if reset:
                deleted = seeded.count()
                seeded.delete()
                self.stdout.write(f'Seeded conversations of {user} deleted: {deleted}')
            existing = set(seeded.values_list('title', flat=True))
            # `seed` creates its orders in order, so the nth by id is the nth of dev.json.
            orders = list(Order.objects.order_by('pk').values_list('number', flat=True))
            for number, row in enumerate(rows, start=1):
                if row['title'] not in existing:
                    self.load(user, row, orders, f'conversation #{number}')
        skipped = f', {len(existing)} skipped (already there, use --reset)' if existing else ''
        self.stdout.write(f'Conversation: {len(rows) - len(existing)} for {user}{skipped}')

    def get_user(self, username):
        staff = get_user_model().objects.filter(is_staff=True)
        if username:
            try:
                return staff.get(username=username)
            except staff.model.DoesNotExist:
                raise CommandError(f'There is no staff user "{username}"')
        if staff.count() != 1:
            raise CommandError(f'There are {staff.count()} staff users: pass --user')
        return staff.get()

    def load(self, user, row, orders, where):
        def fill(text):
            def number(match):
                index = int(match.group(1))
                if not 1 <= index <= len(orders):
                    raise CommandError(f'{where} mentions order {index} of dev.json, but there are '
                                       f'{len(orders)} orders: run `seed` first')
                return orders[index - 1]
            return ORDER.sub(number, text)

        messages = [{**message, 'text': fill(message['text']), 'page': fill(message.get('page') or '')}
                    for message in row['messages']]
        # Sent back to Claude if the conversation goes on: it has to start with the user and alternate.
        roles = [message['role'] for message in messages]
        if not roles or roles != [('user', 'assistant')[i % 2] for i in range(len(roles))]:
            raise CommandError(f'The messages of {where} must alternate user and assistant, from the user')

        started = timezone.now() - timedelta(days=row.get('days_ago', 0))
        conversation = Conversation.objects.create(user=user, title=row['title'])
        # As in a real conversation: the first message has no title yet.
        title = ''
        at = started
        for message in messages:
            if message['role'] == Message.Role.USER:
                content = user_content(message['text'], message.get('page'), title, timezone.localdate(at))
                title = row['title']
            else:
                content = [{'type': 'text', 'text': message['text']}]
            saved = conversation.messages.create(role=message['role'], content=content, text=message['text'])
            # `created_at` is auto_now_add, so it can only be backdated with an update.
            Message.objects.filter(pk=saved.pk).update(created_at=at)
            at += MESSAGE_GAP
        Conversation.objects.filter(pk=conversation.pk).update(created_at=started, updated_at=at - MESSAGE_GAP)
