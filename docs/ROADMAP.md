# Roadmap

Completed work and planned development for Lingua Lab. Planned items have no target dates.

## ✅ Completed — Product

| Area | Scope delivered |
|---|---|
| **Japanese learning path** | The Nihongo page brings together the available Japanese learning content. |
| **Kana** | Hiragana, Katakana, and Romaji recognition, with practice and writing guidance. |
| **Grammar** | Sentence patterns, first introductions, and question types. |
| **Vocabulary: Numbers** | A Number ladder organized by place value, with Kanji, Kana, Romaji, reading notes, and combined-number examples. |
| **Vocabulary: Time** | A fixed sample calendar, dates and months, day/night references, parts of the day, frequency, and hour/minute readings. |
| **Vocabulary: First introductions** | Words and expressions for names, people, occupations, origins, and meeting someone for the first time. |
| **English learning entry point** | English appears on the language selection page with a “Coming soon” status. |

## ✅ Completed — Engineering and delivery

| Area | Scope delivered |
|---|---|
| **Pull-request CI** | Workflows validate applicable changes before they can be merged into `master`. |
| **Production releases** | A release-branch workflow builds a candidate, requests approval, deploys to GitHub Pages, and verifies routes after deployment. |
| **Rollback** | A workflow restores a saved stable release and verifies the recovered site. |
| **Operational documentation** | Pre-release, post-release, release, and rollback guides are available. Reference documentation covers application topology, CI, delivery, and verification procedures. |
| **Branch naming policy** | The required `Release Gate` validates PR source branches using `feature/homelab/**` and `release/homelab/**` prefixes. The release workflow generates `release/homelab/YYYYMMDD`. |

## 🔜 Planned

Continue with **Supplemental Grammar → Expand time questions**. **Numbers** and **Time** in Vocabulary are complete. Supplemental Grammar consists of three lessons in this order: **Polite verb forms → Connecting nouns → Time & place**. The place section will be added after new lesson content is available. English learning remains a future direction.

**Shared requirements for new lessons**

- Use **English** for interface labels, meanings, and explanations, consistent with existing lessons.
- For Japanese written with Kanji, include a Hiragana or Katakana reading and Romaji. Kana-only entries also include Romaji.
- Clearly show alternate readings and sound changes. Use color and bold consistently across lessons to highlight them.
- The requirements below are complete specifications; implementation does not depend on images or video from the conversation. Verify Japanese readings against reliable learning references when preparing lesson data.

**Checklist IDs:** Each task has a unique ID within its content group. Keep an ID when reordering, moving, or completing a task. Assign new tasks the next available number in that group; do not renumber or reuse IDs.

### Vocabulary: Numbers — completed

The dedicated **Numbers** lesson appears on the Nihongo page before **Vocabulary**. It uses a single **Number ladder** layout, grouping numbers by place value. Kanji appears above Kana and Romaji; combined-number examples are shown separately below the groups.

**Layout**

| Screen | Arrangement |
|---|---|
| **Number ladder**, wide screens | Five place-value groups (Ones through Ten-thousands), each with nine numbers in that place. |
| **Number ladder**, small screens (≤620 px) | Each group uses three columns and three rows. Reading notes open in a panel below the group. |

Each Number ladder group has nine entries for multipliers 1–9. The number is prominent, with Kanji above Kana and Romaji. Alternate readings and irregular sound changes are highlighted in color and bold, and explained in reading notes. Combined-number examples appear separately below the groups.

**Checklist**

- [x] `NUM-001` Prepare all 45 number entries with Kana, Romaji, and applicable alternate readings.
- [x] `NUM-002` Build a Number ladder with five place-value groups, each containing nine entries ordered by multipliers 1–9.
- [x] `NUM-003` Highlight alternate readings and irregular sound changes with color and bold text.
- [x] `NUM-004` Place combined-number examples below the main content, with Kana and Romaji examples for each place value.
- [x] `NUM-005` Create the Numbers lesson and add its lesson card before Vocabulary on the Nihongo page.
- [x] `NUM-006` Check small-screen layout: the ladder becomes three columns without horizontal overflow, and reading notes do not cause page overflow.
- [x] `NUM-007` Check opening the lesson from Nihongo, returning to the lesson list, and loading its URL directly.

### Vocabulary: Time — completed

The lesson is available at `/nihongo-o-benkyuo/vocabulary/time` and uses **October 15, 2026** as its sample date. The continue-learning link opens the existing **When & what time?** group. Add Grammar links as supplemental lessons become available. Desktop and mobile layouts, direct navigation, and page reloads have been verified in Chromium, Firefox, and WebKit.

Use **one fixed sample date** as “today” and label it as a learning calendar. Choose a 31-day month and a sample date near the middle so all five relative day/night references fit within the calendar. Store the sample date in lesson data and calculate all relative references from that date.

**Lesson layout**

Keep all content in **one calendar frame**. Show dates, relative references, parts of the day, and frequency on the calendar. Place **hour and minute readings** beside or below the monthly calendar, within the same frame; put combined hour-and-minute examples below this section.

**Required content**

- **Days of the week:** Monday–Sunday in the calendar column headings.
- **Dates and months:** readings for dates 1–31 and all January–December month names in the calendar frame.
- **Relative days:** the day before yesterday, yesterday, today, tomorrow, and the day after tomorrow, placed on the five corresponding dates around the sample date.
- **Night references:** the night before last, last night, tonight, tomorrow night, and the night after next, placed in the night portion of the corresponding five dates.
- **Parts of the day:** morning, afternoon, evening, and night. Label afternoon, evening, and night distinctly; use sun/moon icons with text labels.
- **Frequency:** every morning, every afternoon, every evening, every day, and every night. Show each once in the matching part of the sample date on the calendar.
- **Hours and minutes:** readings for 1時–12時 and a 1分–10分 reference table; an interactive clock that selects minutes 0–59, with Kana and Romaji for every entry. Explain 分 readings *ふん/ぷん* and number-based sound changes. Add 何分（なんぷん, *nanpun*), meaning “what minute?”. Highlight special readings in color/bold. Update the combined hour-and-minute reading beneath the clock as its hands move.
- **Time expressions:** 午前（ごぜん, *gozen* — a.m.）, 午後（ごご, *gogo* — p.m.）, and 半（はん, *han* — half past）in the time-reading section, as preparation for related question-and-answer patterns.

**Checklist**

- [x] `TIME-001` Prepare every content group above with Kana, Romaji, and English meanings.
- [x] `TIME-002` Choose a fixed sample date; place dates and weekdays correctly, and calculate relative day/night references from it instead of the device's current date.
- [x] `TIME-003` Build the calendar frame with weekdays, dates, and all 12 month names/readings.
- [x] `TIME-004` Place day/night references on the correct dates and order them past → present → future.
- [x] `TIME-005` Show parts of the day and frequency on the calendar with clearly labeled sun/moon icons.
- [x] `TIME-006` Add 12-hour and 10-minute reading tables in the calendar frame, plus an interactive clock for remaining minutes; highlight special readings and explain 分 rules.
- [x] `TIME-007` Show the combined hour-and-minute reading beneath the interactive clock with Kana and Romaji.
- [x] `TIME-008` Add a.m./p.m. and half-past expressions to the time-reading section in the calendar frame.
- [x] `TIME-009` Create the Time topic and link to it from Vocabulary.
- [x] `TIME-010` Add a continue-learning link to the time-question group in Grammar → Question types, and to supplemental Grammar lessons when their destinations exist.
- [x] `TIME-011` Check all content on small screens, including day/night references and hour/minute tables.
- [x] `TIME-012` Check navigation from Vocabulary, returning to the topic list, and reloading the direct URL; “today” always uses the fixed sample date.
- [x] `TIME-013` Add a hands-on interactive clock with draggable hour/minute hands, keyboard-accessible sliders, a.m./p.m. selection, separate hand readings, and the combined reading; include half past at minute 30.

### Expand time questions

Expand the existing **When & what time?** group in **Grammar → Question types**. Vocabulary → Time links to this group so learners can move from recognizing vocabulary to asking questions. Link each pattern to the relevant supplemental Grammar lesson.

**Required patterns**

| Situation | Pattern |
|---|---|
| Ask for the current time | 今、何時ですか — *Ima, nanji desu ka?* |
| Ask when an event takes place | N は 何時ですか — *N wa nanji desu ka?*; answers include the hour, minute, a.m./p.m., or half past. |
| Know the hour and ask for the minute | N は X時何分ですか — *N wa X-ji nanpun desu ka?*; answer with the specific time. |
| Ask when an action happens | 何時に V-ますか／何時に V-ましたか — *Nanji ni V-masu ka? / Nanji ni V-mashita ka?*; examples include waking up, going to bed, and ending a meeting. |
| Ask for a time range, start, or end | 何時から何時まで V-ますか — *Nanji kara nanji made V-masu ka?*; also include questions using only 何時から or 何時まで. |
| Ask for a range of weekdays | 何曜日から何曜日まで V-ますか — *Nan-yōbi kara nan-yōbi made V-masu ka?*; for example, workdays. |

Keep the existing **いつ** (*itsu*) patterns and explain question-word choices: *itsu* asks when, *nanji* asks what time, *nanpun* asks what minute, and *nan-yōbi* asks which day of the week. Examples about habits, plans, and completed actions must use the appropriate verb form. Non-past forms express present habits or future plans according to context.

**Checklist**

- [ ] `TIME-Q-001` Expand When & what time? with all six situations in the table and retain its existing patterns.
- [ ] `TIME-Q-002` Give each situation a formula and at least one question-and-answer pair with Kana, Romaji, and English meaning.
- [ ] `TIME-Q-003` Add suitable examples for a.m./p.m., half past, habits, plans, and completed actions.
- [ ] `TIME-Q-004` Distinguish time/event questions using です from action-time questions using に + a verb.
- [ ] `TIME-Q-005` Distinguish asking for the minute of a time from asking for a duration in the existing How long? group.
- [ ] `TIME-Q-006` Link each pattern group to supplemental Grammar lessons and add a continue-learning path from Vocabulary → Time.
- [ ] `TIME-Q-007` Check navigation to the correct question group, readings, and small-screen layout.

### Supplemental Grammar

Create three separate lessons in **Grammar**, in the order below. Each lesson explains its structure and gives applied examples; link relevant question-and-answer patterns to the time-question group.

**1. Polite verb forms**

Explain sentences with noun predicates and verb predicates, relating them to the previously learned です. Teach **ます／ません／ました／ませんでした** and distinguish affirmative/negative and non-past/past forms. Non-past forms express habits or future plans depending on context.

- [ ] `GR-VERB-001` Create a Polite verb forms lesson in Grammar.
- [ ] `GR-VERB-002` Present the four forms in a table, highlight the changing endings, and include Kana/Romaji.
- [ ] `GR-VERB-003` Use daily-routine verbs: wake up, go to bed, work, rest, study, and finish.
- [ ] `GR-VERB-004` Give affirmative/negative examples in present, future, and past contexts; explain how context determines time meaning.
- [ ] `GR-VERB-005` Link to questions about when an action happens and to Time & place.

**2. Connecting nouns**

Teach **N1 と N2** (*N1 to N2*) to connect two nouns. Use days off during the week as the main example, with additional examples connecting people or objects to show that the pattern applies beyond time. Explain the noun 休み（やすみ, *yasumi*）and verb 休みます（やすみます, *yasumimasu*）in expressions about days off.

- [ ] `GR-NOUN-001` Create a Connecting nouns lesson in Grammar after Polite verb forms.
- [ ] `GR-NOUN-002` Explain and illustrate と between nouns, with Kana/Romaji and English meanings.
- [ ] `GR-NOUN-003` Include examples about days off and examples connecting people or objects.
- [ ] `GR-NOUN-004` Compare sentences using the noun 休み + です with sentences using the verb 休みます.
- [ ] `GR-NOUN-005` Link to Time & place to explain に when talking about weekdays.

**3. Time & place**

One lesson covering expressions for time and place. **The current implementation scope is the time section:** time points with に, making time the topic with は, and ranges with から・まで. Add the place section after the user has studied the new material and confirmed its scope.

- [ ] `GR-TIME-001` Create a Time & place lesson in Grammar after Connecting nouns; clearly identify the available time section and planned place section.
- [ ] `GR-TIME-002` Explain **time point + に + verb**, distinguishing it from current-time/event sentences using です.
- [ ] `GR-TIME-003` Include examples where に is used with specific times/dates, may be used or omitted with weekdays, and is generally omitted with relative references such as today/tomorrow or every day.
- [ ] `GR-TIME-004` Include examples that make a day/time the topic with は, such as “as for today”.
- [ ] `GR-TIME-005` Teach **A から B まで** (*A kara B made*) with ranges of time, weekdays, and overnight sleep.
- [ ] `GR-TIME-006` Explain that から and まで can be used separately, with examples giving only a start or an end point.
- [ ] `GR-TIME-007` Link to questions using 何時に, 何時から／まで, and 何曜日から／まで in Question types.

**Place — add later**

- [ ] `GR-PLACE-001` Confirm the place-section content after the user studies the new lesson, then extend the existing Time & place lesson.

**Shared checks for supplemental Grammar**

- [ ] `GR-QA-001` Link all three lessons from the Grammar page and provide a route back to the lesson list.
- [ ] `GR-QA-002` Follow the English + Kana + Romaji convention in formulas, examples, questions, and answers.
- [ ] `GR-QA-003` Check small-screen layout, continue-learning links, and direct URL reloads.

### English learning

Develop English-learning content alongside the existing “Coming soon” entry. Define lesson topics and scope before implementation.

> Move an item to **Completed** when the feature is usable in the application. Add a target date only after it has been agreed.
