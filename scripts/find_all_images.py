import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_configs = [
    {
        "id": "2026_sep_int_3",
        "name": "2026 September Int 3 @stewiesat",
        "path": r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf"
    },
    {
        "id": "2026_sep_int_2",
        "name": "2026 September Int 2 @stewiesat",
        "path": r"C:\Users\Thanh GAY\Downloads\2026 September Int 2 @stewiesat.pdf"
    },
    {
        "id": "2026_oct_int_2",
        "name": "2026 October Int 2 @stewiesat",
        "path": r"C:\Users\Thanh GAY\Downloads\2026 October Int 2 @stewiesat.pdf"
    }
]

for cfg in pdf_configs:
    doc = fitz.open(cfg['path'])
    print(f"\n=================== {cfg['name']} ===================")
    for pno in range(len(doc)):
        page = doc[pno]
        text = page.get_text()
        # Find section & module
        # Reading: p3-p29 (M1 Q1-27), p31-p57 (M2 Q1-27)
        # Math: p60-p81 (M1 Q1-22), p83-p104 (M2 Q1-22)
        sec = None
        mod = None
        qnum = None
        
        if 2 <= pno <= 28:
            sec = 'reading'
            mod = 1
            qnum = pno - 2 + 1
        elif 30 <= pno <= 56:
            sec = 'reading'
            mod = 2
            qnum = pno - 30 + 1
        elif 59 <= pno <= 80:
            sec = 'math'
            mod = 1
            qnum = pno - 59 + 1
        elif 82 <= pno <= 103:
            sec = 'math'
            mod = 2
            qnum = pno - 82 + 1
            
        if not sec:
            continue
            
        drawings = page.get_drawings()
        images = page.get_images()
        has_tag = 'image included' in text.lower()
        has_table = 'table' in text.lower() or 'tabular' in text.lower()
        has_graph = any(k in text.lower() for k in ['graph', 'scatterplot', 'figure', 'bar graph', 'plot'])
        
        # In SAT PDFs, drawings include header lines and option boxes.
        # But if there are many drawings, or drawings in a specific region, or 'image included':
        # Let's count drawings that are not the header line or footer line or option rectangles:
        special_drawings = [d for d in drawings if 60 < d['rect'].y0 < 380 and d['rect'].width < 500]
        
        if has_tag or len(images) > 0 or (sec == 'reading' and (has_graph or '0\n' in text or '10\n' in text or '20\n' in text)) or (sec == 'math' and (has_graph or len(special_drawings) > 3)):
            print(f"Page {pno+1} ({sec} M{mod} Q{qnum}): tag={has_tag}, imgs={len(images)}, sp_draw={len(special_drawings)}, graph={has_graph}")
