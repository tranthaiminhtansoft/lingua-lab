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
  /** Daily essentials stay available every day. */
  daily?: boolean;
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
    id: 'devops-meeting',
    title: 'DevOps team meeting',
    description: 'Give a stand-up update, raise incidents, and agree next steps.',
    availableFrom: '2020-01-01',
    daily: true,
    vocab: [
      { term: 'incident', meaning: 'sự cố', pronunciation: '/ˈɪnsɪdənt/', score: 0 },
      { term: 'rollback', meaning: 'khôi phục phiên bản cũ', pronunciation: '/ˈrəʊlbæk/', score: 0 },
      { term: 'deployment', meaning: 'triển khai', pronunciation: '/dɪˈplɔɪmənt/', score: 0 },
      { term: 'pipeline', meaning: 'quy trình CI/CD', pronunciation: '/ˈpaɪplaɪn/', score: 0 },
      { term: 'outage', meaning: 'gián đoạn dịch vụ', pronunciation: '/ˈaʊtɪdʒ/', score: 0 },
      { term: 'root cause', meaning: 'nguyên nhân gốc', pronunciation: '/ruːt kɔːz/', score: 0 },
      { term: 'monitoring', meaning: 'giám sát', pronunciation: '/ˈmɒnɪtərɪŋ/', score: 0 },
      { term: 'runbook', meaning: 'tài liệu xử lý', pronunciation: '/ˈrʌnbʊk/', score: 0 },
      { term: 'postmortem', meaning: 'đánh giá sau sự cố', pronunciation: '/ˌpəʊstˈmɔːtəm/', score: 0 },
    ],
    grammar: [
      { title: 'Present perfect for updates', example: 'We have deployed the fix to staging.' },
      { title: 'Present perfect continuous for ongoing work', example: 'We have been monitoring the cluster since the incident.' },
    ],
    examples: [
      'We rolled back the last deployment because the error rate spiked.',
      'The root cause was a misconfigured timeout, so we added a runbook for it.',
    ],
    quizzes: [
      {
        question: 'Choose the correct stand-up update:',
        options: [
          'We have deployed the patch to staging.',
          'We have deploy the patch to staging.',
          'We has deployed the patch to staging.',
        ],
        answerIndex: 0,
        explanation: 'Present perfect is have/has + past participle: have deployed.',
      },
      {
        question: 'Which word means “sự cố nghiêm trọng”?',
        options: ['incident', 'insight', 'instance'],
        answerIndex: 0,
        explanation: 'An incident is an unplanned event that disrupts a service.',
      },
      {
        question: 'Complete the sentence: “The error rate ___ after the rollback.”',
        options: ['dropped', 'drop', 'dropping'],
        answerIndex: 0,
        explanation: 'Use past simple for a finished action: the error rate dropped.',
      },
      {
        question: 'Which sentence proposes next steps in a meeting?',
        options: [
          'Let’s assign an owner and set a deadline.',
          'That is not my job.',
          'Someone should do it eventually.',
        ],
        answerIndex: 0,
        explanation: 'A clear owner plus a deadline keeps the meeting actionable.',
      },
    ],
    readExpected: 'We rolled back the deployment after the error rate spiked.',
    dialogue: [
      'A: Morning, everyone. Can we start with the incident?',
      'B: Sure. The checkout service went down at 8:40.',
      'A: We rolled back the last deployment, and the error rate is normal now.',
      'B: Do we know the root cause yet?',
      'A: Not yet, but we’re checking the timeout configuration.',
      'B: Great. Let’s write the postmortem and update the runbook today.',
    ],
  },
  {
    id: 'neighbor-morning',
    title: 'Morning greetings with neighbors',
    description: 'Say good morning, make small talk, and keep it friendly.',
    availableFrom: '2020-01-01',
    daily: true,
    vocab: [
      { term: 'good morning', meaning: 'chào buổi sáng', pronunciation: '/ɡʊd ˈmɔːnɪŋ/', score: 0 },
      { term: 'how’s it going', meaning: 'dạo này thế nào', pronunciation: '/haʊz ɪt ˈɡəʊɪŋ/', score: 0 },
      { term: 'lovely weather', meaning: 'thời tiết đẹp', pronunciation: '/ˈlʌvli ˈweðə/', score: 0 },
      { term: 'commute', meaning: 'đi lại hàng ngày', pronunciation: '/kəˈmjuːt/', score: 0 },
      { term: 'catch up', meaning: 'trò chuyện cập nhật', pronunciation: '/kætʃ ʌp/', score: 0 },
      { term: 'have a good one', meaning: 'chúc một ngày tốt lành', pronunciation: '/hæv ə ɡʊd wʌn/', score: 0 },
      { term: 'neighbor', meaning: 'hàng xóm', pronunciation: '/ˈneɪbə/', score: 0 },
      { term: 'small talk', meaning: 'chuyện xã giao ngắn', pronunciation: '/smɔːl tɔːk/', score: 0 },
      { term: 'take care', meaning: 'giữ gìn sức khoẻ', pronunciation: '/teɪk keə/', score: 0 },
    ],
    grammar: [
      { title: 'Present continuous for now', example: 'I’m just heading to the station.' },
      { title: 'Question tags for small talk', example: 'Lovely morning, isn’t it?' },
    ],
    examples: [
      'Morning! Lovely weather today, isn’t it?',
      'I’m just heading to work, but let’s catch up this weekend.',
    ],
    quizzes: [
      {
        question: 'Which is the most natural morning greeting to a neighbor?',
        options: [
          'Morning! How’s it going?',
          'Good morning, citizen. State your purpose.',
          'Hello. What do you want?',
        ],
        answerIndex: 0,
        explanation: 'A short, friendly greeting with a light question fits small talk.',
      },
      {
        question: 'Which phrase ends a short chat politely?',
        options: ['Have a good one!', 'Go away now.', 'Stop talking.'],
        answerIndex: 0,
        explanation: '“Have a good one!” is a casual, friendly sign-off.',
      },
      {
        question: 'Complete the question tag: “Lovely morning, ___?”',
        options: ['isn’t it', 'is it', 'doesn’t it'],
        answerIndex: 0,
        explanation: 'A positive statement takes a negative tag: isn’t it?',
      },
      {
        question: 'Which sentence is typical small talk?',
        options: [
          'I’m just heading to the station.',
          'I need to see your ID.',
          'Move out of my way, please.',
        ],
        answerIndex: 0,
        explanation: 'Small talk shares a light, everyday detail.',
      },
    ],
    readExpected: 'Morning! Lovely weather today, isn’t it?',
    dialogue: [
      'A: Morning, Mrs. Lan! How’s it going?',
      'B: Morning! Pretty good, thanks. Off to work?',
      'A: Yeah, I’m just heading to the station.',
      'B: Lovely weather today, isn’t it?',
      'A: It really is. Let’s catch up this weekend.',
      'B: Sounds good. Have a good one!',
    ],
  },
  {
    id: 'daily-meals',
    title: 'Breakfast, lunch, and dinner',
    description: 'Talk about meals, portions, and eating out during the day.',
    availableFrom: '2020-01-01',
    daily: true,
    vocab: [
      { term: 'breakfast', meaning: 'bữa sáng', pronunciation: '/ˈbrekfəst/', score: 0 },
      { term: 'lunch', meaning: 'bữa trưa', pronunciation: '/lʌntʃ/', score: 0 },
      { term: 'dinner', meaning: 'bữa tối', pronunciation: '/ˈdɪnə/', score: 0 },
      { term: 'portion', meaning: 'khẩu phần', pronunciation: '/ˈpɔːʃən/', score: 0 },
      { term: 'skip a meal', meaning: 'bỏ bữa', pronunciation: '/skɪp ə miːl/', score: 0 },
      { term: 'eat out', meaning: 'ăn ngoài', pronunciation: '/iːt aʊt/', score: 0 },
      { term: 'home-cooked', meaning: 'nấu tại nhà', pronunciation: '/ˌhəʊm ˈkʊkt/', score: 0 },
      { term: 'leftovers', meaning: 'đồ ăn thừa', pronunciation: '/ˈleftəʊvəz/', score: 0 },
      { term: 'balanced meal', meaning: 'bữa ăn cân đối', pronunciation: '/ˈbælənst miːl/', score: 0 },
    ],
    grammar: [
      { title: 'Adverbs of frequency', example: 'I usually have rice for lunch.' },
      { title: 'Portions with countable and uncountable nouns', example: 'I’d like a bowl of soup and some rice.' },
    ],
    examples: [
      'I usually grab a quick breakfast, but I cook dinner at home.',
      'I’m trying to eat a balanced meal at lunch, so I add more vegetables.',
    ],
    quizzes: [
      {
        question: 'Which meal do you usually eat in the evening?',
        options: ['dinner', 'breakfast', 'lunch'],
        answerIndex: 0,
        explanation: 'Dinner is the main meal in the evening.',
      },
      {
        question: 'Complete the sentence: “I usually ___ breakfast at 7 a.m.”',
        options: ['have', 'has', 'having'],
        answerIndex: 0,
        explanation: 'With “I”, use the base form: I have breakfast.',
      },
      {
        question: 'Which phrase means “ăn ngoài”?',
        options: ['eat out', 'eat up', 'eat in'],
        answerIndex: 0,
        explanation: '“Eat out” means to eat at a restaurant instead of at home.',
      },
      {
        question: 'Which sentence is polite when ordering food?',
        options: [
          'Could I have a bowl of soup, please?',
          'Give me soup.',
          'I want soup now.',
        ],
        answerIndex: 0,
        explanation: '“Could I have …, please?” is the standard polite request.',
      },
    ],
    readExpected: 'I usually have a quick breakfast and cook dinner at home.',
    dialogue: [
      'A: What did you have for breakfast?',
      'B: Just coffee and a banana, because I was in a hurry.',
      'A: I usually have pho, but I’m trying to eat a balanced meal.',
      'B: Nice. Are you eating out for lunch today?',
      'A: Yeah, my team is going out. Do you want to join?',
      'B: I’d love to, but I brought leftovers.',
    ],
  },
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
