import React, { useState } from 'react';
import { signUpWithSupabase } from './supabaseClient';

/**
 * VOZX AI — Futuristic Sign Up Component (React + Tailwind CSS)
 * Integrates with Supabase Authentication.
 * Features:
 * - Full Name, Email, Password, Confirm Password
 * - Inline error validation messages with red/green glowing borders
 * - Real-time password strength meter
 * - Supabase Auth account creation
 * - Loading animation and redirect to Login
 */
export default function VozxSignupPage({ onNavigateToLogin, onShowToast }) {
  const [fullName, setFullName] = useState('Varun Reddy');
  const [email, setEmail] = useState('varun.reddy@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Field validation error states
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  // Touched states so errors don't aggressively show before user types
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password strength calculation
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

  // Real-time validation runner
  const validateField = (field, value, otherValue = '') => {
    let error = '';
    switch (field) {
      case 'fullName':
        if (!value.trim()) error = 'Full Name is required.';
        else if (value.trim().length < 2) error = 'Full Name must be at least 2 characters.';
        break;
      case 'email':
        if (!value.trim()) error = 'Email address is required.';
        else if (!emailRegex.test(value.trim())) error = 'Please enter a valid email address.';
        break;
      case 'password':
        if (!value) error = 'Password is required.';
        else if (value.length < 8) error = 'Password must be at least 8 characters.';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password.';
        else if (value !== (otherValue || password)) error = 'Passwords do not match.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = field === 'fullName' ? fullName : field === 'email' ? email : field === 'password' ? password : confirmPassword;
    const error = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field, value) => {
    if (field === 'fullName') setFullName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') {
      setPassword(value);
      if (touched.confirmPassword && confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: value === confirmPassword ? '' : 'Passwords do not match.'
        }));
      }
    }
    if (field === 'confirmPassword') setConfirmPassword(value);

    // If already touched, validate live
    if (touched[field]) {
      const err = validateField(field, value, field === 'confirmPassword' ? password : confirmPassword);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  // Form submission
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Mark all touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    const errName = validateField('fullName', fullName);
    const errEmail = validateField('email', email);
    const errPass = validateField('password', password);
    const errConfirm = validateField('confirmPassword', confirmPassword, password);

    setErrors({
      fullName: errName,
      email: errEmail,
      password: errPass,
      confirmPassword: errConfirm,
      general: ''
    });

    if (errName || errEmail || errPass || errConfirm) {
      if (onShowToast) onShowToast('Please correct the highlighted errors.', 'error');
      return;
    }

    if (!agreedTerms) {
      if (onShowToast) onShowToast('Please accept the Terms of Service & Privacy Policy.', 'error');
      return;
    }

    setIsLoading(true);
    if (onShowToast) onShowToast('Creating your VOZX Neural Core account...', 'info');

    try {
      const result = await signUpWithSupabase(fullName, email, password);

      if (!result.success) {
        setIsLoading(false);
        setErrors((prev) => ({ ...prev, general: result.error }));
        if (onShowToast) onShowToast(result.error || 'Failed to create account.', 'error');
        return;
      }

      // Success
      if (onShowToast) {
        onShowToast('Account created successfully! Redirecting to Sign In...', 'success');
      }

      setTimeout(() => {
        setIsLoading(false);
        if (onNavigateToLogin) {
          onNavigateToLogin(email);
        } else {
          window.location.href = 'login.html';
        }
      }, 1200);

    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Signup failed due to network error';
      setErrors((prev) => ({ ...prev, general: msg }));
      if (onShowToast) onShowToast(msg, 'error');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050816] text-white flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[450px] h-[450px] rounded-full bg-sky-600/10 blur-[100px] pointer-events-none" />

      {/* Main Hardware Mobile Frame */}
      <div className="relative w-full max-w-[412px] min-h-[860px] bg-[#050816]/90 border border-cyan-400/35 rounded-[44px] shadow-[0_0_50px_rgba(34,211,238,0.18)] flex flex-col p-6 backdrop-blur-xl overflow-hidden">
        
        {/* Glowing cyber perimeter border */}
        <div className="absolute inset-0 rounded-[44px] pointer-events-none shadow-[inset_0_0_20px_rgba(34,211,238,0.08)]" />

        {/* Top Notch / Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 px-2">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black/80 rounded-full border border-white/10" />
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Top Header */}
        <header className="flex items-center justify-between py-1 mb-2">
          <button
            type="button"
            onClick={onNavigateToLogin || (() => window.history.back())}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Centered Metallic V Logo */}
          <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            <svg className="w-8 h-8" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="vGradSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
              <path d="M4 6 L16 26 L28 6 L22 6 L16 18 L10 6 Z" fill="url(#vGradSignup)" />
            </svg>
          </div>

          <div className="w-10" />
        </header>

        {/* Title Block */}
        <div className="text-center my-2">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
            Join VOZX and unlock your AI-powered productivity with Supabase Auth
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="my-2 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 text-center font-medium shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-3 my-auto" noValidate>
          
          {/* Input 1: Full Name */}
          <div>
            <div className={`flex items-center h-12 px-4 rounded-2xl bg-[#0d1730]/70 border transition-all ${
              errors.fullName 
                ? 'border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.35)]' 
                : touched.fullName && fullName
                ? 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                : 'border-cyan-400/25 focus-within:border-cyan-400 focus-within:shadow-[0_0_18px_rgba(34,211,238,0.35)]'
            }`}>
              <span className={`mr-3 ${errors.fullName ? 'text-red-400' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Full Name"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 font-medium"
              />
              {touched.fullName && !errors.fullName && fullName && (
                <span className="text-emerald-400 text-xs">✓</span>
              )}
            </div>
            {errors.fullName && (
              <span className="text-[11px] text-red-400 px-3 mt-1 block font-medium">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Input 2: Email Address */}
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
                placeholder="Email Address"
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

          {/* Input 3: Password */}
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
                placeholder="Password (min. 8 characters)"
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

            {/* Password strength meter */}
            {password && (
              <div className="mt-1 px-2">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`} 
                    style={{ width: strength.width }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Strength</span>
                  <span className={`font-semibold ${strength.score >= 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {strength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input 4: Confirm Password */}
          <div>
            <div className={`flex items-center h-12 px-4 rounded-2xl bg-[#0d1730]/70 border transition-all ${
              errors.confirmPassword 
                ? 'border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.35)]' 
                : touched.confirmPassword && confirmPassword && !errors.confirmPassword
                ? 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                : 'border-cyan-400/25 focus-within:border-cyan-400 focus-within:shadow-[0_0_18px_rgba(34,211,238,0.35)]'
            }`}>
              <span className={`mr-3 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm Password"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-cyan-400 p-1"
                aria-label="Toggle confirm password"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-[11px] text-red-400 px-3 mt-1 block font-medium">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Terms & Privacy checkbox */}
          <div className="flex items-start gap-2 text-[11px] text-slate-400 px-1 mt-1">
            <input
              type="checkbox"
              id="signupTerms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-800 border-cyan-400/40 text-cyan-400 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="signupTerms" className="cursor-pointer">
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
                Creating Supabase Account...
              </span>
            ) : (
              <span>Create Account &rarr;</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          <span className="text-[11px] text-slate-400 font-medium">or continue with</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>

        {/* Social buttons */}
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
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin || (() => { window.location.href = 'login.html'; })}
              className="text-cyan-400 font-semibold hover:underline ml-1"
            >
              Sign In
            </button>
          </p>
        </footer>

      </div>
    </div>
  );
}

