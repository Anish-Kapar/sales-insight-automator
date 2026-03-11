import io
import csv
import pandas as pd


def parse_file(contents: bytes, filename: str) -> str:
    """Parse CSV or Excel file and return a plain-text representation."""
    if filename.endswith(".csv"):
        return _parse_csv(contents)
    elif filename.endswith(".xlsx"):
        return _parse_excel(contents)
    else:
        raise ValueError(f"Unsupported file type: {filename}")


def _parse_csv(contents: bytes) -> str:
    text = contents.decode("utf-8", errors="replace")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        raise ValueError("CSV file is empty.")
    lines = [", ".join(row) for row in rows]
    return "\n".join(lines)


def _parse_excel(contents: bytes) -> str:
    df = pd.read_excel(io.BytesIO(contents))
    if df.empty:
        raise ValueError("Excel file is empty.")
    return df.to_csv(index=False)
