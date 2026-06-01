from PIL import Image, ImageDraw, ImageFilter
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
TARGET_W, TARGET_H = 1200, 675
PANEL_PADDING = 36
INNER_PADDING = 12
PANEL_RADIUS = 24
SHADOW_BLUR = 24
SHADOW_OFFSET = (0,12)


def rounded_rect(draw, box, radius, fill):
    left, top, right, bottom = box
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def process(path):
    img = Image.open(path).convert('RGBA')
    w, h = img.size
    base = Image.new('RGBA', (w, h), (0,0,0,0))

    panel_box = (PANEL_PADDING, PANEL_PADDING, w - PANEL_PADDING, h - PANEL_PADDING)

    # shadow layer
    shadow = Image.new('RGBA', (w, h), (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(panel_box, radius=PANEL_RADIUS, fill=(0,0,0,180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=SHADOW_BLUR))
    # paste shadow slightly offset
    base.alpha_composite(shadow, dest=SHADOW_OFFSET)

    # white panel
    panel = Image.new('RGBA', (w, h), (0,0,0,0))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle(panel_box, radius=PANEL_RADIUS, fill=(255,255,255,255))
    base = Image.alpha_composite(base, panel)

    # compute inner area for the thumbnail image
    inner_box = (panel_box[0] + INNER_PADDING, panel_box[1] + INNER_PADDING, panel_box[2] - INNER_PADDING, panel_box[3] - INNER_PADDING)
    inner_w = inner_box[2] - inner_box[0]
    inner_h = inner_box[3] - inner_box[1]

    # resize original to fit inner area
    img_ratio = img.width / img.height
    inner_ratio = inner_w / inner_h
    if img_ratio > inner_ratio:
        # fit width
        new_w = inner_w
        new_h = int(new_w / img_ratio)
    else:
        new_h = inner_h
        new_w = int(new_h * img_ratio)
    resized = img.resize((new_w, new_h), Image.LANCZOS)

    # create rounded mask for thumbnail
    mask = Image.new('L', (new_w, new_h), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0,0,new_w,new_h), radius=max(12, int(PANEL_RADIUS*0.6)), fill=255)

    paste_x = inner_box[0] + (inner_w - new_w)//2
    paste_y = inner_box[1] + (inner_h - new_h)//2

    # paste resized thumbnail into the white panel using rounded mask
    base.paste(resized, (paste_x, paste_y), mask)
    final = base

    # convert to RGB and save
    out = final.convert('RGB')
    out.save(path, quality=90, optimize=True)
    print('wrote', path)


if __name__ == '__main__':
    files = [f for f in os.listdir(ASSETS_DIR) if f.endswith('.png') and f[0] in '123456']
    files.sort()
    for f in files:
        process(os.path.join(ASSETS_DIR, f))
