import fitz
import os
import sys
from PIL import Image, ImageChops

sys.stdout.reconfigure(encoding='utf-8')

def autocrop(im, bgcolor=(255, 255, 255), padding=10):
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

def crop_box(doc, page_idx, rect, out_path, zoom=3.0):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    page = doc[page_idx]
    mat = fitz.Matrix(zoom, zoom)
    clip_rect = fitz.Rect(*rect)
    pix = page.get_pixmap(matrix=mat, clip=clip_rect)
    pix.save(out_path)
    with Image.open(out_path) as im:
        cropped = autocrop(im.convert("RGB"))
        cropped.save(out_path, format="PNG", optimize=True)
    print(f"Saved: {out_path} ({cropped.width}x{cropped.height})")

# Let's define the crop specs for 2026 September Int 3:
# Page dimensions are 725.67 x 408.19
# Reading left column: x ~ 40 to 360
# Header is above y ~ 50, footer is below y ~ 380

crops_sep_3 = [
    # Page 13: Reading M1 Q11 (Graph on left side above text)
    # Text begins around y ~ 210: "To measure whether countries..."
    # Graph is around x: 45 to 355, y: 50 to 205
    (12, (45, 45, 360, 210), "r_m1_q11.png"),

    # Page 40: Reading M2 Q10 (Graph on left side above text)
    # Text begins around y ~ 205: "Some plants' leaves emit..."
    # Graph is around x: 45 to 355, y: 50 to 205
    (39, (45, 45, 360, 205), "r_m2_q10.png"),

    # Page 42: Reading M2 Q12 (Table on left side above text)
    # Text begins around y ~ 160: "Drosophila (fruit flies)..."
    # Table is around x: 45 to 355, y: 45 to 160
    (41, (45, 45, 360, 160), "r_m2_q12.png"),

    # Page 69: Math M1 Q10 (Triangle CAE / CBD)
    # Centered above text. Prompt starts at y ~ 200: "In the figure shown..."
    # Note: Figure not drawn to scale is at y ~ 70
    # Figure is around x: 150 to 550, y: 65 to 195
    (68, (150, 60, 550, 195), "m_m1_q10.png"),

    # Page 79: Math M1 Q20 (Triangle QRS)
    # Prompt starts around y ~ 215: "In triangle QRS shown..."
    # Figure is around x: 180 to 520, y: 65 to 210
    (78, (180, 60, 520, 210), "m_m1_q20.png"),

    # Page 81: Math M1 Q22 (Coordinate plane shelves)
    # Prompt starts around y ~ 240: "The line models..."
    # Graph is around x: 200 to 520, y: 65 to 235
    (80, (200, 60, 520, 235), "m_m1_q22.png"),

    # Page 84: Math M2 Q2 (Scatterplot with line of best fit)
    # Prompt starts around y ~ 215: "The scatterplot shows..."
    # Graph is around x: 180 to 520, y: 65 to 210
    (83, (180, 60, 520, 210), "m_m2_q2.png"),
]

doc_sep_3 = fitz.open(r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf")
out_dir_sep_3 = r"c:\Users\Thanh GAY\Documents\bluebook-sat\public\images\2026_sep_int_3"
print("Cropping Sep Int 3...")
for pno, rect, fn in crops_sep_3:
    crop_box(doc_sep_3, pno, rect, os.path.join(out_dir_sep_3, fn))

