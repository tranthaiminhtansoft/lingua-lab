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
    number: '04',
    title: 'Connect two nouns',
    japaneseTitle: 'の',
    formulaParts: [['N1', 'N1'], ['の', 'no'], ['N2', 'N2']] as const,
    explanation: 'の links two nouns. Depending on context, it can show affiliation or possession.',
    examples: [
      { parts: [['ABC大学', 'ABC daigaku'], ['の', 'no'], ['学生', 'gakusei'], ['です。', 'desu']] as const, translation: 'I am a student at ABC University.', label: 'Affiliation' },
      { parts: [['わたし', 'watashi'], ['の', 'no'], ['名前', 'namae'], ['は', 'wa'], ['タン', 'Tan'], ['です。', 'desu']] as const, translation: 'My name is Tan.', label: 'Possession' },
    ],
  },
];
