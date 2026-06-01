from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', '5.png')
W, H = 1200, 675

# sky gradient
top = (180, 220, 255)
bottom = (240, 250, 255)
img = Image.new('RGB', (W, H), top)
d = ImageDraw.Draw(img)
for y in range(H):
    t = y / (H-1)
    r = int(top[0]*(1-t) + bottom[0]*t)
    g = int(top[1]*(1-t) + bottom[1]*t)
    b = int(top[2]*(1-t) + bottom[2]*t)
    d.line([(0,y),(W,y)], fill=(r,g,b))

# draw clouds (multiple layered ellipses)
import random
random.seed(42)
cloud_centers = [(300,200),(520,180),(850,220),(420,320),(720,300)]
for cx, cy in cloud_centers:
    w = 380 if cx<600 else 320
    h = 160
    # layered smaller ellipses
    offsets = [(-140,0),(-60,-20),(0,0),(80,-10),(150,10)]
    for ox, oy in offsets:
        bbox = [cx + ox - w//4, cy + oy - h//4, cx + ox + w//4, cy + oy + h//4]
        d.ellipse(bbox, fill=(255,255,255))

# chat bubble icon in center-right
bubble_x = 900
bubble_y = 420
bw, bh = 260, 160
d.rounded_rectangle([bubble_x-bw//2, bubble_y-bh//2, bubble_x+bw//2, bubble_y+bh//2], radius=40, fill=(255,255,255))
# tail
tail = [(bubble_x-20, bubble_y+bh//2-10),(bubble_x-60, bubble_y+bh//2+40),(bubble_x-10, bubble_y+bh//2-6)]
d.polygon(tail, fill=(255,255,255))
# small text dots
d.ellipse([bubble_x-40, bubble_y-10, bubble_x-20, bubble_y+10], fill=(200,220,240))
d.ellipse([bubble_x-10, bubble_y-10, bubble_x+10, bubble_y+10], fill=(200,220,240))
d.ellipse([bubble_x+20, bubble_y-10, bubble_x+40, bubble_y+10], fill=(200,220,240))

img.save(OUT)
print('wrote', OUT)
