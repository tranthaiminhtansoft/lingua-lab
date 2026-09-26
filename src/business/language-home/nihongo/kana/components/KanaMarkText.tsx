import type { ReactNode } from 'react';

export function KanaMarkText({ children, lang }: { children: string; lang?: string }): ReactNode {
  return <span lang={lang}>{children.split(/([゛゜])/u).map((part, index) => /[゛゜]/u.test(part)
    ? <span className="kana-mark" key={`${part}-${index}`}>{part}</span>
    : part)}</span>;
}
