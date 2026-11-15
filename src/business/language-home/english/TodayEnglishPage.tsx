import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTodayEnglishContextApi,
  getContentVersionApi,
  isTopicAvailableApi,
} from './services/englishContentApi';
import type { EnglishTopic, TodayEnglishContext } from './content/todayEnglish';
import {
  readProgress,
  writeProgress,
  getTopicProgress,
  updateVocabularyScore,
  isOverallComplete,
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

function scoreText(spoken: string, expected: string): number {
  const spokenWords = normalizeText(spoken);
  const expectedWords = normalizeText(expected);
  if (expectedWords.length === 0) return 0;
  let matches = 0;
  const used = new Set<number>();
  for (const word of spokenWords) {
    const index = expectedWords.findIndex((candidate, i) => candidate === word && !used.has(i));
    if (index >= 0) {
      used.add(index);
      matches += 1;
    }
  }
  return Math.round((matches / expectedWords.length) * 100);
}

function scoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-low';
}

function simulatedReadScore(): number {
  return Math.round(70 + Math.random() * 25);
}
export function TodayEnglishPage() {
  const [context, setContext] = useState<TodayEnglishContext | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [progress, setProgress] = useState(readProgress);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [readScore, setReadScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [versionChecked, setVersionChecked] = useState(false);

  useEffect(() => {
    void getTodayEnglishContextApi().then((loadedContext) => {
      setContext(loadedContext);
      const firstAvailable = loadedContext.topics.find((topic) => isTopicAvailableApi(topic));
      if (firstAvailable) setSelectedTopicId(firstAvailable.id);
    });
    void getContentVersionApi().then((version) => {
      setRemoteVersion(version.version);
      setVersionChecked(true);
    });
  }, []);

  const availableTopicIds = useMemo(
    () => context?.topics.filter((topic) => isTopicAvailableApi(topic)).map((topic) => topic.id) ?? [],
    [context],
  );

  const selectedTopic = useMemo(
    () => context?.topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [context, selectedTopicId],
  );

  const selectedProgress = useMemo(() => {
    if (!selectedTopic) return null;
    return getTopicProgress(progress, selectedTopic.id, selectedTopic.vocab.map((item) => item.term));
  }, [progress, selectedTopic]);

  const overallComplete = useMemo(
    () => isOverallComplete(progress, availableTopicIds),
    [progress, availableTopicIds],
  );

  function handleSelectTopic(topic: EnglishTopic) {
    if (!isTopicAvailableApi(topic)) {
      window.alert('Chủ đề này đang Coming soon và sẽ mở từ ' + topic.availableFrom + '.');
      return;
    }
    setSelectedTopicId(topic.id);
    setQuizAnswer(null);
    setReadScore(null);
  }

  function handleQuizAnswer(index: number) {
    setQuizAnswer(index);
  }

  function handleReadAloud(term?: string) {
    const target = term ?? selectedTopic?.readExpected;
    if (!target) return;
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      const simulated = simulatedReadScore();
      applyReadScore(simulated, term);
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
      const score = scoreText(transcript, target);
      applyReadScore(score, term);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  }

  function applyReadScore(score: number, term?: string) {
    setReadScore(score);
    if (!selectedTopic) return;
    const topicId = selectedTopic.id;
    const vocabTerms = selectedTopic.vocab.map((item) => item.term);
    let nextState = progress;
    if (term) {
      nextState = updateVocabularyScore(nextState, topicId, term, score, vocabTerms);
    } else {
      // Score the first incomplete vocabulary item as a lightweight MVP fallback.
      const incomplete = vocabTerms.find((item) => !getTopicProgress(nextState, topicId, vocabTerms).vocabulary[item]?.completed);
      if (incomplete) nextState = updateVocabularyScore(nextState, topicId, incomplete, score, vocabTerms);
    }
    setProgress(nextState);
    writeProgress(nextState);
  }

  function handleRefresh() {
    window.alert('Đã kiểm tra version. Nếu có bản mới, nội dung sẽ được tải về (MVP dùng bundle local).');
  }

  if (!context) {
    return <main className="english-today-page"><p>Đang tải English hôm nay…</p></main>;
  }

  const topicProgress = selectedProgress;
  const quiz = selectedTopic?.quiz;
  const quizCorrect = quizAnswer !== null && quiz !== undefined && quizAnswer === quiz.answerIndex;

  return (
    <main className="english-today-page">
      <div className="english-today-topbar">
        <div className="english-today-crumb">English <span aria-hidden="true">/</span> <b>Today’s English</b></div>
        <div className="english-today-tag">MVP PREVIEW</div>
      </div>

      <section className="english-today-hero">
        <article className="english-today-card english-today-context">
          <p className="english-today-eyebrow">Hôm nay · Today</p>
          <h1 className="english-today-title">{context.date}</h1>
          <p className="english-today-copy">
            {context.season}. {context.holiday}. Các chủ đề ưu tiên giao tiếp thực tế và IELTS 6.5–8.0.
          </p>
          <div className="english-today-meta">
            <span className="english-today-pill">🍂 {context.season}</span>
            <span className="english-today-pill">📅 {context.holiday}</span>
            <span className="english-today-pill">🎯 IELTS 6.5–8.0</span>
            <span className="english-today-pill">🌐 Theo thiết bị</span>
          </div>
        </article>
        <aside className="english-today-card english-today-refresh">
          <h2>Dữ liệu nội dung</h2>
          <p>Remote version: {remoteVersion ?? '…'} · Local version: {progress.version}</p>
          <p>{versionChecked ? 'Đã kiểm tra version khi mở trang.' : 'Đang kiểm tra version…'}</p>
          <button className="english-today-button secondary" type="button" onClick={handleRefresh}>
            Kiểm tra / Refresh
          </button>
          <p>Tổng thể chỉ đạt 100% khi tất cả chủ đề đạt 100%.</p>
        </aside>
      </section>

      <section className="english-today-section">
        <div className="english-today-section-head">
          <h2>Hôm nay có các chủ đề này. Bạn muốn chọn chủ đề nào để học?</h2>
        </div>
        <div className="english-today-topic-grid">
          {context.topics.map((topic) => {
            const available = isTopicAvailableApi(topic);
            const tp = getTopicProgress(progress, topic.id, topic.vocab.map((item) => item.term));
            return (
              <button
                key={topic.id}
                type="button"
                className={`english-today-topic${selectedTopicId === topic.id ? ' selected' : ''}${available ? '' : ' coming'}`}
                onClick={() => handleSelectTopic(topic)}
                disabled={!available}
              >
                <span className={`english-today-badge ${available ? 'available' : 'coming'}`}>
                  {available ? 'Có sẵn' : `Coming soon · ${topic.availableFrom}`}
                </span>
                <h3 className="english-today-topic-title">{topic.title}</h3>
                <p className="english-today-topic-desc">{topic.description}</p>
                <div className="english-today-topic-meta">
                  Từ vựng · Grammar · Ví dụ · Quiz · Đọc to · Tiến độ: <span className={scoreClass(tp.progress)}>{tp.progress}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedTopic && topicProgress && (
        <section className="english-today-card english-today-detail">
          <div className="english-today-detail-head">
            <div>
              <h3>{selectedTopic.title}</h3>
              <p>{selectedTopic.description}</p>
            </div>
            <Link className="english-today-button ghost" to="/nihongo-o-benkyuo">Về Nihongo</Link>
          </div>

          <div className="english-today-block">
            <h4>Tiến độ chủ đề</h4>
            <div className="english-today-score">
              <div>
                <strong className={scoreClass(topicProgress.progress)}>{topicProgress.progress}%</strong> hoàn thành · Cần đạt 100%. Tổng thể chỉ đạt 100% khi tất cả chủ đề đạt 100%.
              </div>
              <div className="english-today-score-bar">
                <i style={{ width: `${topicProgress.progress}%` }} />
              </div>
            </div>
          </div>

          <div className="english-today-block">
            <h4>Từ vựng hôm nay</h4>
            <div className="english-today-list">
              {selectedTopic.vocab.map((item) => {
                const vp = topicProgress.vocabulary[item.term] ?? { score: 0, completed: false };
                return (
                  <div className="english-today-item" key={item.term}>
                    <strong>{item.term}</strong>
                    <span>
                      {item.meaning} · {item.pronunciation} · Phát âm: <span className={scoreClass(vp.score)}>{vp.score}%</span>
                      {vp.completed ? ' (đạt ngưỡng)' : ' (chưa đạt)'}
                    </span>
                    <div style={{ marginTop: 8 }}>
                      <button className="english-today-button secondary" type="button" onClick={() => handleReadAloud(item.term)}>
                        {isListening ? 'Đang nghe…' : 'Đọc từ này'}
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
              {selectedTopic.grammar.map((item) => (
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
              {selectedTopic.examples.map((example) => (
                <div className="english-today-example english-today-item" key={example}>
                  {example}
                </div>
              ))}
            </div>
          </div>

          <div className="english-today-practice">
            <section className="english-today-card" style={{ padding: 18 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#394eaa', textTransform: 'uppercase' }}>Trắc nghiệm củng cố</h4>
              <p className="english-today-quiz-question">{quiz?.question}</p>
              <div className="english-today-options">
                {quiz?.options.map((option, index) => (
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
                    ? quiz?.explanation
                    : 'Chưa đúng. Hãy xem lại giải thích và thử lại.'}
              </div>
            </section>

            <section className="english-today-card" style={{ padding: 18 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#394eaa', textTransform: 'uppercase' }}>Đọc to và chấm điểm</h4>
              <div className="english-today-read-expected">{selectedTopic.readExpected}</div>
              <div className="english-today-read-controls">
                <button className="english-today-button secondary" type="button" onClick={() => handleReadAloud()} disabled={isListening}>
                  {isListening ? 'Đang nghe…' : 'Bắt đầu đọc'}
                </button>
              </div>
              <div className="english-today-score">
                <div>
                  <strong className={readScore === null ? 'score-mid' : scoreClass(readScore)}>{readScore === null ? '—' : readScore}</strong> % khớp
                </div>
                <div className="english-today-score-bar">
                  <i style={{ width: `${readScore ?? 0}%` }} />
                </div>
                <p style={{ margin: '8px 0 0', color: '#697382', fontSize: 11 }}>
                  Nếu browser hỗ trợ SpeechRecognition, app so sánh từ đã nói. Nếu không, dùng điểm mô phỏng. Ngưỡng đạt: {VOCAB_THRESHOLD}%.
                </p>
              </div>
            </section>
          </div>

          {overallComplete && (
            <p style={{ marginTop: 16, color: '#2f7a55', fontWeight: 700 }}>
              Bạn đã đạt 100% cho tất cả chủ đề hôm nay.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
