import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const jsonPath = new URL('src/business/language-home/english/content/englishContent.json', root);
const bank = JSON.parse(await readFile(jsonPath, 'utf8'));
const rewriteDir = new URL('content-source/english/rewrite/', root);

async function readJson(name) {
  const p = new URL(name, rewriteDir);
  if (!existsSync(p)) return {};
  return JSON.parse(await readFile(p, 'utf8'));
}

const vocabMeta = Object.assign({}, await readJson('vocab-meta-A.json'), await readJson('vocab-meta-B.json'), await readJson('vocab-meta-C.json'));
const grammarExtra = Object.assign({}, await readJson('grammar-extra-A.json'), await readJson('grammar-extra-B.json'), await readJson('grammar-extra-C.json'));
const quizMeta = Object.assign({}, await readJson('quiz-meta-A.json'), await readJson('quiz-meta-B.json'), await readJson('quiz-meta-C.json'));
const dialogueExtra = Object.assign({}, await readJson('dialogue-extra-A.json'), await readJson('dialogue-extra-B.json'), await readJson('dialogue-extra-C.json'));

function hasPos(m=''){ return /^\([a-z()/]+\)\s*/i.test(m.trim()); }
function plainMeaning(m=''){ return m.replace(/^\([^)]+\)\s*/, '').trim(); }
function normMeaning(meaning, pos) {
  const t = (meaning||'').trim();
  if (hasPos(t)) return t;
  const p = pos.startsWith('(') ? pos : `(${pos})`;
  return `${p} ${t}`;
}
function splitDialogueMessage(msg) {
  const m = msg.match(/^(.*?)\s*(\([^()]*\))\s*$/);
  if (!m) return { english: msg.trim(), translation: '' };
  const english = m[1].trim();
  if (!english) return { english: msg.trim(), translation: '' };
  return { english, translation: m[2].trim() };
}
function ensureBilingual(lines) {
  // lines may be ["A: Hi. (Xin chào.)", ...] or ["A: Hi.", "(Xin chào.)", ...]
  // normalize to "A: Hi. (Xin chào.)" per message
  const msgs = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/^\(.*\)$/.test(t) && msgs.length > 0) {
      const prev = msgs[msgs.length - 1];
      if (!/\([^()]*\)\s*$/.test(prev)) msgs[msgs.length - 1] = prev + ' ' + t;
    } else {
      msgs.push(t);
    }
  }
  // ensure each has translation in parens; if missing, keep as-is
  return msgs;
}

function formatDialogueForSheet(msgs) {
  // sunday-mass style: English line, blank line, (translation), blank line, ...
  const out = [];
  for (const msg of msgs) {
    const { english, translation } = splitDialogueMessage(msg);
    out.push(english);
    if (translation) { out.push(''); out.push(translation); }
    out.push('');
  }
  while (out.length && out[out.length-1] === '') out.pop();
  return out.join('\n');
}

function toSheetGrammarExample(example) {
  // "English. (Vietnamese.)" -> "English.\n(Vietnamese.)"
  const m = example.match(/^(.*?)\s*(\([^()]*\))\s*$/);
  if (!m) return example;
  return `${m[1].trim()}\n${m[2].trim()}`;
}

function buildGrammarItem(g) {
  const formula = g.usage ? `[${g.usage.replace(/^\[|\]$/g,'')}]` : g.formula;
  const realFormula = g.usage ? g.formula : g.formula;
  return {
    ...(g.title ? { title: g.title } : {}),
    ...(g.category ? { category: g.category } : {}),
    formula: realFormula,
    example: g.example,
    ...(g.pronunciation ? { pronunciation: g.pronunciation } : {}),
    ...(g.usage ? { usage: g.usage.replace(/^\[|\]$/g,'') } : {}),
  };
}

let changed = 0;
for (const t of bank.topics) {
  if (t.id === 'sunday-mass') continue;
  const vm = vocabMeta[t.id] || { pos: {}, notes: {} };
  // vocab
  t.vocab = t.vocab.map(v => {
    const pos = vm.pos?.[v.term] || (hasPos(v.meaning) ? v.meaning.match(/^\(([^)]+)\)/)[1] : 'n');
    const meaning = normMeaning(v.meaning, pos);
    const note = vm.notes?.[v.term];
    return {
      term: v.term,
      meaning,
      pronunciation: v.pronunciation,
      ...(note ? { synonyms: note } : (v.synonyms ? { synonyms: v.synonyms } : {})),
      score: 0,
    };
  });

  // grammar: transform existing to have usage in [Dùng...] style? Keep as-is but ensure usage exists
  t.grammar = t.grammar.map((g, i) => {
    const item = { ...g };
    // normalize: if usage exists, keep; if not and formula looks like [Dùng ...], move it
    if (!item.usage && typeof item.formula === 'string' && /^\[.*\]$/.test(item.formula.trim())) {
      item.usage = item.formula.trim().replace(/^\[|\]$/g,'');
      // try to get real formula from alternatives or keep
      if (item.alternatives?.[0]?.formula) item.formula = item.alternatives[0].formula;
    }
    return item;
  });
  const ge = grammarExtra[t.id];
  if (ge && t.grammar.length < 6) {
    t.grammar.push(buildGrammarItem(ge));
  }

  // quizzes
  const qm = quizMeta[t.id];
  if (qm) {
    t.quizzes = t.quizzes.map((q, i) => {
      const meta = qm.existing?.[i];
      const opts = q.options.map(o => o.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim());
      if (meta?.extraOption && opts.length < 4) opts.push(meta.extraOption.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim());
      // ensure 4 options
      while (opts.length < 4) opts.push('None of the above');
      const finalOpts = opts.slice(0, 4);
      const oldCorrect = (q.answerIndices && q.answerIndices.length ? q.answerIndices : [q.answerIndex]).map(idx => q.options[idx]).map(o=>o.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim());
      const newIndices = finalOpts.map((o, idx) => oldCorrect.includes(o) ? idx : -1).filter(x=>x>=0);
      const answerIndex = newIndices[0] ?? 0;
      return {
        ...(q.questionType ? { questionType: q.questionType.trim() } : { questionType: 'Single Best Answer' }),
        question: meta?.question || q.question,
        options: finalOpts,
        answerIndex,
        ...(newIndices.length > 1 ? { answerIndices: newIndices } : {}),
        explanation: meta?.explanation || q.explanation,
      };
    });
    if (qm.new) {
      const nq = qm.new;
      const opts = nq.options.map(o => o.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim());
      const indices = nq.answerIndices || (typeof nq.answerIndex === 'number' ? [nq.answerIndex] : [0]);
      t.quizzes.push({
        questionType: nq.questionType || 'Single Best Answer',
        question: nq.question,
        options: opts,
        answerIndex: indices[0] ?? 0,
        ...(indices.length > 1 ? { answerIndices: indices } : {}),
        explanation: nq.explanation,
      });
    }
  } else {
    t.quizzes = t.quizzes.map(q => ({ ...q, questionType: (q.questionType||'Single Best Answer').trim(), options: q.options.map(o=>o.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim()) }));
  }

  // dialogue
  t.dialogue = ensureBilingual(t.dialogue);
  const de = dialogueExtra[t.id];
  if (de?.mainExtra && t.dialogue.length < 6) {
    t.dialogue = t.dialogue.concat(ensureBilingual(de.mainExtra));
  }
  // ensure at least 6? user said flexible, but better keep reasonable; we won't force.
  const existingVariants = (t.dialogueVariants || []).map(v => ensureBilingual(v));
  if (de?.variant1) {
    // replace or set variant1 as the first variant; keep others except if we have too many
    const v1 = ensureBilingual(de.variant1);
    if (existingVariants.length === 0) t.dialogueVariants = [v1];
    else t.dialogueVariants = [v1, ...existingVariants.slice(1)];
  } else {
    t.dialogueVariants = existingVariants;
  }
  // for main dialogue, if it has translations inline, keep; also keep variant 0 in sunday-mass style (bilingual)
  changed++;
}

bank.version = '2026.11.28';
bank.updatedAt = '2026-11-28';
await writeFile(jsonPath, JSON.stringify(bank, null, 2) + '\n');
console.log('merged', changed, 'topics');
