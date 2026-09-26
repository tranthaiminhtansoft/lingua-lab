import { Navigate, Route, Routes } from 'react-router-dom';
import { LanguageConstellationPage } from '../business/language-home/LanguageConstellationPage';
import { NihongoPage } from '../business/language-home/nihongo/NihongoPage';
import { KanaPage } from '../business/language-home/nihongo/kana/KanaPage';
import { AppShell } from './AppShell';

export default function App() {
  return <Routes>
    <Route path="/" element={<LanguageConstellationPage />} />
    <Route element={<AppShell />}>
      <Route path="/nihongo-o-benkyuo" element={<NihongoPage />} />
      <Route path="/nihongo-o-benkyuo/kana" element={<KanaPage />} />
      <Route path="/lessons/kana" element={<Navigate replace to="/nihongo-o-benkyuo/kana" />} />
      <Route path="*" element={<main><h1>Page not found</h1><p>That lesson is not available.</p></main>} />
    </Route>
  </Routes>;
}
