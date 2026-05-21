import { Link } from 'react-router-dom';
import { useSessions } from '../hooks/useSessions';
import LoadingSpinner from './common/LoadingSpinner';
import MemorySummary from './common/MemorySummary';
import MemoryTags from './common/MemoryTags';
import { useEffect, useState } from 'react';
import { getMemoryTitle, formatMemoryDate } from '../utils/sessionDisplay';

export default function Memories() {
  const { sessions, loading, error } = useSessions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-center">
          <LoadingSpinner size="xl" color="purple" />
          <p className="mt-4 text-slate-400 font-medium">Loading your memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-center max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-red-500/20">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Memories</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  Your Memories
                </h1>
                <p className="text-slate-400 mt-1">Named conversations you can search and revisit</p>
              </div>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Memory
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">No Memories Yet</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Start creating memories by uploading your first audio conversation.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create Your First Memory
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 mb-8">
              {sessions.length} {sessions.length === 1 ? 'memory' : 'memories'}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session, index) => {
                const title = getMemoryTitle(session);
                const routeId = session.session_id || session.id;
                const hasSummary =
                  session.summary && session.summary !== 'No summary generated yet';

                return (
                  <Link
                    key={routeId}
                    to={`/sessions/${routeId}`}
                    className={`group relative flex flex-col bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/15 overflow-hidden ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 opacity-80 group-hover:opacity-100" />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 rounded-xl flex items-center justify-center border border-purple-500/30">
                          <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors line-clamp-2 leading-snug">
                            {title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatMemoryDate(session.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <MemoryTags tags={session.tags} sessionType={session.session_type} />
                      </div>

                      <div className="flex-1 mb-4 min-h-[4.5rem]">
                        {hasSummary ? (
                          <MemorySummary summary={session.summary!} variant="card" />
                        ) : (
                          <p className="text-slate-500 text-sm italic">Generating summary…</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-500">
                        <span className="group-hover:text-purple-300 transition-colors font-medium">
                          Open memory
                        </span>
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
