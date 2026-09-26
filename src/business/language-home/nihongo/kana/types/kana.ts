export type KanaGroup = 'basic' | 'dakuten' | 'handakuten';

export interface KanaEntry {
  hiragana: string;
  katakana: string;
  romaji: string;
  group: KanaGroup;
}

export type SoundMarkEntry = readonly [hiragana: string, katakana: string, romaji: string, meaning?: string];
