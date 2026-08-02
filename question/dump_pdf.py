import fitz
import sys

doc = fitz.open(sys.argv[1])
with open("pdf_dump.txt", "w", encoding="utf-8") as f:
    for i in range(len(doc)):
        f.write(f"\n--- PAGE {i+1} ---\n")
        f.write(doc[i].get_text())
doc.close()
print(f"Saved to pdf_dump.txt")
