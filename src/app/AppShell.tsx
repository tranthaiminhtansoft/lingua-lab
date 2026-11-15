import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { lessons } from '../business/language-home/nihongo/lessonRegistry';
import { getTodayEnglishContext } from '../business/language-home/english/content/todayEnglish';

function getDailyEnglishTopics() {
  return getTodayEnglishContext().topics.filter((topic) => topic.daily);
}

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isEnglish = pathname.startsWith('/english');
  const englishTopics = isEnglish ? getDailyEnglishTopics() : [];
  const isEnglishHome = pathname === '/english';

  return <>
    <header className="site-header">
      <Link className="site-brand" to="/">Lingua Lab</Link>
      <button
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        className="menu-toggle"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => { if (event.key === 'Escape') setIsMenuOpen(false); }}
        type="button"
      >
        <span aria-hidden="true">☰</span><span className="visually-hidden">Menu</span>
      </button>
      <nav aria-label="Primary" data-open={isMenuOpen} id="primary-navigation">
        <div className="nav-lessons">
          {isEnglish
            ? isEnglishHome
              ? <span aria-current="page" className="nav-current" id="lessons-nav-parent">English</span>
              : <Link id="lessons-nav-parent" onClick={() => setIsMenuOpen(false)} to="/english">English</Link>
            : pathname === '/nihongo-o-benkyuo'
              ? <span aria-current="page" className="nav-current" id="lessons-nav-parent">Lessons</span>
              : <Link id="lessons-nav-parent" onClick={() => setIsMenuOpen(false)} to="/nihongo-o-benkyuo">Lessons</Link>}
          <div aria-labelledby="lessons-nav-parent" className="nav-lesson-children" role="group">
            {isEnglish
              ? <>
                  {isEnglishHome
                    ? <span aria-current="page" className="nav-current">Today’s English</span>
                    : <Link onClick={() => setIsMenuOpen(false)} to="/english">Today’s English</Link>}
                  {englishTopics.map((topic) => {
                    const path = `/english/${topic.id}`;
                    return pathname === path
                      ? <span aria-current="page" className="nav-current" key={topic.id}>{topic.title}</span>
                      : <Link key={topic.id} onClick={() => setIsMenuOpen(false)} to={path}>{topic.title}</Link>;
                  })}
                </>
              : lessons.map((lesson) => lesson.path === ''
                ? <span aria-disabled="true" className="nav-disabled" key={lesson.id}>{lesson.title} <small>Coming soon</small></span>
                : pathname === lesson.path || pathname.startsWith(`${lesson.path}/`)
                  ? <span aria-current="page" className="nav-current" key={lesson.id}>{lesson.title}</span>
                  : <Link key={lesson.id} onClick={() => setIsMenuOpen(false)} to={lesson.path}>{lesson.title}</Link>)}
          </div>
        </div>
      </nav>
    </header>
    <Outlet />
  </>;
}
