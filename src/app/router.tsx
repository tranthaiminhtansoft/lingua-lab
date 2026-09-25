import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { LessonLobbyPage } from '../business/lesson-lobby/LessonLobbyPage';
import { KanaPage } from '../business/kana/KanaPage';

export function restorePagesPath(basePath = import.meta.env.BASE_URL) {
  const fallbackPath = new URLSearchParams(window.location.search).get('p');
  if (!fallbackPath || fallbackPath.startsWith('//')) return;

  const destination = new URL(fallbackPath, window.location.origin);
  if (destination.origin !== window.location.origin) return;

  const fallbackHash = new URLSearchParams(window.location.search).get('h') ?? window.location.hash;
  const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  window.history.replaceState(null, '', `${normalizedBasePath}${destination.pathname}${destination.search}${fallbackHash}`);
}

restorePagesPath();

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <LessonLobbyPage /> },
      { path: 'lessons/kana', element: <KanaPage /> },
      { path: '*', element: <main><h1>Page not found</h1><p>That lesson is not available.</p></main> },
    ],
  },
], { basename: import.meta.env.BASE_URL });
