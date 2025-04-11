from pipeline import TablePipeline

if __name__ == "__main__":
    pdf_path = "example.pdf"  # Update with your PDF file
    pipeline = TablePipeline(pdf_path)
    pipeline.run()
    pipeline.save_to_excel()
