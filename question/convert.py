"""
SAT PDF to CSV Converter (No AI - Regex Parser)
================================================
Script này đọc file PDF đề thi SAT (Digital SAT Practice Test),
dùng regex để trích xuất câu hỏi, sau đó xuất ra file CSV
tương thích với hệ thống Bluebook SAT.

MIỄN PHÍ 100% - KHÔNG CẦN API KEY!

Cách dùng:
  python convert.py <đường_dẫn_file_pdf> --type <reading|math> [--module <1|2>]

Ví dụ:
  python convert.py "2026 May v2 Math.pdf" --type math
  python convert.py "sat_reading.pdf" --type reading

Yêu cầu:
  pip install pymupdf
"""

import argparse
import csv
import io
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

# Fix encoding trên Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


def extract_text_from_pdf(pdf_path: str) -> str:
    """Đọc toàn bộ text từ file PDF."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("❌ Thiếu thư viện PyMuPDF. Hãy chạy: pip install pymupdf")
        sys.exit(1)

    if not os.path.exists(pdf_path):
        print(f"❌ Không tìm thấy file: {pdf_path}")
        sys.exit(1)

    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        full_text += page.get_text()
    doc.close()
    return full_text


def parse_docx_elements(docx_path: str) -> list:
    """Đọc toàn bộ các đoạn văn và bảng biểu từ file DOCX."""
    if not os.path.exists(docx_path):
        print(f"❌ Không tìm thấy file: {docx_path}")
        sys.exit(1)

    with zipfile.ZipFile(docx_path) as docx:
        tree = ET.parse(docx.open('word/document.xml'))
        root = tree.getroot()
        
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        body = root.find('.//w:body', ns)
        if body is None:
            return []
            
        elements = []
        for child in body:
            tag = child.tag.split('}')[-1]
            if tag == 'p':
                text = "".join([t.text for t in child.findall('.//w:t', ns) if t.text]).strip()
                if text:
                    elements.append(('p', text))
            elif tag == 'tbl':
                html_table = parse_docx_xml_table(child, ns)
                if html_table:
                    elements.append(('tbl', html_table))
                    
        return elements


def parse_docx_xml_table(tbl_node, ns) -> str:
    """Biến đổi bảng XML của Word thành mã HTML Table đẹp mắt."""
    rows = []
    for tr in tbl_node.findall('.//w:tr', ns):
        row_cells = []
        for tc in tr.findall('.//w:tc', ns):
            cell_paragraphs = []
            for p in tc.findall('.//w:p', ns):
                p_text = "".join([t.text for t in p.findall('.//w:t', ns) if t.text]).strip()
                if p_text:
                    cell_paragraphs.append(p_text)
            cell_text = "<br>".join(cell_paragraphs)
            row_cells.append(cell_text)
        if row_cells:
            rows.append(row_cells)
            
    if not rows:
        return ""
        
    html = '<table class="passage-table" border="1" style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">'
    for r_idx, row in enumerate(rows):
        html += '<tr>'
        for cell in row:
            if r_idx == 0:
                html += f'<th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f8fafc; font-weight: bold; text-align: left;">{cell}</th>'
            else:
                html += f'<td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">{cell}</td>'
        html += '</tr>'
    html += '</table>'
    return html


def parse_docx_questions(elements: list, exam_type: str) -> list:
    """Duyệt qua các đối tượng Word và phân nhóm thành các câu hỏi SAT."""
    questions = []
    current_question = None
    current_module = 1
    temp_paragraphs = []
    
    for el_type, val in elements:
        if el_type == 'p':
            p_clean = val.strip()
            
            # Kiểm tra module marker
            mod_match = re.search(r'MODULE\s+(\d)', p_clean, re.IGNORECASE)
            if mod_match:
                current_module = int(mod_match.group(1))
                continue
                
            q_match = re.match(r'^C.u\s+(\d+)', p_clean, re.IGNORECASE)
            if q_match:
                if current_question:
                    process_docx_question(current_question, temp_paragraphs, questions, exam_type)
                q_num = int(q_match.group(1))
                current_question = {
                    'module': current_module,
                    'question_number': q_num,
                    'passage': '',
                    'prompt': '',
                    'option_a': '',
                    'option_b': '',
                    'option_c': '',
                    'option_d': '',
                    'correct_answer_index': -1,
                    'correct_answer_text': '',
                    'question_type': 'mcq'
                }
                temp_paragraphs = []
                continue
                
            if current_question is not None:
                temp_paragraphs.append(p_clean)
        elif el_type == 'tbl':
            if current_question is not None:
                temp_paragraphs.append(val)
                
    if current_question:
        process_docx_question(current_question, temp_paragraphs, questions, exam_type)
        
    return questions


def process_docx_question(q, paragraphs, questions_list, exam_type):
    """Phân tách đoạn văn của câu hỏi thành passage, prompt và 4 đáp án A/B/C/D."""
    option_a_idx = -1
    option_b_idx = -1
    option_c_idx = -1
    option_d_idx = -1
    
    for idx, p in enumerate(paragraphs):
        p_clean = p.strip()
        if p_clean.startswith('A.'):
            option_a_idx = idx
        elif p_clean.startswith('B.'):
            option_b_idx = idx
        elif p_clean.startswith('C.'):
            option_c_idx = idx
        elif p_clean.startswith('D.'):
            option_d_idx = idx
            
    if option_a_idx != -1 and option_b_idx != -1 and option_c_idx != -1 and option_d_idx != -1:
        q['option_a'] = paragraphs[option_a_idx][2:].strip()
        q['option_b'] = paragraphs[option_b_idx][2:].strip()
        q['option_c'] = paragraphs[option_c_idx][2:].strip()
        q['option_d'] = paragraphs[option_d_idx][2:].strip()
        content_paragraphs = paragraphs[:option_a_idx]
    else:
        if exam_type == 'math':
            q['question_type'] = 'spr'
            content_paragraphs = paragraphs
        else:
            content_paragraphs = paragraphs

    if content_paragraphs:
        q['prompt'] = content_paragraphs[-1]
        if len(content_paragraphs) > 1:
            q['passage'] = "\n\n".join(content_paragraphs[:-1])
            
    questions_list.append(q)


def detect_modules(text: str) -> list:
    """Tìm tất cả các module có trong PDF."""
    modules_found = []
    # Tìm pattern "Module X" trong text
    module_matches = list(re.finditer(r'Module\s+(\d)', text))
    if module_matches:
        for m in module_matches:
            mod_num = int(m.group(1))
            if mod_num not in [x[0] for x in modules_found]:
                modules_found.append((mod_num, m.start()))
    return modules_found


def split_by_module(text: str) -> dict:
    """Tách text theo module."""
    modules = detect_modules(text)
    result = {}

    if len(modules) == 0:
        # Không tìm thấy module marker -> coi tất cả là module 1
        result[1] = text
    elif len(modules) == 1:
        result[modules[0][0]] = text[modules[0][1]:]
    else:
        for i in range(len(modules)):
            mod_num = modules[i][0]
            start = modules[i][1]
            end = modules[i + 1][1] if i + 1 < len(modules) else len(text)
            result[mod_num] = text[start:end]

    return result


def parse_answer_sheet(text: str) -> dict:
    """
    Parse Answer Sheet từ cuối PDF.
    Trả về dict: { (module, question_number): answer_string }
    Ví dụ: { (1, 1): 'D', (1, 3): '64', (2, 6): '44' }
    """
    answers = {}

    # Tìm phần Answer Sheet
    answer_match = re.search(r'Answer\s+Sheet', text)
    if not answer_match:
        print("   ⚠️ Không tìm thấy Answer Sheet trong PDF")
        return answers

    answer_text = text[answer_match.start():]

    # Tách theo Module
    module_splits = re.split(r'Module\s+(\d)', answer_text)
    # module_splits: ['Answer Sheet\n', '1', '\n1\n2\n...', '2', '\n1\n2\n...']

    for i in range(1, len(module_splits) - 1, 2):
        mod_num = int(module_splits[i])
        mod_content = module_splits[i + 1].strip()

        # Loại bỏ watermark
        mod_content = re.sub(r'@abusat\s*\d+', '', mod_content)
        mod_content = re.sub(r'\n\d+\s*$', '', mod_content)  # page number at end

        lines = [l.strip() for l in mod_content.split('\n') if l.strip()]

        # Cấu trúc Answer Sheet: nhóm 10 câu
        # Dòng 1-10: số thứ tự câu hỏi (1, 2, 3, ..., 10)
        # Dòng 11-20: đáp án (D, C, 64, B, ...)
        # Rồi tiếp nhóm 10 câu nữa, v.v.

        # Tìm các nhóm: dãy liên tiếp số tăng dần là câu hỏi, phần còn lại là đáp án
        q_numbers = []
        answer_values = []
        expecting_numbers = True
        current_numbers = []
        current_answers = []

        for line in lines:
            # Kiểm tra xem dòng này có phải là số thứ tự câu hỏi không
            if line.isdigit() and expecting_numbers:
                num = int(line)
                if len(current_numbers) == 0 or num == current_numbers[-1] + 1:
                    current_numbers.append(num)
                else:
                    # Số không liên tiếp -> đây là đáp án
                    expecting_numbers = False
                    current_answers.append(line)
            elif expecting_numbers and current_numbers:
                # Hết dãy số -> bắt đầu đáp án
                expecting_numbers = False
                current_answers.append(line)
            elif not expecting_numbers:
                current_answers.append(line)

            # Khi đã thu đủ đáp án cho nhóm hiện tại
            if not expecting_numbers and len(current_answers) == len(current_numbers):
                q_numbers.extend(current_numbers)
                answer_values.extend(current_answers)
                current_numbers = []
                current_answers = []
                expecting_numbers = True

        # Xử lý nhóm cuối nếu còn sót
        if current_numbers and current_answers:
            # Pad nếu thiếu
            while len(current_answers) < len(current_numbers):
                current_answers.append('')
            q_numbers.extend(current_numbers)
            answer_values.extend(current_answers[:len(current_numbers)])

        # Map vào dict
        for q_num, ans in zip(q_numbers, answer_values):
            answers[(mod_num, q_num)] = ans

    return answers


def apply_answers(questions: list, answer_sheet: dict):
    """Gán đáp án từ answer sheet vào danh sách câu hỏi."""
    letter_to_index = {'A': 0, 'B': 1, 'C': 2, 'D': 3}

    for q in questions:
        key = (q['module'], q['question_number'])
        if key in answer_sheet:
            ans = answer_sheet[key]
            if q['question_type'] == 'mcq' and ans.upper() in letter_to_index:
                q['correct_answer_index'] = letter_to_index[ans.upper()]
            elif q['question_type'] == 'spr':
                q['correct_answer_text'] = ans
            elif q['question_type'] == 'mcq':
                # Đáp án là số nhưng câu hỏi là MCQ -> có thể phân loại sai, chuyển sang SPR
                q['question_type'] = 'spr'
                q['correct_answer_text'] = ans
                q['correct_answer_index'] = -1



def parse_math_questions(text: str, module: int) -> list:
    """Parse các câu hỏi Toán từ text thuần."""
    questions = []

    # Tách câu hỏi bằng pattern "Question N. X"
    pattern = r'Question\s+N\.\s*(\d+)'
    splits = re.split(pattern, text)

    # splits sẽ có dạng: [trước_q1, "1", nội_dung_q1, "2", nội_dung_q2, ...]
    if len(splits) < 3:
        print(f"   ⚠️ Không tìm thấy câu hỏi nào với pattern 'Question N. X'")
        return questions

    for i in range(1, len(splits) - 1, 2):
        q_num = int(splits[i])
        q_content = splits[i + 1].strip()

        # Loại bỏ watermark/footer
        q_content = re.sub(r'@abusat\s*\d+', '', q_content)
        q_content = re.sub(r'2026 May\s*(II|I)', '', q_content)
        q_content = re.sub(r'Tg:\s*DigitSAT', '', q_content)
        q_content = re.sub(r'\n\d+\s*$', '', q_content)  # page numbers at end

        # Tìm các đáp án A), B), C), D)
        choice_pattern = r'(?:^|\n)\s*([A-D])\)\s*'
        choices = list(re.finditer(choice_pattern, q_content))

        if len(choices) >= 4:
            # MCQ - lấy prompt (phần trước đáp án A)
            prompt_text = q_content[:choices[0].start()].strip()
            prompt_text = re.sub(r'\s+', ' ', prompt_text)  # collapse whitespace

            # Lấy text cho từng lựa chọn
            options = []
            for j in range(4):
                start = choices[j].end()
                end = choices[j + 1].start() if j + 1 < len(choices) else len(q_content)
                opt_text = q_content[start:end].strip()
                # Loại bỏ các dòng thừa
                opt_text = re.sub(r'@abusat.*', '', opt_text).strip()
                opt_text = re.sub(r'\n\d+\s*$', '', opt_text).strip()
                opt_text = re.sub(r'\s+', ' ', opt_text)
                options.append(opt_text)

            questions.append({
                'module': module,
                'question_number': q_num,
                'prompt': prompt_text,
                'question_type': 'mcq',
                'option_a': options[0] if len(options) > 0 else '',
                'option_b': options[1] if len(options) > 1 else '',
                'option_c': options[2] if len(options) > 2 else '',
                'option_d': options[3] if len(options) > 3 else '',
                'correct_answer_index': -1,  # Không có đáp án trong đề
                'correct_answer_text': '',
            })
        else:
            # SPR - không có đáp án A/B/C/D
            prompt_text = q_content.strip()
            prompt_text = re.sub(r'\s+', ' ', prompt_text)

            questions.append({
                'module': module,
                'question_number': q_num,
                'prompt': prompt_text,
                'question_type': 'spr',
                'option_a': '',
                'option_b': '',
                'option_c': '',
                'option_d': '',
                'correct_answer_index': -1,
                'correct_answer_text': '',
            })

    return questions


def save_math_csv(questions: list, output_path: str):
    """Lưu câu hỏi Math ra file CSV."""
    
    # --- File tổng hợp chuẩn Unified Engine ---
    all_headers = ['section', 'module', 'question_number', 'passage', 'prompt',
                   'question_type', 'option_a', 'option_b', 'option_c', 'option_d',
                   'correct_answer', 'correct_answer_text', 'image_url']

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(all_headers)
        for q in questions:
            # correct_answer_index is 0,1,2,3 for A,B,C,D
            ans_idx = q.get('correct_answer_index')
            ans_letter = ''
            if ans_idx is not None and str(ans_idx).isdigit() and int(ans_idx) >= 0 and int(ans_idx) < 4:
                ans_letter = ['A', 'B', 'C', 'D'][int(ans_idx)]
                
            writer.writerow([
                'math', q['module'], q['question_number'], '', q['prompt'],
                q['question_type'], q['option_a'], q['option_b'], q['option_c'], q['option_d'],
                ans_letter if q['question_type'] == 'mcq' else '',
                q.get('correct_answer_text', '') if q['question_type'] == 'spr' else '',
                ''
            ])
    print(f"   📁 File Math tổng hợp: {output_path} ({len(questions)} câu)")


def save_reading_csv(questions: list, output_path: str):
    """Lưu câu hỏi Reading ra file CSV."""
    headers = ['section', 'module', 'question_number', 'passage', 'prompt',
               'question_type', 'option_a', 'option_b', 'option_c', 'option_d',
               'correct_answer', 'correct_answer_text', 'image_url']

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(headers)
        for q in questions:
            ans_idx = q.get('correct_answer_index')
            ans_letter = ''
            if ans_idx is not None and str(ans_idx).isdigit() and int(ans_idx) >= 0 and int(ans_idx) < 4:
                ans_letter = ['A', 'B', 'C', 'D'][int(ans_idx)]
                
            writer.writerow([
                'reading', q['module'], q['question_number'],
                q.get('passage', ''), q['prompt'],
                'mcq', q['option_a'], q['option_b'], q['option_c'], q['option_d'],
                ans_letter, '', ''
            ])
    print(f"   📁 File: {output_path} ({len(questions)} câu)")


def main():
    parser = argparse.ArgumentParser(
        description='🎓 SAT PDF to CSV Converter (Không cần AI!)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  python convert.py "sat_math.pdf" --type math
  python convert.py "sat_reading.pdf" --type reading
        """
    )
    parser.add_argument('pdf', help='Đường dẫn tới file PDF đề thi SAT')
    parser.add_argument('--type', '-t', required=True, choices=['reading', 'math'],
                        help='Loại bài thi: reading hoặc math')
    parser.add_argument('--module', '-m', type=int, choices=[1, 2], default=None,
                        help='Module (1 hoặc 2) - tùy chọn')
    parser.add_argument('--output', '-o', default=None,
                        help='Tên file CSV đầu ra (mặc định: tên_file_pdf.csv)')

    args = parser.parse_args()

    if args.output is None:
        base_name = os.path.splitext(os.path.basename(args.pdf))[0]
        args.output = os.path.join(os.path.dirname(args.pdf) or '.', f"{base_name}.csv")

    print("=" * 60)
    print("🎓 SAT PDF to CSV Converter (No AI - Regex)")
    print("=" * 60)
    print(f"📄 File PDF : {args.pdf}")
    print(f"📝 Loại     : {'Reading & Writing' if args.type == 'reading' else 'Math'}")
    print(f"💾 Output   : {args.output}")
    print("=" * 60)

    # Bước 1: Đọc và phân tích file đầu vào
    is_docx = args.pdf.lower().endswith('.docx')
    all_questions = []

    if is_docx:
        print("\n📖 Bước 1: Đang đọc file DOCX...")
        elements = parse_docx_elements(args.pdf)
        print(f"   ✅ Đã đọc xong ({len(elements)} phần tử)")

        print("\n📝 Bước 2: Đang phân tích câu hỏi từ file Word...")
        all_questions = parse_docx_questions(elements, args.type)
        print(f"   ✅ Tìm thấy {len(all_questions)} câu hỏi")
    else:
        # Bước 1: Đọc PDF
        print("\n📖 Bước 1: Đang đọc file PDF...")
        text = extract_text_from_pdf(args.pdf)
        print(f"   ✅ Đã đọc xong ({len(text)} ký tự)")

        # Bước 2: Tách module
        print("\n🔍 Bước 2: Đang tìm các module...")
        module_texts = split_by_module(text)
        print(f"   ✅ Tìm thấy {len(module_texts)} module: {list(module_texts.keys())}")

        # Bước 3: Parse từng module
        print("\n📝 Bước 3: Đang phân tích câu hỏi...")
        for mod_num, mod_text in module_texts.items():
            print(f"\n   --- Module {mod_num} ---")
            if args.type == 'math':
                qs = parse_math_questions(mod_text, mod_num)
            else:
                qs = parse_math_questions(mod_text, mod_num)  # Reading cũng dùng cùng parser
            all_questions.extend(qs)
            mcq_count = sum(1 for q in qs if q['question_type'] == 'mcq')
            spr_count = sum(1 for q in qs if q['question_type'] == 'spr')
            print(f"   ✅ {len(qs)} câu (MCQ: {mcq_count}, SPR: {spr_count})")

        # Bước 3.5: Parse Answer Sheet
        print("\n📋 Bước 3.5: Đang tìm Answer Sheet...")
        answer_sheet = parse_answer_sheet(text)
        if answer_sheet:
            print(f"   ✅ Tìm thấy đáp án cho {len(answer_sheet)} câu!")
            apply_answers(all_questions, answer_sheet)
            answered = sum(1 for q in all_questions
                           if (q['question_type'] == 'mcq' and q['correct_answer_index'] != -1)
                           or (q['question_type'] == 'spr' and q['correct_answer_text'] != ''))
            print(f"   ✅ Đã gán đáp án cho {answered}/{len(all_questions)} câu")
        else:
            print("   ⚠️ Không tìm thấy Answer Sheet")

    # Bước 4: Lưu CSV
    print(f"\n💾 Bước 4: Đang lưu file CSV...")
    if args.type == 'math':
        save_math_csv(all_questions, args.output)
    else:
        save_reading_csv(all_questions, args.output)

    # Tóm tắt
    print("\n" + "=" * 60)
    print("🎉 HOÀN TẤT!")
    print("=" * 60)
    total_mcq = sum(1 for q in all_questions if q['question_type'] == 'mcq')
    total_spr = sum(1 for q in all_questions if q['question_type'] == 'spr')
    print(f"📊 Tổng: {len(all_questions)} câu (MCQ: {total_mcq}, SPR: {total_spr})")

    # Kiểm tra số lượng câu thiếu đáp án
    missing_mcq = sum(1 for q in all_questions if q['question_type'] == 'mcq' and q['correct_answer_index'] == -1)
    missing_spr = sum(1 for q in all_questions if q['question_type'] == 'spr' and q['correct_answer_text'] == '')

    if missing_spr > 0:
        print(f"\n⚠️  Có {missing_spr} câu SPR chưa điền đáp án, cần tự điền vào cột 'correct_answer_text' trong file CSV!")
    if missing_mcq > 0:
        print(f"⚠️  Có {missing_mcq} câu MCQ chưa điền đáp án, cần tự điền vào cột 'correct_answer_index' (0=A, 1=B, 2=C, 3=D)!")
    
    if missing_mcq == 0 and missing_spr == 0:
        print(f"\n✅ Đã tự động điền đầy đủ đáp án cho tất cả {len(all_questions)} câu từ Answer Sheet!")

    print(f"\n💡 Import file CSV vào Admin Panel tại: http://localhost:3000/admin.html")


if __name__ == '__main__':
    main()
