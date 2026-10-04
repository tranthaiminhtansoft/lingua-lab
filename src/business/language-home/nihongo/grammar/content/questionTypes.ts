import type { JapaneseRomajiPair } from '../components/JapaneseWithRomaji';

export type JapaneseSentence = { parts: readonly JapaneseRomajiPair[]; translation: string };
export type QuestionExample = {
  question: JapaneseSentence;
  answers: readonly { label: string; sentence: JapaneseSentence }[];
  context?: string;
};
export type TimeKey = 'present' | 'past' | 'future' | 'ongoing' | 'past-ongoing';
export type QuestionForm = {
  time: TimeKey;
  formula: readonly JapaneseRomajiPair[];
  examples: readonly QuestionExample[];
};
export type QuestionType = {
  id: string;
  title: string;
  keywords: readonly JapaneseRomajiPair[];
  explanation: string;
  note: string;
  aspectNote?: string;
  forms: readonly QuestionForm[];
};
export type QuestionGroup = {
  id: string;
  title: string;
  japanese: readonly JapaneseRomajiPair[];
  description: string;
  types: readonly QuestionType[];
};

export const questionTypesPath = '/nihongo-o-benkyuo/grammar/question-types';
export const timeLabels: Record<TimeKey, string> = {
  present: 'Present / habits',
  past: 'Past',
  future: 'Future / plans',
  ongoing: 'Present ongoing',
  'past-ongoing': 'Past ongoing',
};
export const timeNotes: Record<TimeKey, string> = {
  present: 'The non-past form describes a present fact or habit here. The same form can describe the future in another context.',
  past: 'The ending places the question and its answer in the past.',
  future: 'Japanese has no separate future ending. The predicate uses a non-past form; a future time or the conversation makes the meaning clear. A change of state can be expressed with narimasu (“become”).',
  ongoing: 'For an action in progress, use the verb’s te-form + imasu. This form can also describe a continuing or resulting state, depending on the verb.',
  'past-ongoing': 'For an action that was in progress, use the verb’s te-form + imashita. This can also describe a state that continued in the past.',
};

const pair = (japanese: string, romaji: string, alternative?: readonly [string, string]): JapaneseRomajiPair =>
  alternative ? [japanese, romaji, alternative] : [japanese, romaji];
const line = (translation: string, ...parts: JapaneseRomajiPair[]): JapaneseSentence => ({ parts, translation });
const sentence = (japanese: string, romaji: string, translation: string) => line(translation, pair(japanese, romaji));
const reply = (label: string, value: JapaneseSentence) => ({ label, sentence: value });
const exchange = (question: JapaneseSentence, answer: JapaneseSentence): QuestionExample => ({ question, answers: [reply('Answer', answer)] });
const form = (time: TimeKey, formula: readonly JapaneseRomajiPair[], ...examples: QuestionExample[]): QuestionForm => ({ time, formula, examples });
const formula = (japanese: string, romaji: string) => [pair(japanese, romaji)];
const noProgressive = 'These examples ask about a fact or state, not an action in progress. Do not add te imasu to a noun or adjective just to imitate an English continuous tense.';

const nounFormula = [pair('N1', 'N1'), pair('は', 'wa'), pair('N2', 'N2'), pair('です', 'desu'), pair('か', 'ka')];
const whoFormula = [pair('N1', 'N1'), pair('は', 'wa'), pair('だれ', 'dare', ['どなた', 'donata']), pair('です', 'desu'), pair('か', 'ka')];
const ageFormula = [pair('N1', 'N1'), pair('は', 'wa'), pair('何歳', 'nansai', ['おいくつ', 'oikutsu']), pair('です', 'desu'), pair('か', 'ka')];
const whereFormula = [pair('N', 'N'), pair('は', 'wa'), pair('どこ', 'doko', ['どちら', 'dochira']), pair('です', 'desu'), pair('か', 'ka')];
const whereQuestion = (time: 'present' | 'past' | 'future') => line(
  time === 'past' ? 'Where was the meeting yesterday?' : time === 'future' ? 'Where is the meeting going to be tomorrow?' : 'Where is the meeting today?',
  pair(time === 'past' ? '昨日の会議は' : time === 'future' ? '明日の会議は' : '今日の会議は', time === 'past' ? 'Kinō no kaigi wa' : time === 'future' ? 'Ashita no kaigi wa' : 'Kyō no kaigi wa'),
  pair('どこ', 'doko', ['どちら', 'dochira']), pair(time === 'past' ? 'でしたか。' : 'ですか。', time === 'past' ? 'deshita ka?' : 'desu ka?'),
);

const yesNoTypes: readonly QuestionType[] = [
  {
    id: 'yes-no-nouns', title: 'Identity & noun statements', keywords: formula('ですか', 'desu ka'),
    explanation: 'Add ka to a polite noun statement. Answer by confirming it, denying it, or giving the correct information. The topic can be omitted when it is clear.',
    note: 'Hai, sō desu confirms the statement; iie, chigaimasu corrects it. In a past question, repeat the past predicate when you want the time to be explicit.',
    aspectNote: noProgressive,
    forms: [
      form('present', nounFormula, {
        question: line('Is Min a student?', pair('ミン', 'Min'), pair('さん', 'san'), pair('は', 'wa'), pair('学生', 'gakusei'), pair('です', 'desu'), pair('か。', 'ka?')),
        answers: [
          reply('Yes', sentence('はい、学生です。', 'Hai, gakusei desu.', 'Yes, Min is a student.')),
          reply('No', line('No, Min isn’t a student.', pair('いいえ、', 'iie,'), pair('学生', 'gakusei'), pair('じゃ', 'ja', ['では', 'de wa']), pair('ありません。', 'arimasen.'))),
          reply('Short confirmation', sentence('はい、そうです。', 'Hai, sō desu.', 'Yes, that’s right.')),
          reply('Short correction', sentence('いいえ、違います。', 'Iie, chigaimasu.', 'No, that’s not right.')),
        ],
      }),
      form('past', formula('N1 は N2 でしたか', 'N1 wa N2 deshita ka'), {
        question: sentence('去年、学生でしたか。', 'Kyonen, gakusei deshita ka?', 'Were you a student last year?'),
        answers: [reply('Yes', sentence('はい、学生でした。', 'Hai, gakusei deshita.', 'Yes, I was a student.')), reply('No', sentence('いいえ、学生じゃありませんでした。', 'Iie, gakusei ja arimasen deshita.', 'No, I wasn’t a student.'))],
      }),
      form('future', nounFormula, {
        question: sentence('来年も学生ですか。', 'Rainen mo gakusei desu ka?', 'Are you still going to be a student next year?'),
        answers: [reply('Yes', sentence('はい、来年も学生です。', 'Hai, rainen mo gakusei desu.', 'Yes, I’m still going to be a student next year.')), reply('No', sentence('いいえ、来年は会社員です。', 'Iie, rainen wa kaishain desu.', 'No, I’m going to be a company employee next year.'))],
      }),
    ],
  },
  {
    id: 'yes-no-actions', title: 'Actions & habits', keywords: formula('ますか', 'masu ka'),
    explanation: 'Ask whether someone does, did, or will do an action. Answers repeat the verb in the matching form; a negative answer uses the matching negative ending.',
    note: 'Ka marks the question without changing word order. Non-past masu can express a habit or a future plan; te imasu is used here for an action happening now.',
    forms: [
      form('present', formula('V-ますか', 'V-masu ka'), {
        question: sentence('毎日、日本語を勉強しますか。', 'Mainichi, nihongo o benkyō shimasu ka?', 'Do you study Japanese every day?'),
        answers: [reply('Yes', sentence('はい、毎日勉強します。', 'Hai, mainichi benkyō shimasu.', 'Yes, I study every day.')), reply('No', sentence('いいえ、毎日は勉強しません。', 'Iie, mainichi wa benkyō shimasen.', 'No, I don’t study every day.'))],
      }),
      form('past', formula('V-ましたか', 'V-mashita ka'), {
        question: sentence('昨日、日本語を勉強しましたか。', 'Kinō, nihongo o benkyō shimashita ka?', 'Did you study Japanese yesterday?'),
        answers: [reply('Yes', sentence('はい、勉強しました。', 'Hai, benkyō shimashita.', 'Yes, I studied.')), reply('No', sentence('いいえ、勉強しませんでした。', 'Iie, benkyō shimasen deshita.', 'No, I didn’t study.'))],
      }),
      form('future', formula('V-ますか', 'V-masu ka'), {
        question: sentence('明日、日本語を勉強しますか。', 'Ashita, nihongo o benkyō shimasu ka?', 'Are you going to study Japanese tomorrow?'),
        answers: [reply('Yes', sentence('はい、明日勉強します。', 'Hai, ashita benkyō shimasu.', 'Yes, I’m going to study tomorrow.')), reply('No', sentence('いいえ、明日は勉強しません。', 'Iie, ashita wa benkyō shimasen.', 'No, I’m not going to study tomorrow.'))],
      }),
      form('ongoing', formula('V-ていますか', 'V-te imasu ka'), {
        question: sentence('今、日本語を勉強していますか。', 'Ima, nihongo o benkyō shite imasu ka?', 'Are you studying Japanese now?'),
        answers: [reply('Yes', sentence('はい、勉強しています。', 'Hai, benkyō shite imasu.', 'Yes, I’m studying.')), reply('No', sentence('いいえ、勉強していません。', 'Iie, benkyō shite imasen.', 'No, I’m not studying.'))],
      }),
      form('past-ongoing', formula('V-ていましたか', 'V-te imashita ka'), {
        question: sentence('昨日の夜、日本語を勉強していましたか。', 'Kinō no yoru, nihongo o benkyō shite imashita ka?', 'Were you studying Japanese last night?'),
        answers: [reply('Yes', sentence('はい、勉強していました。', 'Hai, benkyō shite imashita.', 'Yes, I was studying.')), reply('No', sentence('いいえ、勉強していませんでした。', 'Iie, benkyō shite imasen deshita.', 'No, I wasn’t studying.'))],
      }),
    ],
  },
  {
    id: 'yes-no-adjectives', title: 'Qualities & conditions', keywords: formula('形容詞＋ですか', 'keiyōshi + desu ka'),
    explanation: 'Ask about a quality or condition. These examples use an i-adjective, whose past ending is katta desu; na-adjectives instead use deshita.',
    note: 'The i-adjective itself changes in the past. Do not attach deshita directly to an unchanged i-adjective. The example asks about weather, so a future answer is a prediction.',
    aspectNote: noProgressive,
    forms: [
      form('present', formula('い形容詞＋ですか', 'i-keiyōshi + desu ka'), {
        question: sentence('今日は暑いですか。', 'Kyō wa atsui desu ka?', 'Is it hot today?'),
        answers: [reply('Yes', sentence('はい、暑いです。', 'Hai, atsui desu.', 'Yes, it’s hot.')), reply('No', sentence('いいえ、暑くないです。', 'Iie, atsuku nai desu.', 'No, it isn’t hot.'))],
      }),
      form('past', formula('い形容詞の語幹＋かったですか', 'i-keiyōshi no gokan + katta desu ka'), {
        question: sentence('昨日は暑かったですか。', 'Kinō wa atsukatta desu ka?', 'Was it hot yesterday?'),
        answers: [reply('Yes', sentence('はい、暑かったです。', 'Hai, atsukatta desu.', 'Yes, it was hot.')), reply('No', sentence('いいえ、暑くなかったです。', 'Iie, atsuku nakatta desu.', 'No, it wasn’t hot.'))],
      }),
      form('future', formula('い形容詞＋ですか', 'i-keiyōshi + desu ka'), {
        context: 'Looking at tomorrow’s weather forecast.',
        question: sentence('明日も暑いですか。', 'Ashita mo atsui desu ka?', 'Is it going to be hot tomorrow too?'),
        answers: [reply('Forecast', sentence('はい、明日も暑いです。', 'Hai, ashita mo atsui desu.', 'Yes, it’s going to be hot tomorrow too.'))],
      }),
    ],
  },
];

const whTypes: readonly QuestionType[] = [
  {
    id: 'who', title: 'Who?', keywords: [pair('だれ', 'dare', ['どなた', 'donata'])],
    explanation: 'Replace the person you want to identify with a question word. Give the person’s name or role in the answer, rather than just yes or no.',
    note: 'Donata is more polite than dare. For an unknown person doing an action, the question word takes ga, not wa. The ongoing examples ask who is acting rather than who someone is.',
    forms: [
      form('present', whoFormula, exchange(line('Who is that person?', pair('あの方は', 'Ano kata wa'), pair('だれ', 'dare', ['どなた', 'donata']), pair('ですか。', 'desu ka?')), sentence('田中さんです。', 'Tanaka-san desu.', 'That’s Tanaka-san.'))),
      form('past', formula('N は だれでしたか', 'N wa dare deshita ka'), exchange(line('Who was that person yesterday?', pair('昨日の方は', 'Kinō no kata wa'), pair('だれ', 'dare', ['どなた', 'donata']), pair('でしたか。', 'deshita ka?')), sentence('田中さんでした。', 'Tanaka-san deshita.', 'That was Tanaka-san.'))),
      form('future', formula('だれが V-ますか', 'Dare ga V-masu ka'), exchange(line('Who is going to come tomorrow?', pair('明日は', 'Ashita wa'), pair('だれ', 'dare', ['どなた', 'donata']), pair('が来ますか。', 'ga kimasu ka?')), sentence('田中さんが来ます。', 'Tanaka-san ga kimasu.', 'Tanaka-san is going to come.'))),
      form('ongoing', formula('だれが V-ていますか', 'Dare ga V-te imasu ka'), exchange(sentence('だれが話していますか。', 'Dare ga hanashite imasu ka?', 'Who is speaking?'), sentence('田中さんが話しています。', 'Tanaka-san ga hanashite imasu.', 'Tanaka-san is speaking.'))),
      form('past-ongoing', formula('だれが V-ていましたか', 'Dare ga V-te imashita ka'), exchange(sentence('さっき、だれが話していましたか。', 'Sakki, dare ga hanashite imashita ka?', 'Who was speaking a moment ago?'), sentence('田中さんが話していました。', 'Tanaka-san ga hanashite imashita.', 'Tanaka-san was speaking.'))),
    ],
  },
  {
    id: 'what', title: 'What?', keywords: [pair('何', 'nani / nan')],
    explanation: 'Ask for a thing, job, or activity. Use nan before desu and nani before o in the examples below.',
    note: 'The reading of the question word depends on the word that follows; nani and nan are not interchangeable in every sentence. The job example connects to the first-introductions dialogue.',
    forms: [
      form('present', formula('N は 何ですか', 'N wa nan desu ka'), exchange(sentence('お仕事は何ですか。', 'Oshigoto wa nan desu ka?', 'What do you do?'), sentence('エンジニアです。', 'Enjinia desu.', 'I’m an engineer.'))),
      form('past', formula('何を V-ましたか', 'Nani o V-mashita ka'), exchange(sentence('昨日、何を食べましたか。', 'Kinō, nani o tabemashita ka?', 'What did you eat yesterday?'), sentence('うどんを食べました。', 'Udon o tabemashita.', 'I ate udon.'))),
      form('future', formula('何を V-ますか', 'Nani o V-masu ka'), exchange(sentence('明日、何を食べますか。', 'Ashita, nani o tabemasu ka?', 'What are you going to eat tomorrow?'), sentence('うどんを食べます。', 'Udon o tabemasu.', 'I’m going to eat udon.'))),
      form('ongoing', formula('何を V-ていますか', 'Nani o V-te imasu ka'), exchange(sentence('今、何を食べていますか。', 'Ima, nani o tabete imasu ka?', 'What are you eating now?'), sentence('うどんを食べています。', 'Udon o tabete imasu.', 'I’m eating udon.'))),
      form('past-ongoing', formula('何を V-ていましたか', 'Nani o V-te imashita ka'), exchange(sentence('さっき、何を食べていましたか。', 'Sakki, nani o tabete imashita ka?', 'What were you eating a moment ago?'), sentence('うどんを食べていました。', 'Udon o tabete imashita.', 'I was eating udon.'))),
    ],
  },
  {
    id: 'where', title: 'Where?', keywords: [pair('どこ', 'doko', ['どちら', 'dochira'])],
    explanation: 'Ask where something is or where an action happens. De marks the place of an action; ni can mark a destination or location, depending on the verb.',
    note: 'Dochira can be a more polite alternative to doko in a location question. It can also mean “which of two” in other contexts; it is not a universal replacement for doko.',
    forms: [
      form('present', whereFormula, exchange(whereQuestion('present'), sentence('会議室です。', 'Kaigishitsu desu.', 'It’s in the meeting room.'))),
      form('past', [pair('N は', 'N wa'), pair('どこ', 'doko', ['どちら', 'dochira']), pair('でしたか', 'deshita ka')], exchange(whereQuestion('past'), sentence('会議室でした。', 'Kaigishitsu deshita.', 'It was in the meeting room.'))),
      form('future', whereFormula, exchange(whereQuestion('future'), sentence('会議室です。', 'Kaigishitsu desu.', 'It’s going to be in the meeting room.'))),
      form('ongoing', formula('どこで V-ていますか', 'Doko de V-te imasu ka'), exchange(sentence('今、どこで勉強していますか。', 'Ima, doko de benkyō shite imasu ka?', 'Where are you studying now?'), sentence('図書館で勉強しています。', 'Toshokan de benkyō shite imasu.', 'I’m studying at the library.'))),
      form('past-ongoing', formula('どこで V-ていましたか', 'Doko de V-te imashita ka'), exchange(sentence('昨日の夜、どこで勉強していましたか。', 'Kinō no yoru, doko de benkyō shite imashita ka?', 'Where were you studying last night?'), sentence('図書館で勉強していました。', 'Toshokan de benkyō shite imashita.', 'I was studying at the library.'))),
    ],
  },
  {
    id: 'when', title: 'When & what time?', keywords: [pair('いつ', 'itsu'), pair('何時', 'nanji')],
    explanation: 'Itsu asks when; nanji asks for a clock time. A specific clock time usually takes ni with an action verb, while itsu normally does not.',
    note: 'For an event schedule, desu can describe both its current scheduled time and a future event. Use the conversation or a time expression to distinguish them.',
    aspectNote: 'The examples ask for a schedule or time, not an activity in progress, so no continuous form is needed here.',
    forms: [
      form('present', formula('N は 何時ですか', 'N wa nanji desu ka'), exchange(sentence('毎日の授業は何時ですか。', 'Mainichi no jugyō wa nanji desu ka?', 'What time is the daily class?'), sentence('九時です。', 'Kuji desu.', 'It’s at nine.'))),
      form('past', formula('いつ V-ましたか', 'Itsu V-mashita ka'), exchange(sentence('いつ日本に来ましたか。', 'Itsu Nihon ni kimashita ka?', 'When did you come to Japan?'), sentence('去年の四月に来ました。', 'Kyonen no shigatsu ni kimashita.', 'I came in April last year.'))),
      form('future', formula('いつ V-ますか／何時に V-ますか', 'Itsu V-masu ka / nanji ni V-masu ka'),
        exchange(sentence('いつ日本に行きますか。', 'Itsu Nihon ni ikimasu ka?', 'When are you going to go to Japan?'), sentence('来年の四月に行きます。', 'Rainen no shigatsu ni ikimasu.', 'I’m going to go in April next year.')),
        exchange(sentence('明日は何時に出発しますか。', 'Ashita wa nanji ni shuppatsu shimasu ka?', 'What time are you going to leave tomorrow?'), sentence('九時に出発します。', 'Kuji ni shuppatsu shimasu.', 'I’m going to leave at nine.'))),
    ],
  },
  {
    id: 'which', title: 'Which?', keywords: [pair('どれ', 'dore'), pair('どの＋N', 'dono + N'), pair('どちら', 'dochira')],
    explanation: 'Dore stands alone; dono must come before a noun. Dochira is commonly used when choosing between two alternatives.',
    note: 'Dore and dono + noun are different structures, not words to swap in the same position. Compare the two full versions of the present question below.',
    forms: [
      form('present', formula('どれが…／どの N が…', 'Dore ga… / dono N ga…'), exchange(line('Which book do you like?', pair('どの本が好きですか。', 'Dono hon ga suki desu ka?', ['どれが好きですか。', 'Dore ga suki desu ka?'])), sentence('この本が好きです。', 'Kono hon ga suki desu.', 'I like this book.'))),
      form('past', formula('どの N を V-ましたか', 'Dono N o V-mashita ka'), exchange(sentence('昨日、どの本を読みましたか。', 'Kinō, dono hon o yomimashita ka?', 'Which book did you read yesterday?'), sentence('この本を読みました。', 'Kono hon o yomimashita.', 'I read this book.'))),
      form('future', formula('どの N を V-ますか', 'Dono N o V-masu ka'), exchange(sentence('明日、どの本を読みますか。', 'Ashita, dono hon o yomimasu ka?', 'Which book are you going to read tomorrow?'), sentence('この本を読みます。', 'Kono hon o yomimasu.', 'I’m going to read this book.'))),
      form('ongoing', formula('どの N を V-ていますか', 'Dono N o V-te imasu ka'), exchange(sentence('今、どの本を読んでいますか。', 'Ima, dono hon o yonde imasu ka?', 'Which book are you reading now?'), sentence('この本を読んでいます。', 'Kono hon o yonde imasu.', 'I’m reading this book.'))),
      form('past-ongoing', formula('どの N を V-ていましたか', 'Dono N o V-te imashita ka'), exchange(sentence('さっき、どの本を読んでいましたか。', 'Sakki, dono hon o yonde imashita ka?', 'Which book were you reading a moment ago?'), sentence('この本を読んでいました。', 'Kono hon o yonde imashita.', 'I was reading this book.'))),
    ],
  },
  {
    id: 'whose', title: 'Whose?', keywords: [pair('だれの', 'dare no', ['どなたの', 'donata no'])],
    explanation: 'Use no after the question word to ask about ownership. In the answer, the noun can be omitted after no when it is understood.',
    note: 'Donata no is more polite than dare no. The future example asks who the owner will be after a planned transfer.',
    aspectNote: noProgressive,
    forms: [
      form('present', formula('N は だれのですか', 'N wa dare no desu ka'), exchange(line('Whose bag is this?', pair('このかばんは', 'Kono kaban wa'), pair('だれの', 'dare no', ['どなたの', 'donata no']), pair('ですか。', 'desu ka?')), sentence('田中さんのです。', 'Tanaka-san no desu.', 'It’s Tanaka-san’s.'))),
      form('past', formula('N は だれの…でしたか', 'N wa dare no… deshita ka'), exchange(sentence('このかばんは、前はだれのものでしたか。', 'Kono kaban wa, mae wa dare no mono deshita ka?', 'Whose bag was this before?'), sentence('田中さんのものでした。', 'Tanaka-san no mono deshita.', 'It was Tanaka-san’s.'))),
      form('future', formula('N は だれの…になりますか', 'N wa dare no… ni narimasu ka'), exchange(sentence('このかばんは、明日からだれのものになりますか。', 'Kono kaban wa, ashita kara dare no mono ni narimasu ka?', 'Whose bag is this going to become from tomorrow?'), sentence('リンさんのものになります。', 'Rin-san no mono ni narimasu.', 'It’s going to become Lin’s.'))),
    ],
  },
  {
    id: 'age', title: 'How old?', keywords: [pair('何歳', 'nansai', ['おいくつ', 'oikutsu'])],
    explanation: 'Ask for an age. Oikutsu is a polite alternative to nansai. Reply with the age rather than yes or no.',
    note: 'Age can feel personal even when the wording is polite; ask when it is relevant. Twenty years old has the special reading hatachi.',
    aspectNote: noProgressive,
    forms: [
      form('present', ageFormula, exchange(line('How old is Lin?', pair('リンさんは', 'Rin-san wa'), pair('何歳', 'nansai', ['おいくつ', 'oikutsu']), pair('ですか。', 'desu ka?')), sentence('二十歳です。', 'Hatachi desu.', 'Lin is 20.'))),
      form('past', [pair('N は', 'N wa'), pair('何歳', 'nansai', ['おいくつ', 'oikutsu']), pair('でしたか', 'deshita ka')], exchange(line('How old was Lin last year?', pair('去年、リンさんは', 'Kyonen, Rin-san wa'), pair('何歳', 'nansai', ['おいくつ', 'oikutsu']), pair('でしたか。', 'deshita ka?')), sentence('十九歳でした。', 'Jūkyūsai deshita.', 'Lin was 19.'))),
      form('future', formula('何歳になりますか', 'Nansai ni narimasu ka'), exchange(sentence('来年、リンさんは何歳になりますか。', 'Rainen, Rin-san wa nansai ni narimasu ka?', 'How old is Lin going to be next year?'), sentence('二十一歳になります。', 'Nijūissai ni narimasu.', 'Lin is going to turn 21.'))),
    ],
  },
  {
    id: 'quantity', title: 'How many?', keywords: [pair('いくつ', 'ikutsu'), pair('何＋助数詞', 'nan + josūshi')],
    explanation: 'Ikutsu asks for a general number of things. Use a suitable counter for the noun: nanko for small items, nanmai for flat things, nannin for people.',
    note: 'These examples use ko to count apples. The counter and its pronunciation depend on what you count; ikutsu is not the right counter for every noun.',
    forms: [
      form('present', formula('N は いくつありますか', 'N wa ikutsu arimasu ka'), exchange(sentence('りんごはいくつありますか。', 'Ringo wa ikutsu arimasu ka?', 'How many apples are there?'), sentence('三つあります。', 'Mittsu arimasu.', 'There are three.'))),
      form('past', formula('何個 V-ましたか', 'Nanko V-mashita ka'), exchange(sentence('昨日、りんごを何個買いましたか。', 'Kinō, ringo o nanko kaimashita ka?', 'How many apples did you buy yesterday?'), sentence('三個買いました。', 'Sanko kaimashita.', 'I bought three.'))),
      form('future', formula('何個 V-ますか', 'Nanko V-masu ka'), exchange(sentence('明日、りんごを何個買いますか。', 'Ashita, ringo o nanko kaimasu ka?', 'How many apples are you going to buy tomorrow?'), sentence('三個買います。', 'Sanko kaimasu.', 'I’m going to buy three.'))),
      form('ongoing', formula('何人が V-ていますか', 'Nannin ga V-te imasu ka'), exchange(sentence('今、何人が勉強していますか。', 'Ima, nannin ga benkyō shite imasu ka?', 'How many people are studying now?'), sentence('三人が勉強しています。', 'Sannin ga benkyō shite imasu.', 'Three people are studying.'))),
      form('past-ongoing', formula('何人が V-ていましたか', 'Nannin ga V-te imashita ka'), exchange(sentence('さっき、何人が勉強していましたか。', 'Sakki, nannin ga benkyō shite imashita ka?', 'How many people were studying a moment ago?'), sentence('三人が勉強していました。', 'Sannin ga benkyō shite imashita.', 'Three people were studying.'))),
    ],
  },
  {
    id: 'price', title: 'How much money?', keywords: [pair('いくら', 'ikura')],
    explanation: 'Ask for a price or cost. Answer with the amount and currency; yen is pronounced en.',
    note: 'Ikura asks for money here. For duration or general extent, use dono kurai instead. A known future price can use desu just like a current price.',
    aspectNote: noProgressive,
    forms: [
      form('present', formula('N は いくらですか', 'N wa ikura desu ka'), exchange(sentence('この本はいくらですか。', 'Kono hon wa ikura desu ka?', 'How much is this book?'), sentence('千円です。', 'Sen en desu.', 'It’s 1,000 yen.'))),
      form('past', formula('N は いくらでしたか', 'N wa ikura deshita ka'), exchange(sentence('昨日、この本はいくらでしたか。', 'Kinō, kono hon wa ikura deshita ka?', 'How much was this book yesterday?'), sentence('千円でした。', 'Sen en deshita.', 'It was 1,000 yen.'))),
      form('future', formula('N は いくらですか', 'N wa ikura desu ka'), exchange(sentence('明日のセールでは、この本はいくらですか。', 'Ashita no sēru de wa, kono hon wa ikura desu ka?', 'How much is this book going to be in tomorrow’s sale?'), sentence('八百円です。', 'Happyaku en desu.', 'It’s going to be 800 yen.'))),
    ],
  },
  {
    id: 'duration', title: 'How long / to what extent?', keywords: [pair('どのくらい', 'dono kurai', ['どれくらい', 'dore kurai'])],
    explanation: 'Ask for a duration or extent. Here the verb kakarimasu means “take” a certain amount of time; the answer supplies a time interval.',
    note: 'Dono kurai and dore kurai are both common here. The question word is not limited to time, but the verb and context tell you what kind of amount to answer with.',
    aspectNote: 'These examples ask how long a trip takes. Kakarimasu expresses duration here, so it is not changed into a continuous form just to mean “is taking.”',
    forms: [
      form('present', formula('どのくらいかかりますか', 'Dono kurai kakarimasu ka'), exchange(line('How long does it take to get to school?', pair('学校まで', 'Gakkō made'), pair('どのくらい', 'dono kurai', ['どれくらい', 'dore kurai']), pair('かかりますか。', 'kakarimasu ka?')), sentence('三十分かかります。', 'Sanjuppun kakarimasu.', 'It takes 30 minutes.'))),
      form('past', formula('どのくらいかかりましたか', 'Dono kurai kakarimashita ka'), exchange(sentence('昨日、学校までどのくらいかかりましたか。', 'Kinō, gakkō made dono kurai kakarimashita ka?', 'How long did it take to get to school yesterday?'), sentence('三十分かかりました。', 'Sanjuppun kakarimashita.', 'It took 30 minutes.'))),
      form('future', formula('どのくらいかかりますか', 'Dono kurai kakarimasu ka'), exchange(sentence('明日、空港までどのくらいかかりますか。', 'Ashita, kūkō made dono kurai kakarimasu ka?', 'How long is it going to take to get to the airport tomorrow?'), sentence('一時間かかります。', 'Ichijikan kakarimasu.', 'It’s going to take an hour.'))),
    ],
  },
  {
    id: 'how', title: 'How is it?', keywords: [pair('どう', 'dō')],
    explanation: 'Ask about a condition, impression, or experience. Answer with a description rather than a thing or a person.',
    note: 'Dō desu ka can ask for an opinion. The future example asks about a forecast; it is a prediction, not certainty about tomorrow.',
    aspectNote: noProgressive,
    forms: [
      form('present', formula('N は どうですか', 'N wa dō desu ka'), exchange(sentence('日本語の授業はどうですか。', 'Nihongo no jugyō wa dō desu ka?', 'How is your Japanese class?'), sentence('楽しいです。', 'Tanoshii desu.', 'It’s fun.'))),
      form('past', formula('N は どうでしたか', 'N wa dō deshita ka'), exchange(sentence('昨日の授業はどうでしたか。', 'Kinō no jugyō wa dō deshita ka?', 'How was yesterday’s class?'), sentence('楽しかったです。', 'Tanoshikatta desu.', 'It was fun.'))),
      form('future', formula('N は どうですか', 'N wa dō desu ka'), exchange(sentence('明日の天気はどうですか。', 'Ashita no tenki wa dō desu ka?', 'What is the weather going to be like tomorrow?'), sentence('晴れです。', 'Hare desu.', 'It’s going to be sunny.'))),
    ],
  },
  {
    id: 'how-to', title: 'How / by what method?', keywords: [pair('どうやって', 'dō yatte')],
    explanation: 'Ask how an action is done. The reply explains the method or means; de can mark the means, such as a bus or a tool.',
    note: 'Use dō yatte for a method and dō desu ka for an impression or condition. They answer different questions.',
    forms: [
      form('present', formula('どうやって V-ますか', 'Dō yatte V-masu ka'), exchange(sentence('毎日、どうやって学校に行きますか。', 'Mainichi, dō yatte gakkō ni ikimasu ka?', 'How do you get to school every day?'), sentence('バスで行きます。', 'Basu de ikimasu.', 'I go by bus.'))),
      form('past', formula('どうやって V-ましたか', 'Dō yatte V-mashita ka'), exchange(sentence('昨日、どうやって学校に行きましたか。', 'Kinō, dō yatte gakkō ni ikimashita ka?', 'How did you get to school yesterday?'), sentence('バスで行きました。', 'Basu de ikimashita.', 'I went by bus.'))),
      form('future', formula('どうやって V-ますか', 'Dō yatte V-masu ka'), exchange(sentence('明日、どうやって学校に行きますか。', 'Ashita, dō yatte gakkō ni ikimasu ka?', 'How are you going to get to school tomorrow?'), sentence('バスで行きます。', 'Basu de ikimasu.', 'I’m going to go by bus.'))),
      form('ongoing', formula('どうやって V-ていますか', 'Dō yatte V-te imasu ka'), exchange(sentence('今、どうやってこの問題を解いていますか。', 'Ima, dō yatte kono mondai o toite imasu ka?', 'How are you solving this problem now?'), sentence('図を描いて考えています。', 'Zu o kaite kangaete imasu.', 'I’m drawing a diagram and thinking it through.'))),
      form('past-ongoing', formula('どうやって V-ていましたか', 'Dō yatte V-te imashita ka'), exchange(sentence('さっき、どうやってこの問題を解いていましたか。', 'Sakki, dō yatte kono mondai o toite imashita ka?', 'How were you solving this problem a moment ago?'), sentence('図を描いて考えていました。', 'Zu o kaite kangaete imashita.', 'I was drawing a diagram and thinking it through.'))),
    ],
  },
  {
    id: 'what-kind', title: 'What kind?', keywords: [pair('どんな＋N', 'donna + N')],
    explanation: 'Donna comes before a noun and asks for its kind or characteristics. Give a description or category in the answer.',
    note: 'Donna asks for a description; dono asks you to identify a particular item from a set. Keep the noun after donna.',
    aspectNote: 'The teacher examples ask for characteristics and do not need a continuous form. With an action verb, the time form follows that verb.',
    forms: [
      form('present', formula('どんな N ですか', 'Donna N desu ka'), exchange(sentence('田中さんはどんな先生ですか。', 'Tanaka-san wa donna sensei desu ka?', 'What kind of teacher is Tanaka-san?'), sentence('親切な先生です。', 'Shinsetsu na sensei desu.', 'Tanaka-san is a kind teacher.'))),
      form('past', formula('どんな N でしたか', 'Donna N deshita ka'), exchange(sentence('去年の先生はどんな先生でしたか。', 'Kyonen no sensei wa donna sensei deshita ka?', 'What kind of teacher was last year’s teacher?'), sentence('親切な先生でした。', 'Shinsetsu na sensei deshita.', 'The teacher was kind.'))),
      form('future', formula('どんな N を V-ますか', 'Donna N o V-masu ka'), exchange(sentence('明日、どんな料理を作りますか。', 'Ashita, donna ryōri o tsukurimasu ka?', 'What kind of food are you going to make tomorrow?'), sentence('日本料理を作ります。', 'Nihon ryōri o tsukurimasu.', 'I’m going to make Japanese food.'))),
    ],
  },
  {
    id: 'why', title: 'Why?', keywords: [pair('どうして', 'dōshite', ['なぜ', 'naze']), pair('なんで', 'nande')],
    explanation: 'Ask for a reason. A useful answer gives a reason followed by kara desu. The main question verb still determines the time.',
    note: 'Naze often sounds more formal; nande is conversational and can sound direct. Nande can also mean “by what means,” so dōshite makes the intended “why” clearer.',
    forms: [
      form('present', formula('どうして V-ますか', 'Dōshite V-masu ka'), exchange(sentence('どうして日本語を勉強しますか。', 'Dōshite nihongo o benkyō shimasu ka?', 'Why do you study Japanese?'), sentence('日本語が好きだからです。', 'Nihongo ga suki da kara desu.', 'Because I like Japanese.'))),
      form('past', formula('どうして V-ましたか', 'Dōshite V-mashita ka'), exchange(sentence('昨日、どうして休みましたか。', 'Kinō, dōshite yasumimashita ka?', 'Why did you take yesterday off?'), sentence('熱があったからです。', 'Netsu ga atta kara desu.', 'Because I had a fever.'))),
      form('future', formula('どうして V-ますか', 'Dōshite V-masu ka'), exchange(sentence('明日、どうして休みますか。', 'Ashita, dōshite yasumimasu ka?', 'Why are you going to take tomorrow off?'), sentence('病院に行くからです。', 'Byōin ni iku kara desu.', 'Because I’m going to the hospital.'))),
      form('ongoing', formula('どうして V-ていますか', 'Dōshite V-te imasu ka'), exchange(sentence('どうして急いでいますか。', 'Dōshite isoide imasu ka?', 'Why are you hurrying?'), sentence('時間がないからです。', 'Jikan ga nai kara desu.', 'Because I don’t have time.'))),
      form('past-ongoing', formula('どうして V-ていましたか', 'Dōshite V-te imashita ka'), exchange(sentence('さっき、どうして急いでいましたか。', 'Sakki, dōshite isoide imashita ka?', 'Why were you hurrying a moment ago?'), sentence('時間がなかったからです。', 'Jikan ga nakatta kara desu.', 'Because I didn’t have time.'))),
    ],
  },
];

export const questionGroups: readonly QuestionGroup[] = [
  { id: 'yes-no', title: 'Yes / No', japanese: [pair('はい・いいえの質問', 'Hai / iie no shitsumon')], description: 'Check whether a statement is true. Explore noun statements, actions, and qualities.', types: yesNoTypes },
  { id: 'wh', title: 'WH questions', japanese: [pair('疑問詞を使う質問', 'Gimonshi o tsukau shitsumon')], description: 'Ask for missing information. Choose the person, thing, place, time, amount, or reason you need.', types: whTypes },
];
