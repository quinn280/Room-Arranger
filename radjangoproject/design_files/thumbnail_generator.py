from PIL import Image, ImageDraw
from django.conf import settings
import math
import io
import base64
import os

vectorPath = os.path.join(settings.BASE_DIR, 'static/images/')


def generate_thumbnail(bg_width, bg_height, r_width, r_height, obj_list):
    thumbnail = Image.new('RGBA', (bg_width, bg_height), (242, 243, 243))

    rec_scale = getScaleValue(bg_width, bg_height, r_width, r_height, .2*bg_width, .2*bg_height)
    r_scaled_width = rec_scale * r_width
    r_scaled_height = rec_scale * r_height
    r_x = (bg_width - r_scaled_width) // 2
    r_y = (bg_height - r_scaled_height) // 2

    draw = ImageDraw.Draw(thumbnail)
    draw.rectangle([r_x, r_y, r_x + r_scaled_width, r_y + r_scaled_height], fill=(255, 255, 255), outline=(0, 0, 0), width=3)

    obj_list.sort(key=lambda x: x.z)
    for obj in obj_list:
        tx, ty = get_bounding_top_left(obj.x, obj.y, obj.width, obj.height, obj.rotate)
        obj_img = Image.open(f"{vectorPath}{obj.url}").convert('RGBA').resize((int(rec_scale*obj.width), int(rec_scale*obj.height))).rotate(-1*obj.rotate, resample=Image.BICUBIC, expand=True)
        thumbnail.paste(obj_img, (int(tx*rec_scale + r_x), int(ty*rec_scale + r_y)), obj_img)


    thumbnail_io = io.BytesIO()
    thumbnail.save(thumbnail_io, 'PNG', quality=70)
    thumbnail_io.seek(0)
    thumbnail_b64 = base64.b64encode(thumbnail_io.getvalue())
    return thumbnail_b64


def getScaleValue(bgW, bgH, rW, rH, padX, padY):
    max_zoom_x = (bgW - padX) / rW
    max_zoom_y = (bgH - padY) / rH
    return min(max_zoom_x, max_zoom_y)


def get_bounding_top_left(x, y, w, h, angle):
    angle = math.radians(360-angle)

    dx = w // 2
    dy = h // 2
    cx = x + dx
    cy = y + dy

    x1 = cx + (dx * math.cos(angle)) - (dy * math.sin(angle))
    y1 = cy + (dx * math.sin(angle)) + (dy * math.cos(angle))

    x2 = cx - (dx * math.cos(angle)) - (dy * math.sin(angle))
    y2 = cy - (dx * math.sin(angle)) + (dy * math.cos(angle))

    x3 = cx - (dx * math.cos(angle)) + (dy * math.sin(angle))
    y3 = cy - (dx * math.sin(angle)) - (dy * math.cos(angle))

    x4 = cx + (dx * math.cos(angle)) + (dy * math.sin(angle))
    y4 = cy + (dx * math.sin(angle)) - (dy * math.cos(angle))

    xb = min(x1, x2, x3, x4)
    yb = min(y1, y2, y3, y4)

    return (xb, yb)


