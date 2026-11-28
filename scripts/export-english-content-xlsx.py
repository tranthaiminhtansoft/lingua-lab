#!/usr/bin/env python3
"""Generate a single multi-sheet Excel workbook from englishContent.json."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/business/language-home/english/content/englishContent.json"
OUT = ROOT / "english-content.xlsx"

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

def sheet_xml(headers, rows, validations=None):
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
    if validations:
        lines.append(f'  <dataValidations count="{len(validations)}">')
        for v in validations:
            attrs = ' '.join(f'{k}="{esc(str(val))}"' for k, val in v["attrs"].items())
            lines.append(f'    <dataValidation {attrs}>')
            if v.get("formula1"):
                lines.append(f'      <formula1>{esc(v["formula1"])}</formula1>')
            if v.get("formula2"):
                lines.append(f'      <formula2>{esc(v["formula2"])}</formula2>')
            lines.append('    </dataValidation>')
        lines.append('  </dataValidations>')
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
        vocab_rows.append([t["id"], v["term"], v["meaning"], v["pronunciation"], v.get("synonyms", ""), v["score"]])
sheets["vocabulary"] = (["topicId", "term", "meaning", "pronunciation", "synonyms", "score"], vocab_rows)

# grammar
grammar_headers = ["topicId", "formula", "example", "pronunciation"]
grammar_rows = []
for t in bank["topics"]:
    formula_parts = []
    example_parts = []
    pronunciation_parts = []
    for g in t["grammar"]:
        f = g["formula"]
        if g.get("usage"):
            usage = g["usage"].strip()
            if usage.startswith("[") and usage.endswith("]"):
                f = usage + "\n" + f
            else:
                f = "[" + usage + "]\n" + f
        formula_parts.append(f)
        ex = g["example"]
        m = re.match(r"^(.*?)\s*(\([^()]*\))\s*$", ex)
        example_parts.append(m.group(1).strip() + "\n" + m.group(2).strip() if m else ex)
        pronunciation_parts.append(g.get("pronunciation") or "")
    formula_field = "\n\n".join(formula_parts)
    example_field = "\n\n".join(example_parts)
    pronunciation_field = "\n\n".join(pronunciation_parts)
    grammar_rows.append([t["id"], formula_field, example_field, pronunciation_field])
sheets["grammar"] = (grammar_headers, grammar_rows)

# quizzes
quiz_rows = []
for t in bank["topics"]:
    for q in t["quizzes"]:
        ai = q.get("answerIndices") or [q["answerIndex"]]
        labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        opts = [f"{labels[i]}. {o}" for i, o in enumerate(q["options"])]
        quiz_rows.append([t["id"], q.get("questionType", ""), q["question"], "\n".join(opts), ",".join(str(x) for x in ai), q["explanation"]])
sheets["quizzes"] = (["topicId", "questionType", "question", "options", "answerIndex", "explanation"], quiz_rows)

# dialogue
def fmt_dialogue(msgs):
    out = []
    for msg in msgs:
        m = re.match(r"^(.*?)\s*(\([^()]*\))\s*$", msg)
        if m and m.group(1).strip():
            out.extend([m.group(1).strip(), "", m.group(2).strip(), ""])
        else:
            out.extend([msg, ""])
    while out and out[-1] == "":
        out.pop()
    return "\n".join(out)

dialogue_rows = []
for t in bank["topics"]:
    dialogue_rows.append([t["id"], 0, fmt_dialogue(t["dialogue"])])
    for vi, variant in enumerate(t.get("dialogueVariants", []), start=1):
        dialogue_rows.append([t["id"], vi, fmt_dialogue(variant)])
sheets["dialogue"] = (["topicId", "variantIndex", "sentences"], dialogue_rows)

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

# Validations
topic_count = len(bank["topics"])
topic_id_range = f"topics!$A$2:$A${max(200, topic_count + 50)}"
freq_list = '"daily,everyWeekend,limitedTime,everyMon,everyTue,everyWed,everyThu,everyFri,everySat,everySun"'
enddate_formula = 'OR(AND($D2<>"limitedTime",$F2="none"),AND($D2="limitedTime",$F2<>"none",$F2>$E2))'

validations = {
    "topics": [
        {"attrs": {"type":"list","allowBlank":"1","showErrorMessage":"1","sqref":"D2:D1000"}, "formula1": freq_list},
        {"attrs": {"type":"custom","allowBlank":"1","showErrorMessage":"1","sqref":"F2:F1000"}, "formula1": enddate_formula},
    ],
}
for name in ["vocabulary","grammar","quizzes","dialogue","dialogue-guides"]:
    validations[name] = [
        {"attrs": {"type":"list","allowBlank":"1","showErrorMessage":"1","sqref":"A2:A5000"}, "formula1": topic_id_range},
    ]

# Build zip
OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", "\n".join(content_types))
    zf.writestr("_rels/.rels", "\n".join(rels))
    zf.writestr("xl/workbook.xml", "\n".join(workbook))
    zf.writestr("xl/_rels/workbook.xml.rels", "\n".join(workbook_rels))
    for i, name in enumerate(sheet_names, start=1):
        headers, rows = sheets[name]
        zf.writestr(f"xl/worksheets/sheet{i}.xml", sheet_xml(headers, rows, validations.get(name)))

print(f"Created {OUT} with sheets: {', '.join(sheet_names)}")