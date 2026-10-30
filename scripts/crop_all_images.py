import fitz
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from cropper_utils import crop_and_save

base_dir = r"c:\Users\Thanh GAY\Documents\bluebook-sat\public\images"

tasks = [
    # ---------------- 2026 September Int 3 ----------------
    {
        "pdf": r"C:\Users\Thanh GAY\Downloads\2026 September Int 3 @stewiesat.pdf",
        "folder": "2026_sep_int_3",
        "crops": [
            (12, (50, 40, 360, 235), "r_m1_q11.png"),
            (39, (50, 40, 360, 240), "r_m2_q10.png"),
            (41, (50, 40, 360, 152), "r_m2_q12.png"),
            (68, (45, 68, 500, 192), "m_m1_q10.png"),
            (78, (45, 68, 520, 205), "m_m1_q20.png"),
            (80, (250, 68, 480, 225), "m_m1_q22.png"),
            (83, (260, 68, 460, 195), "m_m2_q2.png"),
        ]
    },
    # ---------------- 2026 September Int 2 ----------------
    {
        "pdf": r"C:\Users\Thanh GAY\Downloads\2026 September Int 2 @stewiesat.pdf",
        "folder": "2026_sep_int_2",
        "crops": [
            (12, (50, 40, 360, 245), "r_m1_q11.png"),
            (41, (50, 40, 360, 245), "r_m2_q12.png"),
            (42, (50, 40, 360, 252), "r_m2_q13.png"),
            (62, (270, 85, 450, 205), "m_m1_q4.png"),
            (65, (270, 85, 450, 210), "m_m1_q7.png"),
            (69, (320, 115, 410, 220), "m_m1_q11.png"),
            (70, (270, 85, 450, 205), "m_m1_q12.png"),
            (71, (45, 68, 500, 198), "m_m1_q13.png"),
            (73, (45, 68, 500, 215), "m_m1_q15.png"),
            (86, (230, 135, 490, 335), "m_m2_q5.png"),
            (88, (45, 68, 500, 220), "m_m2_q7.png"),
            (101, (45, 75, 500, 270), "m_m2_q20.png"),
        ]
    },
    # ---------------- 2026 October Int 2 ----------------
    {
        "pdf": r"C:\Users\Thanh GAY\Downloads\2026 October Int 2 @stewiesat.pdf",
        "folder": "2026_oct_int_2",
        "crops": [
            (11, (50, 40, 360, 240), "r_m1_q10.png"),
            (13, (50, 40, 360, 215), "r_m1_q12.png"),
            (14, (50, 30, 360, 215), "r_m1_q13.png"),
            (60, (45, 30, 360, 200), "m_m1_q2.png"),
            (69, (45, 30, 360, 200), "m_m1_q11.png"),
            (77, (45, 30, 360, 270), "m_m1_q19.png"),
            (82, (45, 30, 360, 300), "m_m2_q1.png"),
            (84, (260, 75, 460, 170), "m_m2_q3.png"),
            (88, (300, 75, 420, 125), "m_m2_q7.png"),
            (95, (75, 85, 200, 195), "m_m2_q14.png"),
            (97, (45, 30, 360, 205), "m_m2_q16.png"),
        ]
    }
]

for t in tasks:
    pdf_path = t["pdf"]
    folder = t["folder"]
    target_dir = os.path.join(base_dir, folder)
    print(f"\nProcessing {folder}...")
    doc = fitz.open(pdf_path)
    for page_idx, rect, filename in t["crops"]:
        out_path = os.path.join(target_dir, filename)
        crop_and_save(doc, page_idx, rect, out_path, zoom=3.0)

print("\nAll crops completed successfully!")
