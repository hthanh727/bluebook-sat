import fitz
doc = fitz.open('C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/b1d55254-bb1e-4024-88a3-d14ccd4809f2/.user_uploaded/media_1786731309486.pdf')
print("Page 2 Text:")
print(repr(doc[1].get_text()))
print("-" * 50)
print("Page 3 Text:")
print(repr(doc[2].get_text()))
doc.close()
