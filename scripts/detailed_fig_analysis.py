import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

def analyze_pdf(pdf_path, name):
    doc = fitz.open(pdf_path)
    print(f"\n============================== {name} ==============================")
    for pno in range(len(doc)):
        p = doc[pno]
        txt = p.get_text()
        
        # Determine section, module, qnum
        sec, mod, qnum = None, None, None
        if 2 <= pno <= 28:
            sec, mod, qnum = 'RW', 1, pno - 2 + 1
        elif 30 <= pno <= 56:
            sec, mod, qnum = 'RW', 2, pno - 30 + 1
        elif 59 <= pno <= 80:
            sec, mod, qnum = 'Math', 1, pno - 59 + 1
        elif 82 <= pno <= 103:
            sec, mod, qnum = 'Math', 2, pno - 82 + 1
            
        if not sec:
            continue
            
        has_tag = 'image included' in txt.lower()
        # In Reading, check if there is a graph/table
        # Signs of graph/table in Reading:
        is_rw_graph = sec == 'RW' and any(k in txt.lower() for k in [
            'growth rate (%)', 'percent of leaf', 'economic policy uncertainty',
            'life expectancy in france', 'home heating needs', 'volcanoes active',
            'tax penalties assessed', 'monthly temperatures and wing', 'three studies’ estimated',
            'nucleobase', 'employment in tribal economies', 'bear id'
        ])
        
        is_math_fig = sec == 'Math' and (has_tag or any(k in txt.lower() for k in [
            'figure shown', 'scatterplot', 'scatter plot', 'shown below', 'in the figure', 'the graph of', 'frequency table', 'the table summarizes', 'the table shows'
        ]))
        
        if is_rw_graph or has_tag or is_math_fig:
            # print page info
            print(f"\n--- Page {pno+1} [{sec} M{mod} Q{qnum}] ---")
            lines = [l.strip() for l in txt.split('\n') if l.strip()]
            for l in lines[:5]:
                print(f"  {l}")
            drawings = [d for d in p.get_drawings() if 40 < d['rect'].y0 < 380 and d['rect'].y1 < 380]
            if drawings:
                min_x = min(d['rect'].x0 for d in drawings)
                min_y = min(d['rect'].y0 for d in drawings)
                max_x = max(d['rect'].x1 for d in drawings)
                max_y = max(d['rect'].y1 for d in drawings)
                print(f"  Drawings bbox: ({min_x:.1f}, {min_y:.1f}, {max_x:.1f}, {max_y:.1f}), count={len(drawings)}")
            # Also check text blocks in that region
            for b in p.get_text('blocks'):
                if b[1] < 220 and b[3] > 40:
                    first_line = b[4].split('\n')[0].strip()
                    if first_line and not first_line.startswith('Section') and not first_line.startswith('Stewie'):
                        print(f"  Top block ({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}): {first_line[:50]}")

analyze_pdf(r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf", "2026 September Int 3")
analyze_pdf(r"C:\Users\Thanh GAY\Downloads\2026 September Int 2 @stewiesat.pdf", "2026 September Int 2")
analyze_pdf(r"C:\Users\Thanh GAY\Downloads\2026 October Int 2 @stewiesat.pdf", "2026 October Int 2")
