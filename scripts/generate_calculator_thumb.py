from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', '3.png')
W, H = 1200, 675
BG = (28, 35, 45)
PANEL = (250, 250, 255)
KEY = (200, 205, 210)
KEY_ACC = (100, 140, 200)

im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)

# centered white panel
pad = 120
panel_box = [pad, pad, W-pad, H-pad]
d.rounded_rectangle(panel_box, radius=32, fill=PANEL)

# screen area
screen_box = [panel_box[0]+40, panel_box[1]+40, panel_box[2]-40, panel_box[1]+200]
d.rounded_rectangle(screen_box, radius=12, fill=(20,20,30))
# sample calculation text
try:
    font = ImageFont.truetype('arial.ttf', 48)
except:
    font = ImageFont.load_default()
d.text((screen_box[0]+20, screen_box[1]+40), '12345 × 678 =', font=font, fill=(200,200,220))

# keypad grid
cols = 4
rows = 5
kw = (panel_box[2]-panel_box[0]-80) // cols
kh = 70
start_x = panel_box[0]+40
start_y = screen_box[3]+30
keys = [
    ['7','8','9','÷'],
    ['4','5','6','×'],
    ['1','2','3','−'],
    ['0','.','=', '+'],
    ['C','','','']
]
for r in range(rows):
    for c in range(cols):
        k = keys[r][c]
        x = start_x + c*kw
        y = start_y + r*(kh+18)
        box = [x, y, x+kw-14, y+kh]
        color = KEY_ACC if k in ['=','+','-','×','÷'] else KEY
        d.rounded_rectangle(box, radius=12, fill=color)
        if k:
            try:
                fw, fh = font.getsize(k)
            except Exception:
                fw, fh = d.textbbox((0,0), k, font=font)[2:]
            d.text((x + (kw-14 - fw)/2, y + (kh - fh)/2), k, fill=(20,20,20), font=font)

im.save(OUT)
print('wrote', OUT)
