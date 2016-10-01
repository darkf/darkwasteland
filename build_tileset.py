import json, os
from PIL import Image

TILE_SIZE = 16

def dump_tileset(tileset, num_tiles):
    base_path = "data/tilesets/%s/" % str(tileset).zfill(3)
    tileset_img = Image.new("RGB", (TILE_SIZE*num_tiles, TILE_SIZE))

    for n in range(num_tiles):
        img = Image.open(base_path + str(n).zfill(3) + ".png")
        tileset_img.paste(img, (n*TILE_SIZE, 0))

    tileset_img.save("data/tilesets/%d.png" % tileset)

def main():
    with open("data/tilesets/tilesets.json", "r") as fp:
        tileset_lengths = json.load(fp)

    print(tileset_lengths)

    for tileset, num_tiles in enumerate(tileset_lengths):
        print("Dumping tileset %d..." % tileset)
        dump_tileset(tileset, num_tiles)

if __name__ == "__main__":
    main()