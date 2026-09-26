import type { GrammarPattern } from '../components/GrammarPatternCard';

export const grammarPatterns: readonly GrammarPattern[] = [
  {
    number: '01',
    title: 'Introduce someone or something',
    japaneseTitle: '名詞文',
    formulaParts: [['N1', 'N1'], ['は', 'wa'], ['N2', 'N2'], ['です', 'desu']] as const,
    explanation: 'Set N1 as the topic, then identify or describe it with N2. The particle は is pronounced wa; です makes the statement polite.',
    examples: [{ parts: [['わたし', 'watashi', ['僕', 'boku']], ['は', 'wa'], ['学生', 'gakusei'], ['です。', 'desu']] as const, translation: 'I am a student.' }],
    note: 'は marks the topic (“as for me”), not “am.” 私 is a neutral choice for introductions; 僕 can be used with です／ます but sounds more masculine and less formal.',
  },
  {
    number: '02',
    title: 'Make it negative',
    japaneseTitle: '否定',
    formulaParts: [['N1', 'N1'], ['は', 'wa'], ['N2', 'N2'], ['じゃ', 'ja', ['では', 'de wa']], ['ありません', 'arimasen']] as const,
    explanation: 'じゃありません is a polite negative. じゃないです is also common in everyday polite speech; ではありません is more formal.',
    examples: [{ parts: [['わたし', 'watashi'], ['は', 'wa'], ['先生', 'sensei'], ['じゃ', 'ja', ['では', 'de wa']], ['ありません。', 'arimasen']] as const, translation: 'I am not a teacher.' }],
  },
  {
    number: '03',
    title: 'Ask a yes-or-no question',
    japaneseTitle: '質問',
    formulaParts: [['N1', 'N1'], ['は', 'wa'], ['N2', 'N2'], ['です', 'desu'], ['か', 'ka']] as const,
    explanation: 'Add か to a polite statement to make a yes-or-no question. The subject is often left out of the answer when it is clear from context. はい、そうです confirms the statement; いいえ、違います rejects or corrects it.',
    examples: [
      { parts: [['ミン', 'Min'], ['さん', 'san'], ['は', 'wa'], ['学生', 'gakusei'], ['です', 'desu'], ['か。', 'ka?']] as const, translation: 'Is Min a student?' },
      { parts: [['はい、', 'hai,'], ['学生', 'gakusei'], ['です。', 'desu']] as const, translation: 'Yes, Min is a student.', marker: '↳' },
      { parts: [['いいえ、', 'iie,'], ['学生', 'gakusei'], ['じゃ', 'ja'], ['ありません。', 'arimasen']] as const, translation: 'No, Min isn’t a student.', label: 'Negative', marker: '↳' },
      { parts: [['はい、', 'hai,'], ['そうです。', 'sō desu.']] as const, translation: 'Yes, that’s right. (Short confirmation)', label: 'Short reply', marker: '↳' },
      { parts: [['いいえ、', 'iie,'], ['違います。', 'chigaimasu.']] as const, translation: 'No, that’s not right. (Short correction)', label: 'Short reply', marker: '↳' },
    ],
  },
  {
    number: '04',
    title: 'Say “also”',
    japaneseTitle: 'も',
    formulaParts: [['N1', 'N1'], ['も', 'mo'], ['N2', 'N2'], ['です', 'desu']] as const,
    explanation: 'も marks an additional person or thing and replaces は in this sentence pattern. Repeating it as AもBも means “both A and B.”',
    examples: [
      { parts: [['わたし', 'watashi'], ['も', 'mo'], ['学生', 'gakusei'], ['です。', 'desu']] as const, translation: 'I am a student, too.', label: 'Also' },
      { parts: [['田中さん', 'Tanaka-san'], ['も', 'mo'], ['リンさん', 'Rin-san'], ['も', 'mo'], ['学生', 'gakusei'], ['です。', 'desu']] as const, translation: 'Both Tanaka and Lin are students.', label: 'Both … and …' },
    ],
  },
  {
    number: '05',
    title: 'Connect two nouns',
    japaneseTitle: 'の',
    formulaParts: [['N1', 'N1'], ['の', 'no'], ['N2', 'N2']] as const,
    explanation: 'の links two nouns. Depending on context, it can show affiliation or possession.',
    examples: [
      { parts: [['ABC大学', 'ABC daigaku'], ['の', 'no'], ['学生', 'gakusei'], ['です。', 'desu']] as const, translation: 'I am a student at ABC University.', label: 'Affiliation' },
      { parts: [['わたし', 'watashi'], ['の', 'no'], ['名前', 'namae'], ['は', 'wa'], ['タン', 'Tan'], ['です。', 'desu']] as const, translation: 'My name is Tan.', label: 'Possession' },
    ],
  },
  {
    number: '06',
    title: 'Ask who or how old',
    japaneseTitle: '疑問詞',
    formulaParts: [['N1', 'N1'], ['は', 'wa'], ['だれ', 'dare', ['どなた', 'donata']], ['です', 'desu'], ['か', 'ka'], ['N1', 'N1'], ['は', 'wa'], ['何歳', 'nansai', ['おいくつ', 'oikutsu']], ['です', 'desu'], ['か', 'ka']] as const,
    formulaBreakBefore: 5,
    explanation: 'Replace the information you want with a question word. どなた and おいくつ are polite; asking someone’s age can feel personal, so ask when it is relevant.',
    examples: [
      { parts: [['あの方', 'ano kata'], ['は', 'wa'], ['どなた', 'donata'], ['です', 'desu'], ['か。', 'ka?'], ['—', '—'], ['田中さん', 'Tanaka-san'], ['です。', 'desu']] as const, translation: 'Who is that person? — That’s Tanaka-san.' },
      { parts: [['リンさん', 'Rin-san'], ['は', 'wa'], ['おいくつ', 'oikutsu'], ['です', 'desu'], ['か。', 'ka?'], ['—', '—'], ['二十歳', 'hatachi'], ['です。', 'desu']] as const, translation: 'How old is Lin? — Lin is 20.' },
    ],
  },
];
