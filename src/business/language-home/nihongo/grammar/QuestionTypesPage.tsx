import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { GrammarTopicNavigation } from './components/GrammarTopicNavigation';
import { QuestionJapaneseWithRomaji } from './components/QuestionJapaneseWithRomaji';
import { QuestionTypeAccordion } from './components/QuestionTypeAccordion';
import { questionGroups, timeLabels, timeNotes } from './content/questionTypes';
import type { QuestionExample, QuestionType } from './content/questionTypes';

const questionSections = [
  ['yes-no', 'Yes / No'],
  ['wh', 'WH questions'],
] as const;

const questionChoices = questionGroups.flatMap((group) => group.types.map((type) => ({ group, type })));
const familyChoices = questionGroups.map((group) => ({ group, type: undefined }));
const selectionFromHash = (id: string) => questionChoices.find(({ type }) => type.id === id)
  ?? familyChoices.find(({ group }) => group.id === id);
const questionSectionFromHash = (id: string) => selectionFromHash(id)?.group.id;
const whWordOrderNote = 'Keep the question word where the missing information belongs. You do not move it to the front as in English; the answer supplies that missing information.';

function QuestionExchange({ example }: { example: QuestionExample }) {
  return <div className="question-exchange">
    {example.context && <p className="question-context">{example.context}</p>}
    <div className="question-sentence question-prompt">
      <span className="question-sentence-label">Question</span>
      <div><QuestionJapaneseWithRomaji alignWords showGloss parts={example.question.parts} /><p className="grammar-example-translation">{example.question.translation}</p></div>
    </div>
    {example.answers.map((answer, index) => <div className="question-sentence question-reply" key={`${answer.label}-${index}`}>
      <span className="question-sentence-label">{answer.label}</span>
      <div><QuestionJapaneseWithRomaji alignWords showGloss parts={answer.sentence.parts} /><p className="grammar-example-translation">{answer.sentence.translation}</p></div>
    </div>)}
  </div>;
}

function QuestionTypeDetails({ type }: { type: QuestionType }) {
  return <div className="question-type-content">
      <p className="question-type-explanation">{type.explanation}</p>
      <aside className="question-usage-note"><b>Usage note</b><p>{type.note}</p></aside>
      <div className="question-forms">
        {type.forms.map((form) => <section aria-labelledby={`${type.id}-${form.time}-title`} className="question-time-card" key={form.time}>
          <h3 id={`${type.id}-${form.time}-title`}>{timeLabels[form.time]}</h3>
          <div className="grammar-formula"><QuestionJapaneseWithRomaji alignWords showGloss parts={form.formula} /></div>
          <p className="question-time-note">{timeNotes[form.time]}</p>
          {form.examples.map((example, index) => <QuestionExchange example={example} key={index} />)}
        </section>)}
      </div>
      {type.aspectNote && <aside className="question-usage-note"><b>About ongoing forms</b><p>{type.aspectNote}</p></aside>}
    </div>;
}

export function QuestionTypesPage() {
  const [selection, setSelection] = useState(() => selectionFromHash(window.location.hash.slice(1)));
  const [displayedGroup, setDisplayedGroup] = useState(() => selection?.group);
  const [openType, setOpenType] = useState(() => selection?.type?.id);
  const detailRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let scrollFrame: number | undefined;
    const revealHashTarget = () => {
      if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
      const id = window.location.hash.slice(1);
      const requested = selectionFromHash(id);
      if (requested) {
        setSelection(requested);
        setDisplayedGroup(requested.group);
        setOpenType(requested.type?.id);
        return;
      }
      if (!id) { setSelection(undefined); setOpenType(undefined); }
      const target = document.getElementById(id);
      if (!target?.closest('.question-types-page')) return;
      let ancestor: HTMLElement | null = target;
      while (ancestor) {
        if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
        ancestor = ancestor.parentElement;
      }
      scrollFrame = window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    };
    revealHashTarget();
    window.addEventListener('hashchange', revealHashTarget);
    return () => {
      window.removeEventListener('hashchange', revealHashTarget);
      if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  useEffect(() => {
    if (!selection) return;
    let cancelled = false;
    let frame = window.requestAnimationFrame(() => {
      const animations = detailRef.current?.closest('.question-family-row')?.getAnimations({ subtree: true }) ?? [];
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (cancelled) return;
        frame = window.requestAnimationFrame(() => {
          detailRef.current?.scrollIntoView({ block: 'start' });
          detailRef.current?.focus({ preventScroll: true });
          if (selection.type) document.querySelector<HTMLElement>(`#${selection.type.id} > summary`)?.scrollIntoView({ block: 'start' });
        });
      });
    });
    return () => { cancelled = true; window.cancelAnimationFrame(frame); };
  }, [selection]);

  const chooseQuestion = (id: string) => {
    const requested = selectionFromHash(id);
    if (!requested) return;
    setSelection(requested);
    setDisplayedGroup(requested.group);
    setOpenType(requested.type?.id);
    if (window.location.hash === `#${id}`) detailRef.current?.scrollIntoView({ block: 'start' });
  };

  const toggleGroup = (event: MouseEvent, id: string) => {
    event.preventDefault();
    if (selection?.group.id === id) { closeDetails(); return; }
    chooseQuestion(id);
    window.location.assign(`#${id}`);
  };

  const closeDetails = () => {
    document.querySelector<HTMLElement>(`#${selection?.group.id} > summary`)?.focus({ preventScroll: true });
    setSelection(undefined);
    setOpenType(undefined);
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    listRef.current?.scrollIntoView({ block: 'start' });
  };

  const toggleType = (id: string) => {
    const nextType = openType === id ? undefined : id;
    setOpenType(nextType);
    window.history.pushState(null, '', `#${nextType ?? displayedGroup!.id}`);
  };

  return <main className="grammar-page grammar-topic-page question-types-page">
    <header className="grammar-topic-hero">
      <Link className="grammar-back-link" to="/nihongo-o-benkyuo/grammar">← Grammar topics</Link>
      <div className="grammar-topic-heading">
        <div>
          <p className="grammar-eyebrow">Topic 02 <span lang="ja">質問（しつもん）のかたち</span></p>
          <h1>Question types <span lang="ja">疑問文<small className="question-heading-reading">（ぎもんぶん）</small></span></h1>
        </div>
        <div aria-hidden="true" className="grammar-reference-stamp question-reference-stamp"><span>ASK</span><b>?</b><span>LISTEN · REPLY</span></div>
      </div>
    </header>

    <GrammarTopicNavigation allowCurrentSectionNavigation onSectionSelect={chooseQuestion} resolveSection={questionSectionFromHash} sections={questionSections} />

    <p className="question-reading-guide">Each Japanese phrase has its romaji and English gloss directly underneath. Glosses follow Japanese word order; the full English translation appears below. Kana readings are in brackets. <strong className="question-grammar-emphasis">Particles such as wa and ni, question markers, and endings</strong> are highlighted.</p>

    <section aria-label="Question families" className={`question-workspace${selection ? ' has-selection' : ''}`} ref={listRef}>
      {questionGroups.map((group, index) => <div className={`question-family-row${selection?.group.id === group.id ? ' has-selection' : ''}`} id={`${group.id}-family`} key={group.id}>
        <details className="question-group" id={group.id} open={selection?.group.id === group.id}>
          <summary aria-controls={`${group.id}-questions`} aria-expanded={selection?.group.id === group.id} onClick={(event) => toggleGroup(event, group.id)}>
            <span className="question-group-rail">
              <span aria-hidden="true" className="grammar-feature-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="question-group-heading"><span className="question-group-title" id={`${group.id}-title`}>{group.title}</span><QuestionJapaneseWithRomaji parts={group.japanese} /></span>
              <span className="question-group-count">{group.types.length} types</span><span aria-hidden="true" className="question-toggle" />
            </span>
          </summary>
        </details>
        <div aria-hidden={selection?.group.id !== group.id} className="question-detail-slot" inert={selection?.group.id !== group.id}>
          <div className="question-detail-clip">
            {displayedGroup?.id === group.id && <section aria-labelledby={`${group.id}-title`} className="question-detail-panel" id={`${group.id}-questions`} ref={detailRef} tabIndex={-1}>
              <div className="question-detail-intro">
                <p className="question-detail-family-description">{group.description}</p>
                <button aria-label="Close question details" className="question-detail-close" onClick={closeDetails} type="button">×</button>
              </div>
              {group.id === 'wh' && <p className="question-group-tip question-detail-family-description">{whWordOrderNote}</p>}
              <div className="question-type-list">{group.types.map((type) => <QuestionTypeAccordion isOpen={selection?.group.id === group.id && openType === type.id} key={type.id} onToggle={() => toggleType(type.id)} type={type}><QuestionTypeDetails type={type} /></QuestionTypeAccordion>)}</div>
            </section>}
          </div>
        </div>
      </div>)}
    </section>

  </main>;
}
