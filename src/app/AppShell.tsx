import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { lessons } from '../business/language-home/nihongo/lessonRegistry';
import {
  getTodayEnglishContext,
  isTopicAvailable,
} from '../business/language-home/english/content/todayEnglish';

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isEnglishHome = pathname === '/english';
  const isEnglishTopic = pathname.startsWith('/english/');
  const englishTopics = isEnglishTopic
    ? getTodayEnglishContext().topics.filter((topic) => isTopicAvailable(topic))
    : [];
  const headerClass = [
    'site-header',
    isEnglishHome ? 'english-home-header' : '',
    isEnglishTopic ? 'english-topic-header' : '',
  ].filter(Boolean).join(' ');

  return <>
    <header className={headerClass}>
      <Link className="site-brand" to="/">Lingua Lab</Link>
      {!isEnglishHome && (
        <>
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
              {isEnglishTopic
                ? <Link id="lessons-nav-parent" onClick={() => setIsMenuOpen(false)} to="/english">Today’s English</Link>
                : pathname === '/nihongo-o-benkyuo'
                  ? <span aria-current="page" className="nav-current" id="lessons-nav-parent">Lessons</span>
                  : <Link id="lessons-nav-parent" onClick={() => setIsMenuOpen(false)} to="/nihongo-o-benkyuo">Lessons</Link>}
              <div aria-labelledby="lessons-nav-parent" className="nav-lesson-children" role="group">
                {isEnglishTopic
                  ? englishTopics.map((topic) => {
                      const path = `/english/${topic.id}`;
                      return pathname === path
                        ? <span aria-current="page" className="nav-current" key={topic.id}>{topic.title}</span>
                        : <Link key={topic.id} onClick={() => setIsMenuOpen(false)} to={path}>{topic.title}</Link>;
                    })
                  : lessons.map((lesson) => lesson.path === ''
                    ? <span aria-disabled="true" className="nav-disabled" key={lesson.id}>{lesson.title} <small>Coming soon</small></span>
                    : pathname === lesson.path || pathname.startsWith(`${lesson.path}/`)
                      ? <span aria-current="page" className="nav-current" key={lesson.id}>{lesson.title}</span>
                      : <Link key={lesson.id} onClick={() => setIsMenuOpen(false)} to={lesson.path}>{lesson.title}</Link>)}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
    <Outlet />
  </>;
}
