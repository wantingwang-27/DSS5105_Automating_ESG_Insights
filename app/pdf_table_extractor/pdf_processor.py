import fitz  # PyMuPDF
import cv2
import numpy as np
from PIL import Image
import io


class PDFProcessor:
    """Handles splitting PDF pages at detected vertical gaps."""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.output_doc = fitz.open()

    def detect_visual_gap(self, page_num: int, threshold_length=300, high_intensity=250):
        page = self.doc.load_page(page_num)
        pix = page.get_pixmap(dpi=300)
        image = Image.open(io.BytesIO(pix.tobytes("png")))
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGBA2GRAY)

        height, width = gray.shape
        middle = gray[:, width // 3: 2 * width // 3]
        hist = np.mean(middle, axis=0)

        high_vals = [i for i, val in enumerate(hist) if val > high_intensity]
        if len(high_vals) >= threshold_length:
            gap_start = high_vals[0]
            gap_end = high_vals[-1]
            split_column = (width // 3 + gap_start + (gap_end - gap_start) // 2) * (page.rect.width / width)
            return split_column
        return None

    def split_page_at_gap(self, page_num: int, split_column: float):
        page = self.doc.load_page(page_num)
        width, height = page.rect.width, page.rect.height
        left_rect = fitz.Rect(0, 0, split_column, height)
        right_rect = fitz.Rect(split_column, 0, width, height)

        for rect in [right_rect, left_rect]:
            self.output_doc.insert_pdf(self.doc, from_page=page_num, to_page=page_num)
            self._redact_area(self.output_doc[-1], rect)
            self.output_doc[-1].set_cropbox(left_rect if rect == right_rect else right_rect)

    def _redact_area(self, page, rect):
        page.add_redact_annot(rect)
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    def save_split_pdf(self):
        output_path = self.pdf_path.replace('.pdf', '_split_text.pdf')
        self.output_doc.save(output_path)
        return output_path, self.output_doc.page_count
