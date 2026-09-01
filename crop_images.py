import fitz
import os

pdf_path = r'C:\Users\Thanh GAY\.gemini\antigravity-ide\brain\47cc5fff-b055-4625-b182-d80be3af754f\.user_uploaded\media_1788266257560.pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\Users\Thanh GAY\.gemini\antigravity-ide\scratch\bluebook-sat\public\images\psda_hard'
os.makedirs(out_dir, exist_ok=True)

# Define exact crops for diagrams
# PDF page dimensions: typically 612 x 792 (Letter) or similar
# Let's inspect page rects and save high-res cropped images
crops = [
    # (page_number_1_indexed, filename, (x0, y0, x1, y1))
    # Page 3: Two Histograms (Data Set A and Data Set B)
    (3, 'q3_histograms.png', (120, 160, 480, 350)),
    
    # Page 8: Ice cream scatterplot
    (8, 'q7_scatterplot_icecream.png', (15, 138, 195, 243)),
    
    # Page 9: Dot plot of bursts
    (9, 'q8_dotplot_bursts.png', (150, 160, 360, 293)),
    
    # Page 23: Bird flight scatterplot
    (23, 'q20_scatterplot_bird.png', (145, 175, 455, 472)),
    
    # Page 33: Beach visitors scatterplot
    (33, 'q30_scatterplot_beach.png', (15, 138, 185, 320)),
]

zoom = 3 # 3x scale for crisp retina-quality rendering
mat = fitz.Matrix(zoom, zoom)

for page_num, filename, (x0, y0, x1, y1) in crops:
    page = doc[page_num - 1]
    clip = fitz.Rect(x0, y0, x1, y1)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    filepath = os.path.join(out_dir, filename)
    pix.save(filepath)
    print(f"Saved {filename}: {pix.width}x{pix.height} to {filepath}")
