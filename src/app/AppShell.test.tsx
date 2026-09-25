import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';

function renderShell(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<h1>Lessons page</h1>} />
          <Route path="/lessons/kana" element={<h1>Kana page</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

test('mobile menu exposes current page as a non-clickable item and announces its state', () => {
  renderShell('/lessons/kana');

  const menu = screen.getByRole('button', { name: /menu/i });
  expect(menu).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(menu);

  expect(menu).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'Lessons' })).toBeInTheDocument();
  expect(screen.getByText('Kana')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Kana').closest('a')).toBeNull();
});

test('closes the open menu with Escape', () => {
  renderShell('/');
  const menu = screen.getByRole('button', { name: /menu/i });

  fireEvent.click(menu);
  fireEvent.keyDown(menu, { key: 'Escape' });

  expect(menu).toHaveAttribute('aria-expanded', 'false');
});
