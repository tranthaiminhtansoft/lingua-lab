# English content rewrite inputs

These files are temporary inputs for the `sunday-mass` format migration. They are
merged into `englishContent.json` by `scripts/merge-english-rewrite.mjs`.

Do **not** edit the Google Sheet or the existing JSON directly.

## Source of truth

- Current content: `src/business/language-home/english/content/englishContent.json`
- Compact dump for review: `/private/var/folders/dd/015lj0dn4tb8x7wn10d7z8f40000gn/T/opencode/english-dump.json`

## File schemas

### `vocab-meta-<group>.json`

```json
{
  "topic-id": {
    "pos": {
      "term": "n",
      "another term": "v"
    },
    "notes": {
      "term": "[Trường hợp]\nEnglish example\n(Vietnamese translation)\n\n[Trường hợp]\nSynonym - /ipa/ - meaning"
    }
  }
}
```

- `pos` must contain **every** term that exists for the topic.
- Use `n`, `v`, `adj`, `adv`, `phrase`, `prep`, `conj`, `pron`, `det`, `modal`, `num`.
  Use `(n)(v)` style only when a term genuinely has two parts of speech.
- `notes` is optional per term, but each topic must have **at least 2** noted terms.
- Notes must follow the `[Trường hợp]` block style used by `sunday-mass`.
- Do not change the term spelling.

### `grammar-extra-<group>.json`

```json
{
  "topic-id": {
    "usage": "Dùng ...",
    "formula": "S + ...",
    "example": "English example. (Vietnamese translation.)",
    "pronunciation": "/.../",
    "title": "Short English title",
    "category": "Tense"
  }
}
```

- Exactly **one new grammar point** per topic.
- It must be different from the existing 4 points.
- `usage` starts with `Dùng` and explains when to use it.
- `example` is English followed by the Vietnamese translation in parentheses.
- `pronunciation` is an IPA transcription wrapped in `/.../`.

### `quiz-meta-<group>.json`

```json
{
  "topic-id": {
    "existing": [
      {
        "question": "Vietnamese question",
        "extraOption": "English distractor",
        "explanation": "Lý do sai:\nA - ...\n\nLý do đúng:\nB - ..."
      }
    ],
    "new": {
      "questionType": "Multiple Choice",
      "question": "Vietnamese question",
      "options": ["English option", "English option", "English option", "English option"],
      "answerIndices": [0, 2],
      "explanation": "Lý do sai:\n...\n\nLý do đúng:\n..."
    }
  }
}
```

- `existing` must have exactly the same number of entries as the current topic
  quizzes, in the same order. Do not reorder.
- `extraOption` adds a fourth English option to the existing three.
- The existing correct answer is kept; the merge script shuffles options and
  recalculates the answer index.
- `question` must be in Vietnamese. Options stay in English.
- `explanation` must be in Vietnamese and use `Lý do sai:` / `Lý do đúng:`.
- `new` is required for topics with 4 current quizzes. It is optional for
  `christmas-celebration` (already has 7 quizzes).
- `questionType` is `Single Best Answer` or `Multiple Choice`.
- For `Multiple Choice`, `answerIndices` must contain at least 2 valid indices.
- For `Single Best Answer`, use `answerIndex` (a single number) instead of
  `answerIndices`.

### `dialogue-extra-<group>.json`

```json
{
  "topic-id": {
    "mainExtra": ["A: ...", "B: ..."],
    "variant1": ["A: ...", "B: ...", "A: ...", "B: ...", "A: ...", "B: ..."]
  }
}
```

- `mainExtra` is optional; use it to extend a 4-line main dialogue to 6 lines.
- `variant1` is a **new, different** English-only conversation with 6 lines.
- Do not repeat the main dialogue. Keep the same topic and difficulty.
- For `christmas-celebration`, do not provide `variant1`; it already has two
  extra variants. `mainExtra` is optional.
- Do not include `sunday-mass`; it is frozen.

## Style reference

Read the `sunday-mass` topic in the current JSON. Mirror its:

- Vietnamese vocabulary meanings with a POS prefix.
- `[Trường hợp]` notes.
- `[Dùng ...]` grammar labels followed by the real formula.
- Vietnamese quiz questions with English options and `Lý do sai` / `Lý do đúng`.
- Bilingual dialogue with the translation on its own line.
