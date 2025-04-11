import pdfplumber
import camelot


class TableExtractor:
    """Extracts tables using Camelot and identifies pages with tables."""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path

    def detect_table_pages(self):
        pages = []
        with pdfplumber.open(self.pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                if page.extract_tables():
                    pages.append(i)
        return pages

    def extract_tables(self, pages="all", flavor="lattice"):
        tables = camelot.read_pdf(self.pdf_path, pages=pages, flavor=flavor)
        return [table.df for table in tables if not table.df.empty]
