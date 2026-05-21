import type { Session } from '../types/api';

/** User-facing memory name: LLM title from enrich_session, then display_title, then filename. */
export function getMemoryTitle(session: Pick<Session, 'title' | 'display_title' | 'audio_filename' | 'id'>): string {
  if (session.title?.trim()) return session.title.trim();
  if (session.display_title?.trim()) return session.display_title.trim();
  if (session.audio_filename) {
    return formatFilenameAsTitle(session.audio_filename);
  }
  return `Memory · ${session.id.slice(0, 8)}`;
}

export function formatFilenameAsTitle(filename: string): string {
  let name = filename.split(/[/\\]/).pop() || filename;
  name = name.replace(/\.(mp3|wav|m4a|mp4|webm)$/i, '');
  return name.replace(/[_-]+/g, ' ').trim() || filename;
}

export function formatMemoryDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatSessionType(type?: string): string | null {
  if (!type || type === 'unknown') return null;
  return type.replace(/_/g, ' ');
}

export interface SummarySection {
  heading: string;
  items: string[];
  paragraphs: string[];
}

const KNOWN_HEADERS = new Set([
  'conversation overview',
  'objectives',
  'key topics discussed',
  'key topics & themes',
  'action items',
  'commitments & promises',
  'decisions made',
  'decisions & agreements',
  'follow-ups & reminders',
  'follow-ups, deadlines & reminders',
  'people involved',
  'participants & roles',
  'important context & insights',
  'important discussion points',
  'one-line takeaway',
  'high-level summary',
  'primary objectives',
  'decisions pending / open items',
  'risks, blockers & dependencies',
  'signals & metadata worth indexing',
  'conversation dynamics (optional but valuable)',
]);

function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 80) return false;
  if (t.startsWith('-') || t.startsWith('•') || t.startsWith('*')) return false;
  const lower = t.toLowerCase().replace(/[#*]/g, '').trim();
  if (KNOWN_HEADERS.has(lower)) return true;
  if (/^\d+\.\s/.test(t)) return true;
  if (t.endsWith(':') && t.length < 60) return true;
  if (!t.includes('.') && t.split(' ').length <= 6 && /^[A-Z]/.test(t)) return true;
  return false;
}

function cleanBullet(line: string): string {
  return line.replace(/^[\s\-•*]+\s*/, '').trim();
}

/** Parse enricher summary string into sections for premium UI. */
export function parseSummarySections(raw: string): SummarySection[] {
  const text = raw.trim();
  if (!text || text === 'No summary generated yet') return [];

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: SummarySection[] = [];
  let current: SummarySection | null = null;

  const pushSection = () => {
    if (current && (current.items.length || current.paragraphs.length || current.heading)) {
      sections.push(current);
    }
    current = null;
  };

  for (const line of lines) {
    if (isSectionHeader(line)) {
      pushSection();
      current = {
        heading: line.replace(/:$/, '').replace(/^#+\s*/, ''),
        items: [],
        paragraphs: [],
      };
      continue;
    }

    if (!current) {
      current = { heading: 'Overview', items: [], paragraphs: [] };
    }

    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      const item = cleanBullet(line);
      if (item && item.toLowerCase() !== 'none') current.items.push(item);
    } else if (line.toLowerCase() === 'none') {
      /* skip */
    } else {
      current.paragraphs.push(line);
    }
  }
  pushSection();

  if (sections.length === 0) {
    return [{ heading: 'Summary', items: [], paragraphs: [text] }];
  }
  return sections;
}

export function summaryPreview(raw: string | undefined, maxLen = 160): string {
  if (!raw || raw === 'No summary generated yet') return '';
  const sections = parseSummarySections(raw);
  const first = sections[0];
  const bit =
    first?.paragraphs[0] ||
    first?.items[0] ||
    raw.replace(/\s+/g, ' ').slice(0, maxLen);
  return bit.length > maxLen ? `${bit.slice(0, maxLen)}…` : bit;
}
