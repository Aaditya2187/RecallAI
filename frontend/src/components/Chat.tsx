import { useState, FormEvent, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../hooks/useChat';

export default function Chat() {
  const { messages, ask, loading, error } = useChat();
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [question]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!question.trim() || loading) {
      return;
    }

    try {
      await ask(question.trim());
      setQuestion('');
    } catch (err) {
      console.error('Failed to ask question:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                Ask Neo
              </h1>
              <p className="text-slate-400 mt-1">Query your memories with natural language</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
        <div className={`bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col flex-1 overflow-hidden transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Start a Conversation</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Ask Neo questions about your memories. Neo searches through all your conversations to provide intelligent, contextual answers.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setQuestion("What were the main topics discussed?")}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-sm transition-all border border-white/10"
                  >
                    What were the main topics discussed?
                  </button>
                  <button
                    onClick={() => setQuestion("Summarize the key decisions made")}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-sm transition-all border border-white/10"
                  >
                    Summarize key decisions
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="space-y-4">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-md px-6 py-4 max-w-2xl shadow-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium">You</span>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{message.question}</p>
                    </div>
                  </div>

                  {/* Neo Answer */}
                  <div className="flex justify-start">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md px-6 py-4 max-w-3xl">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-white">Neo</span>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-200 leading-relaxed mb-0 whitespace-pre-wrap">{message.answer}</p>
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center mb-3">
                            <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-slate-400">Sources</span>
                          </div>
                          <div className="space-y-3">
                            {message.sources.map((source, sourceIndex) => (
                              <div key={sourceIndex} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  {source.session_id ? (
                                    <Link
                                      to={`/sessions/${source.session_id}`}
                                      className="text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors line-clamp-1"
                                    >
                                      {source.session_title || 'Related memory'}
                                    </Link>
                                  ) : (
                                    <span className="text-sm font-semibold text-slate-400">
                                      {source.session_title || 'Related memory'}
                                    </span>
                                  )}
                                  {source.speaker && (
                                    <span className="text-[10px] uppercase tracking-wide text-slate-500 shrink-0">
                                      {source.speaker}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 italic border-l-2 border-purple-500/40 pl-3">
                                  {source.chunk_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md px-6 py-4">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white">Neo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-red-300 font-medium mb-1">Failed to get answer</p>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Neo about your memories..."
                  disabled={loading}
                  rows={1}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[48px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-slate-500"
                />
                <div className="absolute right-3 bottom-3 text-xs text-slate-500">
                  {question.trim() ? 'Press Enter to send' : 'Shift+Enter for new line'}
                </div>
              </div>
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}