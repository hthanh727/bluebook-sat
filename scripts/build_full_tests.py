import fitz
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from parser_engine_v2 import parse_reading_question, parse_math_question

test_configs = [
    {
        "title": "2026 September Int 3 @stewiesat",
        "path": r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf"
    },
    {
        "title": "2026 September Int 2 @stewiesat",
        "path": r"C:\Users\Thanh GAY\Downloads\2026 September Int 2 @stewiesat.pdf"
    },
    {
        "title": "2026 October Int 2 @stewiesat",
        "path": r"C:\Users\Thanh GAY\Downloads\2026 October Int 2 @stewiesat.pdf"
    }
]

all_parsed_tests = []

for cfg in test_configs:
    title = cfg["title"]
    doc = fitz.open(cfg["path"])
    print(f"\nParsing {title}...")
    questions = []
    
    # Reading M1: p3 to p29 (indices 2 to 28)
    for q in range(1, 28):
        page_idx = 2 + (q - 1)
        qdata = parse_reading_question(doc, page_idx, title, 1, q)
        questions.append(qdata)
        
    # Reading M2: p31 to p57 (indices 30 to 56)
    for q in range(1, 28):
        page_idx = 30 + (q - 1)
        qdata = parse_reading_question(doc, page_idx, title, 2, q)
        questions.append(qdata)
        
    # Math M1: p60 to p81 (indices 59 to 80)
    for q in range(1, 23):
        page_idx = 59 + (q - 1)
        qdata = parse_math_question(doc, page_idx, title, 1, q)
        questions.append(qdata)
        
    # Math M2: p83 to p104 (indices 82 to 103)
    for q in range(1, 23):
        page_idx = 82 + (q - 1)
        qdata = parse_math_question(doc, page_idx, title, 2, q)
        questions.append(qdata)
        
    print(f"Parsed {len(questions)} questions for {title}.")
    all_parsed_tests.append({
        "title": title,
        "type": "full",
        "questions": questions
    })

out_json = os.path.join(os.path.dirname(__file__), 'parsed_3_full_tests.json')
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(all_parsed_tests, f, indent=2, ensure_ascii=False)
print(f"\nSuccessfully wrote all parsed tests to {out_json}")
