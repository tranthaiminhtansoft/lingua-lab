#!/usr/bin/env python3
"""Generate a single multi-sheet Excel workbook from englishContent.json."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/business/language-home/english/content/englishContent.json"
OUT = ROOT / "content-source/english-content.xlsx"

with SRC.open(encoding="utf-8") as f:
    bank = json.load(f)

def esc(value):
    text = "" if value is None else str(value)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )

def sheet_xml(headers, rows):
    lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
        "  <sheetData>",
    ]
    # header row
    cells = []
    for i, h in enumerate(headers, start=1):
        col = chr(64 + i) if i <= 26 else f"A{chr(64 + i - 26)}"
        cells.append(f'<c r="{col}1" t="inlineStr"><is><t xml:space="preserve">{esc(h)}</t></is></c>')
    lines.append(f'    <row r="1">{"".join(cells)}</row>')
    for r_idx, row in enumerate(rows, start=2):
        cells = []
        for i, value in enumerate(row, start=1):
            col = chr(64 + i) if i <= 26 else f"A{chr(64 + i - 26)}"
            if isinstance(value, bool):
                v = "TRUE" if value else "FALSE"
                cells.append(f'<c r="{col}{r_idx}" t="inlineStr"><is><t xml:space="preserve">{esc(v)}</t></is></c>')
            elif value is None or value == "":
                cells.append(f'<c r="{col}{r_idx}"/>')
            elif isinstance(value, (int, float)):
                cells.append(f'<c r="{col}{r_idx}"><v>{value}</v></c>')
            else:
                cells.append(f'<c r="{col}{r_idx}" t="inlineStr"><is><t xml:space="preserve">{esc(value)}</t></is></c>')
        lines.append(f'    <row r="{r_idx}">{"".join(cells)}</row>')
    lines.append("  </sheetData>")
    lines.append("</worksheet>")
    return "\n".join(lines)

# Build sheet data
sheets = {}

# meta
sheets["meta"] = (["version", "updatedAt"], [[bank["version"], bank["updatedAt"]]])

# topics
topic_rows = []
for t in bank["topics"]:
    topic_rows.append([
        t["id"], t["title"], t["description"], t["frequency"],
        t["startDate"], t["endDate"], t.get("timeLimit"), t.get("theme"),
        " | ".join(t.get("examples", [])), t["readExpected"],
    ])
sheets["topics"] = (
    ["id", "title", "description", "frequency", "startDate", "endDate", "timeLimit", "theme", "examples", "readExpected"],
    topic_rows,
)

# vocabulary
vocab_rows = []
for t in bank["topics"]:
    for v in t["vocab"]:
        vocab_rows.append([t["id"], v["term"], v["meaning"], v["pronunciation"], v["score"]])
sheets["vocabulary"] = (["topicId", "term", "meaning", "pronunciation", "score"], vocab_rows)

# grammar
grammar_rows = []
for t in bank["topics"]:
    for g in t["grammar"]:
        grammar_rows.append([t["id"], g["title"], g["category"], g["formula"], g["example"], g.get("pronunciation")])
sheets["grammar"] = (["topicId", "title", "category", "formula", "example", "pronunciation"], grammar_rows)

# quizzes
quiz_rows = []
for t in bank["topics"]:
    for q in t["quizzes"]:
        quiz_rows.append([t["id"], q["question"], " | ".join(q["options"]), q["answerIndex"], q["explanation"]])
sheets["quizzes"] = (["topicId", "question", "options", "answerIndex", "explanation"], quiz_rows)

# dialogue
dialogue_rows = []
for t in bank["topics"]:
    for i, s in enumerate(t["dialogue"]):
        dialogue_rows.append([t["id"], 0, i, s])
    for vi, variant in enumerate(t.get("dialogueVariants", []), start=1):
        for i, s in enumerate(variant):
            dialogue_rows.append([t["id"], vi, i, s])
sheets["dialogue"] = (["topicId", "variantIndex", "sentenceIndex", "sentence"], dialogue_rows)

# dialogue-guides
guide_rows = []
for t in bank["topics"]:
    for msg, g in (t.get("dialogueGuides") or {}).items():
        guide_rows.append([t["id"], msg, g["pronunciation"], g["meaning"]])
sheets["dialogue-guides"] = (["topicId", "message", "pronunciation", "meaning"], guide_rows)

# Build xlsx
sheet_names = list(sheets.keys())
content_types = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '  <Default Extension="xml" ContentType="application/xml"/>',
    '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
]
for i in range(1, len(sheet_names) + 1):
    content_types.append(f'  <Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
content_types.append('</Types>')

rels = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
    '</Relationships>',
]

workbook_rels = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
]
for i in range(1, len(sheet_names) + 1):
    workbook_rels.append(f'  <Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>')
workbook_rels.append('</Relationships>')

workbook = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    "  <sheets>",
]
for i, name in enumerate(sheet_names, start=1):
    workbook.append(f'    <sheet name="{esc(name)}" sheetId="{i}" r:id="rId{i}"/>')
workbook.append("  </sheets>")
workbook.append("</workbook>")

# Build zip
OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", "\n".join(content_types))
    zf.writestr("_rels/.rels", "\n".join(rels))
    zf.writestr("xl/workbook.xml", "\n".join(workbook))
    zf.writestr("xl/_rels/workbook.xml.rels", "\n".join(workbook_rels))
    for i, name in enumerate(sheet_names, start=1):
        headers, rows = sheets[name]
        zf.writestr(f"xl/worksheets/sheet{i}.xml", sheet_xml(headers, rows))

print(f"Created {OUT} with sheets: {', '.join(sheet_names)}")