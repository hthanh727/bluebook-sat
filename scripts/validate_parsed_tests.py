import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'scripts/parsed_3_full_tests.json', 'r', encoding='utf-8') as f:
    tests = json.load(f)

for t in tests:
    title = t["title"]
    print(f"\n=== {title} ===")
    qs = t['questions']
    print(f"Total questions: {len(qs)}")
    warnings = 0
    for q in qs:
        # Check passage in reading
        if q['section'] == 'reading':
            if not q['passage'] or len(q['passage'].strip()) < 10:
                print(f"  WARN: Empty passage in {q['section']} M{q['module']} Q{q['question_number']}")
                warnings += 1
            if not q['prompt'] or len(q['prompt'].strip()) < 5:
                print(f"  WARN: Empty prompt in {q['section']} M{q['module']} Q{q['question_number']}")
                warnings += 1
            if not q['options'] or len(q['options']) != 4 or any(len(o) == 0 for o in q['options']):
                print(f"  WARN: Incomplete options in {q['section']} M{q['module']} Q{q['question_number']}: {q['options']}")
                warnings += 1
        elif q['section'] == 'math':
            if not q['prompt'] or len(q['prompt'].strip()) < 5:
                print(f"  WARN: Empty prompt in {q['section']} M{q['module']} Q{q['question_number']}")
                warnings += 1
            if q['question_type'] == 'mcq':
                if not q['options'] or len(q['options']) != 4 or any(len(o) == 0 for o in q['options']):
                    print(f"  WARN: Incomplete options in Math M{q['module']} Q{q['question_number']}: {q['options']}")
                    warnings += 1
            elif q['question_type'] == 'spr':
                if not q['correct_answer_text']:
                    print(f"  WARN: Missing correct_answer_text in SPR Math M{q['module']} Q{q['question_number']}")
                    warnings += 1
        if q['image_url']:
            img_full = os.path.join(r"c:\Users\Thanh GAY\Documents\bluebook-sat\public", q['image_url'].replace('/', os.sep))
            if not os.path.exists(img_full):
                print(f"  WARN: Image not found: {img_full}")
                warnings += 1
            else:
                sz = os.path.getsize(img_full)
                if sz == 0:
                    print(f"  WARN: Image empty: {img_full}")
                    warnings += 1
    if warnings == 0:
        print(f"  ALL {len(qs)} QUESTIONS VALIDATED PERFECTLY! Zero warnings.")
    else:
        print(f"  Found {warnings} warnings.")

print("\nValidation complete!")
