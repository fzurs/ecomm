"""
The assistant's turn: streams Claude's answer and runs the tools it asks for, saving every
message so the conversation can be resumed.
"""
import logging

import anthropic
from django.conf import settings
from django.utils import timezone

from .models import Message
from .tools import run_tool, tool_definitions

logger = logging.getLogger(__name__)

# The fastest model: answering from a few tool results doesn't need a bigger one.
MODEL = 'claude-haiku-5-5'
# Tool calls per answer; past it the turn ends with an error.
MAX_STEPS = 10
# Retries of one step whose tool input came back as unparseable JSON.
MAX_JSON_RETRIES = 2

# Frozen: it's the start of the cached prefix. What changes per request (today's date, the page
# the admin is on) goes in the user message.
SYSTEM = """\
Sos el asistente del panel de administración de una tienda online argentina. Respondés en \
español rioplatense, en forma breve y concreta, usando Markdown (listas y tablas cortas).

Respondé con datos reales: consultá las herramientas antes de afirmar cifras, estados o \
nombres, y no inventes datos que no devolvieron. Los importes están en pesos argentinos \
(ARS); formatealos como $ 12.345. Las herramientas de la tienda son de solo lectura: si te \
piden cambiar algo, explicá cómo hacerlo desde el panel. Si una lista viene cortada, decí \
cuántos resultados hay en total.

Cada mensaje del usuario empieza con un bloque <context> con la fecha de hoy, la página del \
panel en la que está (ej. /orders/ORD-000042) y el título de la conversación: usalo para \
resolver referencias como "este pedido" o "esta semana".

Ponele título a la conversación con set_title: en el primer mensaje (el título es "(sin \
título)"), uno de 3 a 6 palabras sobre el tema, sin punto final. Llamala junto con las otras \
herramientas que necesites, no en un paso aparte. Después cambialo solo si te lo piden o si el \
tema cambia por completo. No menciones el título en la respuesta salvo que te lo pidan."""


def get_client():
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _dump(blocks):
    return [block.model_dump(mode='json', exclude_none=True) for block in blocks]


def _text(blocks):
    return ''.join(block.text for block in blocks if block.type == 'text')


def _user_content(text, page, title):
    context = (f'<context>\nHoy: {timezone.localdate().isoformat()}\nPágina: {page or "/"}\n'
               f'Título: {title or "(sin título)"}\n</context>')
    return [{'type': 'text', 'text': context}, {'type': 'text', 'text': text}]


def reply(conversation, text, page=None):
    """
    Yields the events of the answer to `text`: ("text", {"delta"}), ("tool", {"name"}),
    ("error", {"message"}) and, last, ("done", {"conversation"}).
    """
    history = [{'role': m.role, 'content': m.content} for m in conversation.messages.all()]

    # The title before this message: "(sin título)" is what asks the model to name it.
    content = _user_content(text, page, conversation.title)
    conversation.messages.create(role=Message.Role.USER, content=content, text=text)
    history.append({'role': 'user', 'content': content})
    # Until the model names it with set_title (or if the answer is cut off before that).
    if not conversation.title:
        conversation.title = text[:80]
    conversation.save(update_fields=['title', 'updated_at'])

    try:
        yield from _run(conversation, history)
    except anthropic.AuthenticationError:
        logger.exception('Assistant: invalid ANTHROPIC_API_KEY')
        yield 'error', {'message': 'La API key de Anthropic no es válida.'}
    except anthropic.RateLimitError:
        yield 'error', {'message': 'Hay demasiadas consultas en curso. Probá de nuevo en un rato.'}
    except (anthropic.APIStatusError, anthropic.APIConnectionError):
        logger.exception('Assistant: Claude API error')
        yield 'error', {'message': 'No se pudo contactar al asistente. Probá de nuevo.'}

    yield 'done', {'conversation': conversation.pk}


def _run(conversation, history):
    client = get_client()
    json_retries = 0
    steps = 0
    while True:
        try:
            with client.messages.stream(
                model=MODEL,
                max_tokens=64000,
                system=SYSTEM,
                tools=tool_definitions(),
                messages=history,
                thinking={'type': 'adaptive'},
                # Low effort: less thinking before answering, which is what makes it fast.
                output_config={'effort': 'low'},
                # Caches the whole prefix up to the last message.
                cache_control={'type': 'ephemeral'},
            ) as stream:
                for event in stream:
                    if event.type == 'text':
                        yield 'text', {'delta': event.text}
                    elif event.type == 'content_block_start' and event.content_block.type == 'tool_use':
                        yield 'tool', {'name': event.content_block.name}
                response = stream.get_final_message()
        except ValueError:
            # A tool input the SDK couldn't parse at all (eager input streaming): the tool_use
            # block never completed, so the step is asked again. API errors aren't ValueError.
            json_retries += 1
            if json_retries > MAX_JSON_RETRIES:
                raise
            continue
        json_retries = 0

        content = _dump(response.content)
        conversation.messages.create(role=Message.Role.ASSISTANT, content=content, text=_text(response.content))
        history.append({'role': 'assistant', 'content': content})

        tool_uses = [block for block in response.content if block.type == 'tool_use']
        if not tool_uses:
            if response.stop_reason == 'refusal':
                yield 'error', {'message': REFUSAL}
            return

        steps += 1
        if response.stop_reason in ('refusal', 'max_tokens') or steps > MAX_STEPS:
            # A refusal or max_tokens can cut a tool input off (and a truncated input can still
            # parse as a valid object), so those tools don't run. Their tool_use blocks still get
            # an error result: a history with an unanswered tool_use is rejected on the next turn.
            message = {'refusal': REFUSAL, 'max_tokens': TRUNCATED}.get(response.stop_reason, TOO_MANY_STEPS)
            _save_results(conversation, history, [(block, message, True) for block in tool_uses])
            yield 'error', {'message': message}
            return

        _save_results(conversation, history,
                      [(block, *run_tool(block.name, block.input, conversation)) for block in tool_uses])


REFUSAL = 'El asistente no puede responder esa consulta.'
TRUNCATED = 'La respuesta quedó cortada. Probá con una consulta más acotada.'
TOO_MANY_STEPS = 'La consulta necesitó demasiados pasos. Probá dividirla.'


def _save_results(conversation, history, results):
    # All the results in one message: splitting them discourages parallel tool calls.
    content = [{'type': 'tool_result', 'tool_use_id': block.id, 'content': result, 'is_error': is_error}
               for block, result, is_error in results]
    conversation.messages.create(role=Message.Role.USER, content=content)
    history.append({'role': 'user', 'content': content})
