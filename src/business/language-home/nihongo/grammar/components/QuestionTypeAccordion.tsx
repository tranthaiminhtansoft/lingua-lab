import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { QuestionJapaneseWithRomaji } from './QuestionJapaneseWithRomaji';
import type { QuestionType } from '../content/questionTypes';

export function QuestionTypeAccordion({ type, isOpen, onToggle, children }: {
  type: QuestionType;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const details = detailsRef.current;
    const body = bodyRef.current;
    if (!details || !body) return;
    const startHeight = details.open ? body.getBoundingClientRect().height : 0;
    const startOpacity = details.open ? getComputedStyle(body).opacity : '0';
    animationRef.current?.cancel();
    details.open = true;
    body.style.height = `${startHeight}px`;
    const endHeight = isOpen ? body.scrollHeight : 0;
    const finish = () => {
      body.style.height = isOpen ? 'auto' : '0px';
      details.open = isOpen;
      animationRef.current?.cancel();
      animationRef.current = null;
    };
    if (!body.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || startHeight === endHeight) {
      finish();
      return;
    }
    const animation = body.animate([
      { height: `${startHeight}px`, opacity: startOpacity },
      { height: `${endHeight}px`, opacity: isOpen ? '1' : '0' },
    ], { duration: 260, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'both' });
    animationRef.current = animation;
    animation.onfinish = finish;
  }, [isOpen]);

  useEffect(() => () => animationRef.current?.cancel(), []);

  return <details className="question-type" id={type.id} ref={detailsRef}>
    <summary aria-expanded={isOpen} onClick={(event) => { event.preventDefault(); onToggle(); }}>
      <span className="question-type-label"><span className="question-type-title">{type.title}</span><QuestionJapaneseWithRomaji parts={type.keywords} /></span>
      <span aria-hidden="true" className="question-toggle" />
    </summary>
    <div aria-hidden={!isOpen} className="question-disclosure-body" inert={!isOpen} ref={bodyRef}>{children}</div>
  </details>;
}
