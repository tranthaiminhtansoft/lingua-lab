import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodayEnglishContextApi,
  getContentVersionApi,
  isTopicAvailableApi,
} from './services/englishContentApi';
import type { EnglishTopic, TodayEnglishContext } from './content/todayEnglish';
import {
  readProgress,
  getTopicProgress,
} from './progress/englishProgress';
import './todayEnglish.css';

export function TodayEnglishPage() {
  const navigate = useNavigate();
  const [context, setContext] = useState<TodayEnglishContext | null>(null);
  const [progress] = useState(readProgress);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [versionChecked, setVersionChecked] = useState(false);

  useEffect(() => {
    void getTodayEnglishContextApi().then(setContext);
    void getContentVersionApi().then((version) => {
      setRemoteVersion(version.version);
      setVersionChecked(true);
    });
  }, []);

  const availableTopicIds = useMemo(
    () => context?.topics.filter((topic) => isTopicAvailableApi(topic)).map((topic) => topic.id) ?? [],
    [context],
  );

  const overallProgress = useMemo(() => {
    if (availableTopicIds.length === 0) return 0;
    const completed = availableTopicIds.filter((id) => progress.topics[id]?.completed).length;
    return Math.round((completed / availableTopicIds.length) * 100);
  }, [progress, availableTopicIds]);

  function handleSelectTopic(topic: EnglishTopic) {
    if (!isTopicAvailableApi(topic)) {
      window.alert('Chủ đề này đang Coming soon và sẽ mở từ ' + topic.availableFrom + '.');
      return;
    }
    navigate(`/english/${topic.id}`);
  }

  function handleRefresh() {
    window.alert('Đã kiểm tra version. Nếu có bản mới, nội dung sẽ được tải về (MVP dùng bundle local).');
  }

  if (!context) {
    return <main className="english-today-page"><p>Đang tải English hôm nay…</p></main>;
  }

  return (
    <main className="english-today-page">
      <div className="english-today-topbar">
        <div className="english-today-crumb">English <span aria-hidden="true">/</span> <b>Today’s English</b></div>
        <div className="english-today-tag">MVP PREVIEW</div>
      </div>

      <section className="english-today-hero">
        <article className="english-today-card english-today-context">
          <p className="english-today-eyebrow">Hôm nay · Today</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="english-today-title" style={{ margin: 0 }}>{context.date}</h1>
            <span className="english-today-overall">
              Tổng thể: <span className={scoreClass(overallProgress)}>{overallProgress}%</span>
            </span>
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
                className={`english-today-topic${available ? '' : ' coming'}`}
                onClick={() => handleSelectTopic(topic)}
                disabled={!available}
              >
                <span className={`english-today-badge ${available ? 'available' : 'coming'}`}>
                  {available ? (topic.daily ? 'Hàng ngày' : 'Có sẵn') : `Coming soon · ${topic.availableFrom}`}
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
    </main>
  );
}

function scoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-low';
}
