import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkEnglishContentApi,
  getTodayEnglishContextApi,
  isTopicAvailableApi,
} from './services/englishContentApi';
import type { EnglishContentCheckResult } from './services/englishContentApi';
import type { EnglishTopic, TodayEnglishContext } from './content/todayEnglish';
import { isTopicVisible, daysUntilAvailable } from './content/todayEnglish';
import { getTopicTimeLimit } from './content/todayEnglish';
import { useEnglishContent } from './content/englishContentStore';
import {
  readProgress,
  getTopicProgress,
} from './progress/englishProgress';
import './todayEnglish.css';

export function TodayEnglishPage() {
  const navigate = useNavigate();
  const content = useEnglishContent();
  const [context, setContext] = useState<TodayEnglishContext | null>(null);
  const [progress, setProgress] = useState(readProgress);
  const [checkResult, setCheckResult] = useState<EnglishContentCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [today, setToday] = useState(() => new Date());
  const [selectedTopic, setSelectedTopic] = useState<EnglishTopic | null>(null);

  useEffect(() => {
    let active = true;
    void checkEnglishContentApi().then((result) => {
      if (active) setCheckResult(result);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Refresh content when the local date changes so a topic never stays “Coming soon”
    // after its availableFrom date has passed.
    const checkDate = () => setToday((current) => {
      const now = new Date();
      return current.toDateString() === now.toDateString() ? current : now;
    });
    const interval = window.setInterval(checkDate, 30_000);
    window.addEventListener('focus', checkDate);
    document.addEventListener('visibilitychange', checkDate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkDate);
      document.removeEventListener('visibilitychange', checkDate);
    };
  }, []);

  useEffect(() => {
    void getTodayEnglishContextApi(today, content).then(setContext);
  }, [today, content]);

  // A new day starts with a fresh progress slate.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(readProgress());
  }, [today]);

  const availableTopicIds = useMemo(
    () => context?.topics.filter((topic) => isTopicAvailableApi(topic, today)).map((topic) => topic.id) ?? [],
    [context, today],
  );

  const overallProgress = useMemo(() => {
    if (availableTopicIds.length === 0) return 0;
    const completed = availableTopicIds.filter((id) => progress.topics[id]?.completed).length;
    return Math.round((completed / availableTopicIds.length) * 100);
  }, [progress, availableTopicIds]);

  function handleSelectTopic(topic: EnglishTopic) {
    if (!isTopicAvailableApi(topic, today)) {
      window.alert('Chủ đề này đang Coming soon và sẽ mở từ ' + topic.availableFrom + '.');
      return;
    }
    setSelectedTopic(topic);
  }

  function startSelectedTopic() {
    if (!selectedTopic) return;
    const limitMinutes = getTopicTimeLimit(selectedTopic);
    sessionStorage.setItem(`english-timer-${selectedTopic.id}`, String(Date.now() + limitMinutes * 60 * 1000));
    const target = selectedTopic;
    setSelectedTopic(null);
    navigate(`/english/${target.id}`);
  }

  async function handleRefresh() {
    setIsChecking(true);
    const result = await checkEnglishContentApi({ force: true });
    setCheckResult(result);
    setIsChecking(false);
  }

  if (!context) {
    return <main className="english-today-page"><p>Đang tải English hôm nay…</p></main>;
  }

  return (
    <main className="english-today-page">
      <div className="english-today-topbar">
        <div className="english-today-crumb">English <span aria-hidden="true">/</span> <b>Today’s English</b></div>
        <div className="english-today-tag">Daily English</div>
      </div>

      <section className="english-today-hero">
        <article className="english-today-card english-today-context">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#18253a' }}>Tiến độ</span>
            <div className="english-donut" aria-label={`Tiến độ ${overallProgress}%`}>
              <svg viewBox="0 0 42 42" width="72" height="72">
                <circle cx="21" cy="21" r="18" fill="none" stroke="#e7e5de" strokeWidth="4" />
                <circle
                  cx="21" cy="21" r="18" fill="none"
                  stroke={overallProgress >= 80 ? '#2f7a55' : overallProgress >= 50 ? '#b7791f' : '#c0392b'}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(overallProgress / 100) * 113.1} 113.1`}
                  transform="rotate(-90 21 21)"
                />
                <text x="21" y="24" textAnchor="middle" fontSize="11" fontWeight="700" fill="#18253a">
                  {overallProgress}%
                </text>
              </svg>
            </div>
          </div>
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
          <p>Bản đang dùng: {content.version} · cập nhật {content.updatedAt}</p>
          <p aria-live="polite">{describeCheckResult(checkResult, isChecking)}</p>
          <button
            className="english-today-button secondary"
            type="button"
            disabled={isChecking}
            onClick={() => void handleRefresh()}
          >
            {isChecking ? 'Đang kiểm tra…' : 'Kiểm tra bản mới'}
          </button>
          <p>Nội dung tải dạng JSON; nếu lỗi mạng, ứng dụng dùng bản đóng gói sẵn.</p>
          <p>Tổng thể chỉ đạt 100% khi tất cả chủ đề đạt 100%.</p>
        </aside>
      </section>

      <section className="english-today-section">
        <div className="english-today-section-head">
          <h2>Hôm nay có các chủ đề này. Bạn muốn chọn chủ đề nào để học?</h2>
        </div>
        <div className="english-today-topic-grid">
          {context.topics.filter((topic) => isTopicVisible(topic, today)).map((topic) => {
            const available = isTopicAvailableApi(topic, today);
            const tp = getTopicProgress(progress, topic.id, topic.vocab.map((item) => item.term), topic.grammar.map((item) => item.example));
            return (
              <button
                key={topic.id}
                type="button"
                className={`english-today-topic${available ? '' : ' coming'}`}
                onClick={() => handleSelectTopic(topic)}
                disabled={!available}
              >
                <span className={`english-today-badge ${available ? 'available' : 'coming'}`}>
                  {available ? (topic.daily ? 'Hàng ngày' : 'Có sẵn') : `Coming soon · còn ${daysUntilAvailable(topic, today)} ngày`}
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

      {selectedTopic && (
        <div className="english-timer-modal-backdrop">
          <div className="english-timer-modal" role="dialog" aria-modal="true">
            <h2>{selectedTopic.title}</h2>
            <p>{selectedTopic.description}</p>
            <div className="english-timer-modal-time">
              ⏱ Thời gian làm bài: <strong>{getTopicTimeLimit(selectedTopic)} phút</strong>
            </div>
            <p style={{ fontSize: 12, color: '#697382' }}>
              Hoàn thành tất cả từ vựng, ngữ pháp và hội thoại trước khi hết giờ.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="english-today-button ghost" type="button" onClick={() => setSelectedTopic(null)}>
                Huỷ
              </button>
              <button className="english-today-button" type="button" onClick={startSelectedTopic}>
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function describeCheckResult(
  result: EnglishContentCheckResult | null,
  isChecking: boolean,
): string {
  if (isChecking || result === null) return 'Đang kiểm tra bản mới…';
  switch (result.status) {
    case 'updated':
      return `Đã cập nhật nội dung lên bản ${result.version}.`;
    case 'current':
      return 'Bạn đang dùng bản nội dung mới nhất.';
    case 'fallback':
      return 'Không tải được bản mới. Đang dùng bản đóng gói sẵn.';
    case 'skipped':
      return 'Vừa kiểm tra gần đây. Bấm để kiểm tra lại ngay.';
  }
}

function scoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-low';
}
