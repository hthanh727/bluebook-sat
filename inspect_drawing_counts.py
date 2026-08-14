import fitz

pdf_path = 'C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/b1d55254-bb1e-4024-88a3-d14ccd4809f2/.user_uploaded/media_1786728472048.pdf'
doc = fitz.open(pdf_path)

for i in range(len(doc)):
    page = doc[i]
    drawings = page.get_drawings()
    
    count = 0
    for draw in drawings:
        rect = draw["rect"]
        if rect.y0 > 130 and rect.y1 < 520:
            if rect.width < 2 and rect.height < 2:
                continue
            count += 1
            
    if count > 0:
        print(f"Page {i+1}: {count} drawings")

doc.close()
