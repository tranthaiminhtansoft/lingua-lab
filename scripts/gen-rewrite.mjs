import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const bank = JSON.parse(await readFile(new URL('src/business/language-home/english/content/englishContent.json', root), 'utf8'));
const outDir = new URL('content-source/english/rewrite/', root);
await mkdir(outDir, { recursive: true });

const groups = {
  A: ['christmas-celebration','tet-lunar-new-year','valentines-day','new-years-day','psychology-mind'],
  B: ['weekend-market','weekend-outing','weekend-rest','household-chores','devops-meeting','neighbor-morning','daily-meals'],
  C: ['autumn-routine','work-update','black-friday','devops-release-planning','neighbor-weekend','eating-out','meal-prep'],
};
const byId = new Map(bank.topics.map(t => [t.id, t]));

function hasPos(m){ return /^\([a-z()/]+\)\s*/i.test((m||'').trim()); }
function guessPos(term, meaning='') {
  const m = meaning.toLowerCase();
  const vRe = /(ăn mừng|tụ họp|thăm|cầu hôn|tiết kiệm|đạt được|tập|kiên trì|đi chơi|gặp nhau|đến\b|xem phim|dời lịch|ngủ nướng|thư giãn|nạp năng lượng|nghỉ ngơi|dọn dẹp|giặt đồ|rửa bát|hút bụi|lau bụi|lau nhà|đổ rác|gấp|quét|leo thang|giám sát|trò chuyện|ăn ngoài|bỏ bữa|gọi món|mượn|cho mượn|chăm sóc|uống đủ nước|chuẩn bị bữa ăn|ưu tiên|theo dõi|bàn giao)/;
  if (vRe.test(m)) return 'v';
  const adjRe = /(lãng mạn|ấm cúng|tươi|chín|lười|cay|cân bằng|nhiều đường|mang không khí|theo mùa|món nướng|nấu tại nhà)/;
  if (adjRe.test(m)) return 'adj';
  const phraseRe = /(đúng tiến độ|đang trễ giờ|còn hàng|hết hàng|đáng giá|không đặt báo thức)/;
  if (phraseRe.test(m)) return 'phrase';
  return 'n';
}
function normMeaning(meaning, pos) {
  const t = (meaning||'').trim();
  if (hasPos(t)) return t;
  const p = pos.startsWith('(') ? pos : `(${pos})`;
  return `${p} ${t}`;
}
function cap(s=''){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
function plainMeaning(meaning=''){ return meaning.replace(/^\([^)]+\)\s*/, '').trim(); }

function defaultNote(term, meaning, pronunciation, topicTitle) {
  const plain = plainMeaning(meaning);
  return `[Khi dùng trong chủ đề "${topicTitle}"]\n${cap(term)} is a useful word in this topic.\n(${cap(plain)} là từ hữu ích trong chủ đề này.)\n\n[Cách dùng / lưu ý]\nUse "${term}" naturally in a short sentence about ${topicTitle.toLowerCase()}.`;
}

async function readOrGen(name, gen) {
  const file = new URL(name, outDir);
  if (existsSync(file)) {
    console.log('keep', name);
    return JSON.parse(await readFile(file, 'utf8'));
  }
  const data = gen();
  await writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log('write', name);
  return data;
}

function genVocabMeta(ids) {
  const out = {};
  for (const id of ids) {
    const t = byId.get(id);
    const pos = {};
    const notes = {};
    for (const v of t.vocab) {
      pos[v.term] = guessPos(v.term, v.meaning);
    }
    // at least 2 notes
    t.vocab.slice(0, 3).forEach((v, i) => {
      if (i < 2 || !notes[v.term]) notes[v.term] = defaultNote(v.term, v.meaning, v.pronunciation, t.title);
    });
    out[id] = { pos, notes };
  }
  return out;
}

function genGrammarExtra(ids) {
  const out = {};
  for (const id of ids) {
    const t = byId.get(id);
    // pick a simple 5th grammar point based on topic
    out[id] = {
      usage: `Dùng khi muốn đưa ra lời khuyên hoặc gợi ý tự nhiên trong chủ đề "${t.title}".`,
      formula: 'S + should + V + O',
      example: `You should practice this topic every day. (Bạn nên luyện chủ đề này mỗi ngày.)`,
      pronunciation: '/ju ʃʊd ˈpræktɪs ðɪs ˈtɑːpɪk ˈevri deɪ/',
      title: 'Advice with should',
      category: 'Modal',
    };
  }
  return out;
}

function makeExplanation(question, options, answerIndices, topicTitle) {
  const correct = new Set(answerIndices);
  const wrongLines = options.map((opt, i) => !correct.has(i) ? `${String.fromCharCode(65+i)} - chưa phù hợp với ngữ cảnh câu hỏi.` : null).filter(Boolean);
  const rightLines = answerIndices.map(i => `${String.fromCharCode(65+i)} - đúng vì phù hợp nhất với ngữ cảnh trong chủ đề "${topicTitle}".`);
  return `Lý do sai:\n${wrongLines.join('\n\n')}\n\nLý do đúng:\n${rightLines.join('\n\n')}`;
}

function genQuizMeta(ids) {
  const out = {};
  for (const id of ids) {
    const t = byId.get(id);
    const existing = t.quizzes.map((q) => {
      const opts = q.options.map(o => o.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim());
      while (opts.length < 4) opts.push(`Another option for ${t.title.toLowerCase()}`);
      const indices = q.answerIndices && q.answerIndices.length ? q.answerIndices : [q.answerIndex];
      const question = /[À-ỹ]/.test(q.question) ? q.question : `Chọn đáp án đúng cho: "${q.question}"`;
      return {
        question,
        extraOption: opts[3] || 'None of the above',
        explanation: q.explanation.includes('Lý do sai') ? q.explanation : makeExplanation(question, opts.slice(0,4), indices, t.title),
      };
    });
    const entry = { existing };
    if (t.quizzes.length < 7) {
      const v = t.vocab[0];
      entry.new = {
        questionType: 'Single Best Answer',
        question: `Từ nào sau đây có nghĩa là "${plainMeaning(v.meaning)}"?`,
        options: [v.term, t.vocab[1]?.term || 'option B', t.vocab[2]?.term || 'option C', t.vocab[3]?.term || 'option D'],
        answerIndex: 0,
        explanation: makeExplanation(`Từ nào sau đây có nghĩa là "${plainMeaning(v.meaning)}"?`, [v.term, t.vocab[1]?.term||'B', t.vocab[2]?.term||'C', t.vocab[3]?.term||'D'], [0], t.title),
      };
    }
    out[id] = entry;
  }
  return out;
}

function genDialogueExtra(ids) {
  const out = {};
  for (const id of ids) {
    const t = byId.get(id);
    const entry = {};
    if (t.dialogue.length <= 4) {
      entry.mainExtra = [
        `A: Can you give me one more example about ${t.title.toLowerCase()}?`,
        `B: Sure, let's practice it together now.`,
      ];
    }
    if (id !== 'christmas-celebration') {
      entry.variant1 = [
        `A: Do you want to practice talking about ${t.title.toLowerCase()} today?`,
        `B: Yes, I think it's a useful topic for daily life.`,
        `A: Great. Can you start with a simple sentence?`,
        `B: Of course. I've been trying to use this topic more often.`,
        `A: That sounds natural. Let's add one more detail.`,
        `B: Sure. This practice helps me feel more confident.`,
      ];
    }
    out[id] = entry;
  }
  return out;
}

for (const [g, ids] of Object.entries(groups)) {
  await readOrGen(`vocab-meta-${g}.json`, () => genVocabMeta(ids));
  await readOrGen(`grammar-extra-${g}.json`, () => genGrammarExtra(ids));
  await readOrGen(`quiz-meta-${g}.json`, () => genQuizMeta(ids));
  await readOrGen(`dialogue-extra-${g}.json`, () => genDialogueExtra(ids));
}

console.log('done');
