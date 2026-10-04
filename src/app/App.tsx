import { Navigate, Route, Routes } from 'react-router-dom';
import { LanguageConstellationPage } from '../business/language-home/LanguageConstellationPage';
import { NihongoPage } from '../business/language-home/nihongo/NihongoPage';
import { KanaPage } from '../business/language-home/nihongo/kana/KanaPage';
import { GrammarPage } from '../business/language-home/nihongo/grammar/GrammarPage';
import { FirstIntroductionsPage } from '../business/language-home/nihongo/grammar/FirstIntroductionsPage';
import { QuestionTypesPage } from '../business/language-home/nihongo/grammar/QuestionTypesPage';
import { VocabularyPage } from '../business/language-home/nihongo/vocabulary/VocabularyPage';
import { FirstIntroductionsVocabularyPage } from '../business/language-home/nihongo/vocabulary/FirstIntroductionsVocabularyPage';
import { TimeVocabularyPage } from '../business/language-home/nihongo/vocabulary/TimeVocabularyPage';
import { AppShell } from './AppShell';

export default function App() {
  return <Routes>
    <Route path="/" element={<LanguageConstellationPage />} />
    <Route element={<AppShell />}>
      <Route path="/nihongo-o-benkyuo" element={<NihongoPage />} />
      <Route path="/nihongo-o-benkyuo/kana" element={<KanaPage />} />
      <Route path="/nihongo-o-benkyuo/grammar" element={<GrammarPage />} />
      <Route path="/nihongo-o-benkyuo/grammar/first-introductions" element={<FirstIntroductionsPage />} />
      <Route path="/nihongo-o-benkyuo/grammar/question-types" element={<QuestionTypesPage />} />
      <Route path="/nihongo-o-benkyuo/vocabulary/time" element={<TimeVocabularyPage />} />
      <Route path="/nihongo-o-benkyuo/vocabulary" element={<VocabularyPage />} />
      <Route path="/nihongo-o-benkyuo/vocabulary/first-introductions" element={<FirstIntroductionsVocabularyPage />} />
      <Route path="/lessons/kana" element={<Navigate replace to="/nihongo-o-benkyuo/kana" />} />
      <Route path="*" element={<main><h1>Page not found</h1><p>That lesson is not available.</p></main>} />
    </Route>
  </Routes>;
}
