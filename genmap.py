import argparse
import itertools
import json


parser = argparse.ArgumentParser()

parser.add_argument("-W", "--width", type=int, default=10)
parser.add_argument("-H", "--height", type=int, default=10)
parser.add_argument("-L", "--layout", type=str, default="odd-r")
parser.add_argument("-o", "--out", type=str, default=None)

args = parser.parse_args()

hexes = list(itertools.product(range(args.width), range(args.height)))

def getimage(n):
    return "/Users/jhollocombe/Documents/hexmap/tex_Water.jpg" if n % 2 == 0 else "/Users/jhollocombe/Documents/hexmap/beach_sand.png"

hexmap = dict(
    layout=args.layout,
    hexes={"hex" + str(i): dict(q=q, r=r, image=getimage(i)) for i, (q, r) in enumerate(hexes)}
)

json_hexmap = json.dumps(hexmap, indent=2)

if args.out:
    with open(args.out, "w") as file:
        print(json_hexmap, file=file)
else:
    print(json_hexmap)
