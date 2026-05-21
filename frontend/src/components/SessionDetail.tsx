import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import LoadingSpinner from './common/LoadingSpinner';
import MemorySummary from './common/MemorySummary';
import MemoryTags from './common/MemoryTags';
import { useEffect, useState } from 'react';
import { getMemoryTitle, formatMemoryDate } from '../utils/sessionDisplay';

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(id || '');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-center">
          <LoadingSpinner size="xl" color="purple" />
          <p className="mt-4 text-slate-400 font-medium">Loading memory details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-center max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-red-500/20">
          <h2 className="text-xl font-bold text-white mb-2">Memory Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/memories')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium"
          >
            Back to Memories
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const title = getMemoryTitle(session);
  const hasSummary =
    session.summary && session.summary !== 'No summary generated yet';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to="/memories"
            className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium">Back to Memories</span>
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/90 mb-2">
                Memory
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatMemoryDate(session.created_at)}
                </span>
                {session.audio_filename && (
                  <span className="text-slate-500 truncate max-w-[200px]" title={session.audio_filename}>
                    {session.audio_filename}
                  </span>
                )}
              </div>
              <MemoryTags tags={session.tags} sessionType={session.session_type} size="md" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div
          className={`space-y-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10 bg-white/[0.03] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Intelligence Brief</h2>
                <p className="text-sm text-slate-400">Structured insights from your conversation</p>
              </div>
            </div>

            <div className="px-8 py-8">
              {hasSummary ? (
                <MemorySummary summary={session.summary!} variant="detail" />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 animate-pulse">
                    <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-300 font-medium">Summary is being generated</p>
                  <p className="text-slate-500 text-sm mt-1">Refresh in a moment after ingestion completes</p>
                </div>
              )}
            </div>
          </section>

          {session.transcript && (
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                Full transcript
              </h2>
              <div className="rounded-xl bg-slate-950/50 border border-white/10 p-5 max-h-96 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {session.transcript}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
