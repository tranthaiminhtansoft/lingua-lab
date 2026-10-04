import { Link } from 'react-router-dom';
import { GrammarTopicNavigation } from '../grammar/components/GrammarTopicNavigation';
import { buildSampleCalendar, clockWords, dayPeriods, everyDay, hours, minutes, months, sampleDate, weekdays } from './content/time';
import { Reading } from './TimeReading';
import { InteractiveTimeClock } from './InteractiveTimeClock';
import './time.css';

const timeSections = [
  ['time-months', 'Months'],
  ['time-dates', 'Days & nights'],
  ['time-clock', 'Hours & minutes'],
  ['time-next', 'Keep learning'],
] as const;

export function TimeVocabularyPage() {
  const calendar = buildSampleCalendar();
  return <main className="grammar-page vocabulary-topic-page time-page">
    <header className="grammar-topic-hero">
      <Link className="grammar-back-link" to="/nihongo-o-benkyuo/vocabulary">← Vocabulary topics</Link>
      <p className="grammar-eyebrow">Words for your calendar</p>
      <h1>Time <span lang="ja">時間（じかん）</span> <small lang="ja-Latn">jikan</small></h1>
      <p>Read a date, name the parts of a day, and put a time on the clock.</p>
    </header>

    <GrammarTopicNavigation sections={timeSections} allowCurrentSectionNavigation navigationLabel="Time sections" menuId="time-section-menu" />

    <section className="time-calendar-frame" aria-labelledby="sample-calendar-title">
      <header className="time-calendar-heading">
        <div><p className="grammar-eyebrow">A fixed teaching calendar</p><h2 id="sample-calendar-title">October {sampleDate.year}</h2><Reading entry={months[sampleDate.month - 1]} meaning={false} /></div>
        <p className="time-today-note"><b>Sample today: October {sampleDate.day}, {sampleDate.year}</b><br />This is a learning calendar. “Today” stays on this date, wherever and whenever you study.</p>
      </header>
      <aside className="time-sound-key" aria-label="Reading colors">
        <b>See how the sounds join</b>
        <p>Small gaps separate the parts of a word; pronounce them together. Matching endings keep the same color throughout this lesson.</p>
        <div><span className="time-sound time-sound-shared">Shared ending</span><span className="time-sound time-sound-fun">ふん · fun</span><span className="time-sound time-sound-pun">ぷん · pun</span><span className="time-sound time-sound-repeat">まい · mai · every</span><span className="time-sound time-sound-changed">Special / changed sound</span></div>
        <p>For example, <span lang="ja-Latn">ip + pun</span> joins into <span lang="ja-Latn">ippun</span>: the doubled p reflects the small <span lang="ja">っ</span>. Whole irregular words such as <span lang="ja">ついたち</span> (<span lang="ja-Latn">tsuitachi</span>) stay together.</p>
      </aside>
      <section id="time-months" className="time-frame-section" aria-labelledby="months-title">
        <h3 id="months-title">The twelve months</h3><p>Number + <span lang="ja">月（がつ）</span> <span lang="ja-Latn">gatsu</span>. Shared endings are teal; red marks special number readings.</p>
        <div className="time-months">{months.map((entry) => <div key={entry.japanese}><Reading entry={entry} /></div>)}</div>
      </section>
      <section id="time-dates" className="time-frame-section" aria-labelledby="dates-title">
        <h3 id="dates-title">Days, nights & daily rhythms</h3><p>Read across from Monday to Sunday. Follow October 13–17 for the five relative days and nights. The sample routine and recurring labels appear once, on October 15. Scroll within the calendar to explore the dates; the weekday headings stay visible. On a small screen, scroll sideways to explore the full week.</p>
        <div className="time-calendar-scroll" tabIndex={0} role="region" aria-label="October 2026 calendar, scroll horizontally">
          <table className="time-calendar"><caption>October 2026 · sample today is Thursday the 15th</caption>
            <thead><tr>{weekdays.map((entry) => <th scope="col" key={entry.japanese}><Reading entry={entry} /></th>)}</tr></thead>
            <tbody>{Array.from({ length: 5 }, (_, week) => <tr key={week}>{calendar.slice(week * 7, week * 7 + 7).map((cell, column) => <td key={column} className={cell?.day === sampleDate.day ? 'time-sample-today' : undefined} data-day={cell?.day}>
              {cell && <><b className="time-date-number">{cell.day}</b><Reading entry={cell.date} meaning={false} />
                {cell.relative && <div className="time-relative-day"><Reading entry={cell.relative.day} /></div>}
                {cell.day === sampleDate.day && <div className="time-daily-repeat"><Reading entry={everyDay} /></div>}
                {cell.day === sampleDate.day && <div className="time-periods">{dayPeriods.map((period, index) => <div className={`time-period time-period-${index}`} key={period.word.japanese}>
                  <span className="time-period-icon" aria-hidden="true">{period.icon}</span><Reading entry={period.word} /><Reading entry={period.repeat} />
                  {index === 3 && cell.relative && <div className="time-relative-night"><Reading entry={cell.relative.night} /></div>}
                </div>)}</div>}
                {cell.relative && cell.day !== sampleDate.day && <div className="time-relative-night">
                  <span className="time-period-icon" aria-hidden="true">☾</span><Reading entry={cell.relative.night} />
                </div>}
              </>}
            </td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="grammar-source-note">Afternoon follows noon; evening is the late afternoon around sunset; night is after dark. These are everyday labels, not fixed clock boundaries. The first day of a month is <span lang="ja">ついたち</span> (<span lang="ja-Latn">tsuitachi</span>); “one day” is <span lang="ja">いちにち</span> (<span lang="ja-Latn">ichinichi</span>).</p>
      </section>
      <section id="time-clock" className="time-frame-section" aria-labelledby="clock-title">
        <p className="grammar-eyebrow">From calendar to clock</p><h3 id="clock-title">Hours & minutes</h3>
        <div className="time-clock-words">{clockWords.map((entry) => <Reading entry={entry} key={entry.japanese} />)}</div>
        <p>Put a.m. or p.m. before the hour. Put half past after the hour in place of thirty minutes.</p>
        <h4>The twelve hours · <span lang="ja">時（じ）</span> <span lang="ja-Latn">ji</span></h4>
        <div className="time-clock-grid time-hour-grid" aria-label="Hour readings">{hours.map((entry) => <Reading entry={entry} key={entry.japanese} />)}</div>
        <h4>The first ten minutes · <span lang="ja">分（ふん／ぷん）</span> <span lang="ja-Latn">fun / pun</span></h4>
        <aside className="time-minute-rule"><b>Listen for sound changes</b><p>Use <span lang="ja">ぷん</span> (<span lang="ja-Latn">pun</span>) after endings 1, 3, 4, 6, 8 and 10; use <span lang="ja">ふん</span> (<span lang="ja-Latn">fun</span>) after 2, 5, 7 and 9. Endings 1, 6, 8 and 10 also shorten the number: <span lang="ja">いっ・ろっ・はっ・じゅっ</span> (<span lang="ja-Latn">ip- / rop- / hap- / jup-</span>). Apply the same ending inside compound numbers. Alternative readings are marked “Also”.</p></aside>
        <div className="time-clock-grid" aria-label="Minute readings">{minutes.slice(0, 10).map((entry) => <Reading entry={entry} key={entry.japanese} />)}</div>
        <InteractiveTimeClock />
      </section>
      <footer id="time-next" className="time-frame-section">
        <h3>Keep learning</h3><Link className="grammar-primary-link" to="/nihongo-o-benkyuo/grammar/question-types#when">When & what time? →</Link>
        <p className="grammar-source-note">Reading references: <a href="https://jica-van-cms.jica.go.jp/custom/.assets/%E8%8B%B1%E8%AA%9E.pdf">JICA Japanese language handbook</a> · <a href="https://www.busuu.com/en/japanese/time">Busuu: telling the time</a>.</p>
      </footer>
    </section>
  </main>;
}
