from PIL import Image, ImageDraw, ImageFilter
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
OUT = os.path.join(ASSETS_DIR, '1.png')
W,H = 1200,675

bg_color = (250,237,229)  # soft peach
panel_radius = 40
panel_padding = 36

img = Image.new('RGBA', (W,H), bg_color)
d = ImageDraw.Draw(img)

# Draw large rounded white panel occupying most of image
panel_box = (panel_padding, panel_padding, W-panel_padding, H-panel_padding)
mask = Image.new('L', (W,H), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle(panel_box, radius=panel_radius, fill=255)
white_panel = Image.new('RGBA', (W,H), (255,255,255,255))
img = Image.composite(white_panel, img, mask)

# Draw big mouse square in top-left corner like your sample
# square size relative
sq_w = int((W - panel_padding*2) * 0.38)
sq_h = sq_w
sq_x = panel_box[0] + 28
sq_y = panel_box[1] + 28

# rounded square bg for mouse
draw = ImageDraw.Draw(img)
draw.rounded_rectangle((sq_x, sq_y, sq_x+sq_w, sq_y+sq_h), radius=24, fill=(255,244,240))

# draw mouse face centered in that square
cx = sq_x + sq_w//2
cy = sq_y + sq_h//2 + 8
face_r = int(sq_w * 0.36)

# face
draw.ellipse((cx-face_r, cy-face_r, cx+face_r, cy+face_r), fill=(126,85,60))
# ears
ear_r = int(face_r*0.6)
draw.ellipse((cx-face_r-ear_r//2, cy-face_r-ear_r//2, cx-face_r+ear_r//2, cy-face_r+ear_r//2), fill=(126,85,60))
draw.ellipse((cx+face_r-ear_r//2, cy-face_r-ear_r//2, cx+face_r+ear_r//2, cy-face_r+ear_r//2), fill=(126,85,60))
# eyes
eye_r = max(6, int(face_r*0.12))
draw.ellipse((cx-eye_r-40, cy-eye_r-10, cx+eye_r-40, cy+eye_r-10), fill=(28,48,40))
draw.ellipse((cx-eye_r+40, cy-eye_r-10, cx+eye_r+40, cy+eye_r-10), fill=(28,48,40))
# nose
nose_r = max(6, int(face_r*0.14))
draw.ellipse((cx-nose_r, cy+nose_r-6, cx+nose_r, cy+nose_r+6), fill=(28,48,40))
# whiskers
wx = int(face_r*0.7)
wy = cy + int(face_r*0.05)
draw.line((cx-8, wy, cx-48, wy-6), fill=(28,48,40), width=4)
draw.line((cx-8, wy+8, cx-48, wy+14), fill=(28,48,40), width=4)
draw.line((cx+8, wy, cx+48, wy-6), fill=(28,48,40), width=4)
draw.line((cx+8, wy+8, cx+48, wy+14), fill=(28,48,40), width=4)

# subtle shadow under square
shadow = Image.new('RGBA', (W,H), (0,0,0,0))
sd = ImageDraw.Draw(shadow)
sd.rounded_rectangle((sq_x, sq_y, sq_x+sq_w, sq_y+sq_h), radius=24, fill=(0,0,0,120))
shadow = shadow.filter(ImageFilter.GaussianBlur(18))
img = Image.alpha_composite(shadow, img)

# Save
img.convert('RGB').save(OUT, quality=90, optimize=True)
print('wrote', OUT)
