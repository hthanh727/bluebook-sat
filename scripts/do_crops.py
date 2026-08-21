import fitz
import os
from PIL import Image, ImageChops

pdf_path = r"C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/43ae57ff-e1ae-42be-9bfd-7ce444e9faef/.user_uploaded/media_1787336674261.pdf"
output_dir = r"c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/public/images"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
zoom = 4.0
mat = fitz.Matrix(zoom, zoom)

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

def crop_and_save(page_idx, rect, filename):
    page = doc[page_idx]
    pix = page.get_pixmap(matrix=mat, clip=fitz.Rect(*rect))
    out_path = os.path.join(output_dir, filename)
    pix.save(out_path)
    
    with Image.open(out_path) as im:
        cropped = autocrop(im.convert("RGB"))
        cropped.save(out_path, format="PNG", optimize=True)
        print(f"Saved {filename} ({cropped.width}x{cropped.height})")

# Q1 (Page 1): Graph in prompt
crop_and_save(0, (20, 160, 180, 255), "adv_math_med_q1.png")

# Q15 (Page 15): Graph in prompt
crop_and_save(14, (180, 150, 430, 425), "adv_math_med_q15.png")

# Q32 (Pages 33, 34, 35): Options A, B, C, D
crop_and_save(32, (180, 270, 430, 640), "adv_math_med_q32_a.png")
crop_and_save(33, (180, 40, 430, 285), "adv_math_med_q32_b.png")
crop_and_save(33, (180, 310, 430, 715), "adv_math_med_q32_c.png")
crop_and_save(34, (180, 40, 430, 285), "adv_math_med_q32_d.png")

# Q38 (Page 41): Graph in prompt
crop_and_save(40, (170, 170, 430, 445), "adv_math_med_q38.png")

# Q41 (Pages 44, 45): Options A, B, C, D
crop_and_save(43, (35, 205, 175, 355), "adv_math_med_q41_a.png")
crop_and_save(43, (35, 360, 175, 508), "adv_math_med_q41_b.png")
crop_and_save(43, (35, 515, 175, 662), "adv_math_med_q41_c.png")
crop_and_save(44, (35, 15, 175, 155), "adv_math_med_q41_d.png")

# Q48 (Page 52): Graph in prompt
crop_and_save(51, (180, 160, 430, 420), "adv_math_med_q48.png")

print("All crops trimmed and saved cleanly!")
