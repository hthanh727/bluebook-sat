import fitz
import os
from PIL import Image, ImageChops

def autocrop(im, bgcolor=(255, 255, 255), padding=12):
    bg = Image.new(im.mode, im.size, bgcolor)
    diff = ImageChops.difference(im, bg)
    bbox = diff.getbbox()
    if bbox:
        w, h = im.size
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(w, bbox[2] + padding)
        bottom = min(h, bbox[3] + padding)
        return im.crop((left, top, right, bottom))
    return im

def crop_and_save(doc, page_idx, rect, out_path, zoom=3.0):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    page = doc[page_idx]
    mat = fitz.Matrix(zoom, zoom)
    clip_rect = fitz.Rect(*rect) if rect else None
    pix = page.get_pixmap(matrix=mat, clip=clip_rect)
    pix.save(out_path)
    with Image.open(out_path) as im:
        cropped = autocrop(im.convert("RGB"))
        cropped.save(out_path, format="PNG", optimize=True)
    print(f"Saved: {out_path} ({cropped.width}x{cropped.height})")

print("Cropper module ready.")
