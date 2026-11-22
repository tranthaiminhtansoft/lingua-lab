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
│   ├── englishContent.json     # editable content bank (bundled fallback + runtime JSON)
│   ├── englishContentTypes.ts  # shared content types
│   ├── englishContentStore.ts  # active bank, version subscription, bundled default
│   ├── englishContentValidation.ts # runtime JSON validation and normalisation
│   ├── todayEnglish.ts         # daily rotation, availability, time limit
│   └── todayEnglish.test.ts
├── progress/
│   └── englishProgress.ts      # localStorage progress model (daily reset)
├── services/
│   └── englishContentApi.ts    # content API, version check, refresh, fallback
└── TodayEnglishPage.test.tsx
```

## Data flow

1. `englishContent.json` is imported at build time as the bundled fallback and served at `<BASE_URL>content/english-content.json` at runtime.
2. `TodayEnglishPage` and `EnglishTopicPage` call `checkEnglishContentApi()` on mount. Automatic checks are throttled to once every 5 minutes in `localStorage`; the Refresh button forces a check.
3. A successful fetch is validated (`parseEnglishContent`), and a different `version` replaces the active bank in `englishContentStore`; components subscribed via `useEnglishContent()` re-render.
4. Network, HTTP, parse, or validation failures keep the current/bundled bank, so the app remains usable offline.
5. `getTodayEnglishContext(date, content)` builds the topic list from the active bank, applying daily rotation (DevOps / neighbor / meals themes) and weekday/weekend/Sunday/Monday rules.
6. `isTopicVisible(topic, date)` filters topics within a 60-day coming-soon window.
7. `TodayEnglishPage` stores progress in React state and persists via `writeProgress`; `EnglishTopicPage` reads progress, runs read-aloud via `SpeechRecognition`, updates scores, and manages the countdown timer (sessionStorage deadline).

## Content updates

1. Edit `src/business/language-home/english/content/englishContent.json`.
2. Bump `version` (for example `2026.11.29`) and `updatedAt`. A client only replaces its active bank when `version` changes.
3. Run `npm run dev` and press **Kiểm tra bản mới**. The Vite plugin serves the source JSON at `/content/english-content.json`, so edits are picked up without restarting the dev server.
4. Run `npm run build`; the plugin emits the same JSON to `dist/content/english-content.json` for the deployed site.
5. To publish content changes without rebuilding the app, host the JSON on a CORS-enabled URL and set `VITE_ENGLISH_CONTENT_URL` at build time (see `.env.example`). Otherwise, redeploy the site after changing the JSON.

Validation rejects duplicate topic ids, impossible dates, invalid quiz indexes, and missing/empty vocabulary, grammar, examples, quizzes, or dialogue arrays.

## Progress model

- Stored in `localStorage` under `lingua-english-today-progress`, scoped by local date (resets each day).
- `TopicProgress` tracks `vocabulary`, `grammar`, and `dialogue` records (score + completed, threshold above 85%).
- A topic is complete only when every vocabulary, grammar example, and dialogue sentence reaches the threshold.
- Overall progress = completed available topics / total available topics.

## Timer

- Each topic has a time limit (minutes) derived from content size.
- Selecting a topic shows a start popup; starting stores a deadline in `sessionStorage`.
- The topic page shows an in-page countdown; a floating clock appears when the in-page timer scrolls out of view.
- On expiry without completion, a non-dismissible fail popup shows the percentage with retry/home actions.
