from PIL import Image
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
quality = 85

files = [f for f in os.listdir(ASSETS_DIR) if f.endswith('.png') and f[0] in '123456']
files.sort()
for fn in files:
    path = os.path.join(ASSETS_DIR, fn)
    out = os.path.splitext(path)[0] + '.webp'
    try:
        im = Image.open(path).convert('RGB')
        im.save(out, 'WEBP', quality=quality, method=6)
        print('wrote', out)
    except Exception as e:
        print('error', path, e)
