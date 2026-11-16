export type EnglishVocabularyItem = {
  term: string;
  meaning: string;
  pronunciation: string;
  score: number;
};

export type EnglishGrammarItem = {
  title: string;
  /** Grammar group such as Tense, Modal, Conditional, Passive… */
  category: string;
  /** Pattern to memorise, e.g. S + have/has + V3. */
  formula: string;
  example: string;
};

export type EnglishQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type EnglishTheme = 'devops' | 'neighbor' | 'meals';

export type EnglishTopic = {
  id: string;
  title: string;
  description: string;
  availableFrom: string;
  /** Daily essentials stay available every day. */
  daily?: boolean;
  /** Daily topics rotate within their theme. */
  theme?: EnglishTheme;
  vocab: EnglishVocabularyItem[];
  grammar: EnglishGrammarItem[];
  examples: string[];
  quizzes: EnglishQuiz[];
  readExpected: string;
  dialogue: string[];
  /** Extra dialogue variants that rotate by date. */
  dialogueVariants?: string[][];
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
    theme: 'devops',
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
      { term: 'escalation', meaning: 'leo thang sự cố', pronunciation: '/ˌeskəˈleɪʃən/', score: 0 },
      { term: 'on-call', meaning: 'trực sự cố', pronunciation: '/ˌɒn ˈkɔːl/', score: 0 },
      { term: 'mitigation', meaning: 'biện pháp giảm thiểu', pronunciation: '/ˌmɪtɪˈɡeɪʃən/', score: 0 },
    ],
    grammar: [
      { title: 'Present perfect for updates', category: 'Tense', formula: 'S + have/has + V3 + O · (-) S + haven’t/hasn’t + V3 + O · (?) Have/Has + S + V3 + O?', example: 'We have deployed the fix to staging.' },
      { title: 'Present perfect continuous for ongoing work', category: 'Tense', formula: 'S + have/has + been + V-ing + (for/since + time)', example: 'We have been monitoring the cluster since the incident.' },
      { title: 'First conditional for risk', category: 'Conditional', formula: 'If + S + V(present), S + will/can + V + O', example: 'If the error rate spikes, we roll back.' },
      { title: 'Passive for incident reports', category: 'Passive', formula: 'S + was/were + V3 (+ by + agent)', example: 'The service was restored at 9:15.' },
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
    dialogueVariants: [
      [
        'A: Can we go over yesterday’s incident?',
        'B: Sure. The API latency went up around noon.',
        'A: Did the rollback fix it?',
        'B: Yes, but we still don’t know the root cause.',
        'A: Let’s add more monitoring and check again tomorrow.',
        'B: I’ll open a ticket and assign an owner.',
      ],
    ],
  },
  {
    id: 'neighbor-morning',
    title: 'Morning greetings with neighbors',
    description: 'Say good morning, make small talk, and keep it friendly.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'neighbor',
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
      { term: 'elevator', meaning: 'thang máy', pronunciation: '/ˈelɪveɪtə/', score: 0 },
      { term: 'front door', meaning: 'cửa chính', pronunciation: '/ˌfrʌnt ˈdɔː/', score: 0 },
      { term: 'have a nice day', meaning: 'chúc ngày tốt lành', pronunciation: '/hæv ə naɪs deɪ/', score: 0 },
    ],
    grammar: [
      { title: 'Present continuous for now', category: 'Tense', formula: 'S + am/is/are + V-ing + O (+ now/right now)', example: 'I’m just heading to the station.' },
      { title: 'Question tags for small talk', category: 'Question tag', formula: 'Positive statement, + negative tag? / Negative statement, + positive tag?', example: 'Lovely morning, isn’t it?' },
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O (before main verb, after “be”)', example: 'I usually leave around seven.' },
      { title: 'Present simple for facts', category: 'Tense', formula: 'S + V(s/es) + O · (-) S + don’t/doesn’t + V + O · (?) Do/Does + S + V + O?', example: 'She works near my building.' },
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
    dialogueVariants: [
      [
        'A: Good morning! You’re out early.',
        'B: Yeah, I’m heading to the gym before work.',
        'A: Nice. How’s the family?',
        'B: Everyone’s good, thanks. How about yours?',
        'A: All fine. I’ll see you around.',
        'B: Take care!',
      ],
    ],
  },
  {
    id: 'daily-meals',
    title: 'Breakfast, lunch, and dinner',
    description: 'Talk about meals, portions, and eating out during the day.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'meals',
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
      { term: 'snack', meaning: 'bữa phụ', pronunciation: '/snæk/', score: 0 },
      { term: 'bowl', meaning: 'cái bát', pronunciation: '/bəʊl/', score: 0 },
      { term: 'grilled', meaning: 'món nướng', pronunciation: '/ɡrɪld/', score: 0 },
    ],
    grammar: [
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O · (-) S + don’t/doesn’t usually + V + O · (?) Do/Does + S + usually + V + O?', example: 'I usually have rice for lunch.' },
      { title: 'Portions with countable and uncountable nouns', category: 'Quantifier', formula: 'a/an + N (countable) · some + N (uncountable/plural) · a bowl of + N', example: 'I’d like a bowl of soup and some rice.' },
      { title: 'Present simple for habits', category: 'Tense', formula: 'S + V(s/es) + O + time · (-) S + don’t/doesn’t + V + O · (?) Do/Does + S + V + O?', example: 'I have breakfast at seven every day.' },
      { title: '‘would like’ for ordering', category: 'Modal', formula: 'S + would like + N / to + V + O · (-) S + wouldn’t like + N · (?) Would + S + like + N?', example: 'I’d like some tea, please.' },
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
    dialogueVariants: [
      [
        'A: What are you having for lunch?',
        'B: Rice, grilled fish, and soup. What about you?',
        'A: I’m skipping lunch today because I had a late breakfast.',
        'B: That’s not great. Grab something small later.',
        'A: Yeah, maybe a banana and some yogurt.',
        'B: Good. And don’t skip dinner.',
      ],
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
      { title: 'Present simple for routines', category: 'Tense', formula: 'S + V(s/es) + O + (usually/every day) · (-) S + don’t/doesn’t + V + O · (?) Do/Does + S + V + O?', example: 'I usually walk in the park in autumn.' },
      { title: 'Present continuous for temporary changes', category: 'Tense', formula: 'S + am/is/are + V-ing + O + (this week/now)', example: 'I’m trying to sleep earlier this week.' },
      { title: 'Comparatives for seasons', category: 'Comparison', formula: 'N1 + be + adj-er / more adj + than + N2', example: 'The days are shorter than in summer.' },
      { title: '‘going to’ for intentions', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'I’m going to cycle to work more often.' },
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
      { title: 'Present perfect for progress', category: 'Tense', formula: 'S + have/has + V3 + O · (-) S + haven’t/hasn’t + V3 + O · (?) Have/Has + S + V3 + O?', example: 'We have finished the first review.' },
      { title: 'Passive for status', category: 'Passive', formula: 'S + was/were + V3 (+ by + agent)', example: 'The deployment was rolled back.' },
      { title: '‘will’ for commitments', category: 'Modal', formula: 'S + will + V + O · (-) S + won’t + V + O · (?) Will + S + V + O?', example: 'I’ll hand off the logs after this meeting.' },
      { title: 'Modals of possibility', category: 'Modal', formula: 'S + may/might/could + V + O', example: 'We might miss the deadline.' },
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
      { title: 'Comparatives', category: 'Comparison', formula: 'N1 + be + adj-er / more adj + than + N2', example: 'This laptop is cheaper than that one.' },
      { title: 'Superlatives', category: 'Comparison', formula: 'S + be + the + adj-est / most adj + N', example: 'This is the cheapest option.' },
      { title: '‘whether’ for choices', category: 'Clause', formula: 'S + decide + whether + to + V + O', example: 'We need to decide whether to buy now or wait.' },
      { title: 'Imperatives for advice', category: 'Imperative', formula: 'V + O · (-) Don’t + V + O', example: 'Check the price before you buy.' },
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
  {
    id: 'devops-release-planning',
    title: 'DevOps release planning',
    description: 'Plan a release window, freeze code, and agree on go/no-go.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'devops',
    vocab: [
      { term: 'release window', meaning: 'cửa sổ phát hành', pronunciation: '/rɪˈliːs ˈwɪndəʊ/', score: 0 },
      { term: 'code freeze', meaning: 'đóng băng mã nguồn', pronunciation: '/kəʊd friːz/', score: 0 },
      { term: 'staging', meaning: 'môi trường thử', pronunciation: '/ˈsteɪdʒɪŋ/', score: 0 },
      { term: 'canary', meaning: 'phát hành thử', pronunciation: '/kəˈneəri/', score: 0 },
      { term: 'approval', meaning: 'phê duyệt', pronunciation: '/əˈpruːvəl/', score: 0 },
      { term: 'rollback plan', meaning: 'phương án khôi phục', pronunciation: '/ˈrəʊlbæk plæn/', score: 0 },
      { term: 'go/no-go', meaning: 'quyết định triển khai hay không', pronunciation: '/ɡəʊ nəʊ ɡəʊ/', score: 0 },
      { term: 'capacity', meaning: 'năng lực hệ thống', pronunciation: '/kəˈpæsəti/', score: 0 },
      { term: 'smoke test', meaning: 'kiểm tra nhanh', pronunciation: '/sməʊk test/', score: 0 },
      { term: 'changelog', meaning: 'nhật ký thay đổi', pronunciation: '/ˈtʃeɪndʒlɒɡ/', score: 0 },
      { term: 'feature flag', meaning: 'cờ tính năng', pronunciation: '/ˈfiːtʃə flæɡ/', score: 0 },
      { term: 'hotfix', meaning: 'bản vá nóng', pronunciation: '/ˈhɒtfɪks/', score: 0 },
    ],
    grammar: [
      { title: 'Present continuous for future arrangements', category: 'Future', formula: 'S + am/is/are + V-ing + O + future time', example: 'We’re releasing on Thursday.' },
      { title: 'Modals for obligation', category: 'Modal', formula: 'S + need to / must / have to + V + O · (-) S + don’t need to + V + O · (?) Do + S + need to + V + O?', example: 'We need to freeze the code by Wednesday.' },
      { title: 'First conditional for rollout', category: 'Conditional', formula: 'If + S + V(present) + O, S + will + V + O', example: 'If the canary looks healthy, we’ll roll out.' },
      { title: 'Passive with modals', category: 'Passive', formula: 'S + modal + be + V3 (+ by + agent)', example: 'The code must be frozen by Wednesday.' },
    ],
    examples: [
      'We’re releasing on Thursday, so the code freeze starts tonight.',
      'If the canary looks healthy, we’ll roll out to all regions.',
    ],
    quizzes: [
      {
        question: 'Choose the correct future arrangement:',
        options: [
          'We’re releasing on Thursday.',
          'We release on Thursday tomorrow.',
          'We are release on Thursday.',
        ],
        answerIndex: 0,
        explanation: 'Present continuous describes a fixed future arrangement.',
      },
      {
        question: 'Which term means “đóng băng mã nguồn”?',
        options: ['code freeze', 'canary', 'capacity'],
        answerIndex: 0,
        explanation: 'A code freeze stops code changes before a release.',
      },
      {
        question: 'Complete the sentence: “We ___ freeze the code by Wednesday.”',
        options: ['need to', 'need', 'needing'],
        answerIndex: 0,
        explanation: 'Use need + to-infinitive to express obligation.',
      },
      {
        question: 'Which sentence gives a condition for rollout?',
        options: [
          'If the canary looks healthy, we’ll roll out.',
          'The canary looks healthy.',
          'We roll out maybe.',
        ],
        answerIndex: 0,
        explanation: 'First conditional: if + present simple, will + verb.',
      },
    ],
    readExpected: 'We’re releasing on Thursday, so the code freeze starts tonight.',
    dialogue: [
      'A: Quick sync on Thursday’s release?',
      'B: Sure. The code freeze starts tonight at eight.',
      'A: Do we have approval from product?',
      'B: Yes, and the rollback plan is ready.',
      'A: What about the canary?',
      'B: We’ll check it at nine and make the go/no-go call.',
    ],
    dialogueVariants: [
      [
        'A: Is the release still on for Thursday?',
        'B: Yes, but we need approval from security.',
        'A: Any risks in the rollback plan?',
        'B: The database migration is the main one.',
        'A: Then let’s run a smoke test in staging tonight.',
        'B: Agreed. I’ll post the go/no-go decision tomorrow morning.',
      ],
    ],
  },
  {
    id: 'neighbor-weekend',
    title: 'Weekend catch-up with neighbors',
    description: 'Talk about weekend plans, weather, and helping each other out.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'neighbor',
    vocab: [
      { term: 'weekend plans', meaning: 'kế hoạch cuối tuần', pronunciation: '/ˌwiːkˈend plænz/', score: 0 },
      { term: 'forecast', meaning: 'dự báo thời tiết', pronunciation: '/ˈfɔːkɑːst/', score: 0 },
      { term: 'garden', meaning: 'khu vườn', pronunciation: '/ˈɡɑːdn/', score: 0 },
      { term: 'local market', meaning: 'chợ địa phương', pronunciation: '/ˌləʊkl ˈmɑːkɪt/', score: 0 },
      { term: 'lend', meaning: 'cho mượn', pronunciation: '/lend/', score: 0 },
      { term: 'borrow', meaning: 'mượn', pronunciation: '/ˈbɒrəʊ/', score: 0 },
      { term: 'catch up', meaning: 'trò chuyện', pronunciation: '/kætʃ ʌp/', score: 0 },
      { term: 'take care of', meaning: 'chăm sóc', pronunciation: '/teɪk keə əv/', score: 0 },
      { term: 'have a good weekend', meaning: 'chúc cuối tuần vui vẻ', pronunciation: '/hæv ə ɡʊd ˌwiːkˈend/', score: 0 },
      { term: 'fence', meaning: 'hàng rào', pronunciation: '/fens/', score: 0 },
      { term: 'ladder', meaning: 'cái thang', pronunciation: '/ˈlædə/', score: 0 },
      { term: 'herbs', meaning: 'rau thơm', pronunciation: '/hɜːbz/', score: 0 },
    ],
    grammar: [
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O · (-) S + am/is/are + not + going to + V + O · (?) Am/Is/Are + S + going to + V + O?', example: 'I’m going to fix the fence this weekend.' },
      { title: 'Polite requests with ‘could’', category: 'Request', formula: 'Could + you + V + O, please?', example: 'Could you lend me a ladder?' },
      { title: 'Zero conditional for facts', category: 'Conditional', formula: 'If + S + V(present), S + V(present)', example: 'If it rains, I stay home.' },
      { title: '‘like/enjoy’ + V-ing', category: 'Gerund', formula: 'S + like/love/enjoy + V-ing + O', example: 'I enjoy walking in the park at weekends.' },
    ],
    examples: [
      'Are you doing anything fun this weekend?',
      'I’m going to the local market on Saturday morning.',
    ],
    quizzes: [
      {
        question: 'Complete the sentence: “I ___ fix the fence this weekend.”',
        options: ['am going to', 'going to', 'go to'],
        answerIndex: 0,
        explanation: '‘Be going to’ needs the verb be: I am going to fix …',
      },
      {
        question: 'Which word means “mượn”?',
        options: ['borrow', 'lend', 'bring'],
        answerIndex: 0,
        explanation: 'You borrow something from someone; they lend it to you.',
      },
      {
        question: 'Which sentence is a polite request?',
        options: [
          'Could you lend me a ladder?',
          'Give me your ladder.',
          'Ladder, now.',
        ],
        answerIndex: 0,
        explanation: '“Could you …?” is a polite way to ask for help.',
      },
      {
        question: 'Which question asks about weekend plans?',
        options: [
          'Are you doing anything fun this weekend?',
          'What is your address?',
          'Do you have a receipt?',
        ],
        answerIndex: 0,
        explanation: 'This question invites the other person to share plans.',
      },
    ],
    readExpected: 'Are you doing anything fun this weekend?',
    dialogue: [
      'A: Morning! Are you doing anything fun this weekend?',
      'B: I’m going to fix the fence if the forecast is good.',
      'A: Nice. I’m heading to the local market on Saturday.',
      'B: Could you grab some tomatoes for me?',
      'A: Sure, no problem. I’ll drop them off in the afternoon.',
      'B: Thanks! Have a good weekend.',
    ],
    dialogueVariants: [
      [
        'A: Any plans for Saturday?',
        'B: I’m going to the local market with my kids.',
        'A: That sounds fun. Is the forecast good?',
        'B: Sunny, finally. Do you need anything?',
        'A: Could you get me some herbs if you see them?',
        'B: Of course. I’ll drop them off later.',
      ],
    ],
  },
  {
    id: 'eating-out',
    title: 'Eating out and ordering food',
    description: 'Book a table, ask for recommendations, and pay politely.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'meals',
    vocab: [
      { term: 'menu', meaning: 'thực đơn', pronunciation: '/ˈmenjuː/', score: 0 },
      { term: 'recommendation', meaning: 'gợi ý', pronunciation: '/ˌrekəmenˈdeɪʃən/', score: 0 },
      { term: 'order', meaning: 'gọi món', pronunciation: '/ˈɔːdə/', score: 0 },
      { term: 'spicy', meaning: 'cay', pronunciation: '/ˈspaɪsi/', score: 0 },
      { term: 'bill', meaning: 'hoá đơn', pronunciation: '/bɪl/', score: 0 },
      { term: 'split the bill', meaning: 'chia hoá đơn', pronunciation: '/splɪt ðə bɪl/', score: 0 },
      { term: 'takeaway', meaning: 'đồ mang về', pronunciation: '/ˈteɪkəweɪ/', score: 0 },
      { term: 'tip', meaning: 'tiền boa', pronunciation: '/tɪp/', score: 0 },
      { term: 'reservation', meaning: 'đặt bàn', pronunciation: '/ˌrezəˈveɪʃən/', score: 0 },
      { term: 'vegetarian', meaning: 'món chay', pronunciation: '/ˌvedʒəˈteəriən/', score: 0 },
      { term: 'table for two', meaning: 'bàn hai người', pronunciation: '/ˌteɪbl fə ˈtuː/', score: 0 },
      { term: 'lemonade', meaning: 'nước chanh', pronunciation: '/ˌleməˈneɪd/', score: 0 },
    ],
    grammar: [
      { title: 'Polite requests with ‘could’', category: 'Request', formula: 'Could + we/I + V + O, please?', example: 'Could we have the bill, please?' },
      { title: 'Quantifiers with food', category: 'Quantifier', formula: 'a little + N (uncountable) · a few + N (countable) · O', example: 'Could I have a little more rice?' },
      { title: '‘Would you like …?’ offers', category: 'Modal', formula: 'Would + you + like + N / to + V + O?', example: 'Would you like some dessert?' },
      { title: '‘too / enough’', category: 'Adverb', formula: 'S + be + too + adj (+ for + O) · S + be + adj + enough + to + V', example: 'This soup is too spicy for me.' },
    ],
    examples: [
      'Could we have the bill, please?',
      'I’d like something spicy but not too heavy.',
    ],
    quizzes: [
      {
        question: 'Which sentence is polite when asking for the bill?',
        options: [
          'Could we have the bill, please?',
          'Bill now.',
          'Give bill.',
        ],
        answerIndex: 0,
        explanation: '“Could we … , please?” is the standard polite form.',
      },
      {
        question: 'Which phrase means “chia hoá đơn”?',
        options: ['split the bill', 'takeaway', 'tip'],
        answerIndex: 0,
        explanation: 'To split the bill is to share the cost between people.',
      },
      {
        question: 'Complete the sentence: “Could I have ___ more rice?”',
        options: ['a little', 'a few', 'many'],
        answerIndex: 0,
        explanation: 'Rice is uncountable, so use a little.',
      },
      {
        question: 'Which question asks for a recommendation?',
        options: [
          'What do you recommend?',
          'What is your name?',
          'Where is the exit?',
        ],
        answerIndex: 0,
        explanation: '“What do you recommend?” asks for a suggestion.',
      },
    ],
    readExpected: 'Could we have the bill, please?',
    dialogue: [
      'A: Good evening. Do you have a reservation?',
      'B: Yes, under Minh, for two.',
      'A: Here’s the menu. Can I get you something to drink?',
      'B: Just water, please. What do you recommend?',
      'A: The grilled chicken is popular, and it isn’t too spicy.',
      'B: Great. We’ll take that, and could we split the bill later?',
    ],
    dialogueVariants: [
      [
        'A: Do you have a table for two?',
        'B: Sure, right this way. Here are the menus.',
        'A: Thanks. Do you have any vegetarian options?',
        'B: Yes, the mushroom pasta is very good.',
        'A: We’ll order that and two lemonades.',
        'B: Great. Would you like to keep the bill together?',
      ],
    ],
  },
  {
    id: 'meal-prep',
    title: 'Meal prep and healthy eating',
    description: 'Talk about groceries, recipes, and staying healthy during the week.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'meals',
    vocab: [
      { term: 'groceries', meaning: 'thực phẩm mua về', pronunciation: '/ˈɡrəʊsəriz/', score: 0 },
      { term: 'ingredients', meaning: 'nguyên liệu', pronunciation: '/ɪnˈɡriːdiənts/', score: 0 },
      { term: 'recipe', meaning: 'công thức', pronunciation: '/ˈresəpi/', score: 0 },
      { term: 'portion', meaning: 'khẩu phần', pronunciation: '/ˈpɔːʃən/', score: 0 },
      { term: 'protein', meaning: 'chất đạm', pronunciation: '/ˈprəʊtiːn/', score: 0 },
      { term: 'sugary', meaning: 'nhiều đường', pronunciation: '/ˈʃʊɡəri/', score: 0 },
      { term: 'stay hydrated', meaning: 'uống đủ nước', pronunciation: '/steɪ ˈhaɪdreɪtɪd/', score: 0 },
      { term: 'junk food', meaning: 'đồ ăn vặt', pronunciation: '/dʒʌŋk fuːd/', score: 0 },
      { term: 'meal prep', meaning: 'chuẩn bị bữa ăn', pronunciation: '/miːl prep/', score: 0 },
      { term: 'yogurt', meaning: 'sữa chua', pronunciation: '/ˈjɒɡət/', score: 0 },
      { term: 'vegetables', meaning: 'rau củ', pronunciation: '/ˈvedʒtəblz/', score: 0 },
      { term: 'whole grains', meaning: 'ngũ cốc nguyên hạt', pronunciation: '/həʊl ɡreɪnz/', score: 0 },
    ],
    grammar: [
      { title: '‘should’ for advice', category: 'Modal', formula: 'S + should/shouldn’t + V + O · (?) Should + S + V + O?', example: 'You should prep meals on Sunday.' },
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O · (-) S + rarely/never + V + O', example: 'I rarely order junk food during the week.' },
      { title: 'Gerunds as subjects', category: 'Gerund', formula: 'V-ing + V(singular) + O', example: 'Prepping meals saves time.' },
      { title: 'Purpose with ‘to’ and ‘so that’', category: 'Purpose', formula: 'S + V + O + to + V / so that + S + can + V', example: 'I prep meals to save time.' },
    ],
    examples: [
      'I do meal prep on Sunday so I eat better during the week.',
      'I try to add protein to every meal and drink more water.',
    ],
    quizzes: [
      {
        question: 'Which word means “nguyên liệu”?',
        options: ['ingredients', 'groceries', 'recipe'],
        answerIndex: 0,
        explanation: 'Ingredients are the items you use to cook a dish.',
      },
      {
        question: 'Complete the sentence: “You ___ prep meals on Sunday.”',
        options: ['should', 'should to', 'shoulds'],
        answerIndex: 0,
        explanation: 'Use should + base verb, without to.',
      },
      {
        question: 'Which sentence gives advice?',
        options: [
          'You should drink more water.',
          'You drink more water.',
          'Drinking water yesterday.',
        ],
        answerIndex: 0,
        explanation: 'Should expresses advice or a recommendation.',
      },
      {
        question: 'Which phrase means “đồ ăn vặt”?',
        options: ['junk food', 'meal prep', 'protein'],
        answerIndex: 0,
        explanation: 'Junk food is food with little nutritional value.',
      },
    ],
    readExpected: 'I do meal prep on Sunday so I eat better during the week.',
    dialogue: [
      'A: How do you eat healthy on busy days?',
      'B: I do meal prep on Sunday and portion everything.',
      'A: Sounds smart. What do you usually cook?',
      'B: Chicken, rice, and vegetables. I add protein to every meal.',
      'A: Do you ever order junk food?',
      'B: Rarely. I keep fruit at home and stay hydrated.',
    ],
    dialogueVariants: [
      [
        'A: Your lunch looks healthy.',
        'B: Thanks. I did meal prep on Sunday.',
        'A: What’s in it?',
        'B: Rice, chicken, and a lot of vegetables.',
        'A: I should try that. Any tips?',
        'B: Start with two recipes and don’t skip breakfast.',
      ],
    ],
  },
];

const DAILY_THEMES: EnglishTheme[] = ['devops', 'neighbor', 'meals'];

function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function hashText(value: string): number {
  let hash = 7;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 1_000_003;
  return hash;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let value = Math.abs(seed) + 1;
  for (let i = result.length - 1; i > 0; i -= 1) {
    value = (value * 1_103_515_245 + 12_345) % 2_147_483_648;
    const j = value % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function rotate<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function pickDailyVocab(topic: EnglishTopic, seed: number, size = 9): EnglishVocabularyItem[] {
  const ordered = rotate(topic.vocab, seed);
  return ordered.slice(0, Math.min(size, ordered.length));
}

function pickDailyDialogue(topic: EnglishTopic, seed: number): string[] {
  const variants = [topic.dialogue, ...(topic.dialogueVariants ?? [])];
  return [...variants[Math.abs(seed) % variants.length]];
}

function shuffleQuizOptions(quiz: EnglishQuiz, seed: number): EnglishQuiz {
  const correct = quiz.options[quiz.answerIndex];
  const options = seededShuffle(quiz.options, seed);
  return { ...quiz, options, answerIndex: Math.max(0, options.indexOf(correct)) };
}

function buildDailyQuizzes(
  topic: EnglishTopic,
  vocab: EnglishVocabularyItem[],
  seed: number,
): EnglishQuiz[] {
  const target = vocab[Math.abs(seed) % vocab.length];
  const distractors = seededShuffle(
    vocab.filter((item) => item.term !== target.term),
    seed + 13,
  ).slice(0, 2).map((item) => item.term);
  const options = seededShuffle([target.term, ...distractors], seed + 29);
  const vocabularyQuiz: EnglishQuiz = {
    question: `Which word means “${target.meaning}”?`,
    options,
    answerIndex: Math.max(0, options.indexOf(target.term)),
    explanation: `${target.term} means ${target.meaning}.`,
  };
  const curated = seededShuffle(topic.quizzes, seed + 41).slice(0, 3);
  return seededShuffle([...curated, vocabularyQuiz], seed + 53)
    .map((quiz, index) => shuffleQuizOptions(quiz, seed + index));
}

export function getDailyTopics(date = new Date()): EnglishTopic[] {
  const seed = dayNumber(date);
  return DAILY_THEMES.flatMap((theme, index) => {
    const pool = TOPICS.filter((topic) => topic.daily && topic.theme === theme);
    if (pool.length === 0) return [];
    return [pool[(seed + index) % pool.length]];
  });
}

export function getTodayEnglishContext(date = new Date()): TodayEnglishContext {
  const todayKey = dateKey(date);
  const day = dayNumber(date);
  // Daily themes rotate by date so the same three topics do not repeat every day.
  const ordered = [
    ...getDailyTopics(date),
    ...TOPICS.filter((topic) => !topic.daily),
  ];
  const topics = ordered.map((topic) => {
    if (!topic.daily) {
      return { ...topic, vocab: topic.vocab.map((item) => ({ ...item })) };
    }
    // Inside a daily topic, vocabulary, quizzes, and dialogue also rotate by date.
    const seed = day * 97 + hashText(topic.id);
    const vocab = pickDailyVocab(topic, seed);
    return {
      ...topic,
      vocab: vocab.map((item) => ({ ...item })),
      dialogue: pickDailyDialogue(topic, seed),
      quizzes: buildDailyQuizzes(topic, vocab, seed),
    };
  });
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
