import google.generativeai as genai
import os
import sys
import fitz
from PIL import Image
from dotenv import load_dotenv
import json
import time

load_dotenv()
if "GEMINI_API_KEY" not in os.environ:
    print("Error: GEMINI_API_KEY not found in .env")
    sys.exit(1)

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel('gemini-2.0-flash', generation_config={"response_mime_type": "application/json"})

def extract_graphs(pdf_path):
    print(f"Extracting graphs from {pdf_path}")
    doc = fitz.open(pdf_path)
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    out_dir = os.path.join(os.path.dirname(pdf_path), 'images')
    os.makedirs(out_dir, exist_ok=True)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        # Render high-res image for good crop quality
        pix = page.get_pixmap(dpi=150)
        img_path = os.path.join(out_dir, f"temp_{base_name}_page_{page_num}.png")
        pix.save(img_path)
        
        prompt = """
        You are a Math SAT extraction assistant. Look at this page of a Math SAT test.
        Identify any mathematical graphs, geometry figures, or diagrams on this page.
        For each graph/figure, return a JSON object with:
        - "module": The module number (1 or 2).
        - "question_number": The question number this graph belongs to (as an integer).
        - "ymin": The top edge of the bounding box (normalized 0 to 1000).
        - "xmin": The left edge of the bounding box (normalized 0 to 1000).
        - "ymax": The bottom edge of the bounding box (normalized 0 to 1000).
        - "xmax": The right edge of the bounding box (normalized 0 to 1000).
        
        Return a JSON array of these objects. If there are no graphs/figures on this page, return an empty array [].
        Only include actual graphs, diagrams, and figures. Do not include text-only tables.
        Important: ensure the bounding box tightly encompasses the entire figure including any axis labels or geometry labels.
        """
        
        try:
            img = Image.open(img_path)
            # Must pass as genai Image or raw bytes? PIL Image works with google-generativeai
            response = model.generate_content([img, prompt])
            
            text = response.text
            # Sometimes it might return markdown json blocks
            if text.startswith('```json'):
                text = text.strip('```json').strip('```').strip()
            elif text.startswith('```'):
                text = text.strip('```').strip()
                
            data = json.loads(text)
            
            if data:
                print(f"Page {page_num}: Found {len(data)} graphs.")
            
            for item in data:
                q_num = item.get('question_number')
                if q_num is None:
                    continue
                    
                width, height = img.size
                left = (item['xmin'] / 1000.0) * width
                top = (item['ymin'] / 1000.0) * height
                right = (item['xmax'] / 1000.0) * width
                bottom = (item['ymax'] / 1000.0) * height
                
                # Add a little padding
                pad = 10
                left = max(0, left - pad)
                top = max(0, top - pad)
                right = min(width, right + pad)
                bottom = min(height, bottom + pad)
                
                cropped = img.crop((left, top, right, bottom))
                
                # We save with module info if possible?
                # The python script doesn't easily know if it's Module 1 or 2.
                # Since each SAT test resets numbering for Module 2, there might be TWO question 1s!
                # Wait! We need to differentiate Module 1 and Module 2.
                # Let's ask Gemini which module it is, or just output "page_N_Q_M".
                module = item.get('module', 1)
                
                out_name = f"{base_name}_Module{module}_Q{q_num}.png"
                cropped.save(os.path.join(out_dir, out_name))
                print(f"Saved {out_name}")
            time.sleep(15) # delay to respect 5 requests/minute rate limit
        except Exception as e:
            print(f"Error processing page {page_num}: {e}")
            
        finally:
            # Clean up temp image
            img.close()
            if os.path.exists(img_path):
                os.remove(img_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_graphs.py <pdf_path>")
        sys.exit(1)
    extract_graphs(sys.argv[1])
