"""Deterministic placeholder images: the same name always yields the same image."""
import colorsys
import hashlib
import io
import math
import random

from PIL import Image, ImageDraw, ImageFilter

# Shapes are drawn at this scale and downsampled, which antialiases their edges.
SUPERSAMPLE = 4

RGB = tuple[int, int, int]


def _rng(name: str) -> random.Random:
    return random.Random(hashlib.sha256(name.encode()).digest())


def _hsv(hue: float, saturation: float, value: float) -> RGB:
    r, g, b = colorsys.hsv_to_rgb(hue % 1, saturation, value)
    return (round(r * 255), round(g * 255), round(b * 255))


def _lerp(a: RGB, b: RGB, t: float) -> RGB:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _palette(rng: random.Random) -> list[RGB]:
    """Three colours with evenly spaced hues, from light and bright to deep."""
    hue = rng.random()
    step = rng.uniform(0.06, 0.14)
    return [_hsv(hue, 0.6, 0.97), _hsv(hue + step, 0.7, 0.85), _hsv(hue + 2 * step, 0.75, 0.7)]


def _color_at(colors: list[RGB], t: float) -> RGB:
    segment = min(int(t * (len(colors) - 1)), len(colors) - 2)
    return _lerp(colors[segment], colors[segment + 1], t * (len(colors) - 1) - segment)


def _diagonal_gradient(size: tuple[int, int], colors: list[RGB]) -> Image.Image:
    # Stretching a 256px strip is much faster than painting pixel by pixel.
    width, height = size
    span = math.ceil(math.hypot(width, height))
    strip = Image.new("RGB", (256, 1))
    strip.putdata([_color_at(colors, i / 255) for i in range(256)])
    gradient = strip.resize((span, span), Image.Resampling.BILINEAR).rotate(-45, expand=True)
    left, top = (gradient.width - width) // 2, (gradient.height - height) // 2
    return gradient.crop((left, top, left + width, top + height))


def generate_customer_image(name: str, size: tuple[int, int] = (256, 256)) -> Image.Image:
    """Three-colour diagonal gradient with translucent sine waves stacked towards the bottom."""
    rng = _rng(name)
    colors = _palette(rng)
    start, end = colors[0], colors[-1]

    image = _diagonal_gradient(size, colors).convert("RGBA")

    width, height = size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE
    waves = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(waves)
    count = rng.randint(3, 4)
    for i in range(count):
        baseline = height * (0.45 + 0.5 * i / count)
        amplitude = height * rng.uniform(0.03, 0.08)
        frequency = rng.uniform(0.6, 1.6)
        phase = rng.uniform(0, 2 * math.pi)
        tone = _lerp(start, end, (i + 1) / count)
        light = _lerp(tone, (255, 255, 255), 0.35)
        points = [
            (x, baseline + amplitude * math.sin(2 * math.pi * frequency * x / width + phase))
            for x in range(0, width + 1, SUPERSAMPLE)
        ]
        draw.polygon([*points, (width, height), (0, height)], fill=(*light, 110))

    image.alpha_composite(waves.resize(size, Image.Resampling.LANCZOS))
    return image.convert("RGB")


def generate_product_image(name: str, size: tuple[int, int] = (800, 800)) -> Image.Image:
    """Mesh gradient: blurred blobs of the three palette colours over a light background."""
    rng = _rng(name)
    colors = _palette(rng)
    width, height = size

    image = Image.new("RGB", size, _lerp(colors[0], (255, 255, 255), 0.8))
    draw = ImageDraw.Draw(image)
    for i in range(rng.randint(4, 6)):
        color = colors[i % len(colors)]
        cx, cy = rng.uniform(0, width), rng.uniform(0, height)
        radius = min(size) * rng.uniform(0.25, 0.45)
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)

    return image.filter(ImageFilter.GaussianBlur(min(size) * 0.12))


def to_png(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()
