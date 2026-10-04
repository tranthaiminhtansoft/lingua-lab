import { useEffect, useRef, useState } from 'react';

type TopicSection = readonly [id: string, label: string];

export function GrammarTopicNavigation({ sections, allowCurrentSectionNavigation = false, resolveSection, onSectionSelect }: {
  sections: readonly TopicSection[];
  allowCurrentSectionNavigation?: boolean;
  resolveSection?: (id: string) => string | undefined;
  onSectionSelect?: (id: string) => void;
}) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(() => sections.find(([id]) => `#${id}` === window.location.hash)?.[0] ?? sections[0][0]);
  const sectionMenuRef = useRef<HTMLElement>(null);
  const sectionMenuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hashId = window.location.hash.slice(1);
      const target = document.getElementById(hashId);
      const resolved = resolveSection?.(hashId);
      const matchingSection = sections.find(([id]) => id === resolved || target && document.getElementById(id)?.contains(target));
      if (matchingSection) setActiveSection(matchingSection[0]);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sections, resolveSection]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (visibleSection) setActiveSection(resolveSection?.(window.location.hash.slice(1)) ?? visibleSection.target.id);
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    sections.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [sections, resolveSection]);

  useEffect(() => {
    if (!isSectionMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!sectionMenuRef.current?.contains(target) && !sectionMenuTriggerRef.current?.contains(target)) setIsSectionMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSectionMenuOpen(false);
        sectionMenuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSectionMenuOpen]);

  const navigateToSection = (id: string) => {
    onSectionSelect?.(id);
    const target = document.getElementById(id);
    if (target instanceof HTMLDetailsElement) target.open = true;
    if (window.location.hash === `#${id}`) target?.scrollIntoView({ block: 'start' });
    setActiveSection(id);
    setIsSectionMenuOpen(false);
  };

  return <>
    <div className="grammar-section-menu">
      <button
        aria-controls="grammar-section-menu"
        aria-expanded={isSectionMenuOpen}
        aria-label={isSectionMenuOpen ? 'Close grammar sections' : 'Open grammar sections'}
        className="grammar-section-menu-trigger"
        onClick={() => setIsSectionMenuOpen((isOpen) => !isOpen)}
        ref={sectionMenuTriggerRef}
        type="button"
      ><span aria-hidden="true">{isSectionMenuOpen ? '→' : '←'}</span></button>
      {isSectionMenuOpen && <nav aria-label="Grammar sections" className="grammar-section-nav" id="grammar-section-menu" ref={sectionMenuRef}>
        {sections.map(([id, label]) => id === activeSection && !allowCurrentSectionNavigation
          ? <span aria-current="location" aria-disabled="true" className="grammar-section-current" key={id}>{label}</span>
          : <a aria-current={id === activeSection ? 'location' : undefined} className={id === activeSection ? 'grammar-section-current' : undefined} href={`#${id}`} key={id} onClick={() => navigateToSection(id)}>{label}</a>)}
      </nav>}
    </div>
    {showBackToTop && <button aria-label="Back to top" className="back-to-top" onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })} type="button">↑ <span>Top</span></button>}
  </>;
}
