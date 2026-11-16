# Application overview

## Routes

- `/` — language selection (Language Constellation).
- `/nihongo-o-benkyuo` and nested routes — Japanese learning path.
- `/english` — Today’s English hub (topic list, overall progress).
- `/english/:topicId` — topic detail (vocabulary, grammar, quiz, dialogue, timer).

## English module layout

```
src/business/language-home/english/
├── TodayEnglishPage.tsx        # hub: date context, topic list, overall donut, start popup
├── EnglishTopicPage.tsx        # topic detail, read-aloud, quiz, timer, fail popup
├── todayEnglish.css
├── content/
│   ├── todayEnglish.ts         # topic bank, daily rotation, availability, time limit
│   └── todayEnglish.test.ts
├── progress/
│   └── englishProgress.ts      # localStorage progress model (daily reset)
├── services/
│   └── englishContentApi.ts    # simulated backend boundary
└── TodayEnglishPage.test.tsx
```

## Data flow

1. `getTodayEnglishContext(date)` builds the topic list from `TOPICS`, applying daily rotation (DevOps / neighbor / meals themes) and weekday/weekend/Sunday/Monday rules.
2. `isTopicVisible(topic, date)` filters topics within a 60-day coming-soon window.
3. `TodayEnglishPage` fetches via `englishContentApi`, stores progress in React state, persists via `writeProgress`.
4. `EnglishTopicPage` reads progress, runs read-aloud via `SpeechRecognition`, updates scores, and manages the countdown timer (sessionStorage deadline).

## Progress model

- Stored in `localStorage` under `lingua-english-today-progress`, scoped by local date (resets each day).
- `TopicProgress` tracks `vocabulary`, `grammar`, and `dialogue` records (score + completed, threshold 90%).
- A topic is complete only when every vocabulary, grammar example, and dialogue sentence reaches the threshold.
- Overall progress = completed available topics / total available topics.

## Timer

- Each topic has a time limit (minutes) derived from content size.
- Selecting a topic shows a start popup; starting stores a deadline in `sessionStorage`.
- The topic page shows an in-page countdown; a floating clock appears when the in-page timer scrolls out of view.
- On expiry without completion, a non-dismissible fail popup shows the percentage with retry/home actions.
