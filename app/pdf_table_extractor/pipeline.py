import pandas as pd
from pathlib import Path
from .pdf_processor import PDFProcessor
from .table_extractor import TableExtractor


class TablePipeline:
    """Main pipeline: splits PDF, extracts tables, saves to Excel."""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.cleaned_tables = []

    def run(self):
        processor = PDFProcessor(self.pdf_path)
        extractor = TableExtractor(self.pdf_path)

        table_pages = extractor.detect_table_pages()
        for page_num in table_pages:
            split_col = processor.detect_visual_gap(page_num)
            if split_col:
                processor.split_page_at_gap(page_num, split_col)
            else:
                processor.output_doc.insert_pdf(processor.doc, from_page=page_num, to_page=page_num)

        split_pdf_path, _ = processor.save_split_pdf()
        extractor = TableExtractor(split_pdf_path)
        for flavor in ["lattice", "stream"]:
            self.cleaned_tables.extend(extractor.extract_tables(flavor=flavor))

    def save_to_excel(self, output_dir="./output", filename=None):
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        if not filename:
            filename = Path(self.pdf_path).stem + "_tables.xlsx"
        output_path = output_dir / filename

        with pd.ExcelWriter(output_path) as writer:
            for idx, table in enumerate(self.cleaned_tables):
                table.to_excel(writer, sheet_name=f"Sheet{idx+1}", index=False)

        print(f"Saved to {output_path}")
        return output_path
