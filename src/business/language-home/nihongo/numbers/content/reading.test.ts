import { describe, expect, it } from 'vitest';
import { numberGroups } from './numbers';
import { readingUnits } from './reading';

describe('readingUnits', () => {
  it('reconstructs kana and romanization for every table and alternate reading', () => {
    for (const entry of numberGroups.flatMap((group) => [...group.entries])) {
      for (const reading of [entry, ...entry.alternatives]) {
        const units = readingUnits(reading.kana, reading.romaji);
        expect(units.map((unit) => unit.kana).join('')).toBe(reading.kana);
        expect(units.map((unit) => unit.romaji).join('')).toBe(reading.romaji);
        expect(units.every((unit) => unit.romaji.length > 0)).toBe(true);
      }
    }
  });

  it('groups small-kana digraphs and long vowels without shifting alignment', () => {
    expect(readingUnits('よんじゅう', 'yonjū')).toEqual([
      { kana: 'よ', romaji: 'yo' }, { kana: 'ん', romaji: 'n' }, { kana: 'じゅう', romaji: 'jū' },
    ]);
    expect(readingUnits('ひゃくまん', 'hyakuman')).toEqual([
      { kana: 'ひゃ', romaji: 'hya' }, { kana: 'く', romaji: 'ku' }, { kana: 'ま', romaji: 'ma' }, { kana: 'ん', romaji: 'n' },
    ]);
  });
});