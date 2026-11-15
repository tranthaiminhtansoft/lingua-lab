export type EnglishVocabularyItem = {
  term: string;
  meaning: string;
  pronunciation: string;
  score: number;
};

export type EnglishGrammarItem = {
  title: string;
  example: string;
};

export type EnglishQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type EnglishTopic = {
  id: string;
  title: string;
  description: string;
  availableFrom: string;
  vocab: EnglishVocabularyItem[];
  grammar: EnglishGrammarItem[];
  examples: string[];
  quizzes: EnglishQuiz[];
  readExpected: string;
  dialogue: string[];
};

export type TodayEnglishContext = {
  date: string;
  season: string;
  holiday: string;
  topics: EnglishTopic[];
};

const SEASONS_BY_MONTH: Record<number, string> = {
  0: 'Winter',
  1: 'Winter',
  2: 'Spring',
  3: 'Spring',
  4: 'Spring',
  5: 'Summer',
  6: 'Summer',
  7: 'Summer',
  8: 'Autumn',
  9: 'Autumn',
  10: 'Autumn',
  11: 'Winter',
};

const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': 'New Year’s Day',
  '04-30': 'Reunification Day (Vietnam)',
  '05-01': 'International Workers’ Day',
  '09-02': 'National Day (Vietnam)',
  '12-25': 'Christmas',
};

function seasonFor(date: Date): string {
  return SEASONS_BY_MONTH[date.getMonth()] ?? 'Season';
}

function holidayFor(date: Date): string {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return FIXED_HOLIDAYS[key] ?? 'No special holiday today';
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const TOPICS: EnglishTopic[] = [
  {
    id: 'autumn-routine',
    title: 'Autumn routine & energy',
    description: 'Talk about autumn routines, energy, and weekly plans.',
    availableFrom: '2020-01-01',
    vocab: [
      { term: 'energy level', meaning: 'mức năng lượng', pronunciation: '/ˈen.ə.dʒi ˌlev.əl/', score: 0 },
      { term: 'get back into routine', meaning: 'trở lại thói quen', pronunciation: '/ɡet bæk ˈɪn.tuː ruːˈtiːn/', score: 0 },
      { term: 'wrap up warm', meaning: 'mặc ấm', pronunciation: '/ræp ʌp wɔːm/', score: 0 },
      { term: 'cozy', meaning: 'ấm cúng', pronunciation: '/ˈkəʊzi/', score: 0 },
      { term: 'daylight', meaning: 'ánh sáng ban ngày', pronunciation: '/ˈdeɪlaɪt/', score: 0 },
      { term: 'schedule', meaning: 'lịch trình', pronunciation: '/ˈʃedjuːl/', score: 0 },
      { term: 'stay active', meaning: 'duy trì vận động', pronunciation: '/steɪ ˈæktɪv/', score: 0 },
      { term: 'mood', meaning: 'tâm trạng', pronunciation: '/muːd/', score: 0 },
      { term: 'balanced', meaning: 'cân bằng', pronunciation: '/ˈbælənst/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for routines', example: 'I usually walk in the park in autumn.' },
      { title: 'Present continuous for temporary changes', example: 'I’m trying to sleep earlier this week.' },
    ],
    examples: [
      'In autumn, I usually feel more focused, so I plan heavier tasks in the morning.',
      'This week I’m getting back into a routine after a busy period.',
    ],
    quizzes: [
      {
        question: 'Choose the correct sentence about an autumn routine:',
        options: [
          'I am usually walk in the park in autumn.',
          'I usually walk in the park in autumn.',
          'I usually walks in the park in autumn.',
        ],
        answerIndex: 1,
        explanation: 'Use present simple for habits: subject + base verb.',
      },
      {
        question: 'Which phrase means “trở lại thói quen”?',
        options: ['wrap up warm', 'get back into routine', 'energy level'],
        answerIndex: 1,
        explanation: '“Get back into routine” means to return to a usual habit.',
      },
      {
        question: 'Complete the sentence: “This week I’m ___ to sleep earlier.”',
        options: ['try', 'trying', 'tried'],
        answerIndex: 1,
        explanation: 'Present continuous uses am/is/are + -ing for temporary changes.',
      },
      {
        question: 'Which sentence keeps a conversation going?',
        options: [
          'That sounds like a good plan. How about you?',
          'I usually walk in the park.',
          'Wrap up warm.',
        ],
        answerIndex: 0,
        explanation: 'A reaction plus a follow-up question extends the conversation.',
      },
    ],
    readExpected: 'I usually walk in the park in autumn.',
    dialogue: [
      'A: In autumn, I usually feel more focused.',
      'B: So I plan heavier tasks in the morning.',
      'A: This week I’m getting back into a routine.',
      'B: That sounds like a good plan.',
    ],
  },
  {
    id: 'work-update',
    title: 'Work update in English',
    description: 'Give work updates, progress, and blockers in a meeting.',
    availableFrom: '2020-01-01',
    vocab: [
      { term: 'on track', meaning: 'đúng tiến độ', pronunciation: '/ɒn træk/', score: 0 },
      { term: 'blocker', meaning: 'điểm chặn', pronunciation: '/ˈblɒk.ər/', score: 0 },
      { term: 'hand off', meaning: 'bàn giao', pronunciation: '/hænd ɒf/', score: 0 },
      { term: 'deadline', meaning: 'hạn chót', pronunciation: '/ˈdedlaɪn/', score: 0 },
      { term: 'progress update', meaning: 'cập nhật tiến độ', pronunciation: '/ˈprəʊɡres ˈʌpdeɪt/', score: 0 },
      { term: 'dependency', meaning: 'phụ thuộc', pronunciation: '/dɪˈpendənsi/', score: 0 },
      { term: 'prioritize', meaning: 'ưu tiên', pronunciation: '/praɪˈɒrətaɪz/', score: 0 },
      { term: 'follow up', meaning: 'theo dõi tiếp', pronunciation: '/ˈfɒləʊ ʌp/', score: 0 },
      { term: 'workload', meaning: 'khối lượng công việc', pronunciation: '/ˈwɜːkləʊd/', score: 0 },
    ],
    grammar: [
      { title: 'Present perfect for progress', example: 'We have finished the first review.' },
      { title: 'Passive for status', example: 'The deployment was rolled back.' },
    ],
    examples: [
      'We’re on track, but we still have one blocker with the API.',
      'I’ll hand off the logs after this meeting.',
    ],
    quizzes: [
      {
        question: 'Choose the correct work update:',
        options: [
          'We are on track, but we still has one blocker.',
          'We are on track, but we still have one blocker.',
          'We on track, but we still have one blocker.',
        ],
        answerIndex: 1,
        explanation: 'Use “have” with “we” and keep the full verb phrase.',
      },
      {
        question: 'Which word means “điểm chặn”?',
        options: ['hand off', 'blocker', 'on track'],
        answerIndex: 1,
        explanation: 'A blocker is something that stops progress.',
      },
      {
        question: 'Which sentence reports progress with present perfect?',
        options: [
          'We finished the first review.',
          'We have finished the first review.',
          'We are finish the first review.',
        ],
        answerIndex: 1,
        explanation: 'Present perfect is have/has + past participle.',
      },
      {
        question: 'Which reply shows polite turn-taking in a meeting?',
        options: [
          'Can I add something?',
          'You are wrong.',
          'No, listen to me.',
        ],
        answerIndex: 0,
        explanation: '“Can I add something?” is a polite way to take a turn.',
      },
    ],
    readExpected: 'We are on track, but we still have one blocker.',
    dialogue: [
      'A: We’re on track with the release.',
      'B: Do we still have any blockers?',
      'A: Yes, one API issue.',
      'B: I’ll hand off the logs after this meeting.',
    ],
  },
  {
    id: 'black-friday',
    title: 'Black Friday shopping',
    description: 'Talk about shopping, prices, and comparing choices.',
    availableFrom: '2026-11-28',
    vocab: [
      { term: 'deal', meaning: 'ưu đãi', pronunciation: '/diːl/', score: 0 },
      { term: 'discount', meaning: 'giảm giá', pronunciation: '/ˈdɪskaʊnt/', score: 0 },
      { term: 'worth it', meaning: 'đáng giá', pronunciation: '/wɜːθ ɪt/', score: 0 },
      { term: 'bargain', meaning: 'món hời', pronunciation: '/ˈbɑːɡɪn/', score: 0 },
      { term: 'checkout', meaning: 'thanh toán', pronunciation: '/ˈtʃekaʊt/', score: 0 },
      { term: 'limited offer', meaning: 'ưu đãi giới hạn', pronunciation: '/ˈlɪmɪtɪd ˈɒfər/', score: 0 },
      { term: 'compare prices', meaning: 'so sánh giá', pronunciation: '/kəmˈpeər ˈpraɪsɪz/', score: 0 },
      { term: 'in stock', meaning: 'còn hàng', pronunciation: '/ɪn stɒk/', score: 0 },
      { term: 'sold out', meaning: 'hết hàng', pronunciation: '/səʊld aʊt/', score: 0 },
    ],
    grammar: [
      { title: 'Comparatives', example: 'This laptop is cheaper than that one.' },
      { title: 'Whether for choices', example: 'We need to decide whether to buy now or wait.' },
    ],
    examples: [
      'This deal looks good, but I’m not sure whether it is worth it.',
      'The discount is bigger online than in the store.',
    ],
    quizzes: [
      {
        question: 'Choose the correct shopping sentence:',
        options: [
          'This deal is worth than the other one.',
          'This deal is more worth than the other one.',
          'This deal is worth it.',
        ],
        answerIndex: 2,
        explanation: '“Worth it” is a common chunk; avoid forcing a comparative.',
      },
      {
        question: 'Which word means “giảm giá”?',
        options: ['deal', 'discount', 'worth it'],
        answerIndex: 1,
        explanation: 'A discount is a reduction in price.',
      },
      {
        question: 'Complete the comparison: “The discount is bigger ___.”',
        options: ['than online', 'online than', 'more online'],
        answerIndex: 1,
        explanation: 'Use comparative + than: bigger than …',
      },
      {
        question: 'Which sentence asks about a choice?',
        options: [
          'I’m not sure whether to buy now or wait.',
          'I’m not sure if to buy now or wait.',
          'I’m not sure buy now or wait.',
        ],
        answerIndex: 0,
        explanation: 'Use whether + to-infinitive when presenting a choice.',
      },
    ],
    readExpected: 'This deal looks good, but I am not sure whether it is worth it.',
    dialogue: [
      'A: This deal looks good.',
      'B: Is it worth it?',
      'A: The discount is bigger online.',
      'B: I’ll buy it now.',
    ],
  },
];

export function getTodayEnglishContext(date = new Date()): TodayEnglishContext {
  const todayKey = dateKey(date);
  const topics = TOPICS.map((topic) => ({
    ...topic,
    vocab: topic.vocab.map((item) => ({ ...item })),
  }));
  // Keep future topics visible as coming soon, but mark them by availableFrom.
  return {
    date: todayKey,
    season: seasonFor(date),
    holiday: holidayFor(date),
    topics,
  };
}

export function isTopicAvailable(topic: EnglishTopic, date = new Date()): boolean {
  return topic.availableFrom <= dateKey(date);
}
