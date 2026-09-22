import React, { useState } from 'react';
import { signInWithSupabase, resetPasswordWithSupabase } from './supabaseClient';

/**
 * VOZX AI — Futuristic Login Component (React + Tailwind CSS)
 * Aesthetic: ChatGPT Astra + Nothing OS + Apple Intelligence
 * Theme: Cyberpunk Dark (#050816) + Neon Cyan (#22D3EE / #38BDF8)
 * Integrates with Supabase Authentication.
 */
export default function VozxLoginPage({ onLoginSuccess, onNavigateToSignUp, onShowToast }) {
  const [email, setEmail] = useState('varun.reddy@gmail.com');
  const [password, setPassword] = useState('VozxAI#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Field validation error states
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const avatars = [
    { type: 'AI Assistant', icon: '⚡' },
    { type: 'Varun Reddy', icon: 'VR' },
    { type: 'Neural Stream', icon: '🧠' },
  ];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password strength logic
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-700', width: '0%' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1 || pwd.length < 6) {
      return { score: 1, label: 'Weak', color: 'bg-red-500', width: '33%' };
    }
    if (score <= 3) {
      return { score: 2, label: 'Medium', color: 'bg-amber-400', width: '66%' };
    }
    return { score: 4, label: 'Strong', color: 'bg-emerald-400', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      if (!value.trim()) error = 'Email is required.';
      else if (!emailRegex.test(value.trim())) error = 'Please enter a valid email address.';
    }
    if (field === 'password') {
      if (!value) error = 'Password is required.';
      else if (value.length < 8) error = 'Password must be at least 8 characters.';
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, field === 'email' ? email : password);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    const errEmail = validateField('email', email);
    const errPass = validateField('password', password);

    setErrors({
      email: errEmail,
      password: errPass,
      general: ''
    });

    if (errEmail || errPass) {
      if (onShowToast) onShowToast('Please fix the errors before signing in.', 'error');
      return;
    }

    if (!agreedTerms) {
      if (onShowToast) onShowToast('Please accept the Terms of Service to proceed.', 'error');
      return;
    }

    setIsLoading(true);
    if (onShowToast) onShowToast('Authenticating with Supabase Neural Core...', 'info');

    try {
      const result = await signInWithSupabase(email, password, rememberMe);

      if (!result.success) {
        setIsLoading(false);
        setErrors((prev) => ({ ...prev, general: result.error }));
        if (onShowToast) onShowToast(result.error || 'Authentication failed.', 'error');
        return;
      }

      if (onShowToast) {
        const displayName = result.user?.user_metadata?.full_name || 'Varun';
        onShowToast(`Welcome back, ${displayName}! Redirecting to Dashboard...`, 'success');
      }

      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess(result);
        } else {
          window.location.href = 'index.html';
        }
      }, 1100);

    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Login failed due to network error';
      setErrors((prev) => ({ ...prev, general: msg }));
      if (onShowToast) onShowToast(msg, 'error');
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail || !emailRegex.test(targetEmail)) {
      if (onShowToast) onShowToast('Please enter a valid recovery email address.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPasswordWithSupabase(targetEmail);
      setIsResetting(false);
      setShowForgotModal(false);
      if (onShowToast) onShowToast(`Password reset link sent to ${targetEmail}`, 'success');
    } catch (err) {
      setIsResetting(false);
      if (onShowToast) onShowToast('Failed to dispatch password reset email.', 'error');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050816] text-white flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Ambient Gradient Glows */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-50px] w-[400px] h-[400px] rounded-full bg-sky-600/10 blur-[90px] pointer-events-none" />

      {/* Main Hardware Mobile Mockup Frame */}
      <div className="relative w-full max-w-[412px] min-h-[850px] bg-[#050816]/90 border border-cyan-400/30 rounded-[44px] shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col p-6 backdrop-blur-xl overflow-hidden">
        
        {/* Glowing cyber perimeter border */}
        <div className="absolute inset-0 rounded-[44px] pointer-events-none shadow-[inset_0_0_20px_rgba(34,211,238,0.06)]" />

        {/* Top Notch / Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3 px-2">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black/80 rounded-full border border-white/10" />
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Header Section */}
        <header className="flex items-center justify-between py-2 mb-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Minimalist Metallic V Logo */}
          <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            <svg className="w-8 h-8" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="vGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
              <path d="M4 6 L16 26 L28 6 L22 6 L16 18 L10 6 Z" fill="url(#vGradLogin)" />
            </svg>
          </div>

          <div className="w-10" />
        </header>

        {/* Profile Avatar with Pulsing Ring */}
        <div className="flex flex-col items-center my-2">
          <div 
            onClick={() => {
              setAvatarIndex((prev) => (prev + 1) % avatars.length);
              if (onShowToast) onShowToast(`Profile avatar: ${avatars[(avatarIndex + 1) % avatars.length].type}`, 'info');
            }}
            className="relative w-18 h-18 rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 via-sky-600 to-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.4)] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center group"
            title="Click to cycle avatar"
          >
            <div className="w-full h-full rounded-full bg-[#0b1224] border-2 border-[#050816] flex items-center justify-center font-bold text-cyan-300 text-xl group-hover:text-white transition-colors">
              {avatars[avatarIndex].icon}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#050816] shadow-[0_0_8px_#34d399]" />
          </div>
          <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-cyan-400/20 text-[11px] text-slate-400 font-medium">
            AI Ready
          </span>
        </div>

        {/* Welcome Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-[270px] mx-auto">
            Sign in to continue with your AI-powered personal assistant.
          </p>
        </div>

        {/* Error Banner */}
        {errors.general && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 text-center font-medium shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Email input */}
          <div>
            <div className={`flex items-center h-12 px-4 rounded-2xl bg-[#0d1730]/70 border transition-all ${
              errors.email 
                ? 'border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.35)]' 
                : touched.email && email && !errors.email
                ? 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                : 'border-cyan-400/25 focus-within:border-cyan-400 focus-within:shadow-[0_0_18px_rgba(34,211,238,0.35)]'
            }`}>
              <span className={`mr-3 ${errors.email ? 'text-red-400' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2"/>
                  <path d="M22 6l-10 7L2 6" strokeWidth="2"/>
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 font-medium"
              />
              {touched.email && !errors.email && email && (
                <span className="text-emerald-400 text-xs">✓</span>
              )}
            </div>
            {errors.email && (
              <span className="text-[11px] text-red-400 px-3 mt-1 block font-medium">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password input */}
          <div>
            <div className={`flex items-center h-12 px-4 rounded-2xl bg-[#0d1730]/70 border transition-all ${
              errors.password 
                ? 'border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.35)]' 
                : touched.password && password && !errors.password
                ? 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                : 'border-cyan-400/25 focus-within:border-cyan-400 focus-within:shadow-[0_0_18px_rgba(34,211,238,0.35)]'
            }`}>
              <span className={`mr-3 ${errors.password ? 'text-red-400' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-cyan-400 p-1"
                aria-label="Toggle password"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-400 px-3 mt-1 block font-medium">
                {errors.password}
              </span>
            )}

            {/* Password Strength */}
            {password && (
              <div className="mt-1 px-1">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`} 
                    style={{ width: strength.width }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Security</span>
                  <span className={`font-semibold ${strength.score >= 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {strength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs px-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-cyan-400/40 text-cyan-400 focus:ring-0 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setShowForgotModal(true);
              }}
              className="text-cyan-400 hover:text-white transition-colors hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2 text-[11px] text-slate-400 px-1">
            <input
              type="checkbox"
              id="loginTerms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-800 border-cyan-400/40 text-cyan-400 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="loginTerms" className="cursor-pointer">
              I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!agreedTerms || isLoading}
            className={`relative mt-2 h-12 rounded-full font-bold text-sm tracking-wide text-slate-950 flex items-center justify-center transition-all ${
              !agreedTerms || isLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] shadow-[0_4px_25px_rgba(14,165,233,0.5)] hover:shadow-[0_6px_30px_rgba(34,211,238,0.7)] hover:scale-[1.01]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Signing In with Supabase...
              </span>
            ) : (
              <span>Sign In &rarr;</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          <span className="text-[11px] text-slate-400 font-medium">or continue with</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => onShowToast && onShowToast('Connecting via Google OAuth...', 'info')}
            className="h-11 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/10 flex items-center justify-center transition-all"
            title="Google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.3l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.3C.6 9.3 0 10.6 0 12s.6 2.7 1.6 4.7l3.7-1.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 16c1.9 3.7 5.8 7 10.4 7z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onShowToast && onShowToast('Connecting via Apple ID...', 'info')}
            className="h-11 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/10 flex items-center justify-center transition-all"
            title="Apple"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.98 1.7-0.85 2.73.99.08 2.01-.52 2.56-1.23z"/>
            </svg>
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-auto text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp || (() => { window.location.href = 'onboarding.html'; })}
              className="text-cyan-400 font-semibold hover:underline ml-1"
            >
              Sign Up
            </button>
          </p>
        </footer>

      </div>

      {/* Forgot Password Glass Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0b1226]/95 border border-cyan-400/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] text-cyan-300 font-semibold">
                ⚡ Supabase Reset
              </span>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Reset Your Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your email address to receive an official Supabase password recovery link.
            </p>
            <div className="flex items-center h-12 px-4 rounded-2xl bg-[#0d1730] border border-cyan-400/30 mb-4">
              <span className="mr-3 text-slate-400">✉️</span>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter recovery email"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
              />
            </div>
            <button
              type="button"
              disabled={isResetting}
              onClick={handleForgotPassword}
              className="h-11 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:scale-[1.02] transition-transform flex items-center justify-center"
            >
              {isResetting ? 'Sending Reset Email...' : 'Send Recovery Link →'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
