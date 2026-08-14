import fitz
import re
import json
import os

pdf_path = 'C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/b1d55254-bb1e-4024-88a3-d14ccd4809f2/.user_uploaded/media_1786731309486.pdf'
image_out_dir = 'c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/public/images'

if not os.path.exists(image_out_dir):
    os.makedirs(image_out_dir)

doc = fitz.open(pdf_path)
questions = []
extracted_images_count = 0

print(f"Total pages in new PDF: {len(doc)}")

for i in range(len(doc)):
    page = doc[i]
    text = page.get_text()
    q_num = i + 1
    
    # 1. Parse Question ID
    q_id_match = re.search(r"Question ID:\s*([a-zA-Z0-9]+)", text)
    q_id = q_id_match.group(1) if q_id_match else f"unknown_{q_num}"
    
    # 2. Parse Difficulty
    difficulty = "Hard" # default as requested
    
    # 3. Parse Question, Options, Correct Answer
    # We locate "Question" keyword and split
    lines = text.split("\n")
    
    # Find line containing exactly "Question" or similar
    q_line_idx = -1
    for idx, line in enumerate(lines):
        if line.strip().lower() == "question":
            q_line_idx = idx
            break
            
    if q_line_idx == -1:
        # fallback search
        for idx, line in enumerate(lines):
            if "question" in line.lower() and idx < 15:
                q_line_idx = idx
                break
                
    # Extract text from after "Question" line
    content_after_q = "\n".join(lines[q_line_idx + 1:])
    
    # Locate bounds
    ans_idx = content_after_q.find("\nAnswer\n")
    if ans_idx == -1:
        ans_idx = content_after_q.find("\nAnswer\r\n")
        
    corr_ans_idx = content_after_q.find("\nCorrect Answer:")
    rationale_idx = content_after_q.find("\nRationale\n")
    if rationale_idx == -1:
        rationale_idx = content_after_q.find("\nRationale\r\n")
        
    # Check if MCQ or SPR
    q_type = "spr"
    prompt = ""
    options = None
    correct_answer_index = null = None
    correct_answer_text = ""
    
    if ans_idx != -1:
        # MCQ
        q_type = "mcq"
        prompt = content_after_q[:ans_idx].strip()
        
        # Extract options
        end_opts = corr_ans_idx if corr_ans_idx != -1 else (rationale_idx if rationale_idx != -1 else len(content_after_q))
        opts_text = content_after_q[ans_idx + 8:end_opts].strip()
        
        # Parse A, B, C, D
        opt_a = re.search(r"^A\.\s*(.*?)(?=\nB\.|\r\nB\.|$)", opts_text, re.DOTALL)
        opt_b = re.search(r"\nB\.\s*(.*?)(?=\nC\.|\r\nC\.|$)", opts_text, re.DOTALL)
        opt_c = re.search(r"\nC\.\s*(.*?)(?=\nD\.|\r\nD\.|$)", opts_text, re.DOTALL)
        opt_d = re.search(r"\nD\.\s*(.*?)$", opts_text, re.DOTALL)
        
        options = [
            opt_a.group(1).strip() if opt_a else "",
            opt_b.group(1).strip() if opt_b else "",
            opt_c.group(1).strip() if opt_c else "",
            opt_d.group(1).strip() if opt_d else ""
        ]
    else:
        # SPR
        end_prompt = corr_ans_idx if corr_ans_idx != -1 else (rationale_idx if rationale_idx != -1 else len(content_after_q))
        prompt = content_after_q[:end_prompt].strip()
        
    # Extract correct answer text
    if corr_ans_idx != -1:
        end_corr = rationale_idx if rationale_idx != -1 else len(content_after_q)
        corr_text = content_after_q[corr_ans_idx + 16:end_corr].strip()
        if q_type == "mcq":
            # Match index
            correct_answer_index = ["A", "B", "C", "D"].index(corr_text.upper()) if corr_text.upper() in ["A", "B", "C", "D"] else 0
        else:
            correct_answer_text = corr_text
            
    # 4. Extract diagram if exists
    drawings = page.get_drawings()
    x0_min = 9999
    y0_min = 9999
    x1_max = -9999
    y1_max = -9999
    draw_count = 0
    
    for draw in drawings:
        rect = draw["rect"]
        if rect.y0 > 130 and rect.y1 < 520:
            if rect.width > 25 or rect.height > 25:
                x0_min = min(x0_min, rect.x0)
                y0_min = min(y0_min, rect.y0)
                x1_max = max(x1_max, rect.x1)
                y1_max = max(y1_max, rect.y1)
                draw_count += 1
                
    image_url = None
    if draw_count >= 10 and x1_max > x0_min and y1_max > y0_min:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        crop_box = fitz.IRect(
            max(0, int(x0_min * 2) - 15), 
            max(0, int(y0_min * 2) - 15), 
            min(pix.width, int(x1_max * 2) + 15), 
            min(pix.height, int(y1_max * 2) + 15)
        )
        cropped_pix = fitz.Pixmap(pix.colorspace, crop_box, pix.alpha)
        cropped_pix.copy(pix, crop_box)
        
        filename = f"media_1786731309486_Q{q_num}.png"
        filepath = os.path.join(image_out_dir, filename)
        cropped_pix.save(filepath)
        image_url = f"images/{filename}"
        extracted_images_count += 1
        
    questions.append({
        "question_number": q_num,
        "passage": "",
        "prompt": prompt,
        "options": options,
        "correct_answer_index": correct_answer_index,
        "correct_answer_text": correct_answer_text,
        "question_type": q_type,
        "difficulty": difficulty,
        "section": "math",
        "image_url": image_url
    })

# Write JSON output
with open('c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/questions_hard.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(questions)} questions. Extracted {extracted_images_count} diagrams.")
doc.close()
