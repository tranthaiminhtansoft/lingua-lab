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
  expect(within(lessonChildren).getByText('Grammar').closest('.nav-disabled')).toHaveAttribute('aria-disabled', 'true');
  expect(within(lessonChildren).getByText('Vocabulary').closest('.nav-disabled')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText('Kana')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Kana').closest('a')).toBeNull();
});

test('closes the open menu with Escape', () => {
  renderShell('/nihongo-o-benkyuo');
  const menu = screen.getByRole('button', { name: /menu/i });

  fireEvent.click(menu);
  fireEvent.keyDown(menu, { key: 'Escape' });

  expect(menu).toHaveAttribute('aria-expanded', 'false');
});
