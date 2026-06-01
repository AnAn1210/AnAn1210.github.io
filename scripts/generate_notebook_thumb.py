from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', '6.png')
W, H = 1200, 675
BG = (245, 245, 250)

im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)

# notebook panel
pad = 120
panel = [pad, pad, W - pad, H - pad]
d.rounded_rectangle(panel, radius=28, fill=(255,255,255))

# spiral binding (rectangles along left)
bx = panel[0]
for i in range(10):
    y = panel[1] + 30 + i * ((panel[3]-panel[1]-60)//9)
    d.rectangle([bx-24, y-12, bx-6, y+12], fill=(200,200,200))

# ruled lines
line_x1 = panel[0] + 30
line_x2 = panel[2] - 30
for i in range(8):
    y = panel[1] + 60 + i*70
    d.line([(line_x1, y), (line_x2, y)], fill=(230,230,240), width=3)

# header title box
try:
    font_h = ImageFont.truetype('arial.ttf', 40)
    font = ImageFont.truetype('arial.ttf', 36)
except:
    font_h = ImageFont.load_default()
    font = ImageFont.load_default()
label = '雲端記事本'
try:
    fw, fh = font_h.getsize(label)
except Exception:
    bbox = d.textbbox((0,0), label, font=font_h)
    fw, fh = bbox[2]-bbox[0], bbox[3]-bbox[1]
d.text((panel[0] + 60, panel[1] + 24), label, fill=(40,40,50), font=font_h)

# pencil icon on bottom-right
px = panel[2] - 120
py = panel[3] - 120
# pencil body
d.polygon([(px, py), (px+120, py-40), (px+140, py-20), (px+20, py+20)], fill=(240,200,80))
# tip
d.polygon([(px+120, py-40), (px+140, py-20), (px+110, py-10)], fill=(60,60,60))
# lead
d.rectangle([px+80, py-10, px+100, py+10], fill=(30,30,30))

im.save(OUT)
print('wrote', OUT)
