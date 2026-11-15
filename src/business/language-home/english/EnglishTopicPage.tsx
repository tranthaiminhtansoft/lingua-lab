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
  resetTopicProgress,
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
  onerror: ((event: { error?: string }) => void) | null;
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

type WordFeedback = 'good' | 'near' | 'missed';

function describeSpeechError(code?: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Micro đang bị chặn. Hãy cấp quyền micro cho trang này rồi thử lại.';
    case 'audio-capture':
      return 'Không tìm thấy micro. Hãy kiểm tra thiết bị ghi âm.';
    case 'no-speech':
      return 'Không nghe thấy giọng nói. Hãy thử lại và nói to hơn.';
    case 'network':
      return 'Lỗi kết nối khi nhận diện giọng nói. Hãy kiểm tra mạng và thử lại.';
    default:
      return 'Không nhận diện được giọng nói. Hãy thử lại.';
  }
}

function getWordFeedback(expected: string, spoken: string): WordFeedback[] {
  const expectedWords = expected.split(/\s+/).filter(Boolean);
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
    const now = audioContext.currentTime;
    const playTone = (frequency: number, start: number, duration: number, volume: number) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(volume, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + duration);
    };
    if (correct) {
      playTone(660, 0, 0.12, 0.08);
      playTone(880, 0.13, 0.16, 0.08);
      playTone(1046, 0.3, 0.2, 0.07);
    } else {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 150;
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    }
    window.setTimeout(() => {
      void audioContext.close();
    }, correct ? 700 : 500);
  } catch {
    // Ignore browsers that block audio.
  }
}

function stopSampleAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
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
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [readFeedback, setReadFeedback] = useState<Record<string, string>>({});
  const [readNotice, setReadNotice] = useState<{ target: string; message: string } | null>(null);

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

  function handleResetTopic() {
    if (!topic) return;
    const confirmed = window.confirm('Luyện tập lại sẽ xoá toàn bộ điểm của chủ đề này. Bạn có chắc không?');
    if (!confirmed) return;
    const nextState = resetTopicProgress(progress, topic.id);
    setProgress(nextState);
    writeProgress(nextState);
    setReadFeedback({});
    setReadNotice(null);
    setDialogueIndex(0);
    setQuizAnswers({});
  }

  function handleQuizAnswer(questionIndex: number, optionIndex: number) {
    setQuizAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
    playFeedbackSound(optionIndex === topic?.quizzes[questionIndex]?.answerIndex);
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
    playFeedbackSound(score >= VOCAB_THRESHOLD);
    if (key && kind === 'dialogue' && score >= VOCAB_THRESHOLD) {
      const completedIndex = topic.dialogue.indexOf(key);
      if (completedIndex >= 0) {
        setDialogueIndex((current) => Math.max(current, Math.min(completedIndex + 1, topic.dialogue.length - 1)));
      }
    }
  }

  function recordSpoken(expected: string, transcript: string) {
    setReadFeedback((current) => ({ ...current, [expected]: transcript }));
  }

  function handleReadAloud(target: string, key?: string, kind: 'vocab' | 'dialogue' = 'vocab') {
    const expected = cleanSentence(target);
    if (!expected) return;
    setReadNotice(null);
    stopSampleAudio();
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      setReadNotice({
        target: expected,
        message: 'Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge và cấp quyền micro.',
      });
      return;
    }
    const recognition = new Constructor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    let receivedResult = false;
    let hadError = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (!transcript) return;
      receivedResult = true;
      recordSpoken(expected, transcript);
      applyReadScore(scoreText(transcript, expected), key, kind);
    };
    recognition.onerror = (event) => {
      hadError = true;
      setIsListening(false);
      setReadNotice({ target: expected, message: describeSpeechError(event.error) });
    };
    recognition.onend = () => {
      setIsListening(false);
      if (hadError || receivedResult) return;
      setReadNotice({
        target: expected,
        message: 'Không nghe thấy giọng nói. Hãy thử lại và nói to, rõ hơn.',
      });
    };
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setReadNotice({ target: expected, message: 'Không bắt đầu được micro. Hãy thử lại.' });
    }
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
              <button className="english-today-button ghost" type="button" onClick={handleResetTopic} style={{ marginTop: 10 }}>
                Luyện tập lại chủ đề
              </button>
            </div>
          </div>
        )}

        <div className="english-today-block">
          <h4>Từ vựng hôm nay</h4>
          <div className="english-today-list english-today-vocab-grid">
            {topic.vocab.map((item) => {
              const vp = topicProgress?.vocabulary[item.term] ?? { score: 0, completed: false };
              const spoken = readFeedback[item.term];
              const termFeedback = spoken ? getWordFeedback(item.term, spoken) : null;
              return (
                <div className="english-today-item" key={item.term}>
                  <strong>
                    {item.term.split(/\s+/).map((word, wordIndex) => (
                      <span
                        key={`${item.term}-${wordIndex}`}
                        className={termFeedback
                          ? termFeedback[wordIndex] === 'good'
                            ? 'score-high'
                            : termFeedback[wordIndex] === 'near'
                              ? 'score-mid'
                              : 'score-low'
                          : undefined}
                        style={{ marginRight: 4 }}
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </strong>
                  <span>
                    {item.meaning} · {item.pronunciation} · Phát âm: <span className={scoreClass(vp.score)}>{vp.score}%</span>
                    {vp.completed ? ' (đạt ngưỡng)' : ' (chưa đạt)'}
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className={`english-today-button secondary${isListening ? ' listening' : ''}`}
                      type="button"
                      onClick={() => handleReadAloud(item.term, item.term, 'vocab')}
                      disabled={isListening || vp.completed}
                    >
                      {vp.completed ? 'Đã đạt' : isListening ? 'Đang nghe…' : vp.score > 0 ? 'Đọc lại' : 'Đọc từ này'}
                    </button>
                    <button className="english-today-button ghost" type="button" onClick={() => speakText(item.term)} disabled={isListening}>
                      🔊 Nghe mẫu
                    </button>
                  </div>
                  {readNotice?.target === item.term && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#c0392b', lineHeight: 1.5 }}>
                      {readNotice.message}
                    </div>
                  )}
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

        <div className="english-today-practice">
          <section className="english-today-card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#394eaa', textTransform: 'uppercase' }}>Trắc nghiệm củng cố</h4>
            <div style={{ display: 'grid', gap: 18 }}>
              {topic.quizzes.map((quizItem, questionIndex) => {
                const answer = quizAnswers[questionIndex];
                const correct = answer === quizItem.answerIndex;
                return (
                  <div key={quizItem.question}>
                    <p className="english-today-quiz-question">{questionIndex + 1}. {quizItem.question}</p>
                    <div className="english-today-options">
                      {quizItem.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          type="button"
                          className={`english-today-option${answer === optionIndex ? (optionIndex === quizItem.answerIndex ? ' correct' : ' wrong') : ''}`}
                          onClick={() => handleQuizAnswer(questionIndex, optionIndex)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="english-today-feedback">
                      {answer === undefined
                        ? 'Chọn một đáp án.'
                        : correct
                          ? quizItem.explanation
                          : 'Chưa đúng. Hãy xem lại và thử lại.'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="english-today-card" style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#394eaa', textTransform: 'uppercase' }}>Kiểm tra đoạn hội thoại</h4>
            <p style={{ margin: '0 0 12px', color: '#697382', fontSize: 12 }}>
              Đọc từng tin nhắn. Đạt {VOCAB_THRESHOLD}% mới mở tin nhắn tiếp theo.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {topic.dialogue.slice(0, dialogueIndex + 1).map((sentence, index) => {
                const record = topicProgress?.dialogue[sentence] ?? { score: 0, completed: false };
                const isCurrent = index === dialogueIndex;
                const isRight = sentence.startsWith('B:');
                const isLast = index === topic.dialogue.length - 1;
                const messageText = cleanSentence(sentence);
                const spoken = readFeedback[messageText];
                const messageFeedback = spoken ? getWordFeedback(messageText, spoken) : null;
                return (
                  <div key={sentence} style={{ display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '88%', padding: '10px 12px', borderRadius: 14, background: isRight ? '#e9edff' : '#fbfaf6', border: '1px solid #e7e5de' }}>
                      <strong style={{ display: 'block', fontSize: 11, color: '#697382' }}>{isRight ? 'B' : 'A'}</strong>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                        {messageText.split(/\s+/).map((word, wordIndex) => (
                          <span
                            key={`${sentence}-${wordIndex}`}
                            className={messageFeedback
                              ? messageFeedback[wordIndex] === 'good'
                                ? 'score-high'
                                : messageFeedback[wordIndex] === 'near'
                                  ? 'score-mid'
                                  : 'score-low'
                              : undefined}
                            style={{ marginRight: 4 }}
                          >
                            {word}{' '}
                          </span>
                        ))}
                      </div>
                      {record.completed && (
                        <div className="score-high" style={{ marginTop: 6, fontSize: 11 }}>Đã đạt {record.score}%</div>
                      )}
                      {!record.completed && isCurrent && (
                        <>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              className={`english-today-button secondary${isListening ? ' listening' : ''}`}
                              type="button"
                              onClick={() => handleReadAloud(sentence, sentence, 'dialogue')}
                              disabled={isListening}
                            >
                              {isListening ? 'Đang nghe…' : record.score > 0 ? 'Đọc lại' : 'Đọc tin nhắn'}
                            </button>
                            <button className="english-today-button ghost" type="button" onClick={() => speakText(cleanSentence(sentence))} disabled={isListening}>
                              🔊 Nghe mẫu
                            </button>
                          </div>
                          {readNotice?.target === messageText && (
                            <div style={{ marginTop: 8, fontSize: 11, color: '#c0392b', lineHeight: 1.5 }}>
                              {readNotice.message}
                            </div>
                          )}
                          {record.score > 0 && (
                            <div style={{ marginTop: 6, fontSize: 11 }}>
                              Đọc: <span className={scoreClass(record.score)}>{record.score}%</span>
                            </div>
                          )}
                        </>
                      )}
                      {record.completed && isLast && (
                        <div className="score-high" style={{ marginTop: 6, fontSize: 11 }}>Hoàn thành đoạn hội thoại.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
