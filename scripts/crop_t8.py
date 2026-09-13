import fitz
import os
from PIL import Image, ImageChops

pdf_path = r"C:\Users\Thanh GAY\.gemini\antigravity-ide\brain\2374e161-773f-4c09-8837-219ebb030bd8\.user_uploaded\media_1789298356011.pdf"
output_dir = r"c:\Users\Thanh GAY\.gemini\antigravity-ide\scratch\bluebook-sat\public\images\t8_2026_int_1"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
zoom = 4.0  # high res
mat = fitz.Matrix(zoom, zoom)

def autocrop(im, bgcolor=(255, 255, 255), padding=16):
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
    # rect is (x0, y0, x1, y1) in points
    pix = page.get_pixmap(matrix=mat, clip=fitz.Rect(*rect))
    out_path = os.path.join(output_dir, filename)
    pix.save(out_path)
    
    with Image.open(out_path) as im:
        cropped = autocrop(im.convert("RGB"))
        cropped.save(out_path, format="PNG", optimize=True)
        print(f"Saved {filename} ({cropped.width}x{cropped.height}) to {out_path}")

# 1. Module 1, Question 4 (Page 3 -> index 2)
# rect between Q4 title and problem statement: y: 95 to 285, x: 210 to 380
crop_and_save(2, (210, 95, 385, 285), "m1_q4.png")

# 2. Module 1, Question 8 (Page 4 -> index 3)
# Histograms: y: 440 to 595, x: 170 to 420
crop_and_save(3, (170, 440, 420, 595), "m1_q8.png")

# 3. Module 1, Question 13 (Page 5 -> index 4)
# Pyramid: y: 625 to 778, x: 210 to 390
crop_and_save(4, (210, 625, 390, 778), "m1_q13.png")

# 4. Module 1, Question 15 (Page 6 -> index 5)
# Scatterplot: y: 375 to 605, x: 190 to 410
crop_and_save(5, (190, 375, 410, 605), "m1_q15.png")

# 5. Module 1, Question 16 (Page 7 -> index 6)
# Triangles: y: 95 to 230, x: 230 to 365
crop_and_save(6, (230, 95, 365, 230), "m1_q16.png")

# 6. Module 2, Question 17 (Page 14 -> index 13)
# Scatterplot: y: 420 to 615, x: 200 to 395
crop_and_save(13, (200, 420, 395, 615), "m2_q17.png")

print("All crops saved successfully!")
