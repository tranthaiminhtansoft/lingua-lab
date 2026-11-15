import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';

function renderShell(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/nihongo-o-benkyuo" element={<h1>Lessons page</h1>} />
          <Route path="/nihongo-o-benkyuo/kana" element={<h1>Kana page</h1>} />
          <Route path="/nihongo-o-benkyuo/grammar/first-introductions" element={<h1>First introductions page</h1>} />
          <Route path="/english" element={<h1>English page</h1>} />
          <Route path="/english/:topicId" element={<h1>English topic page</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

test('mobile menu exposes current page as a non-clickable item and announces its state', () => {
  renderShell('/nihongo-o-benkyuo/kana');

  const menu = screen.getByRole('button', { name: /menu/i });
  expect(menu).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(menu);

  expect(menu).toHaveAttribute('aria-expanded', 'true');
  const lessonsParent = screen.getByRole('link', { name: 'Lessons' });
  expect(lessonsParent).toHaveAttribute('href', '/nihongo-o-benkyuo');
  const lessonChildren = screen.getByRole('group', { name: 'Lessons' });
  expect(lessonsParent.parentElement).toContainElement(lessonChildren);
  expect(within(lessonChildren).getByText('Kana')).toHaveAttribute('aria-current', 'page');
  expect(within(lessonChildren).getByRole('link', { name: 'Grammar' })).toHaveAttribute('href', '/nihongo-o-benkyuo/grammar');
  expect(within(lessonChildren).getByRole('link', { name: 'Vocabulary' })).toHaveAttribute('href', '/nihongo-o-benkyuo/vocabulary');
  expect(screen.getByText('Kana')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Kana').closest('a')).toBeNull();
});

test('keeps Grammar selected on its nested topic route', () => {
  renderShell('/nihongo-o-benkyuo/grammar/first-introductions');

  expect(screen.getByRole('heading', { name: 'First introductions page' })).toBeInTheDocument();
  expect(screen.getByText('Grammar', { selector: '.nav-current' })).toHaveAttribute('aria-current', 'page');
});

test('closes the open menu with Escape', () => {
  renderShell('/nihongo-o-benkyuo');
  const menu = screen.getByRole('button', { name: /menu/i });

  fireEvent.click(menu);
  fireEvent.keyDown(menu, { key: 'Escape' });

  expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('hides the top tabs on the English home page', () => {
  renderShell('/english');

  expect(screen.getByRole('heading', { name: 'English page' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull();
  expect(screen.queryByRole('button', { name: /menu/i })).toBeNull();
});

test('opens a menu of other English topics from a topic page', () => {
  renderShell('/english/devops-meeting');

  const menu = screen.getByRole('button', { name: /menu/i });
  expect(menu).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(menu);

  expect(menu).toHaveAttribute('aria-expanded', 'true');
  const topicsGroup = screen.getByRole('group', { name: 'Today’s English' });
  expect(within(topicsGroup).getByText('DevOps team meeting')).toHaveAttribute('aria-current', 'page');
  expect(within(topicsGroup).getByRole('link', { name: 'Morning greetings with neighbors' })).toHaveAttribute('href', '/english/neighbor-morning');
  expect(within(topicsGroup).getByRole('link', { name: 'Autumn routine & energy' })).toHaveAttribute('href', '/english/autumn-routine');
  expect(screen.getByRole('link', { name: 'Today’s English' })).toHaveAttribute('href', '/english');
});
