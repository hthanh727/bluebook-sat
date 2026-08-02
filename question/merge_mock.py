import csv
import argparse

# Cấu trúc file chuẩn mới nhất cho Full Mock Test
UNIFIED_HEADERS = [
    'section', 'module', 'question_number', 'passage', 'prompt',
    'question_type', 'option_a', 'option_b', 'option_c', 'option_d',
    'correct_answer', 'correct_answer_text', 'image_url'
]

def map_reading_row(row):
    """Chuyển đổi dòng CSV Reading cũ sang chuẩn mới."""
    # correct_answer trong Reading cũ là index (0,1,2,3)
    ans_idx = row.get('correct_answer', '')
    ans_letter = ''
    if str(ans_idx).isdigit() and 0 <= int(ans_idx) <= 3:
        ans_letter = ['A', 'B', 'C', 'D'][int(ans_idx)]
    elif ans_idx in ['A', 'B', 'C', 'D']:
        ans_letter = ans_idx

    return {
        'section': 'reading',
        'module': row.get('module', ''),
        'question_number': row.get('question_number', ''),
        'passage': row.get('passage', ''),
        'prompt': row.get('prompt', ''),
        'question_type': 'mcq',
        'option_a': row.get('option_a', ''),
        'option_b': row.get('option_b', ''),
        'option_c': row.get('option_c', ''),
        'option_d': row.get('option_d', ''),
        'correct_answer': ans_letter,
        'correct_answer_text': '',
        'image_url': row.get('image_url', '')
    }

def map_math_row(row):
    """Chuyển đổi dòng CSV Math cũ sang chuẩn mới."""
    ans_idx = row.get('correct_answer_index', '')
    ans_letter = ''
    if str(ans_idx).isdigit() and 0 <= int(ans_idx) <= 3:
        ans_letter = ['A', 'B', 'C', 'D'][int(ans_idx)]
    elif ans_idx in ['A', 'B', 'C', 'D']:
        ans_letter = ans_idx

    q_type = row.get('question_type', 'mcq')
    
    return {
        'section': 'math',
        'module': row.get('module', ''),
        'question_number': row.get('question_number', ''),
        'passage': '', # Toán không có đoạn văn
        'prompt': row.get('prompt', ''),
        'question_type': q_type,
        'option_a': row.get('option_a', ''),
        'option_b': row.get('option_b', ''),
        'option_c': row.get('option_c', ''),
        'option_d': row.get('option_d', ''),
        'correct_answer': ans_letter if q_type == 'mcq' else '',
        'correct_answer_text': row.get('correct_answer_text', '') if q_type == 'spr' else '',
        'image_url': row.get('image_url', '')
    }

def process_file(filepath, map_func):
    """Đọc file CSV cũ và trả về danh sách các row theo cấu trúc mới."""
    results = []
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                results.append(map_func(row))
        print(f"[SUCCESS] Successfully read {len(results)} questions from file: {filepath}")
    except Exception as e:
        print(f"[ERROR] Error reading file {filepath}: {e}")
    return results

def main():
    parser = argparse.ArgumentParser(description="Tool gộp Reading CSV và Math CSV CŨ thành một Full Mock Test CSV MỚI.")
    parser.add_argument('--reading', '-r', required=True, help="Đường dẫn tới file CSV Reading cũ")
    parser.add_argument('--math', '-m', required=True, help="Đường dẫn tới file CSV Math cũ")
    parser.add_argument('--output', '-o', default='Full_Mock_Test_Converted.csv', help="Tên file output (Mặc định: Full_Mock_Test_Converted.csv)")
    
    args = parser.parse_args()

    print("[INFO] Starting merge and convert process...")
    all_questions = []

    # Xử lý Reading
    reading_questions = process_file(args.reading, map_reading_row)
    all_questions.extend(reading_questions)

    # Xử lý Math
    math_questions = process_file(args.math, map_math_row)
    all_questions.extend(math_questions)

    if not all_questions:
        print("[WARNING] No questions were converted. Please check the file paths.")
        return

    # Lưu ra file mới
    try:
        with open(args.output, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=UNIFIED_HEADERS, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            writer.writerows(all_questions)
        print(f"\n[SUCCESS] SUCCESS! Standardized file exported: {args.output} ({len(all_questions)} questions)")
        print(f"[INFO] You can directly upload the file {args.output} to the Admin Panel (select Full Mock Test).")
    except Exception as e:
        print(f"[ERROR] Error writing output file: {e}")

if __name__ == "__main__":
    main()
