import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { LanguageConstellationPage } from '../business/language-home/LanguageConstellationPage';
import { NihongoPage } from '../business/language-home/nihongo/NihongoPage';
import { KanaPage } from '../business/language-home/nihongo/kana/KanaPage';
import { GrammarPage } from '../business/language-home/nihongo/grammar/GrammarPage';
import { FirstIntroductionsPage } from '../business/language-home/nihongo/grammar/FirstIntroductionsPage';
import { VocabularyPage } from '../business/language-home/nihongo/vocabulary/VocabularyPage';
import { FirstIntroductionsVocabularyPage } from '../business/language-home/nihongo/vocabulary/FirstIntroductionsVocabularyPage';

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
  { path: '/', element: <LanguageConstellationPage /> },
  {
    element: <AppShell />,
    children: [
      { path: 'nihongo-o-benkyuo', element: <NihongoPage /> },
      { path: 'nihongo-o-benkyuo/kana', element: <KanaPage /> },
      { path: 'nihongo-o-benkyuo/grammar', element: <GrammarPage /> },
      { path: 'nihongo-o-benkyuo/grammar/first-introductions', element: <FirstIntroductionsPage /> },
      { path: 'nihongo-o-benkyuo/vocabulary', element: <VocabularyPage /> },
      { path: 'nihongo-o-benkyuo/vocabulary/first-introductions', element: <FirstIntroductionsVocabularyPage /> },
      { path: 'lessons/kana', element: <Navigate replace to="/nihongo-o-benkyuo/kana" /> },
      { path: '*', element: <main><h1>Page not found</h1><p>That lesson is not available.</p></main> },
    ],
  },
], { basename: import.meta.env.BASE_URL });
