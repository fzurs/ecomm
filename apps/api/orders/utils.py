import hashlib
import random

from PIL import Image


def generate_gradient(name: str, size=(100, 100)) -> Image.Image:
    seed = int(hashlib.sha256(name.encode()).hexdigest(), 16)
    rng = random.Random(seed)

    color1 = tuple(rng.randint(0, 255) for _ in range(3))
    color2 = tuple(rng.randint(0, 255) for _ in range(3))

    width, height = size
    image = Image.new("RGB", size)

    for x in range(width):
        t = x / (width - 1)

        color = tuple(int(color1[i] * (1 - t) + color2[i] * t) for i in range(3))

        for y in range(height):
            image.putpixel((x, y), color)

    return image
