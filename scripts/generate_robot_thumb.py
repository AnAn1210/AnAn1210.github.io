from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', '4.png')
W, H = 1200, 675
BG1 = (230, 240, 255)
BG2 = (200, 220, 255)

im = Image.new('RGB', (W, H), BG1)
d = ImageDraw.Draw(im)
# vertical gradient
for y in range(H):
    t = y / (H - 1)
    r = int(BG1[0] * (1-t) + BG2[0] * t)
    g = int(BG1[1] * (1-t) + BG2[1] * t)
    b = int(BG1[2] * (1-t) + BG2[2] * t)
    d.line([(0,y),(W,y)], fill=(r,g,b))

# robot body: centered rounded square
body_w, body_h = 640, 420
bx = (W - body_w) // 2
by = (H - body_h) // 2
d.rounded_rectangle([bx,by,bx+body_w,by+body_h], radius=40, fill=(60,80,120))

# face panel
face_box = [bx+40, by+40, bx+body_w-40, by+220]
d.rounded_rectangle(face_box, radius=18, fill=(220,230,245))

# eyes
eye_radius = 28
eye_y = face_box[1] + 60
left_x = face_box[0] + 120
right_x = face_box[2] - 120
d.ellipse([left_x-eye_radius, eye_y-eye_radius, left_x+eye_radius, eye_y+eye_radius], fill=(20,20,30))
d.ellipse([right_x-eye_radius, eye_y-eye_radius, right_x+eye_radius, eye_y+eye_radius], fill=(20,20,30))
# shine
d.ellipse([left_x-eye_radius+8, eye_y-eye_radius+8, left_x-eye_radius+18, eye_y-eye_radius+18], fill=(255,255,255))

# mouth: LED bar
m_x1 = face_box[0]+140
m_x2 = face_box[2]-140
m_y = face_box[3]-50
d.rectangle([m_x1, m_y-8, m_x2, m_y+8], fill=(30,200,130))

# antenna
ant_x = bx + body_w//2
d.line([(ant_x, by), (ant_x, by-60)], fill=(40,40,40), width=8)
d.ellipse([ant_x-18, by-86, ant_x+18, by-50], fill=(200,60,80))

# small details: bolts
for i in range(3):
    x = bx + 40 + i*100
    y = by + body_h - 40
    d.ellipse([x-10,y-10,x+10,y+10], fill=(30,40,60))

# label text
try:
    font = ImageFont.truetype('arial.ttf', 36)
except:
    font = ImageFont.load_default()
label = 'Gemini 聊天機器人'
try:
    fw, fh = font.getsize(label)
except Exception:
    bbox = d.textbbox((0,0), label, font=font)
    fw, fh = bbox[2]-bbox[0], bbox[3]-bbox[1]
d.text((W//2 - fw//2, by + body_h - 80), label, fill=(235,235,240), font=font)

im.save(OUT)
print('wrote', OUT)
