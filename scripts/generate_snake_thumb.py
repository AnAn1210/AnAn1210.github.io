from PIL import Image, ImageDraw, ImageFilter
import math, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', '2.png')
W, H = 1200, 675
BG1 = (205, 255, 190)
BG2 = (120, 200, 110)

im = Image.new('RGB', (W, H), BG1)
draw = ImageDraw.Draw(im)

# vertical gradient
for y in range(H):
    t = y / (H - 1)
    r = int(BG1[0] * (1-t) + BG2[0] * t)
    g = int(BG1[1] * (1-t) + BG2[1] * t)
    b = int(BG1[2] * (1-t) + BG2[2] * t)
    draw.line([(0,y),(W,y)], fill=(r,g,b))

# snake body as series of circles along a sine curve
center_y = H // 2 + 20
amplitude = 80
period = 800.0
num_segments = 22
max_radius = 96
min_radius = 40
colors = [(40,120,40),(30,100,30)]

for i in range(num_segments):
    t = i / (num_segments - 1)
    x = int(100 + t * (W - 200))
    y = int(center_y + math.sin(t * 2 * math.pi * (W/period)) * amplitude * (1 - (t-0.5)**2*2))
    radius = int(max_radius * (1 - t*0.8) + min_radius * t*0.2)
    color = colors[i % 2]
    bbox = [x-radius, y-radius, x+radius, y+radius]
    draw.ellipse(bbox, fill=color)
    # darker border
    outline = (max(color[0]-20,0), max(color[1]-20,0), max(color[2]-20,0))
    draw.ellipse([bbox[0]+4,bbox[1]+4,bbox[2]-4,bbox[3]-4], outline=outline)

# head: place at first segment (left)
head_x = int(100 + 0 * (W - 200))
head_y = int(center_y)
head_radius = int(max_radius * 1.05)
draw.ellipse([head_x-head_radius, head_y-head_radius, head_x+head_radius, head_y+head_radius], fill=(50,150,50))
# eye
eye_x = head_x + head_radius//3
eye_y = head_y - head_radius//4
draw.ellipse([eye_x-10,eye_y-10,eye_x+10,eye_y+10], fill=(255,255,255))
draw.ellipse([eye_x-4,eye_y-4,eye_x+4,eye_y+4], fill=(0,0,0))
# tongue
tongue = [(head_x+head_radius-8, head_y), (head_x+head_radius+30, head_y-10), (head_x+head_radius+30, head_y+10)]
draw.polygon(tongue, fill=(200,20,60))

# finalize: ensure RGB and save
final = im.convert('RGB')
final.save(OUT)
print('wrote', OUT)
