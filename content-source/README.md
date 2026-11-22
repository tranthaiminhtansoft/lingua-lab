# English content source (CSV / Excel / Google Sheets)

These CSV files are the human-friendly source for the English content bank.
They can be opened in Excel or Google Sheets, edited, then converted back to
`src/business/language-home/english/content/englishContent.json`.

## Files

- `meta.csv` — `version`, `updatedAt`
- `topics.csv` — one row per topic (includes `examples` as ` | `-separated)
- `vocabulary.csv` — `topicId, term, meaning, pronunciation, score`
- `grammar.csv` — `topicId, title, category, formula, example, pronunciation`
- `quizzes.csv` — `topicId, question, options (pipe-separated), answerIndex, explanation`
- `dialogue.csv` — `topicId, variantIndex (0 = main), sentenceIndex, sentence`
- `dialogue-guides.csv` — `topicId, message, pronunciation, meaning`

## Single Excel file (recommended)

Run `npm run content:xlsx` to generate `content-source/english-content.xlsx`.
This is **one file with 7 sheets** (meta, topics, vocabulary, grammar, quizzes, dialogue, dialogue-guides).
Open it directly in Excel or import the whole file into Google Sheets (**File → Import → Upload**).

## Import CSVs into Google Sheets (alternative)

1. Create a new Google Sheet.
2. For each CSV file, create a tab with the same name (without `.csv`) and use **File → Import → Upload**.
3. In `meta`, keep one row with `version` and `updatedAt`.
4. Set sharing to **Anyone with the link → Viewer**.
5. Publish to web: **File → Share → Publish to web → Entire document → CSV**, or publish each tab.

## Notes

- `options` in `quizzes.csv` uses ` | ` as separator.
- `daily` and `mondayOnly` use `TRUE` / `FALSE` (or empty).
- Optional fields can be left empty.
- After editing, bump `version` (for example `2026.11.29`) and `updatedAt` in `meta.csv`.
- The app only replaces its active bank when `version` changes.
