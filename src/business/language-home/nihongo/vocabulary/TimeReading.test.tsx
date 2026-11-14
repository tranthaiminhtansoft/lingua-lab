import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Reading } from './TimeReading';
import { clockExamples, clockWords, dayBoundaryWords, dayPeriods, dates, everyDay, hours, minutes, months, relativeDays, relativeMornings, relativeNights, weekdays } from './content/time';

const entries = [...weekdays, ...months, ...dates, ...relativeDays, ...relativeMornings, ...relativeNights, ...dayBoundaryWords, everyDay,
  ...dayPeriods.flatMap(({ word, repeat }) => [word, repeat]), ...hours, ...minutes, ...clockWords, ...clockExamples];

function expectAligned(container: HTMLElement, selector: string, reading: { kana: string; romaji: string; parts?: { kana: string; romaji: string }[] }) {
  const groups = [...container.querySelectorAll<HTMLElement>(selector)];
  const expected = reading.parts?.map(({ kana, romaji }) => [kana, romaji]) ?? [[reading.kana, reading.romaji]];
  expect(groups.map((group) => [group.querySelector('[lang="ja"]')?.textContent, group.querySelector('[lang="ja-Latn"]')?.textContent])).toEqual(expected);
}

test('pairs every vocabulary reading part with its romaji directly underneath', () => {
  const { container } = render(<>{entries.map((entry) => <Reading entry={entry} key={entry.japanese} meaning={false} />)}</>);
  const readings = [...container.querySelectorAll<HTMLElement>('.time-reading')];
  expect(readings).toHaveLength(entries.length);
  readings.forEach((reading, index) => {
    expectAligned(reading, ':scope > .time-aligned-parts > .time-aligned-part', entries[index]);
    if (entries[index].alternative) {
      expectAligned(reading, ':scope > .time-alternative .time-aligned-parts > .time-aligned-part', entries[index].alternative!);
    }
  });
});
