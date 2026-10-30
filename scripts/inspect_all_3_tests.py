import fitz
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_paths = [
    ("2026_sep_int_3", r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf"),
    ("2026_sep_int_2", r"C:\Users\Thanh GAY\Downloads\2026 September Int 2 @stewiesat.pdf"),
    ("2026_oct_int_2", r"C:\Users\Thanh GAY\Downloads\2026 October Int 2 @stewiesat.pdf"),
]

for label, path in pdf_paths:
    print(f"\n=================== {label} ===================")
    doc = fitz.open(path)
    print(f"Total pages: {len(doc)}")
    
    # Check Answer key pages: 58 (RW) and 105 (Math)
    p58 = doc[57].get_text()
    p105 = doc[104].get_text()
    print("Page 58 sample:", p58[:200].replace('\n', ' '))
    print("Page 105 sample:", p105[:200].replace('\n', ' '))
