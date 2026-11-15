import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  getTodayEnglishContextApi,
  isTopicAvailableApi,
} from './services/englishContentApi';
import type { TodayEnglishContext } from './content/todayEnglish';
import {
  readProgress,
  writeProgress,
  getTopicProgress,
  updateVocabularyScore,
  updateDialogueScore,
  VOCAB_THRESHOLD,
} from './progress/englishProgress';
import './todayEnglish.css';

type SpeechRecognitionResult = { transcript: string };
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResult>> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function normalizeText(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

function scoreText(spoken: string, expected: string): number {
  const spokenWords = normalizeText(spoken);
  const expectedWords = normalizeText(expected);
  if (expectedWords.length === 0) return 0;
  const used = new Set<number>();
  let score = 0;
  for (const expectedWord of expectedWords) {
    let best = 0;
    spokenWords.forEach((spokenWord, index) => {
      if (used.has(index)) return;
      if (spokenWord === expectedWord) {
        best = Math.max(best, 1);
        return;
      }
      const distance = levenshtein(spokenWord, expectedWord);
      const maxLength = Math.max(spokenWord.length, expectedWord.length);
      const similarity = maxLength === 0 ? 1 : 1 - distance / maxLength;
      if (similarity >= 0.55) best = Math.max(best, similarity * 0.75);
    });
    if (best > 0) {
      const index = spokenWords.findIndex((word, i) => !used.has(i) && (word === expectedWord || levenshtein(word, expectedWord) <= 2));
      if (index >= 0) used.add(index);
    }
    score += best;
  }
  return Math.round(Math.min(100, (score / expectedWords.length) * 100));
}

function scoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-low';
}

function simulatedReadScore(): number {
  return Math.round(70 + Math.random() * 25);
}

type WordFeedback = 'good' | 'near' | 'missed';

function getWordFeedback(expected: string, spoken: string): WordFeedback[] {
  const expectedWords = expected.split(/\\s+/).filter(Boolean);
  const spokenWords = normalizeText(spoken);
  const used = new Set<number>();
  return expectedWords.map((rawWord) => {
    const word = rawWord.toLowerCase().replace(/[^a-z0-9']/g, '');
    if (!word) return 'missed';
    let bestIndex = -1;
    let bestSimilarity = 0;
    spokenWords.forEach((candidate, index) => {
      if (used.has(index)) return;
      if (candidate === word) {
        bestSimilarity = 1;
        bestIndex = index;
        return;
      }
      const distance = levenshtein(candidate, word);
      const maxLength = Math.max(candidate.length, word.length);
      const similarity = maxLength === 0 ? 1 : 1 - distance / maxLength;
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestIndex = index;
      }
    });
    if (bestIndex < 0 || bestSimilarity < 0.55) return 'missed';
    used.add(bestIndex);
    return bestSimilarity >= 0.9 ? 'good' : 'near';
  });
}

function playFeedbackSound(correct: boolean) {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = correct ? 660 : 220;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + (correct ? 0.18 : 0.25));
    oscillator.onended = () => {
      void audioContext.close();
    };
  } catch {
    // Ignore browsers that block audio.
  }
}

function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function EnglishTopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [context, setContext] = useState<TodayEnglishContext | null>(null);
  const [progress, setProgress] = useState(readProgress);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [readScore, setReadScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastExpected, setLastExpected] = useState('');
  const [spokenTranscript, setSpokenTranscript] = useState('');

  useEffect(() => {
    void getTodayEnglishContextApi().then(setContext);
  }, []);

  const topic = useMemo(
    () => context?.topics.find((item) => item.id === topicId) ?? null,
    [context, topicId],
  );

  const topicProgress = useMemo(() => {
    if (!topic) return null;
    return getTopicProgress(progress, topic.id, topic.vocab.map((item) => item.term), topic.dialogue);
  }, [progress, topic]);

  useEffect(() => {
    if (!context || !topic) return;
    if (!isTopicAvailableApi(topic)) {
      window.alert('Chủ đề này đang Coming soon và sẽ mở từ ' + topic.availableFrom + '.');
      navigate('/english');
    }
  }, [context, topic, navigate]);

  function handleQuizAnswer(index: number) {
    setQuizAnswer(index);
    playFeedbackSound(index === quiz.answerIndex);
  }

  function cleanSentence(value: string): string {
    return value.replace(/^[A-Z]:\s*/, '');
  }

  function applyReadScore(score: number, key?: string, kind: 'vocab' | 'dialogue' = 'vocab') {
    if (!topic) return;
    const topicIdValue = topic.id;
    const vocabTerms = topic.vocab.map((item) => item.term);
    const dialogueSentences = topic.dialogue;
    let nextState = progress;
    if (key && kind === 'vocab') {
      nextState = updateVocabularyScore(nextState, topicIdValue, key, score, vocabTerms, dialogueSentences);
    } else if (key && kind === 'dialogue') {
      nextState = updateDialogueScore(nextState, topicIdValue, key, score, vocabTerms, dialogueSentences);
    } else {
      const current = getTopicProgress(nextState, topicIdValue, vocabTerms, dialogueSentences);
      const incomplete = vocabTerms.find((item) => !current.vocabulary[item]?.completed)
        ?? dialogueSentences.find((item) => !current.dialogue[item]?.completed);
      if (incomplete) {
        const isDialogue = dialogueSentences.includes(incomplete);
        if (isDialogue) nextState = updateDialogueScore(nextState, topicIdValue, incomplete, score, vocabTerms, dialogueSentences);
        else nextState = updateVocabularyScore(nextState, topicIdValue, incomplete, score, vocabTerms, dialogueSentences);
      }
    }
    setProgress(nextState);
    writeProgress(nextState);
    setReadScore(score);
    playFeedbackSound(score >= VOCAB_THRESHOLD);
  }

  function handleReadAloud(target: string, key?: string, kind: 'vocab' | 'dialogue' = 'vocab') {
    const expected = cleanSentence(target);
    if (!expected) return;
    setLastExpected(expected);
    setSpokenTranscript('');
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      applyReadScore(simulatedReadScore(), key, kind);
      return;
    }
    const recognition = new Constructor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ');
      setSpokenTranscript(transcript);
      applyReadScore(scoreText(transcript, expected), key, kind);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  if (!context) {
    return <main className="english-today-page"><p>Đang tải chủ đề…</p></main>;
  }

  if (!topic) {
    return (
      <main className="english-today-page">
        <p>Không tìm thấy chủ đề.</p>
        <Link className="english-today-button" to="/english">Quay lại danh sách</Link>
      </main>
    );
  }

  const quiz = topic.quiz;
  const quizCorrect = quizAnswer !== null && quizAnswer === quiz.answerIndex;

  return (
    <main className="english-today-page">
      <div className="english-today-topbar">
        <div className="english-today-crumb">
          English <span aria-hidden="true">/</span> <Link to="/english">Today’s English</Link> <span aria-hidden="true">/</span> <b>{topic.title}</b>
        </div>
        <div className="english-today-tag">MVP PREVIEW</div>
      </div>

      <section className="english-today-card english-today-detail" style={{ marginTop: 0 }}>
        <div className="english-today-detail-head">
          <div>
            <h1 className="english-today-title" style={{ fontSize: 28 }}>{topic.title}</h1>
            <p>{topic.description}</p>
          </div>
          <Link className="english-today-button ghost" to="/english">Danh sách chủ đề</Link>
        </div>

        {topicProgress && (
          <div className="english-today-block">
            <h4>Tiến độ chủ đề</h4>
            <div className="english-today-score">
              <div>
                <strong className={scoreClass(topicProgress.progress)}>{topicProgress.progress}%</strong> hoàn thành · Cần đạt 100%.
              </div>
              <div className="english-today-score-bar">
                <i style={{ width: `${topicProgress.progress}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="english-today-block">
          <h4>Từ vựng hôm nay</h4>
          <div className="english-today-list">
            {topic.vocab.map((item) => {
              const vp = topicProgress?.vocabulary[item.term] ?? { score: 0, completed: false };
              return (
                <div className="english-today-item" key={item.term}>
                  <strong>{item.term}</strong>
                  <span>
                    {item.meaning} · {item.pronunciation} · Phát âm: <span className={scoreClass(vp.score)}>{vp.score}%</span>
                    {vp.completed ? ' (đạt ngưỡng)' : ' (chưa đạt)'}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="english-today-button secondary" type="button" onClick={() => handleReadAloud(item.term, item.term, 'vocab')} disabled={isListening}>
                      {isListening ? 'Đang nghe…' : 'Đọc từ này'}
                    </button>
                    <button className="english-today-button ghost" type="button" onClick={() => speakText(item.term)}>
                      🔊 Nghe mẫu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="english-today-block">
          <h4>Grammar tương ứng</h4>
          <div className="english-today-list">
            {topic.grammar.map((item) => (
              <div className="english-today-item" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="english-today-block">
          <h4>Câu ví dụ để áp dụng</h4>
          <div className="english-today-list">
            {topic.examples.map((example) => (
              <div className="english-today-example english-today-item" key={example}>
                {example}
              </div>
            ))}
          </div>
        </div>

        <div className="english-today-block">
          <h4>Đoạn hội thoại dài (đọc to)</h4>
          <p style={{ margin: '0 0 10px', color: '#697382', fontSize: 12 }}>
            Mỗi câu cần đạt ít nhất {VOCAB_THRESHOLD}% để hoàn thành chủ đề.
          </p>
          <div className="english-today-list">
            {topic.dialogue.map((sentence) => {
              const record = topicProgress?.dialogue[sentence] ?? { score: 0, completed: false };
              return (
                <div className="english-today-item" key={sentence}>
                  <strong>{sentence}</strong>
                  <span>
                    Phát âm/đọc: <span className={scoreClass(record.score)}>{record.score}%</span>
                    {record.completed ? ' (đạt)' : ' (chưa đạt)'}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="english-today-button secondary" type="button" onClick={() => handleReadAloud(sentence, sentence, 'dialogue')} disabled={isListening}>
                      {isListening ? 'Đang nghe…' : 'Đọc câu này'}
                    </button>
                    <button className="english-today-button ghost" type="button" onClick={() => speakText(cleanSentence(sentence))}>
                      🔊 Nghe mẫu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="english-today-practice">
          <section className="english-today-card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#394eaa', textTransform: 'uppercase' }}>Trắc nghiệm củng cố</h4>
            <p className="english-today-quiz-question">{quiz.question}</p>
            <div className="english-today-options">
              {quiz.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={`english-today-option${quizAnswer === index ? (index === quiz.answerIndex ? ' correct' : ' wrong') : ''}`}
                  onClick={() => handleQuizAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="english-today-feedback">
              {quizAnswer === null
                ? 'Chọn một đáp án.'
                : quizCorrect
                  ? quiz.explanation
                  : 'Chưa đúng. Hãy xem lại giải thích và thử lại.'}
            </div>
          </section>

          <section className="english-today-card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#394eaa', textTransform: 'uppercase' }}>Đọc to và chấm điểm</h4>
            <div className="english-today-read-expected">{topic.readExpected}</div>
            <div className="english-today-read-controls">
              <button className="english-today-button secondary" type="button" onClick={() => handleReadAloud(topic.readExpected)} disabled={isListening}>
                {isListening ? 'Đang nghe…' : 'Bắt đầu đọc'}
              </button>
              <button className="english-today-button ghost" type="button" onClick={() => speakText(topic.readExpected)}>
                🔊 Nghe mẫu
              </button>
            </div>
            <div className="english-today-score">
              <div>
                <strong className={readScore === null ? 'score-mid' : scoreClass(readScore)}>{readScore === null ? '—' : readScore}</strong> % khớp
                {readScore !== null && (
                  <span style={{ marginLeft: 8 }} className={scoreClass(readScore)}>
                    {readScore >= VOCAB_THRESHOLD ? 'Đọc đạt' : readScore >= 50 ? 'Gần đúng' : 'Chưa đạt'}
                  </span>
                )}
              </div>
              <div className="english-today-score-bar">
                <i style={{ width: `${readScore ?? 0}%` }} />
              </div>
              {spokenTranscript && lastExpected && (
                <div style={{ marginTop: 10, lineHeight: 1.8 }}>
                  {getWordFeedback(lastExpected, spokenTranscript).map((status, index) => (
                    <span
                      key={`${lastExpected}-${index}`}
                      className={status === 'good' ? 'score-high' : status === 'near' ? 'score-mid' : 'score-low'}
                      style={{ marginRight: 6 }}
                    >
                      {lastExpected.split(/\\s+/)[index]}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ margin: '8px 0 0', color: '#697382', fontSize: 11 }}>
                Xanh: đọc đúng, vàng: gần đúng, đỏ: sai hoặc bị miss. Ngưỡng đạt: {VOCAB_THRESHOLD}%.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
