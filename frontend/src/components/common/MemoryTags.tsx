import { formatSessionType } from '../../utils/sessionDisplay';

interface MemoryTagsProps {
  tags?: string[];
  sessionType?: string;
  size?: 'sm' | 'md';
}

export default function MemoryTags({ tags = [], sessionType, size = 'sm' }: MemoryTagsProps) {
  const typeLabel = formatSessionType(sessionType);
  const visibleTags = tags.filter((t) => t && t.length > 0).slice(0, 8);

  if (!typeLabel && visibleTags.length === 0) return null;

  const pill =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 rounded-md'
      : 'text-xs px-2.5 py-1 rounded-lg';

  return (
    <div className="flex flex-wrap gap-1.5">
      {typeLabel && (
        <span
          className={`${pill} font-semibold uppercase tracking-wider bg-indigo-500/25 text-indigo-200 border border-indigo-400/30`}
        >
          {typeLabel}
        </span>
      )}
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={`${pill} font-medium bg-white/10 text-slate-300 border border-white/10 capitalize`}
        >
          {tag.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
}
