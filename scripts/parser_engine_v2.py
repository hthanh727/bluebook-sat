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
    ("2026 September Int 2 @stewiesat", "reading", 1, 11): "images/2026_sep_int_2/r_m1_q11.png",
    ("2026 September Int 2 @stewiesat", "reading", 2, 12): "images/2026_sep_int_2/r_m2_q12.png",
    ("2026 September Int 2 @stewiesat", "reading", 2, 13): "images/2026_sep_int_2/r_m2_q13.png",
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

def clean_reading_passage(text, has_image):
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
            "Employing high-performance"
        ]
        for pstart in passages_starts:
            idx = full.find(pstart)
            if idx != -1:
                return full[idx:].strip()
    return full.strip()

def extract_reading_passage_formatted(page, has_image):
    # 1. Get horizontal line segments in left passage area (x < 375, 35 <= y <= 385)
    raw_lines = []
    for d in page.get_drawings():
        r = d['rect']
        if r.height <= 3 and r.width > 1 and r.x1 <= 375 and 35 <= r.y0 <= 385:
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
        if bbox[0] >= 370 or bbox[1] < 35 or bbox[3] > 385:
            continue
        b_text = ''.join(s['text'] for l in b.get('lines', []) for s in l.get('spans', []))
        if 'stewiesat' in b_text.lower() or 'stewie education' in b_text.lower():
            continue
            
        for l in b.get('lines', []):
            for s in l.get('spans', []):
                t = s['text']
                if not t:
                    continue
                s_bbox = s['bbox']
                if s_bbox[2] > 370 or s_bbox[1] < 35 or s_bbox[3] > 385:
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

def clean_math_text(text):
    text = text.replace('\uf8f1', '{').replace('\uf8f2', '').replace('\uf8f3', '')
    text = text.replace('◦', '^\\circ')
    text = text.replace('−', '-')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_math_question(doc, page_idx, test_name, module, q_num):
    page = doc[page_idx]
    has_image = (test_name, "math", module, q_num) in IMAGE_MAP
    
    txt_all = page.get_text()
    is_spr = 'answer preview' in txt_all.lower()
    
    blocks = page.get_text("blocks")
    # Check if 2-column layout (question on the right side)
    # A question is 2-column if there are blocks on the right containing "Mark for Review" or if options are x > 370
    is_2_col = any(b[0] > 370 and 'mark for review' in b[4].lower() for b in blocks)
    
    if is_2_col:
        content_blocks = [b for b in blocks if b[0] > 370 and 55 < b[1] < 380 and 'Stewie' not in b[4] and 'stewiesat' not in b[4]]
    else:
        content_blocks = [b for b in blocks if 55 < b[1] < 380 and 'Stewie' not in b[4] and 'stewiesat' not in b[4]]
        
    content_blocks = [b for b in content_blocks if not (re.match(r'^\d+\s*\]?\s*Mark for Review', b[4].strip()) and b[1] < 60)]
    content_blocks.sort(key=lambda b: (b[1], b[0]))
    
    ans_key = ALL_KEYS[test_name]["math"][str(module)][str(q_num)]
    
    if is_spr:
        prompt_blocks = []
        for b in content_blocks:
            if 'answer preview' in b[4].lower():
                break
            prompt_blocks.append(b)
        raw_prompt = " ".join(b[4].strip() for b in prompt_blocks).strip()
        prompt = clean_math_prompt_advanced(raw_prompt, has_image, is_2_col)
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
        # MCQ
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
        
        matched_opts = []
        for b in boxes:
            t = page.get_text('text', clip=b).strip()
            if re.match(r'^[ABCD](\s*\n|\s+)', t):
                matched_opts.append((b, t))
                
        if len(matched_opts) == 4:
            first_y = matched_opts[0][0].y0
            prompt_blocks = [b for b in content_blocks if b[3] <= first_y + 5]
            raw_prompt = " ".join(b[4].strip() for b in prompt_blocks).strip()
            prompt = clean_math_prompt_advanced(raw_prompt, has_image, is_2_col)
            
            def clean_box_opt(t, letter):
                t = re.sub(r'^' + letter + r'(\s*\n|\s+)', '', t).strip()
                t = t.replace('\x10', '(').replace('\x11', ')').replace('\x12', '(').replace('\x13', ')')
                t = t.replace('\uf8f1', '{').replace('\uf8f2', '').replace('\uf8f3', '')
                t = t.replace('◦', '^\\circ').replace('−', '-')
                return re.sub(r'\s+', ' ', t).strip()
                
            opt_list = [
                clean_box_opt(matched_opts[0][1], 'A'),
                clean_box_opt(matched_opts[1][1], 'B'),
                clean_box_opt(matched_opts[2][1], 'C'),
                clean_box_opt(matched_opts[3][1], 'D'),
            ]
        else:
            bA, bB, bC, bD = None, None, None, None
            prompt_blocks = []
            for b in content_blocks:
                t = b[4].strip()
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
            raw_prompt = " ".join(b[4].strip() for b in prompt_blocks).strip()
            prompt = clean_math_prompt_advanced(raw_prompt, has_image, is_2_col)
            
            def clean_b_opt(b, letter):
                if not b: return ""
                t = b[4].strip()
                t = re.sub(r'^' + letter + r'\s*\n\s*', '', t).strip()
                t = t.replace('\x10', '(').replace('\x11', ')').replace('\x12', '(').replace('\x13', ')')
                t = t.replace('\uf8f1', '{').replace('\uf8f2', '').replace('\uf8f3', '')
                t = t.replace('◦', '^\\circ').replace('−', '-')
                return re.sub(r'\s+', ' ', t).strip()
                
            opt_list = [
                clean_b_opt(bA, 'A'),
                clean_b_opt(bB, 'B'),
                clean_b_opt(bC, 'C'),
                clean_b_opt(bD, 'D'),
            ]
            
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

def clean_math_prompt_advanced(prompt, has_image, is_2_col):
    prompt = clean_math_text(prompt)
    prompt = re.sub(r'^\d+\s*\]?\s*Mark for Review\s*(\|?\s*ë?\s*image included)?\s*(ABC)?\s*', '', prompt).strip()
    if has_image:
        if is_2_col:
            # Nothing from graph is in prompt because it was restricted to right column!
            return prompt
        # 1-col: Remove graph/diagram annotations
        starts = [
            "In the figure shown",
            "In the figure,",
            "In triangle",
            "The line models",
            "The scatterplot shows",
            "The graph of the function",
            "The graph shown",
            "The shaded region",
            "A certain company",
            "The frequency table",
            "Area (square feet)",
            "What is the best interpretation",
            "Which of the following",
            "For the quadratic function",
            "For the exponential function",
            "A space probe",
            "The figure shown"
        ]
        # If prompt starts with the question statement directly:
        for s in starts:
            idx = prompt.find(s)
            if idx != -1:
                # Also if prompt contains trailing graph numbers after '?', strip them
                cleaned = prompt[idx:].strip()
                qmark = cleaned.rfind('?')
                if qmark != -1 and qmark + 1 < len(cleaned):
                    # Check if trailing text after '?' is just diagram numbers/letters
                    after = cleaned[qmark+1:].strip()
                    if len(after) > 0 and (re.match(r'^[\d\s\-\.,xyrscbadABCEQRSLWhlw]+$', after) or len(after) < 30):
                        cleaned = cleaned[:qmark+1].strip()
                return cleaned
                
        prompt = re.sub(r'^Note:\s*[Ff]igure not drawn to scale\.?\s*', '', prompt).strip()
    return prompt.strip()
