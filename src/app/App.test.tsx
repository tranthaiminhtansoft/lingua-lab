import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders the source-faithful Kana route inside the host shell', () => {
  render(<MemoryRouter initialEntries={['/lessons/kana']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: /Kana/ })).toBeInTheDocument();
  expect(screen.getByText('Learn one sound at a time')).toBeInTheDocument();
  expect(screen.getByText('Kana', { selector: '.nav-current' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: /Random practice/i })).toBeInTheDocument();
});
