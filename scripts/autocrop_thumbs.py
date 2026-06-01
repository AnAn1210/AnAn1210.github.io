from PIL import Image
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
TARGET_W, TARGET_H = 1200, 675
TARGET_RATIO = TARGET_W / TARGET_H
THRESH = 18
PADDING = 1.15


def most_common_color(samples):
    counts = {}
    for c in samples:
        counts[c] = counts.get(c, 0) + 1
    return max(counts.items(), key=lambda x: x[1])[0]


def find_content_bbox(img, bg_color, thresh=THRESH):
    w, h = img.size
    px = img.load()
    minx, miny = w, h
    maxx, maxy = 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if abs(r - bg_color[0]) > thresh or abs(g - bg_color[1]) > thresh or abs(b - bg_color[2]) > thresh:
                found = True
                if x < minx: minx = x
                if y < miny: miny = y
                if x > maxx: maxx = x
                if y > maxy: maxy = y
    if not found:
        return None
    return (minx, miny, maxx + 1, maxy + 1)


def expand_to_ratio(box, img_size, target_ratio, padding=PADDING):
    w_img, h_img = img_size
    minx, miny, maxx, maxy = box
    bw = maxx - minx
    bh = maxy - miny
    cx = minx + bw / 2
    cy = miny + bh / 2

    # expand with padding
    bw *= padding
    bh *= padding

    # adjust to target ratio
    if bw / bh > target_ratio:
        # too wide -> increase height
        bh = bw / target_ratio
    else:
        bw = bh * target_ratio

    left = int(max(0, cx - bw / 2))
    top = int(max(0, cy - bh / 2))
    right = int(min(w_img, left + bw))
    bottom = int(min(h_img, top + bh))

    # if clipped at edge, shift to fill target size
    if right - left < bw:
        left = max(0, int(right - bw))
    if bottom - top < bh:
        top = max(0, int(bottom - bh))

    return (left, top, int(left + bw), int(top + bh))


def center_crop_box(img_size, target_ratio):
    w, h = img_size
    if w / h > target_ratio:
        crop_h = h
        crop_w = int(h * target_ratio)
    else:
        crop_w = w
        crop_h = int(w / target_ratio)
    left = (w - crop_w) // 2
    top = (h - crop_h) // 2
    return (left, top, left + crop_w, top + crop_h)


def process_file(path):
    try:
        img = Image.open(path).convert('RGBA')
        w, h = img.size
        # sample corners for bg color
        samples = [img.getpixel((0,0)), img.getpixel((w-1,0)), img.getpixel((0,h-1)), img.getpixel((w-1,h-1))]
        bg = most_common_color(samples)[:3]
        bbox = find_content_bbox(img, bg)
        if bbox:
            box = expand_to_ratio(bbox, (w, h), TARGET_RATIO)
        else:
            box = center_crop_box((w, h), TARGET_RATIO)
        cropped = img.crop(box).resize((TARGET_W, TARGET_H), Image.LANCZOS)
        cropped.save(path, optimize=True)
        print('wrote', path)
    except Exception as e:
        print('error', path, e)


if __name__ == '__main__':
    assets = [f for f in os.listdir(ASSETS_DIR) if f.endswith('.png') and f[0] in '123456']
    assets.sort()
    for fn in assets:
        process_file(os.path.join(ASSETS_DIR, fn))
