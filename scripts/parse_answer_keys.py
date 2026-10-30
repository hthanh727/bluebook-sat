import fitz
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_paths = [
    ("2026 September Int 3 @stewiesat", r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf"),
    ("2026 September Int 2 @stewiesat", r"C:\Users\Thanh GAY\Downloads\2026 September Int 2 @stewiesat.pdf"),
    ("2026 October Int 2 @stewiesat", r"C:\Users\Thanh GAY\Downloads\2026 October Int 2 @stewiesat.pdf"),
]

def parse_rw_keys(page_text):
    # Expect 27 answers for section 1, 27 for section 2
    # Format typically: "Q A Q A Q A \n 1 A 10 B 19 A \n 2 A 11 C 20 B ..."
    # We can use regex to find pairs of number and choice (A, B, C, D)
    lines = [l.strip() for l in page_text.split('\n') if l.strip()]
    
    # Let's split by Section 1 and Section 2
    full_text = "\n".join(lines)
    s1_part = ""
    s2_part = ""
    if "Section 2" in full_text:
        parts = re.split(r'Section 2', full_text, flags=re.IGNORECASE)
        s1_part = parts[0]
        s2_part = "Section 2" + parts[1]
    
    def extract_pairs(text, max_q=27):
        pairs = {}
        # match tokens
        tokens = text.split()
        for i in range(len(tokens) - 1):
            if tokens[i].isdigit():
                q_num = int(tokens[i])
                val = tokens[i+1]
                if 1 <= q_num <= max_q and val in ['A', 'B', 'C', 'D']:
                    if q_num not in pairs:
                        pairs[q_num] = val
        return pairs

    s1 = extract_pairs(s1_part, 27)
    s2 = extract_pairs(s2_part, 27)
    return s1, s2

def parse_math_keys(page_text):
    lines = [l.strip() for l in page_text.split('\n') if l.strip()]
    full_text = "\n".join(lines)
    s1_part = ""
    s2_part = ""
    if "Section 2" in full_text:
        parts = re.split(r'Section 2', full_text, flags=re.IGNORECASE)
        s1_part = parts[0]
        s2_part = "Section 2" + parts[1]
    
    def extract_math_pairs(text, max_q=22):
        pairs = {}
        tokens = text.split()
        for i in range(len(tokens) - 1):
            if tokens[i].isdigit():
                q_num = int(tokens[i])
                val = tokens[i+1]
                # val can be A/B/C/D or number (e.g. 556, 12, 49, -1, 4.57, 34500, etc.)
                if 1 <= q_num <= max_q:
                    if q_num not in pairs:
                        # make sure tokens[i] is actually a Q number and not part of an answer
                        # check if next token looks like an answer
                        # if tokens[i+1] is a letter or number or fraction
                        pairs[q_num] = val
        return pairs

    s1 = extract_math_pairs(s1_part, 22)
    s2 = extract_math_pairs(s2_part, 22)
    return s1, s2

all_keys = {}
for name, path in pdf_paths:
    doc = fitz.open(path)
    rw_s1, rw_s2 = parse_rw_keys(doc[57].get_text())
    m_s1, m_s2 = parse_math_keys(doc[104].get_text())
    all_keys[name] = {
        'reading': {1: rw_s1, 2: rw_s2},
        'math': {1: m_s1, 2: m_s2}
    }
    print(f"\nKeys for {name}:")
    print(f"  RW S1: {len(rw_s1)} keys (expect 27): {rw_s1}")
    print(f"  RW S2: {len(rw_s2)} keys (expect 27): {rw_s2}")
    print(f"  Math S1: {len(m_s1)} keys (expect 22): {m_s1}")
    print(f"  Math S2: {len(m_s2)} keys (expect 22): {m_s2}")

with open('scratch_all_keys.json', 'w', encoding='utf-8') as f:
    json.dump(all_keys, f, indent=2)
print("\nSaved all keys to scratch_all_keys.json")
