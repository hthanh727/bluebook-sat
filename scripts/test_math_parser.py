import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def parse_math_page(page, q_num):
    blocks = page.get_text("blocks")
    content_blocks = []
    
    for b in blocks:
        text = b[4].strip()
        if not text:
            continue
        if b[1] < 35 and ('Section' in text or 'September' in text or 'October' in text):
            continue
        if b[3] > 385 and ('Stewie' in text or 'stewiesat' in text or 'Page' in text):
            continue
        # Also skip header line like "1 ] Mark for Review ... ABC"
        if re.match(r'^\d+\s*\]?\s*Mark for Review', text) and b[1] < 60:
            continue
        content_blocks.append(b)
        
    content_blocks.sort(key=lambda b: (b[1], b[0]))
    all_text = "\n".join(b[4].strip() for b in content_blocks)
    lines = [l.strip() for l in all_text.split('\n') if l.strip()]
    
    is_spr = any('answer preview' in l.lower() for l in lines) or not any(re.match(r'^[ABCD]$', l) for l in lines)
    
    options = {}
    prompt_lines = []
    current_opt = None
    
    for line in lines:
        if 'answer preview' in line.lower():
            break
        opt_match = re.match(r'^([ABCD])\s*(.*)$', line)
        if not is_spr and opt_match and (len(line) == 1 or line[1] in ' \t.'):
            current_opt = opt_match.group(1)
            options[current_opt] = opt_match.group(2).strip()
        elif current_opt:
            options[current_opt] += " " + line
        else:
            prompt_lines.append(line)
            
    prompt = " ".join(prompt_lines).strip()
    if is_spr:
        return 'spr', prompt, None
    else:
        opt_list = [options.get('A', ''), options.get('B', ''), options.get('C', ''), options.get('D', '')]
        return 'mcq', prompt, opt_list

doc = fitz.open(r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf")
# Math M1 Q1 (page 60, idx 59 - MCQ)
qtype, prm, opts = parse_math_page(doc[59], 1)
print("--- Math Q1 ---")
print("Type:", qtype)
print("Prompt:", prm)
print("Options:", opts)

# Math M1 Q2 (page 61, idx 60 - SPR)
qtype, prm, opts = parse_math_page(doc[60], 2)
print("\n--- Math Q2 ---")
print("Type:", qtype)
print("Prompt:", prm)
print("Options:", opts)
