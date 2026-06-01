from PIL import Image, ImageDraw
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
TARGET = os.path.join(ASSETS_DIR, '1.png')

if not os.path.exists(TARGET):
    print('target missing', TARGET)
    raise SystemExit(1)

img = Image.open(TARGET).convert('RGBA')
w,h = img.size

# mouse badge size relative
badge_w = int(w * 0.32)
badge_h = int(h * 0.32)
if badge_h > badge_w:
    badge_h = badge_w
else:
    badge_w = badge_h

badge = Image.new('RGBA', (badge_w, badge_h), (0,0,0,0))
d = ImageDraw.Draw(badge)

# draw rounded rectangle background (light)
corner = int(badge_h * 0.18)
d.rounded_rectangle((0,0,badge_w,badge_h), radius=corner, fill=(255,235,226,255))

# center circle face
cx = badge_w // 2
cy = int(badge_h * 0.52)
face_r = int(badge_w * 0.28)
d.ellipse((cx-face_r, cy-face_r, cx+face_r, cy+face_r), fill=(126,85,60,255))

# ears
ear_r = int(face_r * 0.6)
d.ellipse((cx-face_r-ear_r//2, cy-face_r-ear_r//2, cx-face_r+ear_r//2, cy-face_r+ear_r//2), fill=(126,85,60,255))
d.ellipse((cx+face_r-ear_r//2, cy-face_r-ear_r//2, cx+face_r+ear_r//2, cy-face_r+ear_r//2), fill=(126,85,60,255))

# eyes
eye_r = max(2, int(face_r*0.12))
d.ellipse((cx-eye_r-14, cy-eye_r-6, cx+eye_r-14, cy+eye_r-6), fill=(28,48,40,255))
d.ellipse((cx-eye_r+14, cy-eye_r-6, cx+eye_r+14, cy+eye_r-6), fill=(28,48,40,255))

# nose
nose_r = max(2, int(face_r*0.14))
d.ellipse((cx-nose_r, cy+nose_r-4, cx+nose_r, cy+nose_r+4), fill=(28,48,40,255))

# smile
d.arc((cx-face_r//2, cy, cx+face_r//2, cy+face_r//2), start=200, end=340, fill=(20,30,24,255), width=max(2,int(face_r*0.06)))

# paste badge onto image (inside white panel area)
# find panel padding used earlier: script used PANEL_PADDING = 36
pad = int(w * 0.03) if w>800 else 36
x = pad + 18
y = pad + 18

img.paste(badge, (x,y), badge)

img.convert('RGB').save(TARGET, quality=90, optimize=True)
print('wrote', TARGET)
