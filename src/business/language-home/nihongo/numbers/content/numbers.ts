// Source: Mami Suzuki, “Japanese Numbers and How to Count ALL of Them”
// https://www.tofugu.com/japanese/counting-in-japanese/
// Sections: Kango basic/alternate readings (lines 95–115), tens (128–269),
// units and sound-change chart (273–315), practice/notes (317–377) in the
// locally captured article. Wago counting is intentionally excluded.
export const numberGroups = [
  {
    id: 'ones',
    entries: [
      { number: 1, kana: 'いち', romaji: 'ichi', alternatives: [] },
      { number: 2, kana: 'に', romaji: 'ni', alternatives: [] },
      { number: 3, kana: 'さん', romaji: 'san', alternatives: [] },
      { number: 4, kana: 'よん', romaji: 'yon', alternatives: [{ kana: 'し', romaji: 'shi', label: 'Alternative', context: 'Often avoided because it sounds like 死 (death).' }] },
      { number: 5, kana: 'ご', romaji: 'go', alternatives: [] },
      { number: 6, kana: 'ろく', romaji: 'roku', alternatives: [] },
      { number: 7, kana: 'なな', romaji: 'nana', alternatives: [{ kana: 'しち', romaji: 'shichi', label: 'Alternative', context: 'なな is more common and avoids confusion with いち or し.' }] },
      { number: 8, kana: 'はち', romaji: 'hachi', alternatives: [] },
      { number: 9, kana: 'きゅう', romaji: 'kyū', alternatives: [{ kana: 'く', romaji: 'ku', label: 'Alternative', context: 'Often avoided because it sounds like 苦 (suffering).' }] },
    ],
  },
  {
    id: 'tens',
    entries: [
      { number: 10, kana: 'じゅう', romaji: 'jū', alternatives: [] },
      { number: 20, kana: 'にじゅう', romaji: 'nijū', alternatives: [] },
      { number: 30, kana: 'さんじゅう', romaji: 'sanjū', alternatives: [] },
      { number: 40, kana: 'よんじゅう', romaji: 'yonjū', alternatives: [{ kana: 'しじゅう', romaji: 'shijū', label: 'Rare / archaic', context: 'An elderly speaker may use it for age; it also appears in older idioms and fixed expressions.' }] },
      { number: 50, kana: 'ごじゅう', romaji: 'gojū', alternatives: [] },
      { number: 60, kana: 'ろくじゅう', romaji: 'rokujū', alternatives: [] },
      { number: 70, kana: 'ななじゅう', romaji: 'nanajū', alternatives: [{ kana: 'しちじゅう', romaji: 'shichijū', label: 'Uncommon / older-speaker', context: 'The article notes older people may use this, but it is not very common.' }] },
      { number: 80, kana: 'はちじゅう', romaji: 'hachijū', alternatives: [] },
      { number: 90, kana: 'きゅうじゅう', romaji: 'kyūjū', alternatives: [{ kana: 'くじゅう', romaji: 'kujū', label: 'Restricted usage', context: 'Not an ordinary numeric alternative; occurs in certain place names such as 九十九里浜.' }] },
    ],
  },
  {
    id: 'hundreds',
    entries: [
      { number: 100, kana: 'ひゃく', romaji: 'hyaku', alternatives: [] },
      { number: 200, kana: 'にひゃく', romaji: 'nihyaku', alternatives: [] },
      { number: 300, kana: 'さんびゃく', romaji: 'sanbyaku', alternatives: [] },
      { number: 400, kana: 'よんひゃく', romaji: 'yonhyaku', alternatives: [] },
      { number: 500, kana: 'ごひゃく', romaji: 'gohyaku', alternatives: [] },
      { number: 600, kana: 'ろっぴゃく', romaji: 'roppyaku', alternatives: [] },
      { number: 700, kana: 'ななひゃく', romaji: 'nanahyaku', alternatives: [] },
      { number: 800, kana: 'はっぴゃく', romaji: 'happyaku', alternatives: [] },
      { number: 900, kana: 'きゅうひゃく', romaji: 'kyūhyaku', alternatives: [] },
    ],
  },
  {
    id: 'thousands',
    entries: [
      { number: 1000, kana: 'せん', romaji: 'sen', alternatives: [{ kana: 'いっせん', romaji: 'issen', label: 'Alternative', context: 'Possible as 一千, but 千 alone is more common.' }] },
      { number: 2000, kana: 'にせん', romaji: 'nisen', alternatives: [] },
      { number: 3000, kana: 'さんぜん', romaji: 'sanzen', alternatives: [] },
      { number: 4000, kana: 'よんせん', romaji: 'yonsen', alternatives: [] },
      { number: 5000, kana: 'ごせん', romaji: 'gosen', alternatives: [] },
      { number: 6000, kana: 'ろくせん', romaji: 'rokusen', alternatives: [] },
      { number: 7000, kana: 'ななせん', romaji: 'nanasen', alternatives: [] },
      { number: 8000, kana: 'はっせん', romaji: 'hassen', alternatives: [] },
      { number: 9000, kana: 'きゅうせん', romaji: 'kyūsen', alternatives: [] },
    ],
  },
  {
    id: 'ten-thousands',
    entries: [
      { number: 10000, kana: 'いちまん', romaji: 'ichiman', alternatives: [] },
      { number: 20000, kana: 'にまん', romaji: 'niman', alternatives: [] },
      { number: 30000, kana: 'さんまん', romaji: 'sanman', alternatives: [] },
      { number: 40000, kana: 'よんまん', romaji: 'yonman', alternatives: [] },
      { number: 50000, kana: 'ごまん', romaji: 'goman', alternatives: [] },
      { number: 60000, kana: 'ろくまん', romaji: 'rokuman', alternatives: [] },
      { number: 70000, kana: 'ななまん', romaji: 'nanaman', alternatives: [] },
      { number: 80000, kana: 'はちまん', romaji: 'hachiman', alternatives: [] },
      { number: 90000, kana: 'きゅうまん', romaji: 'kyūman', alternatives: [] },
    ],
  },
] as const;
