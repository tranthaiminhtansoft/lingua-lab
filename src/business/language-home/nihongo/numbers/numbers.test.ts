import { describe, expect, it } from 'vitest';
import { numberGroups } from './content/numbers';

type NumberEntry = (typeof numberGroups)[number]['entries'][number];

describe('Japanese number reference data', () => {
  it('contains five ordered groups of nine unique, fully specified numbers', () => {
    const expected = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [10, 20, 30, 40, 50, 60, 70, 80, 90],
      [100, 200, 300, 400, 500, 600, 700, 800, 900],
      [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000],
      [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000],
    ];
    const entries: NumberEntry[] = numberGroups.flatMap((group) => [...group.entries]);

    expect(numberGroups).toHaveLength(5);
    expect(numberGroups.map((group) => group.entries.map((entry) => entry.number))).toEqual(expected);
    expect(entries).toHaveLength(45);
    expect(new Set(entries.map((entry) => entry.number)).size).toBe(45);
    for (const entry of entries) {
      expect(entry.kana).toMatch(/^[\p{Script=Hiragana}ー]+$/u);
      expect(entry.romaji).toMatch(/^[a-zāīūēō]+$/);
    }
  });

  it('records evidenced common alternatives and irregular unit readings with context', () => {
    const entries: NumberEntry[] = numberGroups.flatMap((group) => [...group.entries]);
    const entry = (number: number) => entries.find((item) => item.number === number);

    expect(entry(4)?.alternatives).toContainEqual(expect.objectContaining({ kana: 'し', context: expect.stringContaining('death') }));
    expect(entry(70)?.alternatives).toContainEqual(expect.objectContaining({ kana: 'しちじゅう', context: expect.stringContaining('older') }));
    expect(entry(300)?.kana).toBe('さんびゃく');
    expect(entry(600)?.kana).toBe('ろっぴゃく');
    expect(entry(8000)?.kana).toBe('はっせん');
    expect(entry(400)?.alternatives).toEqual([]);
  });
});
