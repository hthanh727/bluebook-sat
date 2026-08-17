import fitz
import os

pdf_path = 'C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/5390c9e1-b885-4d3c-99d6-412448308a1a/.user_uploaded/media_1786980513333.pdf'
doc = fitz.open(pdf_path)

for page_idx, page in enumerate(doc):
    images = page.get_images()
    if images:
        print(f"Page {page_idx + 1} has {len(images)} images:")
        for img_idx, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            width = base_image["width"]
            height = base_image["height"]
            print(f"  Image {img_idx} (xref={xref}): {width}x{height} .{image_ext}")
