import fitz
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load answer keys
with open(os.path.join(os.path.dirname(__file__), 'answer_keys_verified.json'), 'r', encoding='utf-8') as f:
    ALL_KEYS = json.load(f)

IMAGE_MAP = {
    # 2026 September Int 3
    ("2026 September Int 3 @stewiesat", "reading", 1, 11): "images/2026_sep_int_3/r_m1_q11.png",
    ("2026 September Int 3 @stewiesat", "reading", 2, 10): "images/2026_sep_int_3/r_m2_q10.png",
    ("2026 September Int 3 @stewiesat", "reading", 2, 12): "images/2026_sep_int_3/r_m2_q12.png",
    ("2026 September Int 3 @stewiesat", "math", 1, 10): "images/2026_sep_int_3/m_m1_q10.png",
    ("2026 September Int 3 @stewiesat", "math", 1, 20): "images/2026_sep_int_3/m_m1_q20.png",
    ("2026 September Int 3 @stewiesat", "math", 1, 22): "images/2026_sep_int_3/m_m1_q22.png",
    ("2026 September Int 3 @stewiesat", "math", 2, 2): "images/2026_sep_int_3/m_m2_q2.png",

    # 2026 September Int 2
    ("2026 September Int 2 @stewiesat", "reading", 1, 9): "images/2026_sep_int_2/r_m1_q9.png",
    ("2026 September Int 2 @stewiesat", "reading", 1, 10): "images/2026_sep_int_2/r_m1_q10.png",
    ("2026 September Int 2 @stewiesat", "reading", 1, 11): "images/2026_sep_int_2/r_m1_q11.png",
    ("2026 September Int 2 @stewiesat", "reading", 2, 10): "images/2026_sep_int_2/r_m2_q10.png",
    ("2026 September Int 2 @stewiesat", "reading", 2, 12): "images/2026_sep_int_2/r_m2_q12.png",
    ("2026 September Int 2 @stewiesat", "reading", 2, 13): "images/2026_sep_int_2/r_m2_q13.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 3): "images/2026_sep_int_2/m_m1_q3.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 4): "images/2026_sep_int_2/m_m1_q4.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 7): "images/2026_sep_int_2/m_m1_q7.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 11): "images/2026_sep_int_2/m_m1_q11.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 12): "images/2026_sep_int_2/m_m1_q12.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 13): "images/2026_sep_int_2/m_m1_q13.png",
    ("2026 September Int 2 @stewiesat", "math", 1, 15): "images/2026_sep_int_2/m_m1_q15.png",
    ("2026 September Int 2 @stewiesat", "math", 2, 5): "images/2026_sep_int_2/m_m2_q5.png",
    ("2026 September Int 2 @stewiesat", "math", 2, 7): "images/2026_sep_int_2/m_m2_q7.png",
    ("2026 September Int 2 @stewiesat", "math", 2, 20): "images/2026_sep_int_2/m_m2_q20.png",

    # 2026 October Int 2
    ("2026 October Int 2 @stewiesat", "reading", 1, 10): "images/2026_oct_int_2/r_m1_q10.png",
    ("2026 October Int 2 @stewiesat", "reading", 1, 12): "images/2026_oct_int_2/r_m1_q12.png",
    ("2026 October Int 2 @stewiesat", "reading", 1, 13): "images/2026_oct_int_2/r_m1_q13.png",
    ("2026 October Int 2 @stewiesat", "math", 1, 2): "images/2026_oct_int_2/m_m1_q2.png",
    ("2026 October Int 2 @stewiesat", "math", 1, 11): "images/2026_oct_int_2/m_m1_q11.png",
    ("2026 October Int 2 @stewiesat", "math", 1, 19): "images/2026_oct_int_2/m_m1_q19.png",
    ("2026 October Int 2 @stewiesat", "math", 2, 1): "images/2026_oct_int_2/m_m2_q1.png",
    ("2026 October Int 2 @stewiesat", "math", 2, 3): "images/2026_oct_int_2/m_m2_q3.png",
    ("2026 October Int 2 @stewiesat", "math", 2, 7): "images/2026_oct_int_2/m_m2_q7.png",
    ("2026 October Int 2 @stewiesat", "math", 2, 14): "images/2026_oct_int_2/m_m2_q14.png",
    ("2026 October Int 2 @stewiesat", "math", 2, 16): "images/2026_oct_int_2/m_m2_q16.png",
}

IMAGE_BBOXES = {
    # 2026 September Int 3
    ("2026 September Int 3 @stewiesat", "math", 1, 10): (45, 68, 500, 192),
    ("2026 September Int 3 @stewiesat", "math", 1, 20): (45, 68, 520, 205),
    ("2026 September Int 3 @stewiesat", "math", 1, 22): (250, 68, 480, 225),
    ("2026 September Int 3 @stewiesat", "math", 2, 2): (260, 68, 460, 195),

    # 2026 September Int 2
    ("2026 September Int 2 @stewiesat", "math", 1, 3): (300, 95, 425, 238),
    ("2026 September Int 2 @stewiesat", "math", 1, 4): (270, 85, 450, 205),
    ("2026 September Int 2 @stewiesat", "math", 1, 7): (270, 85, 450, 210),
    ("2026 September Int 2 @stewiesat", "math", 1, 11): (320, 115, 410, 220),
    ("2026 September Int 2 @stewiesat", "math", 1, 12): (270, 85, 450, 205),
    ("2026 September Int 2 @stewiesat", "math", 1, 13): (45, 68, 500, 198),
    ("2026 September Int 2 @stewiesat", "math", 1, 15): (45, 68, 500, 215),
    ("2026 September Int 2 @stewiesat", "math", 2, 5): (230, 135, 490, 335),
    ("2026 September Int 2 @stewiesat", "math", 2, 7): (45, 68, 500, 220),
    ("2026 September Int 2 @stewiesat", "math", 2, 20): (45, 75, 500, 270),

    # 2026 October Int 2
    ("2026 October Int 2 @stewiesat", "math", 1, 2): (45, 30, 360, 200),
    ("2026 October Int 2 @stewiesat", "math", 1, 11): (45, 30, 360, 200),
    ("2026 October Int 2 @stewiesat", "math", 1, 19): (45, 30, 360, 270),
    ("2026 October Int 2 @stewiesat", "math", 2, 1): (45, 30, 360, 300),
    ("2026 October Int 2 @stewiesat", "math", 2, 3): (260, 75, 460, 170),
    ("2026 October Int 2 @stewiesat", "math", 2, 7): (300, 75, 420, 125),
    ("2026 October Int 2 @stewiesat", "math", 2, 14): (75, 85, 200, 195),
    ("2026 October Int 2 @stewiesat", "math", 2, 16): (45, 30, 360, 205),
}

def clean_reading_passage(text, has_image):
    text = text.replace('\u2019', "'").replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"').replace('\ufffd', "'")
    lines = text.split('\n')
    cleaned = []
    for l in lines:
        s = l.strip()
        if not s:
            continue
        if 'Section' in s and 'Writing' in s:
            continue
        if 'Stewie Education' in s or 'stewiesat.com' in s:
            continue
        if re.match(r'^Page\s+\d+$', s):
            continue
        cleaned.append(s)
        
    full = "\n".join(cleaned)
    if has_image:
        passages_starts = [
            "To measure whether countries",
            "Some plants’ leaves",
            "Some plants' leaves",
            "Drosophila (fruit flies)",
            "High levels of public",
            "From February 1918",
            "Urbanization, industrialization",
            "A student is collecting",
            "Tribal nations employ",
            "While US public charities",
            "The roofs on the buildings",
            "Employing high-performance",
            "In 2006, Nitya Kallivayalil",
            "Scientists collected information about brown bears"
        ]
        for pstart in passages_starts:
            idx = full.find(pstart)
            if idx != -1:
                return full[idx:].strip()
    return full.strip()

def extract_reading_passage_formatted(page, has_image):
    # 1. Get horizontal line segments in left passage area (x < 375, 22 <= y <= 385)
    raw_lines = []
    for d in page.get_drawings():
        r = d['rect']
        if r.height <= 3 and r.width > 1 and r.x1 <= 375 and 22 <= r.y0 <= 385:
            raw_lines.append(r)
    
    raw_lines.sort(key=lambda r: (round(r.y0, 1), r.x0))
    merged_lines = []
    for r in raw_lines:
        if not merged_lines:
            merged_lines.append(fitz.Rect(r))
        else:
            prev = merged_lines[-1]
            if abs(prev.y0 - r.y0) < 1.5 and r.x0 <= prev.x1 + 6:
                prev.x1 = max(prev.x1, r.x1)
            else:
                merged_lines.append(fitz.Rect(r))
    merged_lines = [m for m in merged_lines if m.width >= 10]

    # 2. Extract spans from left column
    pdict = page.get_text('dict')
    raw_spans = []
    for b in pdict.get('blocks', []):
        if b.get('type') != 0:
            continue
        bbox = b['bbox']
        if bbox[0] >= 370 or bbox[1] < 22 or bbox[3] > 385:
            continue
        b_text = ''.join(s['text'] for l in b.get('lines', []) for s in l.get('spans', []))
        if 'stewiesat' in b_text.lower() or 'stewie education' in b_text.lower():
            continue
        if 'section 1' in b_text.lower() or 'reading and writing' in b_text.lower() or 'reading & writing' in b_text.lower():
            continue
            
        for l in b.get('lines', []):
            for s in l.get('spans', []):
                t = s['text']
                if not t:
                    continue
                s_bbox = s['bbox']
                if s_bbox[2] > 370 or s_bbox[1] < 22 or s_bbox[3] > 385:
                    continue
                raw_spans.append(s)
                
    visual_lines = []
    for s in raw_spans:
        y_base = s['bbox'][3]
        placed = False
        for vl in visual_lines:
            if abs(vl['baseline'] - y_base) < 4:
                vl['spans'].append(s)
                placed = True
                break
        if not placed:
            visual_lines.append({'baseline': y_base, 'spans': [s]})
            
    visual_lines.sort(key=lambda vl: vl['baseline'])
    
    out_lines = []
    for vl in visual_lines:
        spans = vl['spans']
        line_y = vl['baseline']
        hl_on_line = [m for m in merged_lines if abs(m.y0 - line_y) < 5]
        
        elements = []
        for s in spans:
            s_bbox = s['bbox']
            is_u = False
            for hl in hl_on_line:
                overlap = min(s_bbox[2], hl.x1) - max(s_bbox[0], hl.x0)
                if overlap > (s_bbox[2] - s_bbox[0]) * 0.4:
                    is_u = True
                    break
            elements.append({'type': 'span', 'text': s['text'], 'x0': s_bbox[0], 'x1': s_bbox[2], 'u': is_u})
            
        for hl in hl_on_line:
            overlaps = any(min(s['bbox'][2], hl.x1) - max(s['bbox'][0], hl.x0) > 3 for s in spans)
            if not overlaps:
                elements.append({'type': 'blank', 'text': ' _______ ', 'x0': hl.x0, 'x1': hl.x1, 'u': False})
                
        elements.sort(key=lambda el: el['x0'])
        
        line_str = ''
        in_u = False
        for el in elements:
            t = el['text']
            if el['u']:
                if not in_u:
                    line_str += '<u>' + t
                    in_u = True
                else:
                    line_str += t
            else:
                if in_u:
                    line_str += '</u>' + t
                    in_u = False
                else:
                    line_str += t
        if in_u:
            line_str += '</u>'
        out_lines.append(line_str)
        
    full = '\n'.join(out_lines).strip()
    full = re.sub(r' +', ' ', full)
    return clean_reading_passage(full, has_image)

def parse_reading_question(doc, page_idx, test_name, module, q_num):
    page = doc[page_idx]
    has_image = (test_name, "reading", module, q_num) in IMAGE_MAP
    
    blocks = page.get_text("blocks")
    right_blocks = []
    
    for b in blocks:
        text = b[4].strip()
        if not text:
            continue
        if b[1] < 35 and ('Section' in text or 'September' in text or 'October' in text):
            continue
        if b[3] > 385 and ('Stewie' in text or 'stewiesat' in text or 'Page' in text):
            continue
        if b[0] >= 365:
            right_blocks.append(b)
            
    right_blocks.sort(key=lambda b: b[1])
    
    passage = extract_reading_passage_formatted(page, has_image)
    
    bA, bB, bC, bD = None, None, None, None
    prompt_blocks = []
    
    for b in right_blocks:
        t = b[4].strip()
        if re.match(r'^\d+\s*\]?\s*Mark for Review', t) and b[1] < 60:
            continue
        if not bA and re.match(r'^A\s*\n', t):
            bA = b
        elif bA and not bB and re.match(r'^B\s*\n', t):
            bB = b
        elif bB and not bC and re.match(r'^C\s*\n', t):
            bC = b
        elif bC and not bD and re.match(r'^D\s*\n', t):
            bD = b
        elif not bA:
            prompt_blocks.append(b)
            
    prompt = " ".join(b[4].strip() for b in prompt_blocks).strip()
    prompt = re.sub(r'^\d+\s*\]?\s*Mark for Review\s*', '', prompt).strip()
    
    def clean_opt(b, letter):
        if not b:
            return ""
        t = b[4].strip()
        t = re.sub(r'^' + letter + r'\s*\n\s*', '', t).strip()
        return re.sub(r'\s+', ' ', t)
        
    opt_list = [
        clean_opt(bA, 'A'),
        clean_opt(bB, 'B'),
        clean_opt(bC, 'C'),
        clean_opt(bD, 'D'),
    ]
    
    ans_key = ALL_KEYS[test_name]["reading"][str(module)][str(q_num)]
    opt_indices = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
    correct_idx = opt_indices.get(ans_key, 0)
    
    if q_num <= 5:
        domain = "Craft and Structure"
    elif q_num <= 15:
        domain = "Information and Ideas"
    elif q_num <= 22:
        domain = "Standard English Conventions"
    else:
        domain = "Expression of Ideas"
        
    return {
        "question_number": q_num,
        "original_question_number": q_num,
        "section": "reading",
        "module": module,
        "question_type": "mcq",
        "passage": passage,
        "prompt": prompt,
        "options": opt_list,
        "correct_answer_index": correct_idx,
        "correct_answer_text": None,
        "image_url": IMAGE_MAP.get((test_name, "reading", module, q_num), None),
        "domain": domain,
        "difficulty": "Medium"
    }

# ==================== ADVANCED MATH LATEX ENGINE ====================

def is_math_font(font_name):
    fn = font_name.lower()
    return fn.startswith('cm') or 'math' in fn or 'msam' in fn or 'msbm' in fn

def extract_math_text_with_latex(page, clip_rect=None, exclude_rects=None, wrap_math=True):
    """
    Extracts text from a page or clipped area, reconstructing:
    1. Square roots (\\sqrt{...})
    2. Fractions (\\frac{numerator}{denominator})
    3. Superscripts (x^{2}, a^{x}) and subscripts (x_{1})
    4. Math symbols (− -> -, ≤ -> \\le, ≥ -> \\ge, π -> \\pi, ◦ -> ^\\circ, · -> \\cdot, △ -> \\triangle)
    5. Filters out watermarks (stewiesat, Roboto, NotoSans)
    6. Excludes any text in exclude_rects (e.g. cropped images)
    """
    pdict = page.get_text('dict')
    drawings = page.get_drawings()
    
    if exclude_rects is None:
        exclude_rects = []
        
    # 1. Collect candidate horizontal lines
    cand_lines = []
    for d in drawings:
        r = d['rect']
        if r.height <= 2.5 and 2.5 <= r.width <= 150 and 40 <= r.y0 <= 380:
            r_box = fitz.Rect(r.x0, r.y0 - 1.5, r.x1, r.y1 + 1.5)
            if clip_rect and not fitz.Rect(clip_rect).intersects(r_box):
                continue
            if any(fitz.Rect(ex).intersects(r_box) for ex in exclude_rects):
                continue
            cand_lines.append(r)

    # 2. Collect all spans
    all_spans = []
    for b in pdict['blocks']:
        if b.get('type') != 0:
            continue
        for l in b['lines']:
            for s in l['spans']:
                t = s['text']
                font = s['font']
                # Ignore watermarks and footers
                if 'Roboto' in font or 'NotoSans' in font or 'stewiesat' in t.lower() or s['size'] > 30:
                    continue
                s_bbox = fitz.Rect(s['bbox'])
                if s_bbox.y0 < 35 or s_bbox.y1 > 385:
                    continue
                if clip_rect and not fitz.Rect(clip_rect).intersects(s_bbox):
                    continue
                if any(fitz.Rect(ex).contains(s_bbox) or (fitz.Rect(ex).intersects(s_bbox) and s_bbox.intersects(fitz.Rect(ex))) for ex in exclude_rects):
                    continue
                if 'Mark for Review' in t or 'image included' in t:
                    continue
                all_spans.append(s)

    used_span_ids = set()
    special_constructs = []

    # 3. Detect square roots: horizontal line with '√' immediately to its left
    for line in cand_lines:
        rad_candidates = [
            (i, s) for i, s in enumerate(all_spans)
            if '√' in s['text'] and abs(s['bbox'][2] - line.x0) < 4 and abs(s['bbox'][1] - line.y0) < 18
        ]
        if rad_candidates:
            # It's a square root!
            rad_idx, rad_span = rad_candidates[0]
            under = [
                (i, s) for i, s in enumerate(all_spans)
                if line.x0 - 2 <= s['bbox'][0] and s['bbox'][2] <= line.x1 + 4 and 0 <= s['bbox'][1] - line.y1 <= 16
            ]
            under.sort(key=lambda x: x[1]['bbox'][0])
            under_str = "".join(x[1]['text'] for x in under).strip()
            if not under_str:
                under_str = "x"
            sqrt_latex = f"\\sqrt{{{under_str}}}"
            
            min_x = rad_span['bbox'][0]
            max_x = max(line.x1, max((x[1]['bbox'][2] for x in under), default=line.x1))
            min_y = rad_span['bbox'][1]
            max_y = max(line.y1, max((x[1]['bbox'][3] for x in under), default=line.y1))
            
            special_constructs.append({
                'bbox': (min_x, min_y, max_x, max_y),
                'y_base': max_y,
                'latex': sqrt_latex,
                'span_indices': [rad_idx] + [x[0] for x in under]
            })
            used_span_ids.add(rad_idx)
            for x in under: used_span_ids.add(x[0])

    # 4. Detect fractions: remaining horizontal lines with text above and below
    for line in cand_lines:
        # If this line was already consumed by sqrt
        if any(abs(c['bbox'][1] - line.y0) < 20 and c['bbox'][0] <= line.x0 <= c['bbox'][2] for c in special_constructs if '\\sqrt' in c['latex']):
            continue
            
        above = []
        below = []
        for i, s in enumerate(all_spans):
            if i in used_span_ids:
                continue
            s_text = s['text'].strip()
            if s_text in ['\x10', '\x11', '\x12', '\x13', '(', ')', '[', ']', '{', '}']:
                continue
            sb = fitz.Rect(s['bbox'])
            overlap_x = min(sb.x1, line.x1) - max(sb.x0, line.x0)
            span_mid_x = (sb.x0 + sb.x1) / 2
            if overlap_x > 0 and (line.x0 - 2 <= span_mid_x <= line.x1 + 2):
                if 0 <= (line.y0 - sb.y1) <= 15 or abs(sb.y1 - line.y0) < 4:
                    above.append((i, s))
                elif 0 <= (sb.y0 - line.y1) <= 15 or abs(sb.y0 - line.y1) < 4:
                    below.append((i, s))
        
        if above and below:
            above.sort(key=lambda x: x[1]['bbox'][0])
            below.sort(key=lambda x: x[1]['bbox'][0])
            num_str = "".join(x[1]['text'] for x in above).strip()
            den_str = "".join(x[1]['text'] for x in below).strip()
            
            # Clean symbols inside fraction
            for s_old, s_new in [('−', '-'), ('π', '\\pi'), ('\x10', '('), ('\x11', ')'), ('\x12', '('), ('\x13', ')')]:
                num_str = num_str.replace(s_old, s_new)
                den_str = den_str.replace(s_old, s_new)
            
            frac_latex = f"\\frac{{{num_str}}}{{{den_str}}}"
            
            min_x = min(min(x[1]['bbox'][0] for x in above), min(x[1]['bbox'][0] for x in below), line.x0)
            max_x = max(max(x[1]['bbox'][2] for x in above), max(x[1]['bbox'][2] for x in below), line.x1)
            min_y = min(x[1]['bbox'][1] for x in above)
            max_y = max(x[1]['bbox'][3] for x in below)
            
            special_constructs.append({
                'bbox': (min_x, min_y, max_x, max_y),
                'y_base': (line.y0 + line.y1) / 2 + 5,
                'latex': frac_latex,
                'span_indices': [x[0] for x in above] + [x[0] for x in below]
            })
            for x in above: used_span_ids.add(x[0])
            for x in below: used_span_ids.add(x[0])

    # 5. Group remaining spans + constructs into visual lines
    items = []
    for i, s in enumerate(all_spans):
        if i in used_span_ids:
            continue
        items.append({
            'type': 'span',
            'bbox': s['bbox'],
            'y_base': s['bbox'][3],
            'size': s['size'],
            'font': s['font'],
            'text': s['text'],
            'flags': s['flags']
        })
    for sc in special_constructs:
        items.append({
            'type': 'construct',
            'bbox': sc['bbox'],
            'y_base': sc['y_base'],
            'size': 10.0,
            'font': 'CMR10',
            'text': sc['latex'],
            'flags': 0
        })

    items.sort(key=lambda it: it['y_base'])
    lines = []
    for it in items:
        placed = False
        for l in lines:
            if abs(l['y_base'] - it['y_base']) < 6:
                l['items'].append(it)
                if it['type'] == 'span':
                    l['y_base'] = max(l['y_base'], it['y_base'])
                placed = True
                break
        if not placed:
            lines.append({'y_base': it['y_base'], 'items': [it]})

    lines.sort(key=lambda l: l['y_base'])

    # 6. Format each line with superscripts / subscripts and math delimiters
    formatted_lines = []
    for l in lines:
        line_items = l['items']
        line_items.sort(key=lambda it: it['bbox'][0])
        
        sizes = [it['size'] for it in line_items if it['type'] == 'span' and it['text'].strip()]
        base_size = max(sizes) if sizes else 10.0
        base_y1 = l['y_base']

        # Determine if pure math line
        non_math_words = []
        for it in line_items:
            if it['type'] == 'span':
                fn = it['font'].lower()
                is_m = is_math_font(fn) or (it['size'] <= base_size * 0.82)
                if not is_m:
                    w = re.findall(r'[a-zA-Z]{2,}', it['text'])
                    non_math_words.extend(w)

        is_pure_math_line = len(non_math_words) == 0 and any(
            it['type'] == 'construct' or is_math_font(it['font'].lower()) for it in line_items
        )

        chunks = []
        for it in line_items:
            if it['type'] == 'construct':
                chunks.append({'text': it['text'], 'is_math': True, 'x0': it['bbox'][0], 'x1': it['bbox'][2]})
            else:
                t = it['text']
                is_super = (it['size'] <= base_size * 0.82 and it['bbox'][3] < base_y1 - 1.5) or any(it['font'].endswith(x) for x in ['7', '5', '6'])
                is_sub = (it['size'] <= base_size * 0.82 and it['bbox'][1] > base_y1 - 4) and not is_super
                is_m = is_math_font(it['font'].lower()) or is_super or is_sub
                
                # Replace special chars
                t = t.replace('−', '-').replace('≤', '\\le ').replace('≥', '\\ge ')
                t = t.replace('π', '\\pi ').replace('◦', '^\\circ ').replace('·', '\\cdot ')
                t = t.replace('△', '\\triangle ')
                t = t.replace('\uf8f1', '{').replace('\uf8f2', '').replace('\uf8f3', '')
                t = t.replace('\x10', '(').replace('\x11', ')').replace('\x12', '(').replace('\x13', ')')
                
                if is_super:
                    t = f"^{{{t.strip()}}}"
                elif is_sub:
                    t = f"_{{{t.strip()}}}"
                    
                chunks.append({'text': t, 'is_math': is_m, 'x0': it['bbox'][0], 'x1': it['bbox'][2]})

        if not wrap_math:
            out = ''
            prev_x1 = None
            for c in chunks:
                if prev_x1 is not None and (c['x0'] - prev_x1) > 2.5 and not out.endswith(' '):
                    out += ' '
                out += c['text']
                prev_x1 = c['x1']
            cleaned_line = re.sub(r' +', ' ', out).strip()
            if cleaned_line:
                formatted_lines.append(cleaned_line)
            continue

        if is_pure_math_line:
            out = ''
            prev_x1 = None
            for c in chunks:
                if prev_x1 is not None and (c['x0'] - prev_x1) > 2.5 and not out.endswith(' '):
                    out += ' '
                out += c['text']
                prev_x1 = c['x1']
            clean = re.sub(r' +', ' ', out).strip()
            if any(sym in clean for sym in ['=', '<', '>', '\\frac', '\\sqrt', '+', '-', '*']):
                formatted_lines.append(f"\\[{clean}\\]")
            elif clean:
                formatted_lines.append(clean)
            continue

        # Mixed line: combine contiguous math items
        out = ''
        prev_x1 = None
        in_math = False
        cur_math = ''
        for c in chunks:
            t = c['text']
            m = c['is_math']
            has_lead_sp = t.startswith(' ')
            t_clean = t.strip()
            if not t_clean:
                continue

            need_space = (prev_x1 is not None and (c['x0'] - prev_x1) > 2.0) or has_lead_sp
            
            if m:
                if not in_math:
                    if (need_space or (out and out[-1].isalnum())) and not out.endswith(' '):
                        out += ' '
                    in_math = True
                    cur_math = t_clean
                else:
                    if need_space:
                        cur_math += ' '
                    cur_math += t_clean
            else:
                if in_math:
                    trail_punc = ''
                    while cur_math and cur_math[-1] in [',', '.', ';', '?', ':']:
                        trail_punc = cur_math[-1] + trail_punc
                        cur_math = cur_math[:-1]
                    cur_math_stripped = cur_math.strip()
                    if cur_math_stripped:
                        out += f"\\({cur_math_stripped}\\){trail_punc}"
                    in_math = False
                    cur_math = ''
                if (need_space or (out and out[-1].isalnum())) and not out.endswith(' ') and t_clean[0] not in [',', '.', ';', '?', ':', ')']:
                    out += ' '
                out += t_clean
            prev_x1 = c['x1']
            
        if in_math:
            trail_punc = ''
            while cur_math and cur_math[-1] in [',', '.', ';', '?', ':']:
                trail_punc = cur_math[-1] + trail_punc
                cur_math = cur_math[:-1]
            cur_math_stripped = cur_math.strip()
            if cur_math_stripped:
                out += f"\\({cur_math_stripped}\\){trail_punc}"

        cleaned_line = re.sub(r' +', ' ', out).strip()
        if cleaned_line:
            formatted_lines.append(cleaned_line)

    return "\n\n".join(formatted_lines)

def wrap_math_formulas_in_prompt(prompt_text):
    return prompt_text

def parse_math_question(doc, page_idx, test_name, module, q_num):
    page = doc[page_idx]
    has_image = (test_name, "math", module, q_num) in IMAGE_MAP
    img_bbox = IMAGE_BBOXES.get((test_name, "math", module, q_num), None)
    exclude_rects = [img_bbox] if img_bbox else []
    
    txt_all = page.get_text()
    is_spr = 'answer preview' in txt_all.lower()
    is_2_col = any(b[0] > 370 and 'mark for review' in b[4].lower() for b in page.get_text('blocks'))
    
    ans_key = ALL_KEYS[test_name]["math"][str(module)][str(q_num)]
    
    # 1. Option boxes
    raw_boxes = [d['rect'] for d in page.get_drawings() if d['rect'].width > 120 and d['rect'].height > 15 and 80 < d['rect'].y0 < 370]
    if is_2_col:
        raw_boxes = [b for b in raw_boxes if b.x0 > 370]
    else:
        raw_boxes = [b for b in raw_boxes if b.x0 < 100]
        
    boxes = []
    for b in raw_boxes:
        if not any(abs(b.y0 - u.y0) < 3 for u in boxes):
            boxes.append(b)
    boxes.sort(key=lambda b: b.y0)
    
    # 2. Extract Prompt
    ap_y0 = None
    for b in page.get_text('blocks'):
        if 'answer preview' in b[4].lower():
            ap_y0 = b[1]
            break

    if is_spr:
        first_y = (ap_y0 - 2) if ap_y0 else 360
    elif boxes:
        first_y = boxes[0].y0
    else:
        first_y = 360

    if is_2_col:
        prompt_clip = fitz.Rect(375, 55, 680, first_y)
    else:
        prompt_clip = fitz.Rect(45, 55, 680, first_y)
        
    raw_prompt = extract_math_text_with_latex(page, clip_rect=prompt_clip, exclude_rects=exclude_rects)
    # Clean leading question number / header
    prompt = re.sub(r'^\d+\s*\]?\s*(\|?\s*ë?\s*image included)?\s*(ABC)?\s*', '', raw_prompt).strip()
    if is_spr:
        prompt = re.sub(r'\s*Answer Preview:.*$', '', prompt, flags=re.DOTALL).strip()
    prompt = wrap_math_formulas_in_prompt(prompt)

    if is_spr:
        return {
            "question_number": q_num,
            "original_question_number": q_num,
            "section": "math",
            "module": module,
            "question_type": "spr",
            "passage": None,
            "prompt": prompt,
            "options": None,
            "correct_answer_index": None,
            "correct_answer_text": str(ans_key).strip(),
            "image_url": IMAGE_MAP.get((test_name, "math", module, q_num), None),
            "domain": "Math",
            "difficulty": "Medium"
        }
    else:
        # MCQ options
        opt_list = []
        if len(boxes) == 4:
            for i, (b, letter) in enumerate(zip(boxes, ['A', 'B', 'C', 'D'])):
                opt_raw = extract_math_text_with_latex(page, clip_rect=b, wrap_math=False)
                # Strip leading option letter label
                opt_c = re.sub(r'^(\^\{' + letter + r'\}|' + letter + r')\s*', '', opt_raw).strip()
                # Wrap math formulas / numbers in \( ... \)
                # If option is English sentence (has multiple normal words without =), don't wrap in math
                words_count = len(re.findall(r'\b[a-zA-Z]{3,}\b', opt_c))
                is_sentence = words_count >= 3 and not any(c in opt_c for c in ['=', '<', '>', '\\frac', '\\sqrt'])
                if is_sentence:
                    opt_formatted = opt_c
                else:
                    opt_formatted = f"\\({opt_c}\\)"
                opt_list.append(opt_formatted)
        else:
            # Fallback if boxes != 4
            opt_list = ["A", "B", "C", "D"]

        opt_indices = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
        correct_idx = opt_indices.get(ans_key, 0)
        return {
            "question_number": q_num,
            "original_question_number": q_num,
            "section": "math",
            "module": module,
            "question_type": "mcq",
            "passage": None,
            "prompt": prompt,
            "options": opt_list,
            "correct_answer_index": correct_idx,
            "correct_answer_text": None,
            "image_url": IMAGE_MAP.get((test_name, "math", module, q_num), None),
            "domain": "Math",
            "difficulty": "Medium"
        }
