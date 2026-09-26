import { Link } from 'react-router-dom';

export function LanguageConstellationPage() {
  return (
    <main className="language-home">
      <div className="language-home-shell">
        <header className="language-home-top">
          <div className="language-home-brand">Lingua Lab</div>
          <div className="language-home-tag">Choose a constellation</div>
        </header>

        <section aria-labelledby="language-home-title" className="language-home-hero">
          <h1 aria-label="Find your language." id="language-home-title">Find your<br />language.</h1>
          <p>Two worlds are waiting in the same sky. Start wherever curiosity pulls you.</p>
        </section>

        <section aria-label="Language constellations" className="language-sky">
          <div aria-hidden="true" className="language-orbit" />
          <div aria-hidden="true" className="language-orbit language-orbit-two" />
          <svg aria-hidden="true" className="language-constellation-lines" viewBox="0 0 1000 470" preserveAspectRatio="none">
            <path d="M260 205 C390 85 590 115 745 360" fill="none" stroke="#506b92" strokeDasharray="5 12" strokeWidth="1.5" />
            <path d="M260 205 C380 290 535 290 745 360" fill="none" opacity=".45" stroke="#506b92" strokeWidth="1" />
          </svg>
          <Link aria-label="Explore Nihongo learning path" className="language-constellation language-nihongo" to="/nihongo-o-benkyuo">
            <span>
              <b lang="ja">あ</b>
              <span>Nihongo</span>
            </span>
          </Link>
          <div aria-label="English learning path coming soon" className="language-constellation language-english" role="img">
            <span>
              <b>A</b>
              <span>English</span>
              <small>Coming soon</small>
            </span>
          </div>
          <i aria-hidden="true" className="language-small-star language-star-one">✦</i>
          <i aria-hidden="true" className="language-small-star language-star-two">✧</i>
          <i aria-hidden="true" className="language-small-star language-star-three">✦</i>
        </section>

        <p className="language-home-hint">Begin with Nihongo; English is coming soon.</p>
        <footer className="language-home-foot">
          <span>One sky · many ways to learn</span>
          <span>Find your next learning path</span>
        </footer>
      </div>
    </main>
  );
}
