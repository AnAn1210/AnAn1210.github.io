from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('assets', exist_ok=True)
size=(1200,675)
colors=[('#FFE8D6','#21403b'),('#DFF7E4','#163a2b'),('#FFF7D6','#2b2b18'),('#E8F0FF','#13294b'),('#E8F7FF','#0f3a4a'),('#F0E8FF','#2b1644')]
texts=[('作品 01','打地鼠'),('作品 02','貪食蛇'),('作品 03','工程計算機'),('作品 04','聊天機器人'),('作品 05','ntfy 應用'),('作品 06','雲端記事本')]

# Try to load a TTF; fallback to default
try:
    font_large=ImageFont.truetype('arial.ttf',56)
    font_small=ImageFont.truetype('arial.ttf',36)
except Exception:
    font_large=ImageFont.load_default()
    font_small=ImageFont.load_default()

for i,(bg,fg) in enumerate(colors, start=1):
    img=Image.new('RGBA', size, bg)
    draw=ImageDraw.Draw(img)
    label,sub=texts[i-1]
    draw.text((60,80), label, font=font_large, fill=fg)
    draw.text((60,160), sub, font=font_small, fill=fg)
    out=f'assets/{i}.png'
    img.save(out)
    print('wrote',out)
