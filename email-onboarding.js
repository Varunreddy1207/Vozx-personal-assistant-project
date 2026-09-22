/**
 * VOZX AI — Email Assistant Onboarding & Dashboard Controller
 * Handles 4-screen flow, orbital animations, circular progress ring,
 * QR scanner simulation, AI Compose modal, smart replies, and local persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const screen1 = document.getElementById('screen1LinkEmail');
  const screen2 = document.getElementById('screen2Connecting');
  const screen3 = document.getElementById('screen3Success');
  const screen4 = document.getElementById('screen4Dashboard');

  const s1BackBtn = document.getElementById('s1BackBtn');
  const dashBackBtn = document.getElementById('dashBackBtn');
  const continueBtn = document.getElementById('continueBtn');
  const skipLinkBtn = document.getElementById('skipLinkBtn');
  const openEmailDashboardBtn = document.getElementById('openEmailDashboardBtn');
  const emailInput = document.getElementById('emailInput');
  const providerCards = document.querySelectorAll('.provider-card');
  const connectingTitle = document.getElementById('connectingTitle');
  const progressPercentLabel = document.getElementById('progressPercentLabel');
  const progressStrokeBar = document.getElementById('progressStrokeBar');
  const autoRedirectTimer = document.getElementById('autoRedirectTimer');

  // Modals & Tools
  const scanQrBtn = document.getElementById('scanQrBtn');
  const qrScannerModal = document.getElementById('qrScannerModal');
  const closeQrModal = document.getElementById('closeQrModal');
  const simulateQrSuccessBtn = document.getElementById('simulateQrSuccessBtn');

  const composeTriggerCard = document.getElementById('composeTriggerCard');
  const composeModal = document.getElementById('composeModal');
  const closeComposeModal = document.getElementById('closeComposeModal');
  const generateDraftBtn = document.getElementById('generateDraftBtn');
  const sendDraftBtn = document.getElementById('sendDraftBtn');
  const composePrompt = document.getElementById('composePrompt');
  const composeSubject = document.getElementById('composeSubject');
  const composeRecipient = document.getElementById('composeRecipient');

  // Dashboard quick bar
  const quickEmailInput = document.getElementById('quickEmailInput');
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const attachBtn = document.getElementById('attachBtn');
  const voiceEmailBtn = document.getElementById('voiceEmailBtn');
  const emojiEmailBtn = document.getElementById('emojiEmailBtn');
  const replyChips = document.querySelectorAll('.reply-chip');
  const catTabs = document.querySelectorAll('.cat-tab-pill');
  const emailsListContainer = document.getElementById('emailsListContainer');
  const emailToast = document.getElementById('emailToast');

  // Delete & Add Mail Elements
  const dashDeleteAccountBtn = document.getElementById('dashDeleteAccountBtn');
  const addMailBtn = document.getElementById('addMailBtn');
  const delMailIconBtn = document.getElementById('delMailIconBtn');
  const emailDeleteModal = document.getElementById('emailDeleteModal');
  const emailDelCancelBtn = document.getElementById('emailDelCancelBtn');
  const emailDelConfirmBtn = document.getElementById('emailDelConfirmBtn');
  const activeAccountEmailDisplay = document.getElementById('activeAccountEmailDisplay');
  const deleteAccountTargetEmail = document.getElementById('deleteAccountTargetEmail');
  const dashProfileBtn = document.getElementById('dashProfileBtn');

  // Account Switcher Elements
  const accountSwitcherTrigger = document.getElementById('accountSwitcherTrigger');
  const accountSwitcherModal = document.getElementById('accountSwitcherModal');
  const closeSwitcherModal = document.getElementById('closeSwitcherModal');
  const accountsListContainer = document.getElementById('accountsListContainer');
  const switcherAddAccountBtn = document.getElementById('switcherAddAccountBtn');

  let selectedProvider = 'Gmail';
  let progressInterval = null;
  let countdownInterval = null;

  // -------------------------------------------------------------
  // 1. Screen Switcher
  // -------------------------------------------------------------
  function showScreen(screenEl) {
    const screens = [screen1, screen2, screen3, screen4];
    screens.forEach(s => {
      if (s) {
        s.classList.remove('active');
      }
    });
    if (screenEl) {
      screenEl.classList.add('active');
      // Scroll to top of active screen
      screenEl.scrollTop = 0;
    }
  }

  // -------------------------------------------------------------
  // 2. Provider Selection
  // -------------------------------------------------------------
  providerCards.forEach(card => {
    card.addEventListener('click', () => {
      providerCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');

      selectedProvider = card.dataset.provider || 'Email';
      connectingTitle.textContent = `Connecting your ${selectedProvider}...`;

      // Smart update placeholder or email domain if standard
      if (emailInput) {
        const val = emailInput.value.trim();
        const username = val.includes('@') ? val.split('@')[0] : (val || 'varun.reddy');
        if (selectedProvider === 'Gmail') {
          emailInput.value = `${username}@gmail.com`;
        } else if (selectedProvider === 'Outlook') {
          emailInput.value = `${username}@outlook.com`;
        } else if (selectedProvider === 'Yahoo') {
          emailInput.value = `${username}@yahoo.com`;
        }
      }
    });
  });

  // -------------------------------------------------------------
  // 3. Screen 1 -> Screen 2 Progress Flow
  // -------------------------------------------------------------
  function startConnectionSequence() {
    const emailVal = emailInput.value.trim();
    if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
      showToast('⚠️ Please enter a valid email address');
      emailInput.focus();
      return;
    }

    // Save persistence
    localStorage.setItem('vozx_email_linked', 'true');
    localStorage.setItem('vozx_connected_email', emailVal);
    localStorage.setItem('vozx_connected_provider', selectedProvider);

    // Update or add to connectedAccounts list
    const existingIdx = connectedAccounts.findIndex(a => a.email.toLowerCase() === emailVal.toLowerCase());
    connectedAccounts.forEach(a => a.active = false);
    if (existingIdx >= 0) {
      connectedAccounts[existingIdx].active = true;
      connectedAccounts[existingIdx].provider = selectedProvider;
    } else {
      connectedAccounts.push({
        email: emailVal,
        provider: selectedProvider,
        active: true,
        unread: Math.floor(Math.random() * 8) + 4
      });
    }
    try { localStorage.setItem('vozx_connected_accounts', JSON.stringify(connectedAccounts)); } catch(e) {}
    updateConnectedAccountUI();

    // Switch to Screen 2
    showScreen(screen2);
    connectingTitle.textContent = `Connecting your ${selectedProvider}...`;

    // Animate circular progress ring (0% -> 100%)
    const circumference = 2 * Math.PI * 50; // r=50 -> ~314.159
    let currentPct = 0;
    if (progressStrokeBar) {
      progressStrokeBar.style.strokeDashoffset = circumference;
    }
    if (progressPercentLabel) {
      progressPercentLabel.textContent = '0%';
    }

    if (progressInterval) clearInterval(progressInterval);

    const startTime = Date.now();
    const durationMs = 2400; // 2.4s smooth progress

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let pct = Math.min(100, Math.round((elapsed / durationMs) * 100));

      if (progressPercentLabel) {
        progressPercentLabel.textContent = `${pct}%`;
      }
      if (progressStrokeBar) {
        const offset = circumference - (pct / 100) * circumference;
        progressStrokeBar.style.strokeDashoffset = offset;
      }

      if (pct >= 100) {
        clearInterval(progressInterval);
        setTimeout(showSuccessScreen, 300);
      }
    }, 30);
  }

  // -------------------------------------------------------------
  // 4. Screen 3 (Success Screen) with Auto-Redirect
  // -------------------------------------------------------------
  function showSuccessScreen() {
    showScreen(screen3);

    // Auto countdown redirect after 2s
    let remaining = 2;
    if (autoRedirectTimer) autoRedirectTimer.textContent = remaining;

    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
      remaining -= 1;
      if (autoRedirectTimer) autoRedirectTimer.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        showScreen(screen4);
        showToast('✨ VOZX Email Assistant is live!');
      }
    }, 1000);
  }

  // Manual button click on Screen 3
  if (openEmailDashboardBtn) {
    openEmailDashboardBtn.addEventListener('click', () => {
      if (countdownInterval) clearInterval(countdownInterval);
      showScreen(screen4);
      showToast('✨ VOZX Email Assistant is live!');
    });
  }

  // Continue button on Screen 1
  if (continueBtn) {
    continueBtn.addEventListener('click', startConnectionSequence);
  }

  // Skip for Now link
  if (skipLinkBtn) {
    skipLinkBtn.addEventListener('click', () => {
      showScreen(screen4);
      showToast('ℹ️ Email in guest preview mode. Connect anytime in settings.');
    });
  }

  // Back buttons
  if (s1BackBtn) {
    s1BackBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  if (dashBackBtn) {
    dashBackBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // -------------------------------------------------------------
  // Account Management: Multi-Account Switcher & Delete / Add Mail Actions
  // -------------------------------------------------------------
  const DEFAULT_ACCOUNTS = [
    { email: 'varun.reddy@gmail.com', provider: 'Gmail', active: true, unread: 12 },
    { email: 'varun.work@outlook.com', provider: 'Outlook', active: false, unread: 5 }
  ];

  let connectedAccounts = [];
  try {
    const raw = localStorage.getItem('vozx_connected_accounts');
    if (raw) {
      connectedAccounts = JSON.parse(raw);
    }
  } catch(e) {}

  if (!connectedAccounts || !connectedAccounts.length) {
    const savedSingle = localStorage.getItem('vozx_connected_email');
    if (savedSingle) {
      connectedAccounts = [
        { email: savedSingle, provider: localStorage.getItem('vozx_connected_provider') || 'Gmail', active: true, unread: 12 },
        { email: 'varun.work@outlook.com', provider: 'Outlook', active: false, unread: 5 }
      ];
    } else {
      connectedAccounts = [...DEFAULT_ACCOUNTS];
    }
    try { localStorage.setItem('vozx_connected_accounts', JSON.stringify(connectedAccounts)); } catch(e) {}
  }

  function getActiveAccount() {
    return connectedAccounts.find(a => a.active) || connectedAccounts[0] || null;
  }

  function updateConnectedAccountUI() {
    const active = getActiveAccount();
    if (!active) return;
    if (activeAccountEmailDisplay) activeAccountEmailDisplay.textContent = active.email;
    if (deleteAccountTargetEmail) deleteAccountTargetEmail.textContent = active.email;
    if (dashProfileBtn) dashProfileBtn.title = `Connected: ${active.email}`;

    // Update active inbox tab badge count
    const inboxTab = document.querySelector('.cat-tab-pill[data-tab="inbox"]');
    if (inboxTab) {
      const badge = inboxTab.querySelector('.tab-badge');
      if (badge) badge.textContent = active.unread;
    }
    // Update summary text
    const summaryBody = document.querySelector('.summary-body');
    if (summaryBody) {
      summaryBody.innerHTML = `You have <strong>${active.unread} unread emails</strong>, <strong>${Math.max(1, Math.round(active.unread * 0.3))} important messages</strong>, and <strong>2 meeting invitations</strong> today.`;
    }
  }
  updateConnectedAccountUI();

  function renderAccountsList() {
    if (!accountsListContainer) return;
    accountsListContainer.innerHTML = '';

    connectedAccounts.forEach((acc, idx) => {
      const row = document.createElement('div');
      row.className = `account-item-row ${acc.active ? 'active' : ''}`;
      row.tabIndex = 0;
      row.setAttribute('role', 'button');

      // Provider icon
      let iconSvg = '';
      if (acc.provider === 'Gmail') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/></svg>`;
      } else if (acc.provider === 'Outlook') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" fill="#0078D4"/><text x="12" y="16" font-family="'Space Grotesk', sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle">O</text></svg>`;
      } else if (acc.provider === 'Yahoo') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6001D2" d="M2.5 4h4.2l3.8 8.5L14.3 4h4.2l-6 12.2V20H9v-3.8L2.5 4z"/><circle cx="19.5" cy="18.5" r="2" fill="#6001D2"/></svg>`;
      } else {
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`;
      }

      row.innerHTML = `
        <div class="account-item-left">
          <div class="account-provider-avatar">${iconSvg}</div>
          <div class="account-details">
            <span class="account-email-text">${escapeHtml(acc.email)}</span>
            <div class="account-meta-line">
              <span>${escapeHtml(acc.provider)}</span>
              <span>&bull;</span>
              <span class="account-unread-tag">${acc.unread} unread</span>
            </div>
          </div>
        </div>
        <div class="account-item-right">
          ${acc.active ? `
            <span class="account-active-check" title="Active Account">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
          ` : ''}
          <button type="button" class="account-row-delete-btn" data-account-del="${idx}" title="Unlink this email">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      // Switch account click
      row.addEventListener('click', (e) => {
        if (e.target.closest('.account-row-delete-btn')) return;
        connectedAccounts.forEach((a, i) => a.active = (i === idx));
        try {
          localStorage.setItem('vozx_connected_accounts', JSON.stringify(connectedAccounts));
          localStorage.setItem('vozx_connected_email', acc.email);
          localStorage.setItem('vozx_connected_provider', acc.provider);
        } catch(e) {}
        updateConnectedAccountUI();
        closeAccountSwitcherModal();
        showToast(`✨ Switched active inbox to ${acc.email}`);
      });

      // Delete specific account click
      const delBtn = row.querySelector('.account-row-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetDel = connectedAccounts[idx];
          connectedAccounts.splice(idx, 1);
          if (targetDel.active && connectedAccounts.length > 0) {
            connectedAccounts[0].active = true;
          }
          if (connectedAccounts.length === 0) {
            closeAccountSwitcherModal();
            try {
              localStorage.setItem('vozx_email_linked', 'false');
              localStorage.removeItem('vozx_connected_accounts');
              localStorage.removeItem('vozx_connected_email');
            } catch(e) {}
            if (emailInput) emailInput.value = '';
            showScreen(screen1);
            showToast('🗑️ All email accounts removed. Connect an email to continue.');
            return;
          }
          try {
            localStorage.setItem('vozx_connected_accounts', JSON.stringify(connectedAccounts));
            const newActive = getActiveAccount();
            if (newActive) {
              localStorage.setItem('vozx_connected_email', newActive.email);
              localStorage.setItem('vozx_connected_provider', newActive.provider);
            }
          } catch(e) {}
          updateConnectedAccountUI();
          renderAccountsList();
          showToast(`🗑️ Removed ${targetDel.email}`);
        });
      }

      accountsListContainer.appendChild(row);
    });
  }

  function openAccountSwitcherModal() {
    renderAccountsList();
    if (accountSwitcherModal) accountSwitcherModal.classList.remove('hidden');
  }

  function closeAccountSwitcherModal() {
    if (accountSwitcherModal) accountSwitcherModal.classList.add('hidden');
  }

  if (accountSwitcherTrigger) {
    accountSwitcherTrigger.addEventListener('click', openAccountSwitcherModal);
  }
  if (closeSwitcherModal) {
    closeSwitcherModal.addEventListener('click', closeAccountSwitcherModal);
  }
  if (accountSwitcherModal) {
    accountSwitcherModal.addEventListener('click', (e) => {
      if (e.target === accountSwitcherModal) closeAccountSwitcherModal();
    });
  }

  if (switcherAddAccountBtn) {
    switcherAddAccountBtn.addEventListener('click', () => {
      closeAccountSwitcherModal();
      showScreen(screen1);
      if (emailInput) {
        emailInput.value = '';
        setTimeout(() => emailInput.focus(), 200);
      }
      showToast('📬 Enter the new email address to connect.');
    });
  }

  function openEmailDeleteModal() {
    const active = getActiveAccount();
    if (deleteAccountTargetEmail && active) deleteAccountTargetEmail.textContent = active.email;
    if (emailDeleteModal) emailDeleteModal.classList.remove('hidden');
  }

  function closeEmailDeleteModal() {
    if (emailDeleteModal) emailDeleteModal.classList.add('hidden');
  }

  if (dashDeleteAccountBtn) {
    dashDeleteAccountBtn.addEventListener('click', openEmailDeleteModal);
  }
  if (delMailIconBtn) {
    delMailIconBtn.addEventListener('click', openEmailDeleteModal);
  }
  if (emailDelCancelBtn) {
    emailDelCancelBtn.addEventListener('click', closeEmailDeleteModal);
  }
  if (emailDeleteModal) {
    emailDeleteModal.addEventListener('click', (e) => {
      if (e.target === emailDeleteModal) closeEmailDeleteModal();
    });
  }

  if (emailDelConfirmBtn) {
    emailDelConfirmBtn.addEventListener('click', () => {
      closeEmailDeleteModal();
      const active = getActiveAccount();
      const removedEmail = active ? active.email : 'Email account';
      
      // Remove the active account
      if (active) {
        const idx = connectedAccounts.indexOf(active);
        if (idx >= 0) connectedAccounts.splice(idx, 1);
      }

      if (connectedAccounts.length > 0) {
        connectedAccounts[0].active = true;
        try {
          localStorage.setItem('vozx_connected_accounts', JSON.stringify(connectedAccounts));
          const newActive = getActiveAccount();
          if (newActive) {
            localStorage.setItem('vozx_connected_email', newActive.email);
            localStorage.setItem('vozx_connected_provider', newActive.provider);
          }
        } catch(e) {}
        updateConnectedAccountUI();
        showToast(`🗑️ ${removedEmail} deleted. Switched to ${getActiveAccount().email}`);
      } else {
        // All accounts deleted -> Clear persistence and return to Screen 1 Link Your Email
        try {
          localStorage.setItem('vozx_email_linked', 'false');
          localStorage.removeItem('vozx_connected_accounts');
          localStorage.removeItem('vozx_connected_email');
        } catch(e) {}
        if (emailInput) emailInput.value = '';
        showScreen(screen1);
        showToast('🗑️ Email account deleted. Connect an email to continue.');
      }
    });
  }

  if (addMailBtn) {
    addMailBtn.addEventListener('click', () => {
      // Transition to Screen 1 to connect another email
      showScreen(screen1);
      if (emailInput) {
        emailInput.value = '';
        setTimeout(() => emailInput.focus(), 200);
      }
      showToast('📬 Enter the new email address to connect.');
    });
  }

  // -------------------------------------------------------------
  // 5. QR Code Modal Simulation
  // -------------------------------------------------------------
  if (scanQrBtn && qrScannerModal) {
    scanQrBtn.addEventListener('click', () => {
      qrScannerModal.classList.remove('hidden');
    });
  }
  if (closeQrModal && qrScannerModal) {
    closeQrModal.addEventListener('click', () => {
      qrScannerModal.classList.add('hidden');
    });
  }
  if (simulateQrSuccessBtn) {
    simulateQrSuccessBtn.addEventListener('click', () => {
      qrScannerModal.classList.add('hidden');
      showToast('⚡ QR Code successfully authenticated!');
      startConnectionSequence();
    });
  }

  // -------------------------------------------------------------
  // 6. AI Compose Modal
  // -------------------------------------------------------------
  if (composeTriggerCard && composeModal) {
    composeTriggerCard.addEventListener('click', () => {
      composeModal.classList.remove('hidden');
      if (composePrompt) composePrompt.focus();
    });
  }
  if (closeComposeModal && composeModal) {
    closeComposeModal.addEventListener('click', () => {
      composeModal.classList.add('hidden');
    });
  }

  if (generateDraftBtn) {
    generateDraftBtn.addEventListener('click', () => {
      const promptVal = composePrompt.value.trim() || 'Schedule project review';
      generateDraftBtn.disabled = true;
      generateDraftBtn.innerHTML = '<span>⚡ Neural Drafting...</span>';

      setTimeout(() => {
        composeSubject.value = 'Re: Project Milestone & Architecture Review';
        composePrompt.value =
`Hi Alex,

I hope you're having a productive week.

Following up on "${promptVal}": I have reviewed the sprint deliverables and our team has finalized the neural stream schema. Let's lock in tomorrow at 11:00 AM for the architecture review.

Please find the updated design tokens attached for your team's review.

Best regards,
Varun Reddy
VOZX AI Lead`;
        generateDraftBtn.disabled = false;
        generateDraftBtn.innerHTML = '<span>✨ Generate AI Draft</span>';
        showToast('✨ AI drafted your response!');
      }, 700);
    });
  }

  if (sendDraftBtn) {
    sendDraftBtn.addEventListener('click', () => {
      const recipient = composeRecipient.value.trim() || 'recipient@example.com';
      const subject = composeSubject.value.trim() || 'No Subject';
      composeModal.classList.add('hidden');
      showToast(`🚀 Dispatched to ${recipient}`);

      // Add to list as recent sent
      insertRecentEmail({
        sender: 'You',
        addr: 'varun.reddy@gmail.com',
        time: 'Just now',
        subject: subject,
        preview: composePrompt.value.slice(0, 75) + '...',
        avatar: 'ME',
        avatarClass: 'av-purple',
        unread: false
      });
    });
  }

  // -------------------------------------------------------------
  // 7. Category Tabs Filter
  // -------------------------------------------------------------
  const emailMockStore = [
    {
      id: '1',
      category: 'inbox',
      sender: 'University Administration',
      addr: 'admin@university.edu',
      time: '10:24 AM',
      subject: 'University Fee Reminder • Semester 2',
      preview: 'Please find attached the schedule for semester registration and fee submission for the upcoming term...',
      avatar: 'UN',
      avatarClass: 'av-blue',
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
      avatarClass: 'av-purple',
      unread: true
    },
    {
      id: '3',
      category: 'inbox',
      sender: 'Elena Rostova',
      addr: 'elena@techcorp.io',
      time: 'Yesterday',
      subject: 'Team Meeting Tomorrow: Architecture Review',
      preview: 'Hi Varun, let\'s connect at 11 AM to finalize the neural pipeline schema and Supabase auth endpoints...',
      avatar: 'TM',
      avatarClass: 'av-green',
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
      avatarClass: 'av-cyan',
      unread: false
    },
    {
      id: '5',
      category: 'important',
      sender: 'Apex Ventures',
      addr: 'partner@apexvc.com',
      time: 'Sep 18',
      subject: 'Term Sheet Inquiry: VOZX Seed Round',
      preview: 'Following our neural assistant demonstration on Monday, the partners are excited to discuss terms...',
      avatar: 'AV',
      avatarClass: 'av-blue',
      unread: true
    },
    {
      id: '6',
      category: 'drafts',
      sender: 'Draft',
      addr: 'varun.reddy@gmail.com',
      time: 'Sep 19',
      subject: 'Draft: Client contract addendum for V2 deployment',
      preview: 'Attached please find the modified service level agreement reflecting 99.99% neural uptime...',
      avatar: 'DR',
      avatarClass: 'av-purple',
      unread: false
    }
  ];

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const catKey = tab.dataset.tab;
      renderFilteredEmails(catKey);
    });
  });

  function renderFilteredEmails(category) {
    if (!emailsListContainer) return;
    emailsListContainer.innerHTML = '';

    const filtered = (category === 'inbox')
      ? emailMockStore.filter(e => e.category === 'inbox' || e.category === 'important')
      : (category === 'sent')
        ? emailMockStore.filter(e => e.category === 'sent')
        : emailMockStore.filter(e => e.category === category);

    if (filtered.length === 0) {
      emailsListContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: #94a3b8;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📭</div>
          <p style="font-size: 0.85rem;">No emails in ${category}</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const article = document.createElement('article');
      article.className = `email-glass-item ${item.unread ? 'unread' : ''}`;
      article.dataset.emailId = item.id;
      article.innerHTML = `
        <div class="email-item-header">
          <div class="sender-info">
            <div class="sender-avatar ${item.avatarClass || 'av-blue'}">${item.avatar}</div>
            <div>
              <span class="sender-name">${escapeHtml(item.sender)}</span>
              <span class="sender-addr">${escapeHtml(item.addr)}</span>
            </div>
          </div>
          <div class="email-meta">
            <span class="email-time">${item.time}</span>
            ${item.unread ? '<span class="unread-blue-dot" title="Unread"></span>' : ''}
          </div>
        </div>
        <h4 class="email-subject">${escapeHtml(item.subject)}</h4>
        <p class="email-preview">${escapeHtml(item.preview)}</p>
      `;

      article.addEventListener('click', () => {
        article.classList.remove('unread');
        const dot = article.querySelector('.unread-blue-dot');
        if (dot) dot.remove();
        item.unread = false;
        showToast(`📬 Opened: ${item.subject}`);
      });

      emailsListContainer.appendChild(article);
    });
  }

  function insertRecentEmail(emailObj) {
    emailMockStore.unshift({
      id: Date.now().toString(),
      category: 'sent',
      ...emailObj
    });
    renderFilteredEmails('inbox');
  }

  // -------------------------------------------------------------
  // 8. Smart Reply Chips
  // -------------------------------------------------------------
  replyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.textContent.replace(/^"|"$/g, '');
      if (quickEmailInput) {
        quickEmailInput.value = text;
        quickEmailInput.focus();
        showToast(`💡 Inserted suggestion: "${text}"`);
      }
    });
  });

  // -------------------------------------------------------------
  // 9. Quick AI Bar Handlers
  // -------------------------------------------------------------
  if (sendEmailBtn && quickEmailInput) {
    const handleQuickSend = () => {
      const text = quickEmailInput.value.trim();
      if (!text) {
        showToast('⚠️ Type or dictate a message first');
        return;
      }
      showToast('🚀 AI sending reply: ' + text);
      quickEmailInput.value = '';
    };

    sendEmailBtn.addEventListener('click', handleQuickSend);
    quickEmailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleQuickSend();
      }
    });
  }

  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      showToast('📎 Attachment modal opened: Choose file to attach');
    });
  }

  if (voiceEmailBtn) {
    let isListening = false;
    voiceEmailBtn.addEventListener('click', () => {
      isListening = !isListening;
      if (isListening) {
        voiceEmailBtn.style.filter = 'drop-shadow(0 0 10px #22d3ee)';
        showToast('🎙️ VOZX Neural Voice Listening...');
        setTimeout(() => {
          if (quickEmailInput) quickEmailInput.value = "Sounds great, I'll review and get back to you by 3 PM.";
          voiceEmailBtn.style.filter = 'none';
          showToast('✨ Voice transcription captured!');
          isListening = false;
        }, 1500);
      } else {
        voiceEmailBtn.style.filter = 'none';
      }
    });
  }

  if (emojiEmailBtn) {
    emojiEmailBtn.addEventListener('click', () => {
      if (quickEmailInput) {
        quickEmailInput.value += ' ✨🤝';
        quickEmailInput.focus();
      }
    });
  }

  // Initial email item click handlers
  document.querySelectorAll('.email-glass-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.remove('unread');
      const dot = item.querySelector('.unread-blue-dot');
      if (dot) dot.remove();
      const subject = item.querySelector('.email-subject')?.textContent || 'Email';
      showToast(`📬 Opened: ${subject}`);
    });
  });

  // -------------------------------------------------------------
  // 10. Toast Helper & Utils
  // -------------------------------------------------------------
  let toastTimeout = null;
  function showToast(msg, duration = 2800) {
    if (!emailToast) return;
    emailToast.textContent = msg;
    emailToast.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      emailToast.classList.remove('visible');
    }, duration);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose step jumper for direct URL testing / debugging, e.g. ?step=1, ?step=2, ?step=3, ?step=4 or #step1, #step2...
  const urlParams = new URLSearchParams(window.location.search);
  const hashVal = window.location.hash.toLowerCase().replace('#', '').replace('step=', '').replace('step', '');
  const stepParam = urlParams.get('step') || hashVal;

  if (stepParam === '2') {
    showScreen(screen2);
  } else if (stepParam === '3') {
    showScreen(screen3);
  } else if (stepParam === '4') {
    showScreen(screen4);
  } else {
    // Default Screen 1
    showScreen(screen1);
  }
});
