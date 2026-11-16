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
  /** IPA pronunciation of the example sentence. */
  pronunciation?: string;
};

export type EnglishQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type EnglishTheme = 'devops' | 'neighbor' | 'meals' | 'weekend';

export type EnglishTopic = {
  id: string;
  title: string;
  description: string;
  availableFrom: string;
  /** Daily essentials stay available every day. */
  daily?: boolean;
  /** Only shown on Mondays. */
  mondayOnly?: boolean;
  /** Suggested time limit in minutes for this topic. */
  timeLimit?: number;
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
    id: 'christmas-celebration',
    title: 'Christmas celebration',
    description: 'Talk about Christmas plans, gifts, and festive traditions.',
    availableFrom: '2026-12-25',
    vocab: [
      { term: 'Christmas', meaning: 'Giáng sinh', pronunciation: '/ˈkrɪsməs/', score: 0 },
      { term: 'gift', meaning: 'quà tặng', pronunciation: '/ɡɪft/', score: 0 },
      { term: 'decoration', meaning: 'đồ trang trí', pronunciation: '/ˌdekəˈreɪʃən/', score: 0 },
      { term: 'festive', meaning: 'lễ hội', pronunciation: '/ˈfestɪv/', score: 0 },
      { term: 'gather', meaning: 'tụ họp', pronunciation: '/ˈɡæðə/', score: 0 },
      { term: 'family dinner', meaning: 'bữa tối gia đình', pronunciation: '/ˈfæməli ˈdɪnə/', score: 0 },
      { term: 'carol', meaning: 'bài thánh ca', pronunciation: '/ˈkærəl/', score: 0 },
      { term: 'wish', meaning: 'chúc', pronunciation: '/wɪʃ/', score: 0 },
      { term: 'celebrate', meaning: 'kỷ niệm', pronunciation: '/ˈselɪbreɪt/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for traditions', category: 'Tense', formula: 'S + V(s/es) + O + every Christmas / usually', example: 'We always have turkey for Christmas dinner.' , pronunciation: '/wi ˈɔːlweɪz hæv ˈtɜːki fə ˈkrɪsməs ˈdɪnə/' },
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'We’re going to visit my parents on Christmas Eve.', pronunciation: '/wɪə ˈɡəʊɪŋ tə ˈvɪzɪt maɪ ˈpeərənts ɒn ˈkrɪsməs iːv/' },
      { title: 'Comparatives for gifts', category: 'Comparison', formula: 'N1 + be + adj-er / more adj + than + N2', example: 'This gift is more thoughtful than last year’s.', pronunciation: '/ðɪs ɡɪft ɪz mɔː ˈθɔːtfəl ðæn lɑːst jɪəz/' },
      { title: '‘wish’ + someone + Merry Christmas', category: 'Verb pattern', formula: 'S + wish + O + Merry Christmas / Happy New Year', example: 'I wish you a Merry Christmas!', pronunciation: '/aɪ wɪʃ ju ə ˈmeri ˈkrɪsməs/' },
    ],
    examples: [
      'We always have turkey for Christmas dinner.',
      'I wish you a Merry Christmas and a Happy New Year!',
    ],
    quizzes: [
      { question: 'Which word means “quà tặng”?', options: ['gift', 'carol', 'decoration'], answerIndex: 0, explanation: 'A gift is something you give to someone.' },
      { question: 'Complete: “We’re ___ visit my parents on Christmas Eve.”', options: ['going to', 'go to', 'gone to'], answerIndex: 0, explanation: '“Be going to” needs the verb be.' },
      { question: 'Which sentence wishes someone well?', options: ['I wish you a Merry Christmas!', 'I am Christmas.', 'Christmas is here.'], answerIndex: 0, explanation: '“I wish you …” is a standard greeting.' },
      { question: 'Which word means “tụ họp”?', options: ['gather', 'wish', 'carol'], answerIndex: 0, explanation: 'Gather means to come together.' },
    ],
    readExpected: 'We always have turkey for Christmas dinner.',
    dialogue: [
      'A: What are your plans for Christmas?',
      'B: We’re gathering at my parents’ house.',
      'A: That sounds lovely. Are you cooking?',
      'B: Yes, a big family dinner. What about you?',
      'A: I’m staying home and watching Christmas carols.',
      'B: Merry Christmas in advance!',
    ],
    dialogueVariants: [
      [
        'A: Have you bought gifts yet?',
        'B: Yes, I finished shopping last week.',
        'A: I still need one for my sister.',
        'B: Try the market downtown.',
        'A: Good idea. Merry Christmas!',
        'B: Merry Christmas to you too!',
      ],
    ],
  },
  {
    id: 'tet-lunar-new-year',
    title: 'Tết Nguyên Đán (Lunar New Year)',
    description: 'Talk about Tết traditions, family visits, and lucky money.',
    availableFrom: '2027-02-06',
    vocab: [
      { term: 'Tết', meaning: 'Tết', pronunciation: '/tet/', score: 0 },
      { term: 'lucky money', meaning: 'lì xì', pronunciation: '/ˈlʌki ˈmʌni/', score: 0 },
      { term: 'family reunion', meaning: 'đoàn viên', pronunciation: '/ˈfæməli riˈjuːniən/', score: 0 },
      { term: 'ancestors', meaning: 'tổ tiên', pronunciation: '/ˈænsestəz/', score: 0 },
      { term: 'incense', meaning: 'hương', pronunciation: '/ˈɪnsens/', score: 0 },
      { term: 'traditional food', meaning: 'đồ ăn truyền thống', pronunciation: '/trəˈdɪʃənl fuːd/', score: 0 },
      { term: 'bánh chưng', meaning: 'bánh chưng', pronunciation: '/bæn tʃʊŋ/', score: 0 },
      { term: 'visit relatives', meaning: 'thăm họ hàng', pronunciation: '/ˈvɪzɪt ˈrelətɪvz/', score: 0 },
      { term: 'new year wish', meaning: 'lời chúc năm mới', pronunciation: '/njuː jɪə wɪʃ/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for traditions', category: 'Tense', formula: 'S + V(s/es) + O + every Tết / usually', example: 'We always visit our grandparents on the first day of Tết.', pronunciation: '/wi ˈɔːlweɪz ˈvɪzɪt ˈaʊə ˈɡrænpeərənts ɒn ðə fɜːst deɪ əv tet/' },
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'We’re going to cook bánh chưng this year.', pronunciation: '/wɪə ˈɡəʊɪŋ tə kʊk bæn tʃʊŋ ðɪs jɪə/' },
      { title: '‘have to’ for obligation', category: 'Modal', formula: 'S + have to / has to + V + O', example: 'I have to visit my relatives during Tết.', pronunciation: '/aɪ hæv tə ˈvɪzɪt maɪ ˈrelətɪvz ˈdjʊərɪŋ tet/' },
      { title: '‘wish’ + someone + Happy New Year', category: 'Verb pattern', formula: 'S + wish + O + Happy New Year', example: 'I wish you a Happy New Year!', pronunciation: '/aɪ wɪʃ ju ə ˈhæpi njuː jɪə/' },
    ],
    examples: [
      'We always visit our grandparents on the first day of Tết.',
      'I wish you a Happy New Year!',
    ],
    quizzes: [
      { question: 'Which word means “lì xì”?', options: ['lucky money', 'incense', 'ancestors'], answerIndex: 0, explanation: 'Lucky money is given in red envelopes.' },
      { question: 'Which word means “đoàn viên”?', options: ['family reunion', 'traditional food', 'visit relatives'], answerIndex: 0, explanation: 'Family reunion means gathering with family.' },
      { question: 'Complete: “We’re ___ cook bánh chưng this year.”', options: ['going to', 'go to', 'gone to'], answerIndex: 0, explanation: '“Be going to” needs the verb be.' },
      { question: 'Which sentence wishes someone well?', options: ['I wish you a Happy New Year!', 'I am Tết.', 'Tết is here.'], answerIndex: 0, explanation: '“I wish you …” is a standard greeting.' },
    ],
    readExpected: 'We always visit our grandparents on the first day of Tết.',
    dialogue: [
      'A: What are your plans for Tết?',
      'B: We’re having a big family reunion.',
      'A: That sounds lovely. Are you cooking bánh chưng?',
      'B: Yes, and we’ll visit relatives too.',
      'A: Don’t forget the lucky money!',
      'B: Of course. Happy New Year in advance!',
    ],
    dialogueVariants: [
      [
        'A: Have you cleaned the house for Tết?',
        'B: Yes, and we’ve put up decorations.',
        'A: I still need to buy gifts.',
        'B: Try the market downtown.',
        'A: Good idea. Happy Tết!',
        'B: Happy Tết to you too!',
      ],
    ],
  },
  {
    id: 'valentines-day',
    title: 'Valentine’s Day',
    description: 'Talk about Valentine’s plans, gifts, and expressing love.',
    availableFrom: '2027-02-14',
    vocab: [
      { term: 'Valentine’s Day', meaning: 'Ngày Valentine', pronunciation: '/ˈvæləntaɪnz deɪ/', score: 0 },
      { term: 'romantic', meaning: 'lãng mạn', pronunciation: '/rəʊˈmæntɪk/', score: 0 },
      { term: 'bouquet', meaning: 'bó hoa', pronunciation: '/buˈkeɪ/', score: 0 },
      { term: 'chocolate', meaning: 'sô cô la', pronunciation: '/ˈtʃɒklət/', score: 0 },
      { term: 'date', meaning: 'cuộc hẹn', pronunciation: '/deɪt/', score: 0 },
      { term: 'surprise', meaning: 'bất ngờ', pronunciation: '/səˈpraɪz/', score: 0 },
      { term: 'love letter', meaning: 'thư tình', pronunciation: '/lʌv ˈletə/', score: 0 },
      { term: 'propose', meaning: 'cầu hôn', pronunciation: '/prəˈpəʊz/', score: 0 },
      { term: 'couple', meaning: 'cặp đôi', pronunciation: '/ˈkʌpl/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for habits', category: 'Tense', formula: 'S + V(s/es) + O + every year / usually', example: 'We always exchange gifts on Valentine’s Day.', pronunciation: '/wi ˈɔːlweɪz ɪksˈtʃeɪndʒ ɡɪfts ɒn ˈvæləntaɪnz deɪ/' },
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'I’m going to cook a romantic dinner.', pronunciation: '/aɪm ˈɡəʊɪŋ tə kʊk ə rəʊˈmæntɪk ˈdɪnə/' },
      { title: 'Comparatives for gifts', category: 'Comparison', formula: 'N1 + be + adj-er / more adj + than + N2', example: 'Roses are more romantic than chocolates.', pronunciation: '/ˈrəʊzɪz ɑː mɔː rəʊˈmæntɪk ðæn ˈtʃɒkləts/' },
      { title: '‘wish’ + someone + Happy Valentine’s Day', category: 'Verb pattern', formula: 'S + wish + O + Happy Valentine’s Day', example: 'I wish you a Happy Valentine’s Day!', pronunciation: '/aɪ wɪʃ ju ə ˈhæpi ˈvæləntaɪnz deɪ/' },
    ],
    examples: [
      'We always exchange gifts on Valentine’s Day.',
      'I wish you a Happy Valentine’s Day!',
    ],
    quizzes: [
      { question: 'Which word means “bó hoa”?', options: ['bouquet', 'chocolate', 'surprise'], answerIndex: 0, explanation: 'A bouquet is a bunch of flowers.' },
      { question: 'Which word means “cầu hôn”?', options: ['propose', 'date', 'couple'], answerIndex: 0, explanation: 'To propose is to ask someone to marry you.' },
      { question: 'Complete: “I’m ___ cook a romantic dinner.”', options: ['going to', 'go to', 'gone to'], answerIndex: 0, explanation: '“Be going to” needs the verb be.' },
      { question: 'Which sentence wishes someone well?', options: ['I wish you a Happy Valentine’s Day!', 'I am Valentine.', 'Valentine is here.'], answerIndex: 0, explanation: '“I wish you …” is a standard greeting.' },
    ],
    readExpected: 'We always exchange gifts on Valentine’s Day.',
    dialogue: [
      'A: What are your plans for Valentine’s Day?',
      'B: I’m taking her out for dinner.',
      'A: That sounds romantic. Did you buy a gift?',
      'B: Yes, a bouquet and some chocolate.',
      'A: She’ll love it. Surprise her!',
      'B: I hope so. Happy Valentine’s Day!',
    ],
    dialogueVariants: [
      [
        'A: Have you written a love letter?',
        'B: Yes, I finished it last night.',
        'A: That’s sweet. Are you proposing?',
        'B: Maybe. I’m nervous.',
        'A: You’ll do great. Good luck!',
        'B: Thanks! Wish me luck.',
      ],
    ],
  },
  {
    id: 'new-years-day',
    title: 'New Year’s Day',
    description: 'Talk about New Year’s resolutions and fresh starts.',
    availableFrom: '2027-01-01',
    vocab: [
      { term: 'New Year’s Day', meaning: 'Ngày đầu năm mới', pronunciation: '/njuː jɪəz deɪ/', score: 0 },
      { term: 'resolution', meaning: 'quyết tâm', pronunciation: '/ˌrezəˈluːʃən/', score: 0 },
      { term: 'fresh start', meaning: 'khởi đầu mới', pronunciation: '/freʃ stɑːt/', score: 0 },
      { term: 'goal', meaning: 'mục tiêu', pronunciation: '/ɡəʊl/', score: 0 },
      { term: 'achieve', meaning: 'đạt được', pronunciation: '/əˈtʃiːv/', score: 0 },
      { term: 'habit', meaning: 'thói quen', pronunciation: '/ˈhæbɪt/', score: 0 },
      { term: 'exercise', meaning: 'tập thể dục', pronunciation: '/ˈeksəsaɪz/', score: 0 },
      { term: 'save money', meaning: 'tiết kiệm', pronunciation: '/seɪv ˈmʌni/', score: 0 },
      { term: 'countdown', meaning: 'đếm ngược', pronunciation: '/ˈkaʊntdaʊn/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for resolutions', category: 'Tense', formula: 'S + V(s/es) + O + this year / from now on', example: 'I exercise three times a week this year.', pronunciation: '/aɪ ˈeksəsaɪz θriː taɪmz ə wiːk ðɪs jɪə/' },
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'I’m going to save more money.', pronunciation: '/aɪm ˈɡəʊɪŋ tə seɪv mɔː ˈmʌni/' },
      { title: '‘want to’ for goals', category: 'Modal', formula: 'S + want to + V + O', example: 'I want to learn a new language.', pronunciation: '/aɪ wɒnt tə lɜːn ə njuː ˈlæŋɡwɪdʒ/' },
      { title: '‘wish’ + someone + Happy New Year', category: 'Verb pattern', formula: 'S + wish + O + Happy New Year', example: 'I wish you a Happy New Year!', pronunciation: '/aɪ wɪʃ ju ə ˈhæpi njuː jɪə/' },
    ],
    examples: [
      'I exercise three times a week this year.',
      'I wish you a Happy New Year!',
    ],
    quizzes: [
      { question: 'Which word means “quyết tâm”?', options: ['resolution', 'goal', 'habit'], answerIndex: 0, explanation: 'A resolution is a firm decision to do something.' },
      { question: 'Which word means “khởi đầu mới”?', options: ['fresh start', 'countdown', 'achieve'], answerIndex: 0, explanation: 'A fresh start means a new beginning.' },
      { question: 'Complete: “I’m ___ save more money.”', options: ['going to', 'go to', 'gone to'], answerIndex: 0, explanation: '“Be going to” needs the verb be.' },
      { question: 'Which sentence wishes someone well?', options: ['I wish you a Happy New Year!', 'I am New Year.', 'New Year is here.'], answerIndex: 0, explanation: '“I wish you …” is a standard greeting.' },
    ],
    readExpected: 'I exercise three times a week this year.',
    dialogue: [
      'A: Do you have any New Year’s resolutions?',
      'B: Yes, I want to exercise more.',
      'A: That’s a great goal. How often?',
      'B: Three times a week. What about you?',
      'A: I’m going to save more money.',
      'B: Good luck! Happy New Year!',
    ],
    dialogueVariants: [
      [
        'A: Did you stay up for the countdown?',
        'B: Yes, until midnight.',
        'A: Was it fun?',
        'B: Very. I made a fresh start this year.',
        'A: Me too. Let’s achieve our goals.',
        'B: Agreed. Happy New Year!',
      ],
    ],
  },

  {
    id: 'psychology-mind',
    title: 'Psychology and the mind',
    description: 'Talk about emotions, habits, and how the mind works.',
    availableFrom: '2020-01-01',
    mondayOnly: true,
    vocab: [
      { term: 'emotion', meaning: 'cảm xúc', pronunciation: '/ɪˈməʊʃən/', score: 0 },
      { term: 'anxiety', meaning: 'lo âu', pronunciation: '/æŋˈzaɪəti/', score: 0 },
      { term: 'habit', meaning: 'thói quen', pronunciation: '/ˈhæbɪt/', score: 0 },
      { term: 'motivation', meaning: 'động lực', pronunciation: '/ˌməʊtɪˈveɪʃən/', score: 0 },
      { term: 'mindset', meaning: 'tư duy', pronunciation: '/ˈmaɪndset/', score: 0 },
      { term: 'trigger', meaning: 'kích hoạt', pronunciation: '/ˈtrɪɡə/', score: 0 },
      { term: 'coping', meaning: 'đối phó', pronunciation: '/ˈkəʊpɪŋ/', score: 0 },
      { term: 'resilience', meaning: 'khả năng phục hồi', pronunciation: '/rɪˈzɪliəns/', score: 0 },
      { term: 'empathy', meaning: 'đồng cảm', pronunciation: '/ˈempəθi/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for mental states', category: 'Tense', formula: 'S + V(s/es) + O (think, feel, know, believe)', example: 'I think habits shape our mindset.', pronunciation: 'aɪ θɪŋk ˈhæbɪts ʃeɪp ˈaʊə ˈmaɪndset' },
      { title: '‘used to’ for past habits', category: 'Tense', formula: 'S + used to + V + O', example: 'I used to worry a lot.', pronunciation: 'aɪ juːst tə ˈwʌri ə lɒt' },
      { title: '‘if’ + mental state', category: 'Conditional', formula: 'If + S + V(present), S + will/can + V + O', example: 'If you feel anxious, take a deep breath.', pronunciation: 'ɪf juː fiːl ˈæŋkʃəs, teɪk ə diːp breθ' },
      { title: '‘make’ + someone + feel', category: 'Causative', formula: 'S + make + O + feel + adj', example: 'Good sleep makes me feel calmer.', pronunciation: 'ɡʊd sliːp meɪks miː fiːl ˈkɑːmə' },
    ],
    examples: [
      'I think habits shape our mindset more than talent does.',
      'If you feel anxious, take a deep breath.',
    ],
    quizzes: [
      { question: 'Which word means “động lực”?', options: ['motivation', 'anxiety', 'habit'], answerIndex: 0, explanation: 'Motivation is the reason for acting.' },
      { question: 'Which word means “đồng cảm”?', options: ['empathy', 'trigger', 'coping'], answerIndex: 0, explanation: 'Empathy is understanding others’ feelings.' },
      { question: 'Complete: “I ___ to worry a lot.”', options: ['used', 'use', 'using'], answerIndex: 0, explanation: '“Used to” describes a past habit.' },
      { question: 'Which sentence gives advice?', options: ['If you feel anxious, take a deep breath.', 'I am anxious.', 'Anxiety exists.'], answerIndex: 0, explanation: 'First conditional gives advice for a situation.' },
    ],
    readExpected: 'I think habits shape our mindset more than talent does.',
    dialogue: [
      'A: Why do I keep procrastinating?',
      'B: It might be a habit, not laziness.',
      'A: How do I change it?',
      'B: Start small and track your motivation.',
      'A: That sounds manageable.',
      'B: Yes. Be kind to yourself and keep going.',
    ],
    dialogueVariants: [
      [
        'A: I feel anxious before presentations.',
        'B: That’s normal. Try deep breathing.',
        'A: Does it really help?',
        'B: Yes, it calms the body and mind.',
        'A: I’ll try it next time.',
        'B: You’ve got this.',
      ],
    ],
  },

  {
    id: 'sunday-mass',
    title: 'Sunday Mass and going to church',
    description: 'Talk about going to church, mass, and Sunday worship.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'weekend',
    vocab: [
      { term: 'mass', meaning: 'thánh lễ', pronunciation: '/mæs/', score: 0 },
      { term: 'church', meaning: 'nhà thờ', pronunciation: '/tʃɜːtʃ/', score: 0 },
      { term: 'parish', meaning: 'giáo xứ', pronunciation: '/ˈpærɪʃ/', score: 0 },
      { term: 'prayer', meaning: 'lời cầu nguyện', pronunciation: '/preə/', score: 0 },
      { term: 'hymn', meaning: 'bài thánh ca', pronunciation: '/hɪm/', score: 0 },
      { term: 'sermon', meaning: 'bài giảng', pronunciation: '/ˈsɜːmən/', score: 0 },
      { term: 'communion', meaning: 'rước lễ', pronunciation: '/kəˈmjuːniən/', score: 0 },
      { term: 'blessing', meaning: 'phép lành', pronunciation: '/ˈblesɪŋ/', score: 0 },
      { term: 'choir', meaning: 'ca đoàn', pronunciation: '/ˈkwaɪə/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for weekly worship', category: 'Tense', formula: 'S + V(s/es) + O + every Sunday / usually', example: 'I go to church every Sunday morning.', pronunciation: 'aɪ ɡəʊ tə tʃɜːtʃ ˈevri ˈsʌndeɪ ˈmɔːnɪŋ' },
      { title: 'Present perfect for experience', category: 'Tense', formula: 'S + have/has + been to + place', example: 'I have been to that parish before.', pronunciation: 'aɪ hæv biːn tə ðæt ˈpærɪʃ bɪˈfɔː' },
      { title: '‘go to’ + church', category: 'Preposition', formula: 'go to + church (no article)', example: 'We go to church at nine.', pronunciation: 'wi ɡəʊ tə tʃɜːtʃ æt naɪn' },
      { title: 'Polite invitations', category: 'Modal', formula: 'Would + you + like + to + V + O?', example: 'Would you like to come to mass with us?', pronunciation: 'wʊd ju laɪk tə kʌm tə mæs wɪð ʌs' },
    ],
    examples: [
      'I go to church every Sunday morning.',
      'Would you like to come to mass with us?',
    ],
    quizzes: [
      { question: 'Which word means “thánh lễ”?', options: ['mass', 'church', 'parish'], answerIndex: 0, explanation: 'Mass is the main Sunday worship service.' },
      { question: 'Complete: “I ___ to church every Sunday.”', options: ['go', 'goes', 'going'], answerIndex: 0, explanation: 'With “I”, use the base form: go.' },
      { question: 'Which sentence is polite when inviting?', options: ['Would you like to come to mass with us?', 'Come to mass now.', 'You must come.'], answerIndex: 0, explanation: '“Would you like …?” is a polite invitation.' },
      { question: 'Which word means “ca đoàn”?', options: ['choir', 'sermon', 'hymn'], answerIndex: 0, explanation: 'A choir is the group that sings in church.' },
    ],
    readExpected: 'I go to church every Sunday morning.',
    dialogue: [
      'A: Are you going to church this Sunday?',
      'B: Yes, at nine. Would you like to come?',
      'A: I’d love to. Is the choir singing?',
      'B: Yes, and the sermon is about forgiveness.',
      'A: That sounds meaningful.',
      'B: Great. Let’s meet at the parish gate at eight forty-five.',
    ],
    dialogueVariants: [
      [
        'A: What time is mass today?',
        'B: Nine o’clock, as usual.',
        'A: I’m bringing my children.',
        'B: Wonderful. There’s a children’s blessing.',
        'A: That’s lovely. See you there.',
        'B: See you. Have a blessed Sunday.',
      ],
    ],
  },

  {
    id: 'weekend-market',
    title: 'Weekend market shopping',
    description: 'Buy fresh food at the market and chat with vendors.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'weekend',
    vocab: [
      { term: 'market', meaning: 'chợ', pronunciation: '/ˈmɑːkɪt/', score: 0 },
      { term: 'fresh', meaning: 'tươi', pronunciation: '/freʃ/', score: 0 },
      { term: 'bargain', meaning: 'món hời', pronunciation: '/ˈbɑːɡɪn/', score: 0 },
      { term: 'vendor', meaning: 'người bán hàng', pronunciation: '/ˈvendə/', score: 0 },
      { term: 'weigh', meaning: 'cân', pronunciation: '/weɪ/', score: 0 },
      { term: 'bag', meaning: 'túi', pronunciation: '/bæɡ/', score: 0 },
      { term: 'receipt', meaning: 'hoá đơn', pronunciation: '/rɪˈsiːt/', score: 0 },
      { term: 'cash', meaning: 'tiền mặt', pronunciation: '/kæʃ/', score: 0 },
      { term: 'loose change', meaning: 'tiền lẻ', pronunciation: '/luːs tʃeɪndʒ/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple for market routines', category: 'Tense', formula: 'S + V(s/es) + O + every Saturday / usually', example: 'I usually buy fresh vegetables at the market on Sunday.', pronunciation: 'aɪ ˈjuːʒəli baɪ freʃ ˈvedʒtəblz æt ðə ˈmɑːkɪt ɒn ˈsʌndeɪ' },
      { title: 'Polite requests with ‘could’', category: 'Request', formula: 'Could + you + V + O, please?', example: 'Could you weigh these tomatoes, please?', pronunciation: 'kʊd ju weɪ ðiːz təˈmɑːtəʊz pliːz' },
      { title: '‘how much’ for price', category: 'Question', formula: 'How much + be + N / How much + do/does + S + V?', example: 'How much are these oranges?', pronunciation: 'haʊ mʌtʃ ɑː ðiːz ˈɒrɪndʒɪz' },
      { title: 'Imperatives for advice', category: 'Imperative', formula: 'V + O · (-) Don’t + V + O', example: 'Check the price before you buy.', pronunciation: 'tʃek ðə praɪs bɪˈfɔː ju baɪ' },
    ],
    examples: [
      'I usually buy fresh vegetables at the market on Sunday.',
      'Could you weigh these tomatoes, please?',
    ],
    quizzes: [
      { question: 'Which word means “tươi”?', options: ['fresh', 'cash', 'bag'], answerIndex: 0, explanation: 'Fresh means newly picked or made.' },
      { question: 'Complete: “Could you ___ these tomatoes, please?”', options: ['weigh', 'weighs', 'weighing'], answerIndex: 0, explanation: 'Could you + base verb: weigh.' },
      { question: 'Which question asks about price?', options: ['How much are these oranges?', 'What is your name?', 'Where is the exit?'], answerIndex: 0, explanation: 'How much + be + noun asks about price.' },
      { question: 'Which sentence is polite when buying?', options: ['Could you weigh these, please?', 'Weigh these now.', 'Give me these.'], answerIndex: 0, explanation: '“Could you …, please?” is polite.' },
    ],
    readExpected: 'I usually buy fresh vegetables at the market on Sunday.',
    dialogue: [
      'A: What are you buying today?',
      'B: Fresh tomatoes and some herbs.',
      'A: Could you weigh these, please?',
      'B: Sure. That’s half a kilo.',
      'A: How much is it?',
      'B: Two dollars. Do you need a bag?',
    ],
    dialogueVariants: [
      [
        'A: Morning! What’s fresh today?',
        'B: The spinach and carrots just arrived.',
        'A: Could you give me a kilo of carrots?',
        'B: Of course. Anything else?',
        'A: Just these. How much in total?',
        'B: Five dollars. Have a good weekend!',
      ],
    ],
  },
  {
    id: 'weekend-outing',
    title: 'Going out with friends',
    description: 'Plan a fun weekend with friends and handle small details.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'weekend',
    vocab: [
      { term: 'hang out', meaning: 'đi chơi', pronunciation: '/hæŋ aʊt/', score: 0 },
      { term: 'café', meaning: 'quán cà phê', pronunciation: '/ˈkæfeɪ/', score: 0 },
      { term: 'cinema', meaning: 'rạp chiếu phim', pronunciation: '/ˈsɪnəmə/', score: 0 },
      { term: 'meet up', meaning: 'gặp nhau', pronunciation: '/miːt ʌp/', score: 0 },
      { term: 'reservation', meaning: 'đặt chỗ', pronunciation: '/ˌrezəˈveɪʃən/', score: 0 },
      { term: 'traffic', meaning: 'giao thông', pronunciation: '/ˈtræfɪk/', score: 0 },
      { term: 'late', meaning: 'muộn', pronunciation: '/leɪt/', score: 0 },
      { term: 'split', meaning: 'chia', pronunciation: '/splɪt/', score: 0 },
      { term: 'taxi', meaning: 'taxi', pronunciation: '/ˈtæksi/', score: 0 },
    ],
    grammar: [
      { title: '‘Let’s’ for suggestions', category: 'Modal', formula: 'Let’s + V + O / Why don’t we + V + O?', example: 'Let’s meet up at seven.', pronunciation: 'lets miːt ʌp æt ˈsevən' },
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'We’re going to watch a movie.', pronunciation: 'wɪə ˈɡəʊɪŋ tə wɒtʃ ə ˈmuːvi' },
      { title: 'Present continuous for future arrangements', category: 'Future', formula: 'S + am/is/are + V-ing + O + future time', example: 'I’m meeting friends at six.', pronunciation: 'aɪm ˈmiːtɪŋ frendz æt sɪks' },
      { title: '‘Would you like …?’ offers', category: 'Modal', formula: 'Would + you + like + N / to + V + O?', example: 'Would you like to grab a coffee?', pronunciation: 'wʊd ju laɪk tə ɡræb ə ˈkɒfi' },
    ],
    examples: [
      'Let’s meet up at seven and grab a coffee.',
      'I’m meeting friends at six, so I might be late.',
    ],
    quizzes: [
      { question: 'Which phrase suggests an activity?', options: ['Let’s meet up at seven.', 'I am sleeping.', 'The door is closed.'], answerIndex: 0, explanation: '“Let’s …” is a suggestion.' },
      { question: 'Which word means “gặp nhau”?', options: ['meet up', 'traffic', 'late'], answerIndex: 0, explanation: 'Meet up means to gather with someone.' },
      { question: 'Complete: “We’re ___ watch a movie.”', options: ['going to', 'go to', 'gone to'], answerIndex: 0, explanation: '“Be going to” needs the verb be.' },
      { question: 'Which sentence apologises for being late?', options: ['Sorry, traffic was bad.', 'I am never late.', 'Traffic is good.'], answerIndex: 0, explanation: 'Sorry + reason is a polite apology.' },
    ],
    readExpected: 'Let’s meet up at seven and grab a coffee.',
    dialogue: [
      'A: Are you free this Saturday?',
      'B: Yes! What do you want to do?',
      'A: Let’s meet up at seven and grab a coffee.',
      'B: Sounds good. Should we book a table?',
      'A: Yes, just in case it’s busy.',
      'B: Great. I’ll be there at seven sharp.',
    ],
    dialogueVariants: [
      [
        'A: Do you want to go to the cinema?',
        'B: Sure. What time does the movie start?',
        'A: Seven-thirty. Shall we meet at seven?',
        'B: Perfect. I’ll bring some snacks.',
        'A: Great. I’ll buy the tickets online.',
        'B: See you there!',
      ],
    ],
  },
  {
    id: 'weekend-rest',
    title: 'Rest and recharge at home',
    description: 'Talk about sleeping in, relaxing, and doing nothing.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'weekend',
    vocab: [
      { term: 'sleep in', meaning: 'ngủ nướng', pronunciation: '/sliːp ɪn/', score: 0 },
      { term: 'unwind', meaning: 'thư giãn', pronunciation: '/ʌnˈwaɪnd/', score: 0 },
      { term: 'nap', meaning: 'ngủ trưa', pronunciation: '/næp/', score: 0 },
      { term: 'recharge', meaning: 'nạp năng lượng', pronunciation: '/ˌriːˈtʃɑːdʒ/', score: 0 },
      { term: 'pajamas', meaning: 'đồ ngủ', pronunciation: '/pəˈdʒɑːməz/', score: 0 },
      { term: 'cozy', meaning: 'ấm cúng', pronunciation: '/ˈkəʊzi/', score: 0 },
      { term: 'no alarm', meaning: 'không đặt báo thức', pronunciation: '/nəʊ əˈlɑːm/', score: 0 },
      { term: 'binge', meaning: 'xem/liên tục', pronunciation: '/bɪndʒ/', score: 0 },
      { term: 'lazy', meaning: 'lười', pronunciation: '/ˈleɪzi/', score: 0 },
    ],
    grammar: [
      { title: 'Present continuous for current rest', category: 'Tense', formula: 'S + am/is/are + V-ing + O (+ now/right now)', example: 'I’m just relaxing on the sofa.', pronunciation: 'aɪm dʒʌst rɪˈlæksɪŋ ɒn ðə ˈsəʊfə' },
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O', example: 'I rarely set an alarm on Sunday.', pronunciation: 'aɪ ˈreəli set ən əˈlɑːm ɒn ˈsʌndeɪ' },
      { title: '‘feel like’ + V-ing', category: 'Modal', formula: 'S + feel like + V-ing + O', example: 'I feel like staying in bed.', pronunciation: 'aɪ fiːl laɪk ˈsteɪɪŋ ɪn bed' },
      { title: '‘not … at all’ for emphasis', category: 'Adverb', formula: 'S + don’t/doesn’t + V + O + at all', example: 'I’m not doing anything at all today.', pronunciation: 'aɪm nɒt ˈduːɪŋ ˈeniθɪŋ æt ɔːl təˈdeɪ' },
    ],
    examples: [
      'I feel like staying in bed all morning.',
      'I’m not doing anything at all today.',
    ],
    quizzes: [
      { question: 'Which word means “ngủ nướng”?', options: ['sleep in', 'nap', 'recharge'], answerIndex: 0, explanation: 'Sleep in means to stay in bed longer than usual.' },
      { question: 'Which sentence means “thư giãn”?', options: ['I’m unwinding with a book.', 'I’m working hard.', 'I’m running fast.'], answerIndex: 0, explanation: 'Unwind means to relax after stress.' },
      { question: 'Complete: “I ___ staying in bed.”', options: ['feel like', 'feels like', 'felt like to'], answerIndex: 0, explanation: 'Feel like + V-ing expresses a desire.' },
      { question: 'Which phrase means “không đặt báo thức”?', options: ['no alarm', 'alarm clock', 'wake up'], answerIndex: 0, explanation: 'No alarm means not setting an alarm.' },
    ],
    readExpected: 'I feel like staying in bed all morning.',
    dialogue: [
      'A: How was your weekend?',
      'B: So relaxing. I slept in both days.',
      'A: Nice. Did you do anything?',
      'B: Just a nap and some reading.',
      'A: That sounds perfect.',
      'B: It was. I feel recharged for Monday.',
    ],
    dialogueVariants: [
      [
        'A: Are you doing anything today?',
        'B: Nothing at all. I’m in my pajamas.',
        'A: Lucky you! I have chores.',
        'B: Take a nap later. You deserve it.',
        'A: Maybe I will.',
        'B: Enjoy your rest!',
      ],
    ],
  },
  {
    id: 'household-chores',
    title: 'Household chores and cleaning',
    description: 'Talk about chores, sharing tasks, and keeping home tidy.',
    availableFrom: '2020-01-01',
    daily: true,
    theme: 'weekend',
    vocab: [
      { term: 'chore', meaning: 'việc nhà', pronunciation: '/tʃɔː/', score: 0 },
      { term: 'laundry', meaning: 'giặt đồ', pronunciation: '/ˈlɔːndri/', score: 0 },
      { term: 'dishes', meaning: 'rửa bát', pronunciation: '/ˈdɪʃɪz/', score: 0 },
      { term: 'vacuum', meaning: 'hút bụi', pronunciation: '/ˈvækjuːm/', score: 0 },
      { term: 'tidy up', meaning: 'dọn dẹp', pronunciation: '/ˈtaɪdi ʌp/', score: 0 },
      { term: 'take out the trash', meaning: 'đổ rác', pronunciation: '/teɪk aʊt ðə træʃ/', score: 0 },
      { term: 'dust', meaning: 'lau bụi', pronunciation: '/dʌst/', score: 0 },
      { term: 'mop', meaning: 'lau nhà', pronunciation: '/mɒp/', score: 0 },
      { term: 'clean', meaning: 'dọn sạch', pronunciation: '/kliːn/', score: 0 },
    ],
    grammar: [
      { title: 'Imperatives for chores', category: 'Imperative', formula: 'V + O · (-) Don’t + V + O', example: 'Tidy up the living room.', pronunciation: 'ˈtaɪdi ʌp ðə ˈlɪvɪŋ ruːm' },
      { title: '‘have to’ for obligation', category: 'Modal', formula: 'S + have to / has to + V + O', example: 'I have to do the laundry today.', pronunciation: 'aɪ hæv tə duː ðə ˈlɔːndri təˈdeɪ' },
      { title: '‘who’ questions for tasks', category: 'Question', formula: 'Who + V + O?', example: 'Who is doing the dishes?', pronunciation: 'huː ɪz ˈduːɪŋ ðə ˈdɪʃɪz' },
      { title: '‘already’ for completed tasks', category: 'Adverb', formula: 'S + have/has + already + V3 + O', example: 'I’ve already taken out the trash.', pronunciation: 'aɪv ɔːlˈredi ˈteɪkən aʊt ðə træʃ' },
    ],
    examples: [
      'I have to do the laundry today.',
      'I’ve already taken out the trash.',
    ],
    quizzes: [
      { question: 'Which word means “việc nhà”?', options: ['chore', 'laundry', 'dust'], answerIndex: 0, explanation: 'A chore is a household task.' },
      { question: 'Complete: “I ___ do the laundry today.”', options: ['have to', 'has to', 'having to'], answerIndex: 0, explanation: 'I have to + base verb.' },
      { question: 'Which question asks who does a task?', options: ['Who is doing the dishes?', 'What is the dish?', 'Where is the kitchen?'], answerIndex: 0, explanation: 'Who + be + V-ing asks about the person.' },
      { question: 'Which sentence means “đổ rác”?', options: ['take out the trash', 'take in the trash', 'make the trash'], answerIndex: 0, explanation: 'Take out the trash means to remove garbage.' },
    ],
    readExpected: 'I have to do the laundry today.',
    dialogue: [
      'A: Can you help with the chores today?',
      'B: Sure. What do you need?',
      'A: Could you vacuum the living room?',
      'B: Okay. I’ll do that after lunch.',
      'A: And I’ll take out the trash.',
      'B: Great. Then we’re done.',
    ],
    dialogueVariants: [
      [
        'A: The house is a mess.',
        'B: Let’s tidy up together.',
        'A: I’ll do the dishes, you mop.',
        'B: Deal. Who’s doing the laundry?',
        'A: I already did it this morning.',
        'B: Nice. Teamwork!',
      ],
    ],
  },
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
      { title: 'Present perfect for updates', category: 'Tense', formula: 'S + have/has + V3 + O · (-) S + haven’t/hasn’t + V3 + O · (?) Have/Has + S + V3 + O?', example: 'We have deployed the fix to staging.', pronunciation: 'wi hæv dɪˈplɔɪd ðə fɪks tə ˈsteɪdʒɪŋ' },
      { title: 'Present perfect continuous for ongoing work', category: 'Tense', formula: 'S + have/has + been + V-ing + (for/since + time)', example: 'We have been monitoring the cluster since the incident.', pronunciation: 'wi hæv biːn ˈmɒnɪtərɪŋ ðə ˈklʌstə sɪns ðə ˈɪnsɪdənt' },
      { title: 'First conditional for risk', category: 'Conditional', formula: 'If + S + V(present), S + will/can + V + O', example: 'If the error rate spikes, we roll back.', pronunciation: 'ɪf ðə ˈerə reɪt spaɪks, wi rəʊl bæk' },
      { title: 'Passive for incident reports', category: 'Passive', formula: 'S + was/were + V3 (+ by + agent)', example: 'The service was restored at 9:15.', pronunciation: 'ðə ˈsɜːvɪs wɒz rɪˈstɔːd æt naɪn ˈfɪfˈtiːn' },
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
      { title: 'Present continuous for now', category: 'Tense', formula: 'S + am/is/are + V-ing + O (+ now/right now)', example: 'I’m just heading to the station.', pronunciation: 'aɪm dʒʌst ˈhedɪŋ tə ðə ˈsteɪʃən' },
      { title: 'Question tags for small talk', category: 'Question tag', formula: 'Positive statement, + negative tag? / Negative statement, + positive tag?', example: 'Lovely morning, isn’t it?', pronunciation: 'ˈlʌvli ˈmɔːnɪŋ, ˈɪznt ɪt' },
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O (before main verb, after “be”)', example: 'I usually leave around seven.', pronunciation: 'aɪ ˈjuːʒəli liːv əˈraʊnd ˈsevən' },
      { title: 'Present simple for facts', category: 'Tense', formula: 'S + V(s/es) + O · (-) S + don’t/doesn’t + V + O · (?) Do/Does + S + V + O?', example: 'She works near my building.', pronunciation: 'ʃi wɜːks nɪə maɪ ˈbɪldɪŋ' },
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
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O · (-) S + don’t/doesn’t usually + V + O · (?) Do/Does + S + usually + V + O?', example: 'I usually have rice for lunch.', pronunciation: 'aɪ ˈjuːʒəli hæv raɪs fə lʌntʃ' },
      { title: 'Portions with countable and uncountable nouns', category: 'Quantifier', formula: 'a/an + N (countable) · some + N (uncountable/plural) · a bowl of + N', example: 'I’d like a bowl of soup and some rice.', pronunciation: 'aɪd laɪk ə bəʊl əv suːp ænd sʌm raɪs' },
      { title: 'Present simple for habits', category: 'Tense', formula: 'S + V(s/es) + O + time · (-) S + don’t/doesn’t + V + O · (?) Do/Does + S + V + O?', example: 'I have breakfast at seven every day.', pronunciation: 'aɪ hæv ˈbrekfəst æt ˈsevən ˈevri deɪ' },
      { title: '‘would like’ for ordering', category: 'Modal', formula: 'S + would like + N / to + V + O · (-) S + wouldn’t like + N · (?) Would + S + like + N?', example: 'I’d like some tea, please.', pronunciation: 'aɪd laɪk sʌm tiː pliːz' },
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
      { title: 'Present simple for routines', category: 'Tense', formula: 'S + V(s/es) + O + (usually/every day) · (-) S + don’t/doesn’t + V + O · (?) Do/Does + S + V + O?', example: 'I usually walk in the park in autumn.', pronunciation: 'aɪ ˈjuːʒəli wɔːk ɪn ðə pɑːk ɪn ˈɔːtəm' },
      { title: 'Present continuous for temporary changes', category: 'Tense', formula: 'S + am/is/are + V-ing + O + (this week/now)', example: 'I’m trying to sleep earlier this week.', pronunciation: 'aɪm ˈtraɪɪŋ tə sliːp ˈɜːliə ðɪs wiːk' },
      { title: 'Comparatives for seasons', category: 'Comparison', formula: 'N1 + be + adj-er / more adj + than + N2', example: 'The days are shorter than in summer.', pronunciation: 'ðə deɪz ɑː ˈʃɔːtə ðæn ɪn ˈsʌmə' },
      { title: '‘going to’ for intentions', category: 'Future', formula: 'S + am/is/are + going to + V + O', example: 'I’m going to cycle to work more often.', pronunciation: 'aɪm ˈɡəʊɪŋ tə ˈsaɪkl tə wɜːk mɔː ˈɒfən' },
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
      { title: 'Present perfect for progress', category: 'Tense', formula: 'S + have/has + V3 + O · (-) S + haven’t/hasn’t + V3 + O · (?) Have/Has + S + V3 + O?', example: 'We have finished the first review.', pronunciation: 'wi hæv ˈfɪnɪʃt ðə fɜːst rɪˈvjuː' },
      { title: 'Passive for status', category: 'Passive', formula: 'S + was/were + V3 (+ by + agent)', example: 'The deployment was rolled back.', pronunciation: 'ðə dɪˈplɔɪmənt wɒz rəʊld bæk' },
      { title: '‘will’ for commitments', category: 'Modal', formula: 'S + will + V + O · (-) S + won’t + V + O · (?) Will + S + V + O?', example: 'I’ll hand off the logs after this meeting.', pronunciation: 'aɪl hænd ɒf ðə lɒɡz ˈɑːftə ðɪs ˈmiːtɪŋ' },
      { title: 'Modals of possibility', category: 'Modal', formula: 'S + may/might/could + V + O', example: 'We might miss the deadline.', pronunciation: 'wi maɪt mɪs ðə ˈdedlaɪn' },
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
      { title: 'Comparatives', category: 'Comparison', formula: 'N1 + be + adj-er / more adj + than + N2', example: 'This laptop is cheaper than that one.', pronunciation: 'ðɪs ˈlæptɒp ɪz ˈtʃiːpə ðæn ðæt wʌn' },
      { title: 'Superlatives', category: 'Comparison', formula: 'S + be + the + adj-est / most adj + N', example: 'This is the cheapest option.', pronunciation: 'ðɪs ɪz ðə ˈtʃiːpɪst ˈɒpʃən' },
      { title: '‘whether’ for choices', category: 'Clause', formula: 'S + decide + whether + to + V + O', example: 'We need to decide whether to buy now or wait.', pronunciation: 'wi niːd tə dɪˈsaɪd ˈweðə tə baɪ naʊ ɔː weɪt' },
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
      { title: 'Present continuous for future arrangements', category: 'Future', formula: 'S + am/is/are + V-ing + O + future time', example: 'We’re releasing on Thursday.', pronunciation: 'wɪə rɪˈliːsɪŋ ɒn ˈθɜːzdeɪ' },
      { title: 'Modals for obligation', category: 'Modal', formula: 'S + need to / must / have to + V + O · (-) S + don’t need to + V + O · (?) Do + S + need to + V + O?', example: 'We need to freeze the code by Wednesday.', pronunciation: 'wi niːd tə friːz ðə kəʊd baɪ ˈwenzdeɪ' },
      { title: 'First conditional for rollout', category: 'Conditional', formula: 'If + S + V(present) + O, S + will + V + O', example: 'If the canary looks healthy, we’ll roll out.', pronunciation: 'ɪf ðə kəˈneəri lʊks ˈhelθi, wiːl rəʊl aʊt' },
      { title: 'Passive with modals', category: 'Passive', formula: 'S + modal + be + V3 (+ by + agent)', example: 'The code must be frozen by Wednesday.', pronunciation: 'ðə kəʊd mʌst bi ˈfrəʊzən baɪ ˈwenzdeɪ' },
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
      { title: '‘going to’ for plans', category: 'Future', formula: 'S + am/is/are + going to + V + O · (-) S + am/is/are + not + going to + V + O · (?) Am/Is/Are + S + going to + V + O?', example: 'I’m going to fix the fence this weekend.', pronunciation: 'aɪm ˈɡəʊɪŋ tə fɪks ðə fens ðɪs ˌwiːkˈend' },
      { title: 'Polite requests with ‘could’', category: 'Request', formula: 'Could + you + V + O, please?', example: 'Could you lend me a ladder?', pronunciation: 'kʊd ju lend mi ə ˈlædə' },
      { title: 'Zero conditional for facts', category: 'Conditional', formula: 'If + S + V(present), S + V(present)', example: 'If it rains, I stay home.', pronunciation: 'ɪf ɪt reɪnz, aɪ steɪ həʊm' },
      { title: '‘like/enjoy’ + V-ing', category: 'Gerund', formula: 'S + like/love/enjoy + V-ing + O', example: 'I enjoy walking in the park at weekends.', pronunciation: 'aɪ ɪnˈdʒɔɪ ˈwɔːkɪŋ ɪn ðə pɑːk æt ˌwiːkˈendz' },
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
      { title: 'Polite requests with ‘could’', category: 'Request', formula: 'Could + we/I + V + O, please?', example: 'Could we have the bill, please?', pronunciation: 'kʊd wi hæv ðə bɪl pliːz' },
      { title: 'Quantifiers with food', category: 'Quantifier', formula: 'a little + N (uncountable) · a few + N (countable) · O', example: 'Could I have a little more rice?', pronunciation: 'kʊd aɪ hæv ə ˈlɪtl mɔː raɪs' },
      { title: '‘Would you like …?’ offers', category: 'Modal', formula: 'Would + you + like + N / to + V + O?', example: 'Would you like some dessert?', pronunciation: 'wʊd ju laɪk sʌm dɪˈzɜːt' },
      { title: '‘too / enough’', category: 'Adverb', formula: 'S + be + too + adj (+ for + O) · S + be + adj + enough + to + V', example: 'This soup is too spicy for me.', pronunciation: 'ðɪs suːp ɪz tuː ˈspaɪsi fə miː' },
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
      { title: '‘should’ for advice', category: 'Modal', formula: 'S + should/shouldn’t + V + O · (?) Should + S + V + O?', example: 'You should prep meals on Sunday.', pronunciation: 'ju ʃʊd prep miːlz ɒn ˈsʌndeɪ' },
      { title: 'Adverbs of frequency', category: 'Adverb', formula: 'S + adverb + V + O · (-) S + rarely/never + V + O', example: 'I rarely order junk food during the week.', pronunciation: 'aɪ ˈreəli ˈɔːdə dʒʌŋk fuːd ˈdjʊərɪŋ ðə wiːk' },
      { title: 'Gerunds as subjects', category: 'Gerund', formula: 'V-ing + V(singular) + O', example: 'Prepping meals saves time.', pronunciation: 'ˈprepɪŋ miːlz seɪvz taɪm' },
      { title: 'Purpose with ‘to’ and ‘so that’', category: 'Purpose', formula: 'S + V + O + to + V / so that + S + can + V', example: 'I prep meals to save time.', pronunciation: 'aɪ prep miːlz tə seɪv taɪm' },
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

const WEEKDAY_DAILY_THEMES: EnglishTheme[] = ['devops', 'neighbor', 'meals'];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

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
  if (isWeekend(date)) {
    const sunday = date.getDay() === 0;
    const weekendPool = TOPICS.filter((topic) => {
      if (!(topic.daily && topic.theme === 'weekend')) return false;
      if (sunday && topic.id === 'weekend-outing') return false;
      if (!sunday && topic.id === 'sunday-mass') return false;
      return true;
    });
    const neighborPool = TOPICS.filter((topic) => topic.daily && topic.theme === 'neighbor');
    const mealsPool = TOPICS.filter((topic) => topic.daily && topic.theme === 'meals');
    let weekendPicks: EnglishTopic[];
    if (sunday) {
      weekendPicks = [
        TOPICS.find((topic) => topic.id === 'weekend-rest'),
        TOPICS.find((topic) => topic.id === 'sunday-mass'),
      ].filter(Boolean) as EnglishTopic[];
    } else {
      const outing = TOPICS.find((topic) => topic.id === 'weekend-outing');
      const otherPool = weekendPool.filter((topic) => topic.id !== 'weekend-outing');
      weekendPicks = [outing, rotate(otherPool, seed)[0]].filter(Boolean) as EnglishTopic[];
    }
    return [
      neighborPool.length ? neighborPool[seed % neighborPool.length] : null,
      mealsPool.length ? mealsPool[seed % mealsPool.length] : null,
      ...weekendPicks,
    ].filter(Boolean) as EnglishTopic[];
  }
  return WEEKDAY_DAILY_THEMES.flatMap((theme, index) => {
    const pool = TOPICS.filter((topic) => topic.daily && topic.theme === theme);
    if (pool.length === 0) return [];
    return [pool[(seed + index) % pool.length]];
  });
}

export function getTodayEnglishContext(date = new Date()): TodayEnglishContext {
  const todayKey = dateKey(date);
  const day = dayNumber(date);
  // Daily themes rotate by date so the same three topics do not repeat every day.
  const weekend = isWeekend(date);
  const monday = date.getDay() === 1;
  const ordered = [
    ...getDailyTopics(date),
    ...TOPICS.filter((topic) => {
      if (topic.daily) return false;
      if (topic.mondayOnly && !monday) return false;
      if (weekend && topic.id === 'work-update') return false;
      return true;
    }),
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

/** A coming-soon topic is only shown when it is within this many days. */
export const COMING_SOON_WINDOW_DAYS = 60;

export function isTopicVisible(topic: EnglishTopic, date = new Date(), windowDays = COMING_SOON_WINDOW_DAYS): boolean {
  if (isTopicAvailable(topic, date)) return true;
  const today = dateKey(date);
  const available = topic.availableFrom;
  // Both are ISO YYYY-MM-DD strings, so compare by day count.
  const [ay, am, ad] = available.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const availableDate = new Date(ay, am - 1, ad);
  const todayDate = new Date(ty, tm - 1, td);
  const diff = Math.round((availableDate.getTime() - todayDate.getTime()) / 86_400_000);
  return diff >= 0 && diff <= windowDays;
}

export function getTopicTimeLimit(topic: EnglishTopic): number {
  if (typeof topic.timeLimit === 'number' && topic.timeLimit > 0) return topic.timeLimit;
  const minutes = Math.ceil(topic.vocab.length * 0.4 + topic.grammar.length * 1 + topic.dialogue.length * 0.5);
  return Math.max(5, minutes);
}
