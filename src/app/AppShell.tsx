import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { lessons } from '../business/lesson-lobby/lessonRegistry';

const navigationItems = [
  { label: 'Lessons', to: '/' },
  ...lessons.map((lesson) => ({ label: lesson.title, to: lesson.path, status: lesson.status })),
];

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return <>
    <header className="site-header">
      <Link className="site-brand" to="/">Nihongo O Benkyou <span lang="ja">日本語</span></Link>
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
        {navigationItems.map((item) => item.to === ''
          ? <span aria-disabled="true" className="nav-disabled" key={item.label}>{item.label} <small>Coming soon</small></span>
          : pathname === item.to
            ? <span aria-current="page" className="nav-current" key={item.to}>{item.label}</span>
            : <Link key={item.to} onClick={() => setIsMenuOpen(false)} to={item.to}>{item.label}</Link>)}
      </nav>
    </header>
    <Outlet />
  </>;
}
