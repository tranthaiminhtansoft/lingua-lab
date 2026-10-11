# Lingua Lab Roadmap

This file is the starting point for understanding what Lingua Lab contains, what is underway, and what to work on next. Detailed language plans live in separate files so each can grow without making this overview hard to scan.

## How to use this roadmap

1. Check **Current status** for what is complete and what is planned.
2. Start with **Next work** to find the next actionable scope.
3. Open the Japanese or English roadmap for requirements, examples, and task checklists.
4. Keep checklist IDs stable when moving tasks. Add dates only when they have been agreed.

## Current status

| Area | Status | Details |
|---|---|---|
| Japanese learning | **In progress** | Core Kana, Grammar, Numbers, and Time learning experiences are available. The next planned work is the supplemental Grammar sequence, followed by expanded time questions. See [Japanese Roadmap](ROADMAP-JAPANESE.md). |
| English learning | **Proposed** | The concept and learning scope are documented; implementation has not started. First release: hub, sentence foundations, and everyday introductions. See [English Roadmap](ROADMAP-ENGLISH.md). |
| Shared local learning progress | **Proposed** | A versioned browser-local progress model for Japanese and English is planned; no backend or database is required. See [shared progress plan](#shared-local-learning-progress). |
| CI/CD | **Established; improvement plan proposed** | PR validation, gated GitHub Pages releases, production verification, and rollback are in place. Trigger coverage and governance controls are the first review targets. See [CI/CD Roadmap](ROADMAP-CICD.md). |

## Next work

### Immediate next action: Japanese Polite verb forms

Start with `GR-VERB-001` in [Japanese Roadmap](ROADMAP-JAPANESE.md): create the **Polite verb forms** lesson. Complete that lesson, then continue **Connecting nouns → Time & place** (time section first), and expand **When & what time?** afterward. The Japanese roadmap keeps this sequence and all acceptance criteria together.

### Proposed follow-on initiatives

These are documented directions, not the immediate work queue:

- **CI/CD:** review CI trigger coverage first, then workflow/release-script validation and live repository protections. See [CI/CD Roadmap](ROADMAP-CICD.md).
- **English:** confirm the audience and lesson conventions, then build the hub, **Sentence foundations**, and **Introductions and everyday conversation**. See [English Roadmap](ROADMAP-ENGLISH.md).
- **Shared progress:** define browser-local progress scoped by language, starting with Japanese Kana and English foundations practice. See the shared progress plan below.

## Completed work at a glance

### Product

| Area | Scope delivered |
|---|---|
| **Japanese learning path** | The Nihongo page brings together the available Japanese learning content. |
| **Kana** | Hiragana, Katakana, and Romaji recognition, with practice and writing guidance. |
| **Grammar** | Sentence patterns, first introductions, and question types. |
| **Vocabulary: Numbers** | A Number ladder organized by place value, with Kanji, Kana, Romaji, reading notes, and combined-number examples. |
| **Vocabulary: Time** | A fixed sample calendar, dates and months, day/night references, parts of the day, frequency, and hour/minute readings. |
| **Vocabulary: First introductions** | Words and expressions for names, people, occupations, origins, and meeting someone for the first time. |
| **English learning entry point** | English appears on the language selection page with a “Coming soon” status. |

### Engineering and delivery

| Area | Scope delivered |
|---|---|
| **Pull-request CI** | Workflows validate applicable changes before they can be merged into `master`. |
| **Production releases** | A release-branch workflow builds a candidate, requests approval, deploys to GitHub Pages, and verifies routes after deployment. |
| **Rollback** | A workflow restores a saved stable release and verifies the recovered site. |
| **Operational documentation** | Pre-release, post-release, release, and rollback guides are available. Reference documentation covers application topology, CI, delivery, and verification procedures. |
| **Branch naming policy** | The required `Release Gate` validates PR source branches using `feature/homelab/**` and `release/homelab/**` prefixes. The release workflow generates `release/homelab/YYYYMMDD`. |

## Shared local learning progress

Use one browser-local progress approach for Japanese and English, with language-specific records and stable lesson/activity IDs. Keep both learning paths usable if browser storage is unavailable, provide per-language reset, and state clearly that progress does not sync across devices. Do not represent it as account-backed or server-saved.

**Rollout**

1. Add a shared, versioned local progress store with language-scoped records and safe defaults when browser storage is unavailable.
2. Apply it first to Japanese Kana practice and English foundations practice, then extend it to other lessons where retry/review adds value.
3. Add a compact progress summary for each language and a way to reset one language’s progress without clearing the other.

**Checklist**

- [ ] `SHARED-LEARN-001` Define a versioned, language-scoped local progress model using stable lesson and activity IDs.
- [ ] `SHARED-LEARN-002` Implement shared read/write/reset behavior with storage-unavailable handling; preserve separate Japanese and English progress.
- [ ] `SHARED-LEARN-003` Track progress in Japanese Kana practice and English foundations practice, then review whether the model fits vocabulary and grammar lessons.
- [ ] `SHARED-LEARN-004` Show per-language progress and explain local-only storage, no cross-device sync, and reset behavior.

## Planning rules

- Move work to **Completed** only when the feature is usable in the application.
- Keep task IDs stable when reordering or moving checklist items; do not reuse IDs.
- Do not assign target dates until they have been agreed.
