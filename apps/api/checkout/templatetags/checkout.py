from django import template

register = template.Library()


@register.filter
def price(value):
    """Pesos as the store shows them: `$ 19.500`."""
    return f"$ {value:,}".replace(",", ".")
