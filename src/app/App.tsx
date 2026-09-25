import { Route, Routes } from 'react-router-dom';
import { LessonLobbyPage } from '../business/lesson-lobby/LessonLobbyPage';
import { KanaPage } from '../business/kana/KanaPage';
import { AppShell } from './AppShell';

export default function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route index element={<LessonLobbyPage />} />
      <Route path="/lessons/kana" element={<KanaPage />} />
      <Route path="*" element={<main><h1>Page not found</h1><p>That lesson is not available.</p></main>} />
    </Route>
  </Routes>;
}
