import svgwrite
import svgwrite.shapes
import svgwrite.image
import svgwrite.pattern
from svgwrite import cm, mm
import json
import math


with open('test.json') as file:
    data = json.load(file)


def hex_coords(x=1, y=1):
    R = 50
    r = math.sqrt(3) / 2 * R
    x = (2 * r) * x + r + (y % 2) * r
    y = (1.5 * R) * y + R
    return [(int(x), int(y)) for (x, y) in [
        (x + 0, y + R),
        (x + r, y + R/2),
        (x + r, y - R/2),
        (x + 0, y - R),
        (x - r, y - R/2),
        (x - r, y + R/2),
    ]]

def draw(name):
    dwg = svgwrite.Drawing(filename=name, debug=True)

    images = set(v['image'] for v in data['hexes'].values())
    image_map = {}

    # <pattern id="pattern1" height="100%" width="100%" patternContentUnits="objectBoundingBox">
    #   <image height="1" width="1" preserveAspectRatio="none" xlink:href="file:///Users/jhollocombe/Documents/hexmap/tex_Water.jpg" />
    # </pattern>

    n = 1
    for image in images:
        pattern = svgwrite.pattern.Pattern(size=("100%", "100%"))
        pattern["id"] = "pattern" + str(n)
        pattern["patternContentUnits"] = "objectBoundingBox"

        img = svgwrite.image.Image(image, size=(1, 1))
        img.stretch()

        pattern.add(img)

        dwg.defs.add(pattern)
        image_map[image] = pattern["id"]
        n += 1

    for v in data['hexes'].values():
        hex = svgwrite.shapes.Polygon(points=hex_coords(v['q'], v['r']))
        hex["style"] = "stroke: #999DA3;"
        hex["fill"] = "url(#%s)" % image_map[v['image']]
        dwg.add(hex)

    dwg.save(pretty=True)


if __name__ == '__main__':
    draw('test.svg')
