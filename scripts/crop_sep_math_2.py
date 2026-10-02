import fitz
import os
from PIL import Image, ImageChops

pdf_path = r"C:\Users\Thanh GAY\.gemini\antigravity-ide\brain\70bb52c7-c9aa-424a-9b8d-f7d276a4d809\.user_uploaded\media_1790947222534.pdf"
output_dir = r"c:\Users\Thanh GAY\.gemini\antigravity-ide\scratch\bluebook-sat\public\images\sep_math_2"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
zoom = 4.0  # high res (4x)
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

# Let's inspect pages to get exact coordinates:
# Page 5: Module 1, Question 13 (index 4)
# Between "Question 13" (y ~ 271) and "Line t intersects" (y ~ 460)
# Note: "Note: Figure not drawn to scale." is around y ~ 430
# Let's include or exclude "Note: Figure not drawn to scale."?
# Usually SAT diagrams include "Note: Figure not drawn to scale." inside or under the diagram.
# Let's check y from 290 to 455, x from 180 to 420.
crop_and_save(4, (180, 290, 420, 450), "m1_q13.png")

# Page 7: Module 1, Question 21 (index 6)
# Between "Question 21" (y ~ 370) and "In right triangle QRS" (y ~ 550)
crop_and_save(6, (200, 400, 400, 545), "m1_q21.png")

# Page 10: Module 2, Question 1 (index 9)
# Box plot: between "Question 1" and "From left to right"
crop_and_save(9, (150, 95, 450, 210), "m2_q1.png")

# Page 10: Module 2, Question 2 (index 9)
# Coordinate plane: between "Question 2" and "The graph of a function"
crop_and_save(9, (170, 350, 440, 640), "m2_q2.png")

# Page 11: Module 2, Question 3 (index 10)
# Scatterplot: between "Question 3" and "A scatterplot shows"
crop_and_save(10, (150, 95, 450, 300), "m2_q3.png")

# Page 14: Module 2, Question 16 (index 13)
# Similar triangles: between "Question 16" and "Triangle CAE is similar"
crop_and_save(13, (180, 330, 420, 505), "m2_q16.png")

print("Cropping finished.")
