import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NumbersMatrixView, NumbersPage } from './NumbersPage';

function renderTableView() {
  render(<MemoryRouter><NumbersMatrixView /></MemoryRouter>);
}

describe('Numbers lesson', () => {
  it('restores the side section menu and exposes its major sections', () => {
    render(<MemoryRouter><NumbersPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Open number sections' }));
    const navigation = screen.getByRole('navigation', { name: 'Number sections' });
    expect(within(navigation).getByRole('link', { name: 'Ones' })).toHaveAttribute('href', '#number-step-ones');
    expect(within(navigation).getByRole('link', { name: 'Hundreds' })).toHaveAttribute('href', '#number-step-hundreds');
    expect(within(navigation).getByRole('link', { name: 'Examples' })).toHaveAttribute('href', '#number-ladder-examples-title');
  });

  it('uses only the number ladder and explains sound-changed readings in the group panel', () => {
    render(<MemoryRouter><NumbersPage /></MemoryRouter>);
    expect(screen.getAllByRole('heading', { name: 'Ones' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: 'Ten-thousands' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('group', { name: 'Choose number layout' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Original table' })).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const changedReading = screen.getByText('三百', { selector: '.number-value' }).closest('article')!;
    const notesButton = within(changedReading).getByRole('button', { name: 'Reading notes' });
    fireEvent.click(notesButton);
    expect(notesButton).toHaveAttribute('aria-expanded', 'true');
    const notesPanel = screen.getByRole('complementary', { name: 'Reading notes for 三百' });
    expect(notesPanel).toHaveTextContent('さん + ひゃく → さんびゃく');
    expect(notesPanel).toHaveTextContent('3 × 100 = 300');
    fireEvent.click(within(notesPanel).getByRole('button', { name: 'Close reading notes' }));
    expect(screen.queryByRole('complementary', { name: 'Reading notes for 三百' })).not.toBeInTheDocument();
  });

  it('renders a five-column, nine-row table and seven grounded examples', () => {
    renderTableView();
    const table = screen.getByRole('table', { name: /Japanese numbers/i });
    expect(within(table).getAllByRole('row')).toHaveLength(10);
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    expect(screen.getAllByText('し', { exact: true }).every((reading) => reading.classList.contains('number-alternative'))).toBe(true);
    expect(screen.getAllByRole('article', { name: /Example/i })).toHaveLength(7);
    expect(screen.getAllByTestId('number-composition')).toHaveLength(52);
    expect(screen.getAllByRole('cell').every((cell) => within(cell).getByLabelText(/Number composition/))).toBe(true);
    expect(screen.getAllByRole('article', { name: /Example/i }).every((example) => within(example).getByLabelText(/Number composition/))).toBe(true);
    const examples = screen.getAllByRole('article', { name: /Example/i });
    expect(examples.map((example) => within(example).getByRole('heading').nextElementSibling?.textContent)).toEqual(['十一', '五百六十七', '二千四百八十一', '一万五十九', '三十三万四百七十九', '百万', '十億']);
    for (const element of screen.getAllByTestId('number-composition')) {
      const equation = element.querySelector('.number-composition-equation')?.textContent ?? '';
      const [left, right] = equation.split(' = ');
      const total = left.split(' + ').reduce((sum, term) => {
        const multiplication = term.match(/^([\d,]+) × ([\d,]+)$/);
        return sum + (multiplication ? Number(multiplication[1].replaceAll(',', '')) * Number(multiplication[2].replaceAll(',', '')) : Number(term.replaceAll(',', '')));
      }, 0);
      expect(total).toBe(Number(right.replaceAll(',', '')));
      expect(total).toBe(Number(element.closest('td, article')?.querySelector<HTMLElement>('.number-value')?.dataset.number));
    }
    expect(screen.getByRole('link', { name: /Mami Suzuki/i })).toHaveAttribute('href', 'https://www.tofugu.com/japanese/counting-in-japanese/');
    expect(screen.getByRole('link', { name: /Back to Nihongo lessons/i })).toHaveAttribute('href', '/nihongo-o-benkyuo');
  });

  it('renders composed million and billion examples with aligned, accessible readings and attribution', () => {
    renderTableView();
    const million = screen.getByRole('article', { name: /Example: Million/i });
    expect(within(million).getByText('百万', { selector: '.number-value' })).toBeInTheDocument();
    expect(within(million).getByText('ひゃく')).toBeInTheDocument();
    expect(within(million).getByText('hyaku')).toBeInTheDocument();
    expect(within(million).getByText('まん')).toBeInTheDocument();
    expect(within(million).getByText('man')).toBeInTheDocument();
    expect(within(million).getByLabelText('Complete reading')).toHaveTextContent('ひゃくまん / hyakuman');
    const billion = screen.getByRole('article', { name: /Example: Billion/i });
    expect(within(billion).getByText('十億', { selector: '.number-value' })).toBeInTheDocument();
    expect(within(billion).getByText('じゅう')).toBeInTheDocument();
    expect(within(billion).getByText('おく')).toBeInTheDocument();
    expect(within(billion).getByText('jū')).toBeInTheDocument();
    expect(within(billion).getByText('oku')).toBeInTheDocument();
    expect(within(billion).getByLabelText('Complete reading')).toHaveTextContent('じゅうおく / jūoku');
    expect(screen.getByRole('link', { name: /Mami Suzuki/i })).toHaveAttribute('href', 'https://www.tofugu.com/japanese/counting-in-japanese/');
    expect(within(million).queryByRole('cell')).not.toBeInTheDocument();
  });

  it('shows kana units paired with romaji and labels source-supported alternative registers', () => {
    renderTableView();
    const cells = screen.getAllByRole('cell');
    const cell = cells.find((item) => item.querySelector<HTMLElement>('.number-value')?.dataset.number === '40');
    expect(cell).toBeDefined();
    expect(within(cell!).getByLabelText('Complete reading')).toHaveTextContent('よんじゅう / yonjū');
    expect(within(cell!).getByLabelText('Reading unit よ yo')).toBeInTheDocument();
    expect(within(cell!).getByLabelText('Reading unit ん n')).toBeInTheDocument();
    expect(within(cell!).getByLabelText('Reading unit じゅう jū')).toBeInTheDocument();
    expect(within(cell!).getByText(/Alternate reading: Rare \/ archaic/)).toBeInTheDocument();
    expect(within(cell!).getByLabelText('Alternate reading: しじゅう / shijū')).toBeInTheDocument();
    expect(screen.queryByText('Casual')).not.toBeInTheDocument();
    const ten = cells.find((item) => item.querySelector<HTMLElement>('.number-value')?.dataset.number === '10');
    expect(ten).toBeDefined();
    expect(within(ten!).getByText('十', { selector: '.number-value' })).toBeInTheDocument();
    expect(within(ten!).getByLabelText('Reading unit じゅう jū')).toBeInTheDocument();
    expect(within(ten!).getByTestId('number-composition').querySelector('.number-composition-phonetics')).not.toBeInTheDocument();
    expect(within(ten!).getByTestId('number-composition')).not.toHaveTextContent('いちじゅう');
    expect(within(ten!).queryByText('じ', { exact: true })).not.toBeInTheDocument();
    expect(within(ten!).getByLabelText('Complete reading')).toHaveTextContent('じゅう / jū');
    for (const [number, kanji, kana, romaji] of [[100, '百', 'ひゃく', 'hyaku'], [1000, '千', 'せん', 'sen']] as const) {
      const cellForPlace = cells.find((item) => item.querySelector<HTMLElement>('.number-value')?.dataset.number === String(number))!;
      expect(within(cellForPlace).getByText(kanji, { selector: '.number-value' })).toBeInTheDocument();
      const composition = within(cellForPlace).getByTestId('number-composition');
      expect(composition).not.toHaveTextContent(kana);
      expect(composition).not.toHaveTextContent(romaji);
      expect(composition).not.toHaveTextContent(number === 100 ? 'いちひゃく' : 'いちせん');
    }
  });

  it('shows arithmetic components independently from sound-changed readings', () => {
    renderTableView();
    const cells = screen.getAllByRole('cell');
    for (const number of [300, 600, 800, 3000, 8000]) {
      const cell = cells.find((item) => item.querySelector<HTMLElement>('.number-value')?.dataset.number === String(number));
      expect(cell && within(cell).getByLabelText(/Number composition/)).toBeInTheDocument();
    }
    const changed = cells.find((item) => item.querySelector<HTMLElement>('.number-value')?.dataset.number === '300')!;
    expect(within(changed).getByLabelText(/Number composition/)).toHaveTextContent('3 × 100 = 300');
    expect(within(changed).getByLabelText(/Number composition/)).toHaveTextContent('さん + ひゃく → さんびゃく');
    expect(within(changed).getByLabelText('Complete reading')).toHaveTextContent('さんびゃく');
    const example = screen.getByRole('article', { name: /Example: Ten-thousands/i });
    expect(within(example).getByLabelText(/Number composition/)).toHaveTextContent('33 × 10,000 + 4 × 100 + 7 × 10 + 9 = 330,479');
    for (const element of screen.getAllByTestId('number-composition')) {
      if (element.closest('td')) {
        const number = Number(element.closest('td')?.querySelector<HTMLElement>('.number-value')?.dataset.number);
        if ([300, 600, 800, 3000, 8000].includes(number)) {
          expect(element.querySelector('.number-composition-phonetics')).toBeInTheDocument();
          expect(element.querySelectorAll('.number-composition-phonetics .number-kana')).toHaveLength(element.querySelectorAll('.number-composition-phonetics .number-romaji').length);
        } else {
          expect(element.querySelector('.number-composition-phonetics')).not.toBeInTheDocument();
        }
      }
    }
  });
});
