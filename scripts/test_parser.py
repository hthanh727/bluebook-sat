import fitz
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

def parse_reading_page(page, q_num):
    # Left column: x < 365
    # Right column: x >= 365
    blocks = page.get_text("blocks")
    left_blocks = []
    right_blocks = []
    
    for b in blocks:
        # Ignore top header and bottom footer
        text = b[4].strip()
        if not text:
            continue
        if b[1] < 35 and ('Section' in text or 'September' in text or 'October' in text):
            continue
        if b[3] > 385 and ('Stewie' in text or 'stewiesat' in text or 'Page' in text):
            continue
            
        if b[0] < 365:
            left_blocks.append(b)
        else:
            right_blocks.append(b)
            
    # Sort blocks by y0
    left_blocks.sort(key=lambda b: b[1])
    right_blocks.sort(key=lambda b: b[1])
    
    # Left side is passage
    passage = "\n\n".join(b[4].strip() for b in left_blocks)
    
    # Right side contains Q num, Prompt, Options
    # Let's inspect right blocks
    right_text = "\n".join(b[4].strip() for b in right_blocks)
    
    # Options A, B, C, D
    # Typical right column:
    # 1 ] Mark for Review
    # Prompt text...
    # A Option A
    # B Option B
    # C Option C
    # D Option D
    lines = [l.strip() for l in right_text.split('\n') if l.strip()]
    
    prompt_lines = []
    options = {}
    current_opt = None
    
    for line in lines:
        if re.match(r'^\d+\s*\]?\s*Mark for Review', line):
            continue
        opt_match = re.match(r'^([ABCD])\s*(.*)$', line)
        if opt_match and (len(line) == 1 or line[1] == ' ' or line[1] == '\t'):
            current_opt = opt_match.group(1)
            options[current_opt] = opt_match.group(2).strip()
        elif current_opt:
            options[current_opt] += " " + line
        else:
            prompt_lines.append(line)
            
    prompt = " ".join(prompt_lines).strip()
    opt_list = [options.get('A', ''), options.get('B', ''), options.get('C', ''), options.get('D', '')]
    return passage, prompt, opt_list

doc = fitz.open(r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf")
# Test Reading M1 Q1 (page 3, idx 2)
pas, prm, opts = parse_reading_page(doc[2], 1)
print("--- Q1 ---")
print("Passage:", pas[:100])
print("Prompt:", prm)
print("Options:", opts)

# Test Reading M1 Q10 (page 12, idx 11)
pas, prm, opts = parse_reading_page(doc[11], 10)
print("\n--- Q10 ---")
print("Passage:", pas[:100])
print("Prompt:", prm)
print("Options:", opts)
