import fitz

pdf_path = r"C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/43ae57ff-e1ae-42be-9bfd-7ce444e9faef/.user_uploaded/media_1787336674261.pdf"
doc = fitz.open(pdf_path)

def analyze_page(page_idx):
    page = doc[page_idx]
    print(f"\n================ PAGE {page_idx + 1} ================")
    text_blocks = page.get_text("blocks")
    print("--- Text Blocks ---")
    for b in text_blocks:
        print(f"Rect: {b[:4]} | Text: {b[4][:40].strip()!r}")
    
    drawings = page.get_drawings()
    if drawings:
        min_x = min(d["rect"].x0 for d in drawings if d["rect"].y0 > 100)
        min_y = min(d["rect"].y0 for d in drawings if d["rect"].y0 > 100)
        max_x = max(d["rect"].x1 for d in drawings if d["rect"].y0 > 100)
        max_y = max(d["rect"].y1 for d in drawings if d["rect"].y0 > 100)
        print(f"Drawings bounding box (y > 100): ({min_x:.1f}, {min_y:.1f}, {max_x:.1f}, {max_y:.1f})")

    images = page.get_images()
    if images:
        print("--- Images ---")
        for img in images:
            print(img)

for p in [0, 14, 32, 33, 34, 40, 43, 44, 51]:
    analyze_page(p)
