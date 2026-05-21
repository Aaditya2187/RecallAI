import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className={`flex items-center gap-3 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                Neo
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                to="/memories"
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                Memories
              </Link>
              <Link
                to="/ask"
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                Ask Neo
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-6xl w-full">
            {/* Hero Section */}
            <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent leading-tight">
                Your AI Memory
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                  Assistant
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Transform conversations into searchable knowledge. Create memories from audio and ask Neo anything.
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Creating Memories Card */}
              <Link
                to="/upload"
                className={`group relative bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ animationDelay: '500ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
                    Creating Memories
                  </h3>
                  
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    Upload audio conversations and transform them into searchable memories. Neo will transcribe, analyze, and index everything for you.
                  </p>
                  
                  <div className="flex items-center text-purple-300 font-medium group-hover:text-purple-200 transition-colors">
                    <span>Start Creating</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Ask Neo Card */}
              <Link
                to="/ask"
                className={`group relative bg-gradient-to-br from-indigo-900/50 to-cyan-900/50 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/20 hover:border-indigo-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ animationDelay: '700ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-indigo-200 transition-colors">
                    Ask Neo
                  </h3>
                  
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    Query your memories with natural language. Neo searches through all your conversations to provide intelligent, contextual answers.
                  </p>
                  
                  <div className="flex items-center text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors">
                    <span>Start Asking</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Features Section */}
            <div className={`mt-20 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '900ms' }}>
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold mb-2">AI-Powered</h4>
                <p className="text-slate-400 text-sm">Advanced AI transcription and analysis</p>
              </div>

              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold mb-2">Semantic Search</h4>
                <p className="text-slate-400 text-sm">Find information by meaning, not keywords</p>
              </div>

              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold mb-2">Secure & Private</h4>
                <p className="text-slate-400 text-sm">Your memories stay with you</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}