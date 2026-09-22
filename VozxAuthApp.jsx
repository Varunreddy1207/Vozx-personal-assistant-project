import React, { useState, useEffect } from 'react';
import VozxLoginPage from './VozxLoginPage';
import VozxSignupPage from './VozxSignupPage';
import { configureSupabaseKeys, getCurrentSessionUser, signOutUser } from './supabaseClient';

/**
 * VOZX AI — Main Authentication App Container (React + Tailwind CSS)
 * Manages view states: 'login', 'signup', and 'dashboard_preview'
 * Features global toast notifications and optional Supabase Project API key modal.
 */
export default function VozxAuthApp() {
  const [currentView, setCurrentView] = useState('signup'); // 'signup' | 'login' | 'dashboard'
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('vozx_supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(localStorage.getItem('vozx_supabase_anon_key') || '');

  useEffect(() => {
    // Check existing session
    getCurrentSessionUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3400);
  };

  const handleSaveConfig = () => {
    configureSupabaseKeys(supabaseUrl, supabaseAnonKey);
    setShowConfigModal(false);
    showToast('Supabase API credentials updated successfully!', 'success');
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setCurrentView('login');
    showToast('Signed out of VOZX AI.', 'info');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050816] text-white flex flex-col items-center justify-center font-sans select-none">
      
      {/* Top Floating Controls Bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-400/30 hover:border-cyan-400 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all"
          title="Configure Supabase Project URL & Anon Key"
        >
          <span className="text-cyan-400">⚡</span>
          <span>Supabase Config</span>
        </button>

        <a
          href="index.html"
          className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 hover:bg-cyan-500/20 text-xs text-cyan-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all"
        >
          <span>Home App &rarr;</span>
        </a>
      </div>

      {/* Screen Views */}
      {currentView === 'signup' && (
        <VozxSignupPage
          onNavigateToLogin={() => setCurrentView('login')}
          onShowToast={showToast}
        />
      )}

      {currentView === 'login' && (
        <VozxLoginPage
          onNavigateToSignUp={() => setCurrentView('signup')}
          onLoginSuccess={(authData) => {
            setCurrentUser(authData.user);
            setCurrentView('dashboard');
          }}
          onShowToast={showToast}
        />
      )}

      {currentView === 'dashboard' && (
        <div className="relative w-full max-w-[412px] min-h-[700px] bg-[#050816]/95 border border-cyan-400/40 rounded-[44px] shadow-[0_0_50px_rgba(34,211,238,0.2)] p-8 flex flex-col items-center justify-center text-center backdrop-blur-2xl">
          <div className="w-20 h-20 rounded-full bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-pulse">
            ⚡
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 text-xs font-semibold mb-2">
            ● Supabase Session Active
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">Authenticated!</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-[260px]">
            Welcome, <strong className="text-white">{currentUser?.user_metadata?.full_name || currentUser?.email || 'Varun Reddy'}</strong>. Your AI Assistant workspace is ready.
          </p>

          <div className="w-full flex flex-col gap-3">
            <a
              href="index.html"
              className="w-full h-12 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:scale-[1.02] transition-transform"
            >
              Open Main AI Assistant &rarr;
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-12 rounded-full bg-white/5 border border-white/10 hover:border-red-400/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-sm font-semibold transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Global Glowing Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full border backdrop-blur-md shadow-2xl text-xs font-medium flex items-center gap-2 z-50 animate-bounce transition-all ${
          toast.type === 'success'
            ? 'bg-slate-900/95 border-emerald-400/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            : toast.type === 'error'
            ? 'bg-slate-900/95 border-red-400/60 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            : 'bg-slate-900/95 border-cyan-400/60 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-red-400' : 'bg-cyan-400'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Supabase Key Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#0a1124] border border-cyan-400/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
                ⚙️ Supabase Project Settings
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Connect your actual Supabase project. Find these in your <strong>Supabase Dashboard &gt; Project Settings &gt; API</strong>.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full h-10 px-3 rounded-xl bg-black/50 border border-cyan-400/30 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  SUPABASE_ANON_KEY
                </label>
                <textarea
                  rows={3}
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-3 rounded-xl bg-black/50 border border-cyan-400/30 text-xs text-white outline-none focus:border-cyan-400 font-mono resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-xs"
              >
                Save &amp; Connect
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 h-10 rounded-xl bg-white/5 text-xs text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

