from PIL import Image, ImageDraw, ImageFont
import os, math

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', '1.png')
W, H = 1200, 675
BG = (140, 200, 120)

im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)

# draw grass texture (subtle lines)
for y in range(0, H, 6):
    d.line([(0,y),(W,y)], fill=(120,180,100,40))

# draw holes
hole_centers = [(220,420),(420,360),(620,440),(820,380),(1020,420)]
hole_radius = 70
for cx, cy in hole_centers:
    d.ellipse([cx-hole_radius, cy-hole_radius, cx+hole_radius, cy+hole_radius], fill=(30,20,10))
    # inner rim
    d.ellipse([cx-hole_radius+8, cy-hole_radius+8, cx+hole_radius-8, cy+hole_radius-8], fill=(20,12,6))

# moles popping (use simple circles with ears)
mole_color = (160,100,60)
eye_color = (0,0,0)
pop_offsets = [(-10,-40),(20,-20),(0,-50),(-15,-30),(10,-35)]
for (cx,cy), off in zip(hole_centers, pop_offsets):
    mx, my = cx+off[0], cy+off[1]
    # head
    d.ellipse([mx-48,my-48,mx+48,my+48], fill=mole_color)
    # ears
    d.ellipse([mx-60,my-60,mx-36,my-36], fill=mole_color)
    d.ellipse([mx+36,my-60,mx+60,my-36], fill=mole_color)
    # eyes
    d.ellipse([mx-16,my-8,mx-6,my+2], fill=eye_color)
    d.ellipse([mx+6,my-8,mx+16,my+2], fill=eye_color)
    # nose
    d.ellipse([mx-4,my+10,mx+4,my+18], fill=(180,40,60))

# hammer hitting one mole (rightmost)
hx, hy = hole_centers[3][0]+140, hole_centers[3][1]-90
# handle
d.rectangle([hx-6, hy, hx+6, hy+140], fill=(90,50,30))
# head
d.rectangle([hx-60, hy-30, hx+40, hy+10], fill=(180,30,30))

# title label
try:
    font = ImageFont.truetype('arial.ttf', 54)
except:
    font = ImageFont.load_default()
label = '打地鼠'
try:
    fw, fh = font.getsize(label)
except Exception:
    bbox = d.textbbox((0,0), label, font=font)
    fw, fh = bbox[2]-bbox[0], bbox[3]-bbox[1]
# place top-left
d.rectangle([40,40,40+fw+28,40+fh+20], fill=(255,255,255))
d.text((54,52), label, fill=(30,30,30), font=font)

im.save(OUT)
print('wrote', OUT)
