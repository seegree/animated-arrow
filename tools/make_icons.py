#!/usr/bin/env python3
"""Render the Animated Arrow tile icons and splice them into AnimatedArrow.jsx.

Stdlib only (struct + zlib; the rasterizer is a supersampled point-in-shape
test). The glyph geometry below is the approved HTML mock's SVG geometry, so
what was approved is what ships.

Usage:
    python3 tools/make_icons.py [--sheet PATH]

Each tile is rendered in two whole-tile states (off/on: background, border,
and glyph baked together) and written between the marker comments
/*__ICON_DATA_BEGIN__*/ ... /*__ICON_DATA_END__*/ in AnimatedArrow.jsx as
ICON_PNG["<name>_off"] / ICON_PNG["<name>_on"] binary-string assignments.
--sheet also renders a 4x-scaled contact sheet of every tile in both states
for visual verification before shipping.
"""
import math
import os
import struct
import sys
import zlib

TILE_W = 26
TILE_H = 24
SS = 4  # supersamples per pixel axis
GLYPH_STROKE = 1.6
SHEET_SCALE = 4
SHEET_PAD = 8
SHEET_BG = (29, 29, 29)

# Both states share one palette table so they cannot drift apart.
PALETTE = {
    "off": {"bg": (38, 38, 38), "border": (56, 56, 56), "glyph": (154, 154, 154)},
    "on": {"bg": (57, 81, 107), "border": (95, 141, 184), "glyph": (255, 255, 255)},
}


def bezier_points(p0, c1, c2, p1, steps=24):
    points = []
    for i in range(steps + 1):
        t = i / steps
        u = 1.0 - t
        points.append((
            u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
            u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
        ))
    return points


def line(p1, p2):
    return ("stroke", [p1, p2])


def curve(p0, c1, c2, p1):
    return ("stroke", bezier_points(p0, c1, c2, p1))


def poly(points):
    return ("poly", points)


def circle(center, radius):
    return ("circle", center, radius)


# Tile-space coordinates (26x24), taken from the approved mock's SVGs.
GLYPHS = [
    ("style_triangle", [line((4, 12), (13, 12)),
                        poly([(13, 6.5), (22, 12), (13, 17.5)])]),
    ("style_circle", [line((4, 12), (13, 12)),
                      circle((17.5, 12), 4.5)]),
    ("style_chevron", [line((4, 12), (12, 12)),
                       poly([(13, 6.5), (22, 12), (13, 17.5), (16, 12)])]),
    ("style_diamond", [line((4, 12), (13, 12)),
                       poly([(13, 12), (17.5, 7.5), (22, 12), (17.5, 16.5)])]),
    ("at_end", [line((5, 12), (15, 12)),
                poly([(15, 7.5), (22, 12), (15, 16.5)])]),
    ("at_start", [poly([(11, 7.5), (4, 12), (11, 16.5)]),
                  line((11, 12), (21, 12))]),
    ("ease_linear", [line((6.5, 17.5), (19.5, 6.5))]),
    ("ease_easy", [curve((6.5, 17.5), (13, 17.5), (13, 6.5), (19.5, 6.5))]),
    ("ease_in", [curve((6.5, 17.5), (10, 13.5), (12, 6.5), (19.5, 6.5))]),
    ("ease_out", [curve((6.5, 17.5), (14, 17.5), (16, 10.5), (19.5, 6.5))]),
]


def segment_distance(x, y, a, b):
    ax, ay = a
    bx, by = b
    dx = bx - ax
    dy = by - ay
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        return math.hypot(x - ax, y - ay)
    t = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / length_sq))
    return math.hypot(x - (ax + t * dx), y - (ay + t * dy))


def shape_hit(shape, x, y):
    kind = shape[0]
    if kind == "stroke":
        points = shape[1]
        half = GLYPH_STROKE / 2.0
        for i in range(len(points) - 1):
            if segment_distance(x, y, points[i], points[i + 1]) <= half:
                return True
        return False
    if kind == "poly":
        points = shape[1]
        inside = False
        count = len(points)
        for i in range(count):
            x1, y1 = points[i]
            x2, y2 = points[(i + 1) % count]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                inside = not inside
        return inside
    if kind == "circle":
        (cx, cy), radius = shape[1], shape[2]
        return (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius
    raise ValueError(kind)


def rounded_rect_hit(x, y, rx, ry, rw, rh, radius):
    if x < rx or x > rx + rw or y < ry or y > ry + rh:
        return False
    qx = min(max(x, rx + radius), rx + rw - radius)
    qy = min(max(y, ry + radius), ry + rh - radius)
    dx = x - qx
    dy = y - qy
    return dx * dx + dy * dy <= radius * radius


def render_tile(layers, state):
    colors = PALETTE[state]
    rows = []
    samples = SS * SS
    for py in range(TILE_H):
        row = []
        for px in range(TILE_W):
            hit_count = 0
            r_sum = g_sum = b_sum = 0
            for sy in range(SS):
                for sx in range(SS):
                    x = px + (sx + 0.5) / SS
                    y = py + (sy + 0.5) / SS
                    color = None
                    if rounded_rect_hit(x, y, 0, 0, TILE_W, TILE_H, 3.5):
                        color = colors["border"]
                    if rounded_rect_hit(x, y, 1, 1, TILE_W - 2, TILE_H - 2, 2.5):
                        color = colors["bg"]
                    for shape in layers:
                        if shape_hit(shape, x, y):
                            color = colors["glyph"]
                            break
                    if color is not None:
                        hit_count += 1
                        r_sum += color[0]
                        g_sum += color[1]
                        b_sum += color[2]
            if hit_count == 0:
                row.append((0, 0, 0, 0))
            else:
                row.append((
                    round(r_sum / hit_count),
                    round(g_sum / hit_count),
                    round(b_sum / hit_count),
                    round(255 * hit_count / samples),
                ))
        rows.append(row)
    return rows


def png_bytes(rows):
    width = len(rows[0])
    height = len(rows)
    raw = b"".join(
        b"\x00" + bytes(value for pixel in row for value in pixel)
        for row in rows
    )

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data)))

    return (b"\x89PNG\r\n\x1a\n" +
            chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)) +
            chunk(b"IDAT", zlib.compress(raw, 9)) +
            chunk(b"IEND", b""))


def js_escape(data):
    out = []
    for byte in data:
        if byte == 0x5C:
            out.append("\\\\")
        elif byte == 0x22:
            out.append('\\"')
        elif 32 <= byte <= 126:
            out.append(chr(byte))
        else:
            out.append("\\x%02X" % byte)
    return "".join(out)


def splice(jsx_path, block):
    begin = "/*__ICON_DATA_BEGIN__*/"
    end = "/*__ICON_DATA_END__*/"
    with open(jsx_path, "r", encoding="utf-8") as handle:
        text = handle.read()
    begin_at = text.index(begin) + len(begin)
    end_at = text.index(end)
    new_text = text[:begin_at] + "\n" + block + "    " + text[end_at:]
    with open(jsx_path, "w", encoding="utf-8") as handle:
        handle.write(new_text)


def write_sheet(path, tiles):
    """tiles: list of (rows_off, rows_on) in GLYPHS order; 4x nearest upscale."""
    scale = SHEET_SCALE
    pad = SHEET_PAD
    cols = len(tiles)
    sheet_w = pad + cols * (TILE_W * scale + pad)
    sheet_h = pad + 2 * (TILE_H * scale + pad)
    rows = [[SHEET_BG + (255,)] * sheet_w for _ in range(sheet_h)]
    for col, states in enumerate(tiles):
        for state_index, tile in enumerate(states):
            ox = pad + col * (TILE_W * scale + pad)
            oy = pad + state_index * (TILE_H * scale + pad)
            for ty in range(TILE_H * scale):
                for tx in range(TILE_W * scale):
                    r, g, b, a = tile[ty // scale][tx // scale]
                    if a == 0:
                        continue
                    if a == 255:
                        rows[oy + ty][ox + tx] = (r, g, b, 255)
                    else:
                        br, bg_, bb, _ = rows[oy + ty][ox + tx]
                        f = a / 255.0
                        rows[oy + ty][ox + tx] = (
                            round(r * f + br * (1 - f)),
                            round(g * f + bg_ * (1 - f)),
                            round(b * f + bb * (1 - f)),
                            255,
                        )
    with open(path, "wb") as handle:
        handle.write(png_bytes(rows))


def main(argv):
    sheet_path = None
    if "--sheet" in argv:
        sheet_path = argv[argv.index("--sheet") + 1]

    jsx_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "..", "AnimatedArrow.jsx")
    lines = []
    sheet_tiles = []
    for name, layers in GLYPHS:
        rendered = []
        for state in ("off", "on"):
            rows = render_tile(layers, state)
            rendered.append(rows)
            lines.append('    ICON_PNG["%s_%s"] = "%s";\n'
                         % (name, state, js_escape(png_bytes(rows))))
        sheet_tiles.append(rendered)

    splice(jsx_path, "".join(lines))
    print("Spliced %d icons into %s" % (2 * len(GLYPHS), os.path.normpath(jsx_path)))

    if sheet_path is not None:
        write_sheet(sheet_path, sheet_tiles)
        print("Wrote contact sheet to %s" % sheet_path)


if __name__ == "__main__":
    main(sys.argv[1:])
