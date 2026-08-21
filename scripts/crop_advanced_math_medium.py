import fitz  # PyMuPDF
import os
from PIL import Image

pdf_path = r"C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/43ae57ff-e1ae-42be-9bfd-7ce444e9faef/.user_uploaded/media_1787336674261.pdf"
output_dir = r"c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/public/images"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

# Render pages at 3x scale (216 DPI)
zoom = 3.0
mat = fitz.Matrix(zoom, zoom)

def crop_and_save(page_idx, rect, filename):
    page = doc[page_idx]
    pix = page.get_pixmap(matrix=mat, clip=rect)
    out_path = os.path.join(output_dir, filename)
    pix.save(out_path)
    print(f"Saved {filename} ({pix.width}x{pix.height})")

# Let's inspect page rects and text locations for the pages with graphs:
# 1. Page 1 (Q1: a5663025): Graph in prompt
# 2. Page 15 (Q15: 252a3b3a): Graph in prompt
# 3. Page 33-35 (Q32: 75a32330): Options A (P33), B (P34), C (P34), D (P35)
# 4. Page 41 (Q38: 5f10c095): Graph in prompt
# 5. Page 44-45 (Q41: d675744f): Options A (P44), B (P44), C (P44), D (P45)
# 6. Page 52 (Q48: cef0eada): Graph in prompt

for page_idx in [0, 14, 32, 33, 34, 40, 43, 44, 51]:
    page = doc[page_idx]
    print(f"--- Page {page_idx + 1} Rect: {page.rect} ---")
    drawings = page.get_drawings()
    print(f"Drawings count: {len(drawings)}")
    images = page.get_images()
    print(f"Images count: {len(images)}")
