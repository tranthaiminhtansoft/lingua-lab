import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { lessons } from '../business/language-home/nihongo/lessonRegistry';

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

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
          {pathname === '/nihongo-o-benkyuo'
            ? <span aria-current="page" className="nav-current" id="lessons-nav-parent">Lessons</span>
            : <Link id="lessons-nav-parent" onClick={() => setIsMenuOpen(false)} to="/nihongo-o-benkyuo">Lessons</Link>}
          <div aria-labelledby="lessons-nav-parent" className="nav-lesson-children" role="group">
            {lessons.map((lesson) => lesson.path === ''
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
