import { expect, test, vi } from 'vitest';
import { buildSampleCalendar, clockExamples, clockWords, dayBoundaryWords, dayPeriods, dates, everyDay, hours, minutes, months, relativeDays, relativeMornings, relativeNights, weekdays } from './time';

test('teaching calendar aligns October 2026 and anchors relative days regardless of device time', () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date('2040-02-01T23:00:00Z'));
    const calendar = buildSampleCalendar();
    expect(calendar.slice(0, 3)).toEqual([null, null, null]);
    expect(calendar[3]?.day).toBe(1);
    expect(calendar[17]?.day).toBe(15); // Thursday, with Monday as column zero.
    expect(calendar.filter((cell) => cell?.relative).map((cell) => [cell?.day, cell?.relative?.day.meaning, cell?.relative?.night.meaning])).toEqual([
      [13, 'The day before yesterday', 'The night before last'], [14, 'Yesterday', 'Last night'],
      [15, 'Today', 'Tonight'], [16, 'Tomorrow', 'Tomorrow night'], [17, 'The day after tomorrow', 'The night after next'],
    ]);
    expect(calendar.filter((cell) => cell?.relative).map((cell) => [cell?.day, cell?.relative?.morning.meaning])).toEqual([
      [13, 'The morning before yesterday'], [14, 'Yesterday morning'], [15, 'This morning'],
      [16, 'Tomorrow morning'], [17, 'The morning after tomorrow'],
    ]);
    expect(calendar.filter(Boolean)).toHaveLength(31);
  } finally { vi.useRealTimers(); }
});

test('complete reading sets preserve counter-specific irregular pronunciations', () => {
  expect([dates.length, months.length, hours.length, minutes.length]).toEqual([31, 12, 12, 59]);
  expect([dates[0].kana, dates[19].kana, dates[23].kana, dates[28].kana]).toEqual(['ついたち', 'はつか', 'にじゅうよっか', 'にじゅうくにち']);
  expect(dates[13].parts?.map(({ kana, romaji }) => [kana, romaji])).toEqual([['じゅう', 'jū'], ['よっ', 'yok'], ['か', 'ka']]);
  expect(dates[23].parts?.map(({ kana, romaji }) => [kana, romaji])).toEqual([['に', 'ni'], ['じゅう', 'jū'], ['よっ', 'yok'], ['か', 'ka']]);
  expect([hours[3].kana, hours[6].kana, hours[8].kana]).toEqual(['よじ', 'しちじ', 'くじ']);
  expect([minutes[0].kana, minutes[5].kana, minutes[17].kana, minutes[29].kana, minutes[58].kana]).toEqual(['いっぷん', 'ろっぷん', 'じゅうはっぷん', 'さんじゅっぷん', 'ごじゅうきゅうふん']);
  expect(minutes[39].alternative?.kana).toBe('よんじっぷん');
});

test('daily period vocabulary includes noon and matching every-period readings', () => {
  expect(dayPeriods.map(({ word: period, repeat }) => [period.meaning, period.kana, period.romaji, repeat.meaning])).toEqual([
    ['Morning', 'あさ', 'asa', 'Every morning'],
    ['Noon', 'しょうご', 'shōgo', 'Every noon'],
    ['Afternoon', 'ごご', 'gogo', 'Every afternoon'],
    ['Evening', 'ゆうがた', 'yūgata', 'Every evening'],
    ['Night', 'よる', 'yoru', 'Every night'],
  ]);
  expect(dayPeriods.map(({ icon }) => icon)).toEqual(['🌅', '☀', '🌤', '☀︎☾', '☾']);
  expect(dayBoundaryWords.map(({ japanese, kana, romaji, meaning }) => [japanese, kana, romaji, meaning])).toEqual([
    ['日の出', 'ひので', 'hinode', 'Sunrise'], ['日の入り', 'ひのいり', 'hinoiri', 'Sunset'],
  ]);
});

test('sound segmentation retains every complete pronunciation, including alternatives', () => {
  const words = [...weekdays, ...months, ...dates, ...hours, ...minutes, ...clockExamples, ...clockWords,
    ...relativeDays, ...relativeMornings, ...relativeNights, everyDay, ...dayPeriods.flatMap((period) => [period.word, period.repeat])];
  for (const entry of words) {
    for (const reading of [entry, entry.alternative].filter((value) => value !== undefined)) {
      if (!reading.parts) continue;
      expect(reading.parts.map((part) => part.kana).join('')).toBe(reading.kana);
      expect(reading.parts.map((part) => part.romaji).join('')).toBe(reading.romaji.replaceAll(' ', ''));
    }
  }
});
