import React, { useState, useEffect, useRef } from 'react';

/**
 * VOZX AI — Email Assistant Onboarding & Dashboard Component
 * React + Tailwind CSS
 * 
 * Features:
 * - 4-Screen Full Flow:
 *   1. Screen 1: Link Your Email (3D Energy Orbits, 4 Providers, Continue with paperclip icon, QR scan button)
 *   2. Screen 2: Connecting Email (Animated circular progress 0% -> 100%, 256-bit encryption badge)
 *   3. Screen 3: Email Connected Successfully (Glowing green checkmark, unlocked features, auto-redirect)
 *   4. Screen 4: Email Assistant Dashboard (Category tabs, AI Compose, AI Inbox Synthesis, Smart Replies, Recent Emails, Bottom AI Bar)
 * - QR Scanner Pairing Modal
 * - AI Neural Composer Modal
 * - LocalStorage state persistence ('vozx_email_linked')
 */

export default function VozxEmailOnboarding({ onClose, onComplete, initialStep = 1 }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedProvider, setSelectedProvider] = useState('Gmail');
  const [emailAddress, setEmailAddress] = useState('varun.reddy@gmail.com');
  const [progressPercent, setProgressPercent] = useState(0);
  const [autoCountdown, setAutoCountdown] = useState(2);
  const [activeTab, setActiveTab] = useState('inbox');
  const [quickInput, setQuickInput] = useState('');
  
  // Modals & toast
  const [showQrModal, setShowQrModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [composeTo, setComposeTo] = useState('alex@startup.co');
  const [composeSubj, setComposeSubj] = useState('Re: Project Milestone & Architecture Review');
  const [composeBody, setComposeBody] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Email store
  const [emails, setEmails] = useState([
    {
      id: '1',
      category: 'inbox',
      sender: 'University Administration',
      addr: 'admin@university.edu',
      time: '10:24 AM',
      subject: 'University Fee Reminder • Semester 2',
      preview: 'Please find attached the schedule for semester registration and fee submission for the upcoming term...',
      avatar: 'UN',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      unread: true
    },
    {
      id: '2',
      category: 'important',
      sender: 'PrintFlow Client Team',
      addr: 'client@printflow.design',
      time: '9:15 AM',
      subject: 'PrintFlow Client Inquiry: Production Milestone',
      preview: 'Our production team has completed sprint 3 review. We would like to sync on color calibration tomorrow...',
      avatar: 'PF',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      unread: true
    },
    {
      id: '3',
      category: 'inbox',
      sender: 'Elena Rostova',
      addr: 'elena@techcorp.io',
      time: 'Yesterday',
      subject: 'Team Meeting Tomorrow: Architecture Review',
      preview: "Hi Varun, let's connect at 11 AM to finalize the neural pipeline schema and Supabase auth endpoints...",
      avatar: 'TM',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      unread: false
    },
    {
      id: '4',
      category: 'inbox',
      sender: 'GitHub Security',
      addr: 'notifications@github.com',
      time: 'Yesterday',
      subject: 'Project Update: Design System V2 Ready',
      preview: 'The new high-contrast dark cyberpunk UI components have been pushed to main branch. Automated tests passed...',
      avatar: 'GH',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      unread: false
    }
  ]);

  const toastTimerRef = useRef(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2800);
  };

  // Provider change logic
  const handleSelectProvider = (prov) => {
    setSelectedProvider(prov);
    const username = emailAddress.includes('@') ? emailAddress.split('@')[0] : (emailAddress || 'varun.reddy');
    if (prov === 'Gmail') setEmailAddress(`${username}@gmail.com`);
    else if (prov === 'Outlook') setEmailAddress(`${username}@outlook.com`);
    else if (prov === 'Yahoo') setEmailAddress(`${username}@yahoo.com`);
  };

  // Screen 1 Continue -> Screen 2 Progress Animation
  const startConnecting = () => {
    if (!emailAddress.includes('@') || !emailAddress.includes('.')) {
      showToast('⚠️ Please enter a valid email address');
      return;
    }
    localStorage.setItem('vozx_email_linked', 'true');
    localStorage.setItem('vozx_connected_email', emailAddress);
    setCurrentStep(2);
    setProgressPercent(0);

    const startTime = Date.now();
    const duration = 2400; // 2.4s smooth counter

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgressPercent(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setCurrentStep(3);
        }, 300);
      }
    }, 30);
  };

  // Screen 3 Auto-countdown to Screen 4
  useEffect(() => {
    if (currentStep === 3) {
      let count = 2;
      setAutoCountdown(count);
      const cd = setInterval(() => {
        count -= 1;
        setAutoCountdown(count);
        if (count <= 0) {
          clearInterval(cd);
          setCurrentStep(4);
          showToast('✨ VOZX Email Assistant is live!');
          if (onComplete) onComplete();
        }
      }, 1000);
      return () => clearInterval(cd);
    }
  }, [currentStep, onComplete]);

  // AI draft generation
  const handleGenerateDraft = () => {
    setIsDrafting(true);
    setTimeout(() => {
      setComposeBody(
`Hi Alex,

I hope you're having a productive week.

Following up on our project milestones: our team has finished testing the VOZX email integration pipeline. Let's sync tomorrow at 11:00 AM to review the release metrics.

Attached are the telemetry summaries for review.

Best regards,
Varun Reddy`
      );
      setIsDrafting(false);
      showToast('✨ AI draft generated!');
    }, 700);
  };

  // Send AI Draft
  const handleSendDraft = () => {
    setShowComposeModal(false);
    showToast(`🚀 Dispatched to ${composeTo}`);
    setEmails(prev => [
      {
        id: Date.now().toString(),
        category: 'sent',
        sender: 'You',
        addr: emailAddress,
        time: 'Just now',
        subject: composeSubj,
        preview: composeBody.slice(0, 80) + '...',
        avatar: 'ME',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        unread: false
      },
      ...prev
    ]);
  };

  // Quick Send
  const handleQuickSend = () => {
    if (!quickInput.trim()) return;
    showToast(`🚀 Dispatched: "${quickInput}"`);
    setQuickInput('');
  };

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const filteredEmails = emails.filter(e => {
    if (activeTab === 'inbox') return e.category === 'inbox' || e.category === 'important';
    if (activeTab === 'sent') return e.category === 'sent';
    return e.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center p-0 md:p-6 font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-36 -left-36 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-36 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl"></div>
        <div className="absolute -bottom-36 left-1/3 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      {/* Main Mobile Frame */}
      <div className="relative z-10 w-full max-w-md h-[890px] max-h-screen md:max-h-[880px] bg-[#070d1e]/90 backdrop-blur-2xl border border-cyan-500/30 md:rounded-[36px] shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col overflow-hidden">
        
        {/* Status Notch */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs text-slate-400 font-medium select-none">
          <span>9:41</span>
          <div className="w-24 h-4 bg-black/80 rounded-full border border-slate-800"></div>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            SCREEN 1: LINK YOUR EMAIL
           ------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col justify-between px-6 py-4 overflow-y-auto animate-fadeIn">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose || (() => window.history.back())}
                className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/60 transition shadow-inner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">VOZX AI</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              </div>
              
              <div className="w-10"></div>
            </div>

            {/* Hero Stage with 3D Orbiting Email Icon */}
            <div className="flex flex-col items-center text-center mt-2 mb-4">
              <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                {/* Orbital Ring 1 */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-[spin_8s_linear_infinite]" style={{ transform: 'rotateX(65deg)' }}></div>
                {/* Orbital Ring 2 */}
                <div className="absolute inset-2 rounded-full border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-[spin_12s_linear_infinite_reverse]" style={{ transform: 'rotateY(60deg) rotateZ(30deg)' }}></div>
                {/* Orbital Ring 3 */}
                <div className="absolute inset-4 rounded-full border border-blue-400/30 animate-[spin_10s_linear_infinite]" style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}></div>
                
                {/* Orbit Sparkles */}
                <div className="absolute -top-1 right-6 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                <div className="absolute bottom-2 left-6 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc] animate-ping"></div>

                {/* Central Glowing Email Box */}
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#0b162f] border border-cyan-400/60 p-4 shadow-[0_0_30px_rgba(34,211,238,0.35)] flex items-center justify-center">
                  <svg className="w-9 h-9 text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
                  </svg>
                </div>
              </div>

              <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase mb-1 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]">
                LINK YOUR EMAIL
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white mb-2">
                Let's connect<br />
                your <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">email</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                This helps us manage your emails, give you smart suggestions and keep you organized.
              </p>
            </div>

            {/* Glassmorphic Card Container */}
            <div className="bg-[#0b1329]/75 border border-cyan-500/40 rounded-[26px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              
              {/* Email Address Input */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-950/60 border border-slate-700/80 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Choose Your Email Provider
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Gmail', icon: 'M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.3l3.7 2.9C6.2 7.3 8.9 5 12 5z' },
                    { name: 'Outlook', icon: 'O' },
                    { name: 'Yahoo', icon: 'Y!' },
                    { name: 'Other', icon: '✉' }
                  ].map((prov) => {
                    const isSelected = selectedProvider === prov.name;
                    return (
                      <button
                        key={prov.name}
                        onClick={() => handleSelectProvider(prov.name)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-cyan-300 scale-[1.03]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="w-7 h-7 flex items-center justify-center font-bold text-xs mb-1">
                          {prov.name === 'Gmail' && (
                            <svg className="w-5 h-4" viewBox="0 0 24 18" fill="none">
                              <path d="M1.5 16.5V4.5C1.5 3.4 2.4 2.5 3.5 2.5H5.5L12 8L18.5 2.5H20.5C21.6 2.5 22.5 3.4 22.5 4.5V16.5C22.5 17.6 21.6 18.5 20.5 18.5H19V7.5L12 13L5 7.5V18.5H3.5C2.4 18.5 1.5 17.6 1.5 16.5Z" fill="#EA4335"/>
                              <path d="M19 7.5V18.5H20.5C21.6 18.5 22.5 17.6 22.5 16.5V4.5L19 7.5Z" fill="#4285F4"/>
                              <path d="M5 7.5L1.5 4.5V16.5C1.5 17.6 2.4 18.5 3.5 18.5H5V7.5Z" fill="#34A853"/>
                              <path d="M19 4.5V7.5L12 13L5 7.5V4.5L12 10L19 4.5Z" fill="#EA4335"/>
                              <path d="M18.5 2.5H20.5C21.6 2.5 22.5 3.4 22.5 4.5L19 7.5L12 2L18.5 2.5Z" fill="#FBBC05"/>
                            </svg>
                          )}
                          {prov.name === 'Outlook' && <span className="text-[#0078D4] font-black text-sm">O</span>}
                          {prov.name === 'Yahoo' && <span className="text-[#6001D2] font-black text-xs">Y!</span>}
                          {prov.name === 'Other' && <span className="text-slate-300 text-sm">✉</span>}
                        </div>
                        <span className="text-[11px] font-medium">{prov.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gradient Continue Button (Exact Gradient & Paperclip Icon) */}
              <button
                onClick={startConnecting}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#0ea5e9] via-[#22d3ee] to-[#a855f7] text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:brightness-110 active:scale-[0.99] transition"
              >
                {/* Paperclip Icon with Border */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-black/20 border border-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </div>
                  <span>Continue</span>
                </div>
                <span className="text-lg font-mono">&rarr;</span>
              </button>

              {/* Glowing OR Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                <span className="px-3 text-[10px] font-bold text-cyan-300 tracking-widest uppercase">OR</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
              </div>

              {/* Outline Scan QR Code Button */}
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900/40 border border-cyan-400/50 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                  <rect x="7" y="7" width="3" height="3" />
                  <rect x="14" y="7" width="3" height="3" />
                  <rect x="7" y="14" width="3" height="3" />
                  <rect x="14" y="14" width="3" height="3" />
                </svg>
                <span>Scan QR Code</span>
              </button>

            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-[11px] text-slate-500 mb-1">You can always connect your email later in settings.</p>
              <button
                onClick={() => setCurrentStep(4)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40"
              >
                Skip for Now
              </button>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------
            SCREEN 2: CONNECTING EMAIL
           ------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fadeIn">
            
            {/* Animated Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(15, 23, 42, 0.8)" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#reactProgressGrad)"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset] duration-75"
                />
                <defs>
                  <linearGradient id="reactProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner Floating Animated Envelope */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-cyan-500/15 border border-cyan-400/60 shadow-[0_0_20px_#22d3ee] flex items-center justify-center animate-pulse">
                  <svg className="w-7 h-7 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
                  </svg>
                </div>
              </div>
            </div>

            <span className="font-mono text-3xl font-extrabold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-3">
              {progressPercent}%
            </span>

            <h2 className="text-xl font-bold text-white mb-1.5">
              Connecting your {selectedProvider}...
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mb-8">
              Please wait while VOZX securely links your account and neural keys.
            </p>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <span>🔒</span>
              <span>256-Bit Encrypted OAuth Pipeline</span>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------
            SCREEN 3: EMAIL CONNECTED SUCCESSFULLY
           ------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fadeIn">
            
            {/* Glowing Green Success Checkmark */}
            <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center mb-6 animate-bounce">
              <svg className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_10px_#10b981]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold mb-3">
              ● Neural Sync Ready
            </span>

            <h2 className="text-2xl font-bold text-white mb-2">
              Email Connected Successfully!
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
              VOZX can now organize your emails, summarize inboxes, draft replies, and notify important messages.
            </p>

            {/* Unlocked Features List */}
            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2.5">
              {[
                'AI Smart Inbox Summaries',
                '1-Click Contextual Replies',
                'Priority & Deadline Extraction'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <span>Open Email Assistant</span>
              <span>&rarr;</span>
            </button>

            <span className="text-[11px] text-slate-500 mt-3">
              Auto-opening in {autoCountdown}s...
            </span>

          </div>
        )}

        {/* -------------------------------------------------------------
            SCREEN 4: EMAIL ASSISTANT DASHBOARD
           ------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
            
            {/* Dashboard Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-slate-800/80">
              <button
                onClick={onClose || (() => setCurrentStep(1))}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-xs text-white">VOZX AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                VR
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              
              {/* Title */}
              <div>
                <h1 className="text-xl font-bold text-white">Email Assistant</h1>
                <p className="text-xs text-slate-400">Write, organize, and manage your emails with AI.</p>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { key: 'inbox', label: 'Inbox', count: '12' },
                  { key: 'important', label: 'Important', count: '3' },
                  { key: 'sent', label: 'Sent' },
                  { key: 'drafts', label: 'Drafts', count: '2' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === tab.key ? 'bg-black/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* AI Compose Card */}
              <div
                onClick={() => setShowComposeModal(true)}
                className="bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-500/40 hover:border-purple-400 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition shadow-[0_4px_20px_rgba(168,85,247,0.15)] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">AI Compose</h3>
                    <p className="text-[11px] text-slate-400">Write a professional email in seconds.</p>
                  </div>
                </div>
                <span className="text-purple-300 text-base">&rarr;</span>
              </div>

              {/* Email Summary Card */}
              <div className="bg-[#0b1329]/80 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
                    <span>✉️</span>
                    <span>AI Inbox Synthesis</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  You have <strong className="text-white">12 unread emails</strong>, <strong className="text-cyan-300">3 important messages</strong>, and <strong className="text-purple-300">2 meeting invitations</strong> today.
                </p>
                <button
                  onClick={() => showToast('📊 Synthesis report expanded')}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Smart Reply Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">💡 Smart Reply Suggestions</span>
                  <span className="text-[10px] text-slate-500">Tap to use</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    "I'll take a look.",
                    "Sounds good, let's do it.",
                    "I'm on it.",
                    "Can we reschedule?"
                  ].map((rep, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuickInput(rep);
                        showToast(`💡 Inserted: "${rep}"`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 whitespace-nowrap transition cursor-pointer"
                    >
                      "{rep}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Emails List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Recent Emails</span>
                  <span className="text-[10px] text-cyan-400">{filteredEmails.length} Items</span>
                </div>

                <div className="space-y-2.5">
                  {filteredEmails.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setEmails(prev => prev.map(e => e.id === item.id ? { ...e, unread: false } : e));
                        showToast(`📬 Opened: ${item.subject}`);
                      }}
                      className={`p-3 rounded-2xl bg-[#090f23]/90 border transition cursor-pointer ${
                        item.unread
                          ? 'border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.1)]'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-bold ${item.color}`}>
                            {item.avatar}
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-white leading-tight">{item.sender}</span>
                            <span className="block text-[10px] text-slate-500 leading-tight">{item.addr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">{item.time}</span>
                          {item.unread && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 mt-1 mb-0.5 truncate">{item.subject}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.preview}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom AI Input Bar */}
            <div className="p-4 bg-[#070d1e] border-t border-slate-800/80">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 focus-within:border-cyan-400 transition">
                <button
                  type="button"
                  onClick={() => showToast('📎 File attachment picker opened')}
                  className="text-slate-400 hover:text-cyan-300 text-sm"
                  title="Attach"
                >
                  📎
                </button>
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSend()}
                  placeholder="Write your email with AI..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuickInput("Sounds great, I'll review and get back to you by 3 PM.");
                    showToast('🎙️ Voice dictation applied');
                  }}
                  className="text-slate-400 hover:text-cyan-300 text-sm"
                  title="Voice"
                >
                  🎙️
                </button>
                <button
                  type="button"
                  onClick={() => setQuickInput(prev => prev + ' ✨🤝')}
                  className="text-slate-400 hover:text-cyan-300 text-sm"
                  title="Emoji"
                >
                  😊
                </button>
                <button
                  type="button"
                  onClick={handleQuickSend}
                  className="w-7 h-7 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center font-bold hover:bg-cyan-300 shadow-[0_0_10px_#22d3ee] transition"
                  title="Send"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          QR SCANNER MODAL
         ------------------------------------------------------------- */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0b1329] border border-cyan-400/50 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(34,211,238,0.3)] animate-scaleUp">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">📷 QR Instant Sync</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Scan to Link Email</h3>
            <p className="text-[11px] text-slate-400 mb-4">Pair instantly using your mobile authenticator or webmail.</p>

            {/* QR Pattern Frame */}
            <div className="relative w-44 h-44 mx-auto bg-slate-950 border-2 border-cyan-400/60 rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-bounce"></div>
              <svg className="w-full h-full text-cyan-300" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="24" height="24" rx="3" />
                <rect x="16" y="16" width="12" height="12" fill="#0b1329" />
                <rect x="66" y="10" width="24" height="24" rx="3" />
                <rect x="72" y="16" width="12" height="12" fill="#0b1329" />
                <rect x="10" y="66" width="24" height="24" rx="3" />
                <rect x="16" y="72" width="12" height="12" fill="#0b1329" />
                <rect x="44" y="14" width="8" height="8" />
                <rect x="44" y="44" width="14" height="14" />
                <rect x="66" y="66" width="14" height="14" />
                <rect x="20" y="44" width="8" height="8" />
              </svg>
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                startConnecting();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              Simulate Instant Scan Success
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          AI COMPOSE MODAL
         ------------------------------------------------------------- */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0b1329] border border-purple-500/50 rounded-3xl p-5 shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-scaleUp">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">✨ AI Neural Composer</span>
              <button
                onClick={() => setShowComposeModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <h3 className="text-base font-bold text-white mb-3">Draft New Email</h3>
            
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="To: recipient@example.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <input
                type="text"
                value={composeSubj}
                onChange={(e) => setComposeSubj(e.target.value)}
                placeholder="Subject: Project Milestone"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <textarea
                rows={4}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Describe your intent or let AI draft..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-400 resize-none font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateDraft}
                disabled={isDrafting}
                className="flex-1 py-2.5 rounded-xl bg-purple-600/30 border border-purple-400 text-purple-200 text-xs font-bold hover:bg-purple-600/40 transition disabled:opacity-50"
              >
                {isDrafting ? '⚡ Drafting...' : '✨ Generate AI Draft'}
              </button>
              <button
                onClick={handleSendDraft}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 text-xs font-bold hover:brightness-110 transition shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                Send &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-400/80 text-white text-xs font-semibold shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-fadeIn">
          {toastMessage}
        </div>
      )}

    </div>
  );
}

