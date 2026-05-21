import { parseSummarySections } from '../../utils/sessionDisplay';

interface MemorySummaryProps {
  summary: string;
  variant?: 'card' | 'detail';
}

export default function MemorySummary({ summary, variant = 'detail' }: MemorySummaryProps) {
  const sections = parseSummarySections(summary);

  if (sections.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic">Summary is still being generated…</p>
    );
  }

  const isCard = variant === 'card';

  return (
    <div className={isCard ? 'space-y-3' : 'space-y-6'}>
      {sections.map((section, idx) => (
        <article
          key={`${section.heading}-${idx}`}
          className={
            isCard
              ? ''
              : 'rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-6 shadow-inner'
          }
        >
          <h3
            className={
              isCard
                ? 'text-xs font-semibold uppercase tracking-widest text-purple-300/90 mb-2'
                : 'text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-4 flex items-center gap-2'
            }
          >
            {!isCard && (
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-purple-400 to-indigo-500 shrink-0" />
            )}
            {section.heading}
          </h3>

          {section.paragraphs.length > 0 && (
            <div className={`space-y-2 ${section.items.length ? 'mb-3' : ''}`}>
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    isCard
                      ? 'text-slate-400 text-sm leading-relaxed line-clamp-2'
                      : 'text-slate-200 leading-relaxed'
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {section.items.length > 0 && (
            <ul className={isCard ? 'space-y-1' : 'space-y-2.5'}>
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className={`flex gap-2.5 ${isCard ? 'text-slate-400 text-sm' : 'text-slate-300'}`}
                >
                  <span
                    className={
                      isCard
                        ? 'text-purple-400/80 mt-0.5 shrink-0'
                        : 'mt-2 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0'
                    }
                  >
                    {isCard ? '·' : ''}
                  </span>
                  <span className={isCard ? 'line-clamp-1' : 'leading-relaxed'}>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
