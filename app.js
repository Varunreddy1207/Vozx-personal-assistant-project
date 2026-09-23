/* ==========================================================================
   VOZX AI - Multi-Screen SPA Navigation & Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navigation & Screens
  const screensContainer = document.getElementById('screensContainer');
  const appScreens = document.querySelectorAll('.app-screen');
  const actionCards = document.querySelectorAll('[data-screen-target]');
  const navBackButtons = document.querySelectorAll('[data-nav-back]');
  const bottomNavTabs = document.querySelectorAll('.nav-tab-item');

  // Input & Global Controls
  const chatInput = document.getElementById('chatInput');
  const eqButton = document.getElementById('eqButton');
  const micBtn = document.getElementById('micBtn');
  const sendBtn = document.getElementById('sendBtn');
  const pillInputWrapper = document.querySelector('.pill-input-wrapper');
  const orbStage = document.getElementById('orbStage');
  const userNameGreeting = document.getElementById('userNameGreeting');
  const settingsUserName = document.getElementById('settingsUserName');
  const profileButtons = document.querySelectorAll('.profile-button');
  const editProfileBadgeBtn = document.getElementById('editProfileBadgeBtn');
  const editProfileHeaderBtn = document.getElementById('editProfileHeaderBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const seeAllBtn = document.getElementById('seeAllBtn');
  const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
  const getStartedActionBtn = document.getElementById('getStartedActionBtn');
  const getStartedSignInLink = document.getElementById('getStartedSignInLink');

  // Modals & Feedback
  const toastMsg = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  const modalOverlay = document.getElementById('modalOverlay');
  const sheetTitle = document.getElementById('sheetTitle');
  const sheetBody = document.getElementById('sheetBody');
  const sheetCloseBtn = document.getElementById('sheetCloseBtn');

  // =========================================================================
  // MULTI-SCREEN NAVIGATION CONTROLLER (SPA)
  // =========================================================================
  let navHistory = ['home'];
  let isCurrentlyOffline = false;

  function navigateToScreen(targetScreenId, pushHistory = true) {
    // Lock-in: User cannot navigate to website screens without an active internet connection
    if (isCurrentlyOffline && targetScreenId !== 'offline') {
      const offlineScreen = document.querySelector(`.app-screen[data-screen="offline"]`);
      if (offlineScreen && !offlineScreen.classList.contains('active')) {
        targetScreenId = 'offline';
      } else {
        showToast('📡 No internet connection. Reconnect to access VOZX AI.');
        return;
      }
    }

    const targetScreen = document.querySelector(`.app-screen[data-screen="${targetScreenId}"]`);
    if (!targetScreen) return;

    // Transition screens
    appScreens.forEach(screen => {
      screen.classList.remove('active');
    });
    targetScreen.classList.add('active');

    // Dismiss any modals and overlays if navigating to offline screen
    if (targetScreenId === 'offline') {
      if (modalOverlay) modalOverlay.classList.remove('active');
      const profileModal = document.getElementById('profileEditModal');
      if (profileModal) profileModal.classList.remove('active');
      const settingsModal = document.getElementById('settingsModal');
      if (settingsModal) settingsModal.classList.remove('active');
      const delModal = document.getElementById('deleteConfirmModal');
      if (delModal) delModal.classList.remove('active');
      const switcherModal = document.getElementById('mainAccountSwitcherModal');
      if (switcherModal) switcherModal.classList.remove('active');
    }

    // Manage text bar visibility with animation
    const bottomBar = document.querySelector('.bottom-bar-container');
    if (bottomBar) {
      if (targetScreenId === 'home' || targetScreenId === 'chat') {
        bottomBar.classList.remove('bar-hidden');
        bottomBar.classList.add('bar-visible');
      } else {
        bottomBar.classList.remove('bar-visible');
        bottomBar.classList.add('bar-hidden');
      }
    }

    // Toggle subscreen, chat, and offline active classes on viewport
    const phoneViewport = document.querySelector('.phone-viewport-container');
    if (phoneViewport) {
      phoneViewport.classList.toggle('subscreen-active', targetScreenId !== 'home' && targetScreenId !== 'chat');
      phoneViewport.classList.toggle('chat-active', targetScreenId === 'chat');
      phoneViewport.classList.toggle('offline-active', targetScreenId === 'offline');
    }

    // Maintain navigation history stack
    if (pushHistory) {
      if (navHistory[navHistory.length - 1] !== targetScreenId) {
        navHistory.push(targetScreenId);
      }
    }

    // Synchronize bottom navigation tab highlights
    bottomNavTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetScreenId);
    });

    // Scroll to top of the screen view smoothly
    screensContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    // User cannot go back without internet
    if (isCurrentlyOffline) {
      showToast('📡 No internet connection. Reconnect to access VOZX AI.');
      return;
    }
    if (navHistory.length > 1) {
      navHistory.pop(); // Remove current screen
      const prevScreenId = navHistory[navHistory.length - 1];
      navigateToScreen(prevScreenId, false);
    } else {
      navigateToScreen('home', false);
    }
  }

  // Intercept browser back / popstate navigation when offline
  window.addEventListener('popstate', () => {
    if (isCurrentlyOffline) {
      history.pushState(null, '', window.location.href);
      const offlineScreen = document.querySelector(`.app-screen[data-screen="offline"]`);
      if (offlineScreen && !offlineScreen.classList.contains('active')) {
        navigateToScreen('offline', false);
      }
      showToast('📡 No internet connection. Reconnect to access VOZX AI.');
    }
  });

  // Bind All Header Back Buttons
  navBackButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      goBack();
    });
  });

  // Bind Home 2x4 Grid Action Cards
  actionCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = card.dataset.screenTarget;
      if (!target) return;

      // If offline, redirect to offline diagnostic screen for features requiring network
      if (typeof isCurrentlyOffline !== 'undefined' && isCurrentlyOffline) {
        if (target === 'voice' || target === 'chat' || target === 'pdf' || target === 'email') {
          navigateToScreen('offline');
          showToast('📡 This feature requires an active internet connection.');
          return;
        }
      }

      if (target === 'voice') {
        activateVoiceMode();
      } else if (target === 'chat') {
        card.classList.add('highlight-golden');
        setTimeout(() => {
          card.classList.remove('highlight-golden');
          navigateToScreen('chat');
          chatInput?.focus();
        }, 220);
      } else {
        navigateToScreen(target);
      }
    });
  });

  // Bind Bottom Navigation Tabs
  bottomNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      if (targetTab) {
        navigateToScreen(targetTab);
      }
    });
  });

  // Open Chat Screen when Bottom Search Pill is Clicked / Focused
  if (chatInput) {
    chatInput.addEventListener('focus', () => {
      const activeScreen = document.querySelector('.app-screen.active');
      if (activeScreen?.dataset.screen !== 'chat') {
        navigateToScreen('chat');
      }
    });
  }

  if (pillInputWrapper) {
    pillInputWrapper.addEventListener('click', (e) => {
      if (!e.target.closest('#eqButton') && !e.target.closest('#micBtn') && !e.target.closest('#sendBtn')) {
        const activeScreen = document.querySelector('.app-screen.active');
        if (activeScreen?.dataset.screen !== 'chat') {
          navigateToScreen('chat');
        }
        chatInput?.focus();
      }
    });
  }

  // =========================================================================
  // USER PROFILE & EDIT NAME
  // =========================================================================
  let currentUserName = 'Varun Reddy';
  try {
    const saved = localStorage.getItem('vozx_user_name');
    if (saved && saved.trim()) {
      currentUserName = saved.trim();
    }
  } catch (e) {}

  function updateUserNameDisplays(name) {
    if (userNameGreeting) userNameGreeting.textContent = name;
  }
  updateUserNameDisplays(currentUserName);

  function openEditNameDialog() {
    openSheet(
      'Edit Profile',
      `<div class="name-edit-form">
        <label class="name-edit-label" for="nameInputField">Your Name:</label>
        <input 
          type="text" 
          id="nameInputField" 
          class="name-input-field" 
          value="${escapeHtml(currentUserName)}" 
          placeholder="Your name..."
          maxlength="32"
          autocomplete="off"
        />
        <div class="name-edit-actions">
          <button id="saveNameBtn" class="name-save-btn">Save Changes</button>
          <button id="cancelNameBtn" class="name-cancel-btn">Cancel</button>
        </div>
       </div>`,
      false
    );

    setTimeout(() => {
      const input = document.getElementById('nameInputField');
      if (input) {
        input.focus();
        input.select();
      }
    }, 120);

    const saveBtn = document.getElementById('saveNameBtn');
    const cancelBtn = document.getElementById('cancelNameBtn');
    const inputField = document.getElementById('nameInputField');

    const handleSave = () => {
      const newName = inputField?.value.trim();
      if (newName && newName.length > 0) {
        currentUserName = newName;
        updateUserNameDisplays(currentUserName);
        try {
          localStorage.setItem('vozx_user_name', currentUserName);
        } catch (e) {}
        closeSheet();
        showToast(`Hello ${currentUserName}! Profile updated.`);
      } else {
        showToast('Please enter a valid name');
      }
    };

    saveBtn?.addEventListener('click', handleSave);
    cancelBtn?.addEventListener('click', closeSheet);
    inputField?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    });
  }

  // =========================================================================
  // LOGOUT CONTROLLER
  // =========================================================================
  async function performLogout() {
    closeSheet();
    try {
      if (window.VozxAuth && window.VozxAuth.signOutUser) {
        await window.VozxAuth.signOutUser();
      } else {
        localStorage.setItem('vozx_is_logged_in', 'false');
      }
    } catch (e) {}
    showToast('Logged out of VOZX AI');
    navHistory = ['getstarted'];
    navigateToScreen('getstarted', false);
  }

  if (editProfileHeaderBtn) {
    editProfileHeaderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openEditNameDialog();
    });
  }
  if (editProfileBadgeBtn) {
    editProfileBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditNameDialog();
    });
  }
  profileButtons.forEach(btn => btn.addEventListener('click', openEditNameDialog));

  // =========================================================================
  // TOAST & SHEET MODALS
  // =========================================================================
  let toastTimer = null;
  function showToast(message) {
    if (!toastMsg || !toastText) return;
    toastText.textContent = message;
    toastMsg.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2400);
  }

  function openSheet(title, contentHtml, showDismissBtn = true) {
    if (!modalOverlay) return;
    sheetTitle.textContent = title;
    sheetBody.innerHTML = contentHtml;
    if (sheetCloseBtn) {
      sheetCloseBtn.textContent = 'Dismiss';
      sheetCloseBtn.style.display = showDismissBtn ? 'block' : 'none';
    }
    modalOverlay.classList.add('active');
  }

  function closeSheet() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
  }

  if (sheetCloseBtn) sheetCloseBtn.addEventListener('click', closeSheet);
  const sheetCloseHeaderBtn = document.getElementById('sheetCloseHeaderBtn');
  if (sheetCloseHeaderBtn) sheetCloseHeaderBtn.addEventListener('click', closeSheet);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeSheet();
    });
  }

  // =========================================================================
  // SCREEN 1: PDF ASSISTANT INTERACTIVITY
  // =========================================================================
  const pdfUploadZone = document.getElementById('pdfUploadZone');
  const pdfSummaryCard = document.getElementById('pdfSummaryCard');
  const pdfQaInput = document.getElementById('pdfQaInput');
  const pdfQaSendBtn = document.getElementById('pdfQaSendBtn');
  const pdfCharCount = document.getElementById('pdfCharCount');
  const thumbnailCards = document.querySelectorAll('.thumbnail-card');
  const pdfItemRows = document.querySelectorAll('.pdf-item-row');

  if (pdfUploadZone) {
    pdfUploadZone.addEventListener('click', () => {
      showToast('Uploaded: Project_Blueprint_2026.pdf (3.4 MB)');
    });
  }

  if (pdfSummaryCard) {
    pdfSummaryCard.addEventListener('click', () => {
      openSheet(
        'AI PDF Summary',
        `<div style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <h4 style="color: #38bdf8; margin-bottom: 6px;">Machine Learning Notes.pdf</h4>
          <p>• Chapter 3: Convolutional neural networks and attention layers.<br>
             • Key formula: Attention(Q, K, V) = softmax(QK^T / √d_k)V.<br>
             • Next milestone: Optimization with AdamW and learning rate decay scheduling.</p>
        </div>`
      );
    });
  }

  if (pdfQaInput) {
    pdfQaInput.addEventListener('input', () => {
      if (pdfCharCount) {
        pdfCharCount.textContent = `${pdfQaInput.value.length}/500`;
      }
    });

    const handlePdfQuestion = () => {
      const q = pdfQaInput.value.trim();
      if (!q) return;
      pdfQaInput.value = '';
      if (pdfCharCount) pdfCharCount.textContent = '0/500';
      openSheet('PDF Assistant Answer', `<p style="color: #38bdf8; font-size: 12px; margin-bottom: 6px;">Q: ${escapeHtml(q)}</p><p style="font-size: 13.5px; color: #e2e8f0; line-height: 1.55;">According to Section 4.2 of the loaded document, neural weights converge within 40 epochs when utilizing gradient clipping with momentum set to 0.9.</p>`);
    };

    pdfQaSendBtn?.addEventListener('click', handlePdfQuestion);
    pdfQaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePdfQuestion();
      }
    });
  }

  thumbnailCards.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbnailCards.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const pNum = thumb.querySelector('.thumb-page-num')?.textContent || '1';
      showToast(`Rendered Page ${pNum}`);
    });
  });

  pdfItemRows.forEach(row => {
    row.addEventListener('click', () => {
      const title = row.querySelector('div > div:first-child')?.textContent || 'Document';
      showToast(`Selected: ${title}`);
    });
  });

  // =========================================================================
  // SCREEN 2: MEMORY SCREEN INTERACTIVITY
  // =========================================================================
  const memoryPills = document.querySelectorAll('.filter-pill-btn[data-filter]');
  const rememberedCards = document.querySelectorAll('.remembered-card[data-category]');
  const memoryToggleBtn = document.getElementById('memoryToggleBtn');
  const memoryStatusText = document.getElementById('memoryStatusText');
  const memorySwitchIcon = document.getElementById('memorySwitchIcon');

  let isMemoryActive = true;
  function toggleMemory() {
    isMemoryActive = !isMemoryActive;
    if (memoryToggleBtn) memoryToggleBtn.classList.toggle('off', !isMemoryActive);
    if (memorySwitchIcon) memorySwitchIcon.classList.toggle('active', isMemoryActive);
    if (memoryStatusText) memoryStatusText.textContent = isMemoryActive ? 'On' : 'Off';
    showToast(isMemoryActive ? 'Memory On: Persistent recall active' : 'Memory Off: Ephemeral session');
  }

  if (memoryToggleBtn) {
    memoryToggleBtn.addEventListener('click', toggleMemory);
  }

  memoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      memoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;

      rememberedCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
      showToast(`Filter: ${pill.textContent.trim()}`);
    });
  });

  // =========================================================================
  // SCREEN 3: PLANNER SCREEN INTERACTIVITY
  // =========================================================================
  const calCells = document.querySelectorAll('.cal-cell:not([style*="opacity"])');
  const plannerTasks = document.querySelectorAll('#screenPlanner .task-item');
  const plannerFabBtn = document.getElementById('plannerFabBtn');

  calCells.forEach(cell => {
    cell.addEventListener('click', () => {
      document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('today-active'));
      cell.classList.add('today-active');
      showToast(`Planner: September ${cell.textContent.trim()}, 2026`);
    });
  });

  plannerTasks.forEach(task => {
    task.addEventListener('click', () => {
      task.classList.toggle('done');
      const box = task.querySelector('.task-checkbox');
      const isDone = task.classList.contains('done');
      if (box) box.textContent = isDone ? '✓' : '';
      const label = task.querySelector('.task-label')?.textContent || 'Task';
      showToast(isDone ? `Completed: ${label}` : `Pending: ${label}`);
    });
  });

  if (plannerFabBtn) {
    plannerFabBtn.addEventListener('click', () => {
      openSheet('Add Planner Milestone', `<div style="display: flex; flex-direction: column; gap: 10px;"><input type="text" placeholder="Milestone title..." class="name-input-field"><button class="name-save-btn" onclick="document.getElementById('modalOverlay').classList.remove('active');">Schedule Task</button></div>`);
    });
  }

  // =========================================================================
  // SCREEN 4: NOTES SCREEN INTERACTIVITY
  // =========================================================================
  const notesFabBtn = document.getElementById('notesFabBtn');
  const notesSearchInput = document.querySelector('#screenNotes .subscreen-search-input');
  const noteActionBtns = document.querySelectorAll('.note-action-btn');
  const notesFolderCards = document.querySelectorAll('.notes-folder-card');

  if (notesFabBtn) {
    notesFabBtn.addEventListener('click', () => {
      openSheet('Create New Note', `<div style="display: flex; flex-direction: column; gap: 10px;"><input type="text" placeholder="Note Title..." class="name-input-field"><textarea placeholder="Write note content..." class="name-input-field" style="height: 100px; resize: none;"></textarea><button class="name-save-btn" onclick="document.getElementById('modalOverlay').classList.remove('active');">Save Encrypted Note</button></div>`);
    });
  }

  noteActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.querySelector('.note-action-label')?.textContent || 'Note';
      showToast(`Initiating ${type}...`);
    });
  });

  notesFolderCards.forEach(card => {
    card.addEventListener('click', () => {
      // Intentionally silent folder selection
    });
  });

  if (notesSearchInput) {
    notesSearchInput.addEventListener('input', () => {
      const q = notesSearchInput.value.toLowerCase().trim();
      document.querySelectorAll('#screenNotes .remembered-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'block' : 'none';
      });
    });
  }

  // =========================================================================
  // SCREEN 5: FILES SCREEN INTERACTIVITY
  // =========================================================================
  const folderBoxes = document.querySelectorAll('.folder-box');
  const addFolderBtn = document.getElementById('addFolderBtn');

  folderBoxes.forEach(box => {
    box.addEventListener('click', () => {
      if (box === addFolderBtn) {
        openSheet('Create Folder', `<div style="display: flex; flex-direction: column; gap: 10px;"><input type="text" placeholder="Folder Name..." class="name-input-field"><button class="name-save-btn" onclick="document.getElementById('modalOverlay').classList.remove('active');">Create Vault</button></div>`);
      } else {
        const fName = box.querySelector('.folder-name')?.textContent || 'Folder';
        showToast(`Files Vault: ${fName}`);
      }
    });
  });

  // =========================================================================
  // SCREEN 6: EMAIL ASSISTANT INTERACTIVITY
  // =========================================================================
  const emailTabs = document.querySelectorAll('[data-email-tab]');
  const emailReplyChips = document.querySelectorAll('[data-email-reply]');
  const emailDockInput = document.getElementById('emailDockInput');
  const emailDockSendBtn = document.getElementById('emailDockSendBtn');
  const aiComposeCard = document.getElementById('aiComposeCard');
  const emailSummaryCard = document.getElementById('emailSummaryCard');
  const emailPreviewItems = document.querySelectorAll('.email-preview-item');

  emailTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      emailTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showToast(`Email Tab: ${tab.textContent.trim()}`);
    });
  });

  emailReplyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const reply = chip.dataset.emailReply || chip.textContent.replace(/^"|"$/g, '');
      if (emailDockInput) {
        emailDockInput.value = reply;
        emailDockInput.focus();
        showToast('Smart reply loaded into compose');
      }
    });
  });

  if (emailDockSendBtn) {
    emailDockSendBtn.addEventListener('click', () => {
      const msg = emailDockInput?.value.trim();
      if (msg) {
        emailDockInput.value = '';
        showToast('Email sent securely via VOZX Mail API');
      } else {
        emailDockInput?.focus();
        showToast('Please type an email message');
      }
    });
  }

  if (aiComposeCard) {
    aiComposeCard.addEventListener('click', () => {
      openSheet('AI Email Composer', `<div style="display: flex; flex-direction: column; gap: 10px;"><input type="text" placeholder="Recipient (e.g. team@vozx.ai)" class="name-input-field"><input type="text" placeholder="Subject..." class="name-input-field"><textarea placeholder="Prompt AI: e.g. Draft an update on PrintFlow milestones..." class="name-input-field" style="height: 90px; resize: none;"></textarea><button class="name-save-btn" onclick="document.getElementById('modalOverlay').classList.remove('active');">Generate Draft</button></div>`);
    });
  }

  if (emailSummaryCard) {
    emailSummaryCard.addEventListener('click', () => {
      openSheet('Priority Email Triage', `<p style="font-size: 13px; color: #cbd5e1; line-height: 1.55;"><strong>12 Unread Messages</strong><br>• University Fee Reminder (Due Sep 25)<br>• PrintFlow Client Inquiry (Deliverable v2)<br>• Team Meeting Tomorrow (9:30 AM)</p>`);
    });
  }

  emailPreviewItems.forEach(item => {
    item.addEventListener('click', () => {
      // Intentionally silent email preview selection
    });
  });

  // =========================================================================
  // SCREEN 7: CHAT INTERACTION
  // =========================================================================
  const chatMessagesList = document.getElementById('chatMessagesList');

  function handleSendMessage() {
    if (!chatInput) return;
    const query = chatInput.value.trim();
    if (!query) return;

    // Guard if offline
    if (typeof isCurrentlyOffline !== 'undefined' && isCurrentlyOffline) {
      navigateToScreen('offline');
      showToast('📡 You are currently offline. Reconnect to chat with VOZX AI.');
      return;
    }

    chatInput.value = '';
    sendBtn?.classList.remove('active-ready');

    // Ensure we are on the Chat Screen
    navigateToScreen('chat');

    appendUserMessage(query);
    setTimeout(() => {
      appendAiResponse(query);
    }, 550);
  }

  if (chatInput) {
    chatInput.addEventListener('input', () => {
      if (chatInput.value.trim().length > 0) {
        sendBtn?.classList.add('active-ready');
      } else {
        sendBtn?.classList.remove('active-ready');
      }
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSendMessage();
    });
  }

  function appendUserMessage(text) {
    if (!chatMessagesList) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    chatMessagesList.appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function appendAiResponse(userQuery) {
    if (!chatMessagesList) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai';
    bubble.innerHTML = `Synthesizing neural response for <strong>"${escapeHtml(userQuery)}"</strong>... Integrated context loaded across PDF, Memory, and Planner agents.`;
    chatMessagesList.appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  // =========================================================================
  // VOICE MODE ISOLATION (Only Header + Orb + Greeting + Bottom Mic + Back Button)
  // =========================================================================
  let isVoiceModeActive = false;
  let isVoiceMicMuted = false;
  const voiceBackBtn = document.getElementById('voiceBackBtn');
  const voiceMainMicBtn = document.getElementById('voiceMainMicBtn');
  const voiceStatusText = document.getElementById('voiceStatusText');

  function activateVoiceMode() {
    isVoiceModeActive = true;
    isVoiceMicMuted = false;
    const phoneViewport = document.querySelector('.phone-viewport-container');
    if (phoneViewport) phoneViewport.classList.add('voice-mode-active');
    document.body.classList.add('voice-mode-active');

    // Ensure we are on Home screen
    const currentActive = document.querySelector('.app-screen.active');
    if (!currentActive || currentActive.dataset.screen !== 'home') {
      navigateToScreen('home');
    }

    screensContainer?.scrollTo({ top: 0, behavior: 'smooth' });
    eqButton?.classList.add('is-listening');
    micBtn?.classList.add('text-sky-400');
    orbStage?.classList.add('voice-listening');

    // Reset mic button state
    if (voiceMainMicBtn) {
      voiceMainMicBtn.classList.add('listening');
      voiceMainMicBtn.classList.remove('muted');
      const micSvg = voiceMainMicBtn.querySelector('.voice-mic-svg');
      const mutedSvg = voiceMainMicBtn.querySelector('.voice-mic-muted-svg');
      micSvg?.classList.remove('hidden');
      mutedSvg?.classList.add('hidden');
    }
    if (voiceStatusText) voiceStatusText.textContent = 'Listening... Tap mic to mute';

    showToast('🎙️ Voice Mode Active • Listening...');
  }

  function deactivateVoiceMode(silent = false) {
    if (!isVoiceModeActive) return;
    isVoiceModeActive = false;
    const phoneViewport = document.querySelector('.phone-viewport-container');
    if (phoneViewport) phoneViewport.classList.remove('voice-mode-active');
    document.body.classList.remove('voice-mode-active');

    eqButton?.classList.remove('is-listening');
    micBtn?.classList.remove('text-sky-400');
    orbStage?.classList.remove('voice-listening');
    if (!silent) {
      showToast('Voice Mode Ended • Welcome Back');
    }
  }

  function toggleVoice() {
    if (isVoiceModeActive) {
      deactivateVoiceMode();
    } else {
      activateVoiceMode();
    }
  }

  if (voiceBackBtn) {
    voiceBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deactivateVoiceMode();
    });
  }

  if (voiceMainMicBtn) {
    voiceMainMicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isVoiceMicMuted = !isVoiceMicMuted;
      const micSvg = voiceMainMicBtn.querySelector('.voice-mic-svg');
      const mutedSvg = voiceMainMicBtn.querySelector('.voice-mic-muted-svg');

      if (isVoiceMicMuted) {
        voiceMainMicBtn.classList.remove('listening');
        voiceMainMicBtn.classList.add('muted');
        micSvg?.classList.add('hidden');
        mutedSvg?.classList.remove('hidden');
        if (voiceStatusText) voiceStatusText.textContent = 'Microphone Muted • Tap to speak';
        orbStage?.classList.remove('voice-listening');
        showToast('🔇 Microphone Muted');
      } else {
        voiceMainMicBtn.classList.add('listening');
        voiceMainMicBtn.classList.remove('muted');
        micSvg?.classList.remove('hidden');
        mutedSvg?.classList.add('hidden');
        if (voiceStatusText) voiceStatusText.textContent = 'Listening... Tap mic to mute';
        orbStage?.classList.add('voice-listening');
        showToast('🎙️ Microphone Active • Listening...');
      }
    });
  }

  if (eqButton) eqButton.addEventListener('click', toggleVoice);
  if (micBtn) micBtn.addEventListener('click', toggleVoice);

  // Click empty area on Home screen or press Escape to exit Voice Mode
  const screenHomeEl = document.getElementById('screenHome');
  if (screenHomeEl) {
    screenHomeEl.addEventListener('click', (e) => {
      if (!isVoiceModeActive) return;
      if (e.target.closest('.header-section') || e.target.closest('#orbStage') || e.target.closest('#gridMenuSection') || e.target.closest('#voiceModeBottomBar')) return;
      deactivateVoiceMode();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isVoiceModeActive) {
      deactivateVoiceMode();
    }
  });

  // Settings Modal
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      openSheet(
        'System Settings',
        `<div class="settings-modal-content">
          <div class="settings-row">
            <span class="settings-row-label">Dark Neon Theme</span>
            <span class="settings-badge-active">Active</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Multi-Screen Navigation</span>
            <span class="settings-badge-green">SPA Enabled</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Episodic Memory Sync</span>
            <span class="settings-badge-blue">2,410 Entities</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Active Account</span>
            <span style="color: #94a3b8; font-size: 12px;">varun.reddy@gmail.com</span>
          </div>
          <div style="margin-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px; width: 100%;">
            <button id="settingsLogoutBtn" class="profile-logout-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out of VOZX AI</span>
            </button>
          </div>
         </div>`,
        true
      );

      if (sheetCloseBtn) sheetCloseBtn.textContent = 'Done';
      document.getElementById('settingsLogoutBtn')?.addEventListener('click', performLogout);
    });
  }

  // =========================================================================
  // GET STARTED & AUTHENTICATION SCREENS (SIGN IN & CREATE ACCOUNT)
  // =========================================================================

  // Get Started Screen navigation buttons
  if (getStartedActionBtn) {
    getStartedActionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToScreen('signup');
    });
  }

  if (getStartedSignInLink) {
    getStartedSignInLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToScreen('signin');
    });
  }

  // Back buttons from Auth Screens
  document.getElementById('signinBackBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToScreen('getstarted');
  });

  document.getElementById('signupBackBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToScreen('getstarted');
  });

  // Switch between Sign In and Create Account
  document.getElementById('spaToSignUpBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToScreen('signup');
  });

  document.getElementById('spaToSignInBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToScreen('signin');
  });

  // Password Visibility Toggles
  const spaSignInTogglePass = document.getElementById('spaSignInTogglePass');
  const spaSignInPassword = document.getElementById('spaSignInPassword');
  if (spaSignInTogglePass && spaSignInPassword) {
    spaSignInTogglePass.addEventListener('click', () => {
      const isPass = spaSignInPassword.type === 'password';
      spaSignInPassword.type = isPass ? 'text' : 'password';
      spaSignInTogglePass.innerHTML = isPass
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  const spaSignUpTogglePass = document.getElementById('spaSignUpTogglePass');
  const spaSignUpPassword = document.getElementById('spaSignUpPassword');
  const spaSignUpConfirm = document.getElementById('spaSignUpConfirm');
  if (spaSignUpTogglePass && spaSignUpPassword) {
    spaSignUpTogglePass.addEventListener('click', () => {
      const isPass = spaSignUpPassword.type === 'password';
      spaSignUpPassword.type = isPass ? 'text' : 'password';
      if (spaSignUpConfirm) spaSignUpConfirm.type = isPass ? 'text' : 'password';
      spaSignUpTogglePass.innerHTML = isPass
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // Forgot password
  document.getElementById('spaSignInForgotBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const emailVal = document.getElementById('spaSignInEmail')?.value.trim() || 'your email';
    showToast(`Password reset link sent to ${emailVal}`);
  });

  // Helper function to complete login transition
  function completeAuthLogin(userName, toastMessage) {
    if (userName) {
      currentUserName = userName;
      if (userNameGreeting) userNameGreeting.textContent = currentUserName;
      if (settingsUserName) settingsUserName.textContent = currentUserName;
    }
    try {
      localStorage.setItem('vozx_is_logged_in', 'true');
    } catch (e) {}
    showToast(toastMessage || `Welcome to VOZX AI, ${currentUserName}!`);
    navHistory = ['home'];
    navigateToScreen('home', false);
  }

  // Handle SPA Sign In
  async function handleSignIn() {
    const emailInput = document.getElementById('spaSignInEmail');
    const passInput = document.getElementById('spaSignInPassword');
    const emailErr = document.getElementById('spaSignInEmailErr');
    const passErr = document.getElementById('spaSignInPassErr');
    const emailWrap = document.getElementById('spaSignInEmailWrap');
    const passWrap = document.getElementById('spaSignInPassWrap');
    const submitBtn = document.getElementById('spaSignInSubmitBtn');

    // Clear previous error states
    if (emailErr) { emailErr.textContent = ''; emailErr.classList.remove('visible'); }
    if (passErr) { passErr.textContent = ''; passErr.classList.remove('visible'); }
    emailWrap?.classList.remove('is-invalid');
    passWrap?.classList.remove('is-invalid');

    const email = emailInput?.value.trim() || '';
    const password = passInput?.value || '';

    let hasError = false;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailErr) { emailErr.textContent = 'Please enter a valid email address'; emailErr.classList.add('visible'); }
      emailWrap?.classList.add('is-invalid');
      hasError = true;
    }
    if (!password || password.length < 6) {
      if (passErr) { passErr.textContent = 'Password must be at least 6 characters'; passErr.classList.add('visible'); }
      passWrap?.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.innerHTML = '<span class="btn-text">Signing in...</span>';
      submitBtn.disabled = true;
    }

    try {
      if (window.VozxAuth && window.VozxAuth.signInWithSupabase) {
        const res = await window.VozxAuth.signInWithSupabase(email, password);
        if (res && res.success) {
          const resolvedName = res.user?.user_metadata?.full_name || (email.split('@')[0]) || currentUserName;
          completeAuthLogin(resolvedName, `Welcome back, ${resolvedName}!`);
          return;
        }
      }
      // Demo fallback
      const nameFromEmail = email.split('@')[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      completeAuthLogin(formattedName || currentUserName, `Signed in as ${formattedName || currentUserName}!`);
    } catch (err) {
      completeAuthLogin(currentUserName, `Welcome back to VOZX AI!`);
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    }
  }

  const spaSignInForm = document.getElementById('spaSignInForm');
  spaSignInForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSignIn();
  });
  document.getElementById('spaSignInSubmitBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSignIn();
  });

  // Handle SPA Sign Up
  async function handleSignUp() {
    const nameInput = document.getElementById('spaSignUpName');
    const emailInput = document.getElementById('spaSignUpEmail');
    const passInput = document.getElementById('spaSignUpPassword');
    const confirmInput = document.getElementById('spaSignUpConfirm');
    const termsInput = document.getElementById('spaSignUpTerms');

    const nameErr = document.getElementById('spaSignUpNameErr');
    const emailErr = document.getElementById('spaSignUpEmailErr');
    const passErr = document.getElementById('spaSignUpPassErr');
    const confirmErr = document.getElementById('spaSignUpConfirmErr');

    const nameWrap = document.getElementById('spaSignUpNameWrap');
    const emailWrap = document.getElementById('spaSignUpEmailWrap');
    const passWrap = document.getElementById('spaSignUpPassWrap');
    const confirmWrap = document.getElementById('spaSignUpConfirmWrap');
    const submitBtn = document.getElementById('spaSignUpSubmitBtn');

    // Clear errors
    [nameErr, emailErr, passErr, confirmErr].forEach(el => {
      if (el) { el.textContent = ''; el.classList.remove('visible'); }
    });
    [nameWrap, emailWrap, passWrap, confirmWrap].forEach(w => w?.classList.remove('is-invalid'));

    const fullName = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const password = passInput?.value || '';
    const confirm = confirmInput?.value || '';
    const termsAgreed = termsInput?.checked ?? true;

    let hasError = false;
    if (!fullName) {
      if (nameErr) { nameErr.textContent = 'Please enter your full name'; nameErr.classList.add('visible'); }
      nameWrap?.classList.add('is-invalid');
      hasError = true;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailErr) { emailErr.textContent = 'Please enter a valid email address'; emailErr.classList.add('visible'); }
      emailWrap?.classList.add('is-invalid');
      hasError = true;
    }
    if (!password || password.length < 8) {
      if (passErr) { passErr.textContent = 'Password must be at least 8 characters'; passErr.classList.add('visible'); }
      passWrap?.classList.add('is-invalid');
      hasError = true;
    }
    if (password !== confirm) {
      if (confirmErr) { confirmErr.textContent = 'Passwords do not match'; confirmErr.classList.add('visible'); }
      confirmWrap?.classList.add('is-invalid');
      hasError = true;
    }
    if (!termsAgreed) {
      showToast('Please agree to the Terms of Service to continue');
      hasError = true;
    }

    if (hasError) return;

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.innerHTML = '<span class="btn-text">Creating Account...</span>';
      submitBtn.disabled = true;
    }

    try {
      if (window.VozxAuth && window.VozxAuth.signUpWithSupabase) {
        const res = await window.VozxAuth.signUpWithSupabase(fullName, email, password);
        if (res && res.success) {
          completeAuthLogin(fullName, `Account created! Welcome, ${fullName}!`);
          return;
        }
      }
      completeAuthLogin(fullName, `Account created! Welcome, ${fullName}!`);
    } catch (err) {
      completeAuthLogin(fullName, `Account created! Welcome, ${fullName}!`);
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    }
  }

  const spaSignUpForm = document.getElementById('spaSignUpForm');
  spaSignUpForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSignUp();
  });
  document.getElementById('spaSignUpSubmitBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSignUp();
  });

  // Social Auth Buttons (Google & Apple Only)
  ['spaSignInGoogleBtn', 'spaSignUpGoogleBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      completeAuthLogin(currentUserName, 'Signed in with Google successfully!');
    });
  });

  ['spaSignInAppleBtn', 'spaSignUpAppleBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      completeAuthLogin(currentUserName, 'Signed in with Apple successfully!');
    });
  });

  // Check login state and Supabase session upon initialization
  try {
    if (window.VozxAuth && window.VozxAuth.getCurrentSessionUser) {
      window.VozxAuth.getCurrentSessionUser().then((user) => {
        if (user) {
          const authName = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : '');
          if (authName) {
            currentUserName = authName;
            if (userNameGreeting) userNameGreeting.textContent = currentUserName;
            if (settingsUserName) settingsUserName.textContent = currentUserName;
          }
        } else if (localStorage.getItem('vozx_is_logged_in') === 'false') {
          navHistory = ['getstarted'];
          navigateToScreen('getstarted', false);
        }
      });
    } else {
      const isLoggedOut = localStorage.getItem('vozx_is_logged_in') === 'false';
      if (isLoggedOut) {
        navHistory = ['getstarted'];
        navigateToScreen('getstarted', false);
      }
    }
  } catch (e) {}

  // Energy Vortex Interaction & Voice Mode Toggle
  if (orbStage) {
    orbStage.addEventListener('click', () => {
      const orbImg = orbStage.querySelector('.orb-image');
      if (orbImg) {
        orbImg.style.transform = 'scale(1.16) rotate(4deg)';
        setTimeout(() => {
          orbImg.style.transform = '';
        }, 380);
      }
      if (isVoiceModeActive) {
        deactivateVoiceMode();
      } else {
        activateVoiceMode();
      }
    });
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Swirling Canvas Particle Vortex
  function initOrbCanvas() {
    const canvas = document.getElementById('orbCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = 205;
    let height = canvas.height = 205;

    const particles = [];
    const count = 32;

    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 42 + Math.random() * 45,
        speed: 0.008 + Math.random() * 0.016,
        size: 1.2 + Math.random() * 2,
        alpha: 0.25 + Math.random() * 0.65,
        color: Math.random() > 0.45 ? '#38bdf8' : '#c084fc'
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      particles.forEach(p => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * (p.radius * 0.88);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 9;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  initOrbCanvas();

  // =========================================================================
  // DELETE & EMPTY STATE CONTROLLER (PDF, MEMORY, PLANNER, NOTES, FILES, EMAIL)
  // =========================================================================
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const delModalTitle = document.getElementById('delModalTitle');
  const delModalDesc = document.getElementById('delModalDesc');
  const delModalCancelBtn = document.getElementById('delModalCancelBtn');
  const delModalConfirmBtn = document.getElementById('delModalConfirmBtn');

  const screenDelInfo = {
    pdf: {
      name: 'PDF Assistant',
      itemType: 'recent PDFs and summaries',
      populatedId: 'pdfPopulatedView',
      emptyId: 'pdfEmptyView',
      storageKey: 'vozx_empty_pdf'
    },
    memory: {
      name: 'Memory Vault',
      itemType: 'saved memories and sync logs',
      populatedId: 'memoryPopulatedView',
      emptyId: 'memoryEmptyView',
      storageKey: 'vozx_empty_memory'
    },
    planner: {
      name: 'Planner',
      itemType: 'tasks and upcoming deadlines',
      populatedId: 'plannerPopulatedView',
      emptyId: 'plannerEmptyView',
      storageKey: 'vozx_empty_planner'
    },
    notes: {
      name: 'Notes Repository',
      itemType: 'folders, pinned and recent notes',
      populatedId: 'notesPopulatedView',
      emptyId: 'notesEmptyView',
      storageKey: 'vozx_empty_notes'
    },
    files: {
      name: 'Files & Storage',
      itemType: 'folders and recent uploads',
      populatedId: 'filesPopulatedView',
      emptyId: 'filesEmptyView',
      storageKey: 'vozx_empty_files'
    },
    email: {
      name: 'Email Assistant',
      itemType: 'synced emails and AI analysis',
      populatedId: 'emailPopulatedView',
      emptyId: 'emailEmptyView',
      storageKey: 'vozx_empty_email'
    }
  };

  let pendingDeleteScreen = null;

  function updateDeleteButtonUI(btn, isEmpty) {
    if (!btn) return;
    if (isEmpty) {
      btn.classList.add('is-empty');
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
        <span>Restore</span>
      `;
      btn.title = 'Restore populated data';
    } else {
      btn.classList.remove('is-empty');
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>Delete</span>
      `;
      btn.title = 'Delete All / Clear';
    }
  }

  function setScreenEmptyState(screenKey, isEmpty, silent = false) {
    const info = screenDelInfo[screenKey];
    if (!info) return;

    const populatedEl = document.getElementById(info.populatedId);
    const emptyEl = document.getElementById(info.emptyId);
    const delBtn = document.querySelector(`[data-screen-del="${screenKey}"]`);

    if (isEmpty) {
      if (populatedEl) populatedEl.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      updateDeleteButtonUI(delBtn, true);
      try { localStorage.setItem(info.storageKey, 'true'); } catch (e) {}
      if (!silent) showToast(`${info.name} cleared to empty state`);
    } else {
      if (populatedEl) populatedEl.classList.remove('hidden');
      if (emptyEl) emptyEl.classList.add('hidden');
      updateDeleteButtonUI(delBtn, false);
      try { localStorage.removeItem(info.storageKey); } catch (e) {}
      if (!silent) showToast(`${info.name} restored`);
    }
  }

  function openDeleteConfirmModal(screenKey) {
    const info = screenDelInfo[screenKey];
    if (!info || !deleteConfirmModal) return;

    pendingDeleteScreen = screenKey;
    if (delModalTitle) delModalTitle.textContent = `Clear ${info.name}?`;
    if (delModalDesc) delModalDesc.textContent = `Are you sure you want to delete all ${info.itemType}? The screen will show the empty state.`;
    deleteConfirmModal.classList.add('active');
  }

  function closeDeleteConfirmModal() {
    if (!deleteConfirmModal) return;
    deleteConfirmModal.classList.remove('active');
    pendingDeleteScreen = null;
  }

  // Bind confirmation modal buttons
  if (delModalCancelBtn) {
    delModalCancelBtn.addEventListener('click', closeDeleteConfirmModal);
  }
  if (delModalConfirmBtn) {
    delModalConfirmBtn.addEventListener('click', () => {
      if (pendingDeleteScreen) {
        setScreenEmptyState(pendingDeleteScreen, true);
      }
      closeDeleteConfirmModal();
    });
  }
  if (deleteConfirmModal) {
    deleteConfirmModal.addEventListener('click', (e) => {
      if (e.target === deleteConfirmModal) closeDeleteConfirmModal();
    });
  }

  // Bind All Screen Delete Buttons
  document.querySelectorAll('[data-screen-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const screenKey = btn.dataset.screenDel;
      if (!screenKey || !screenDelInfo[screenKey]) return;

      const isCurrentlyEmpty = btn.classList.contains('is-empty') || 
        localStorage.getItem(screenDelInfo[screenKey].storageKey) === 'true';

      if (isCurrentlyEmpty) {
        // Toggle back to populated
        setScreenEmptyState(screenKey, false);
      } else {
        // Confirm before clearing
        openDeleteConfirmModal(screenKey);
      }
    });
  });

  // Rehydrate saved empty states on load
  Object.keys(screenDelInfo).forEach(screenKey => {
    const info = screenDelInfo[screenKey];
    try {
      if (localStorage.getItem(info.storageKey) === 'true') {
        setScreenEmptyState(screenKey, true, true);
      }
    } catch (e) {}
  });

  // Bind Empty State CTA Action buttons to restore / take action
  const emptyAddGoalBtn = document.getElementById('emptyAddGoalBtn');
  if (emptyAddGoalBtn) {
    emptyAddGoalBtn.addEventListener('click', () => {
      setScreenEmptyState('planner', false);
      showToast('Task added: Design System Review');
    });
  }
  const emptyAddDeadlineBtn = document.getElementById('emptyAddDeadlineBtn');
  if (emptyAddDeadlineBtn) {
    emptyAddDeadlineBtn.addEventListener('click', () => {
      setScreenEmptyState('planner', false);
      showToast('Deadline added: Sprint 14 Delivery');
    });
  }
  const emptyCreateFirstFolderBtn = document.getElementById('emptyCreateFirstFolderBtn');
  if (emptyCreateFirstFolderBtn) {
    emptyCreateFirstFolderBtn.addEventListener('click', () => {
      setScreenEmptyState('notes', false);
      showToast('Folder created: Workspace Notes');
    });
  }
  const emptyAddFirstFolderBtn = document.getElementById('emptyAddFirstFolderBtn');
  if (emptyAddFirstFolderBtn) {
    emptyAddFirstFolderBtn.addEventListener('click', () => {
      setScreenEmptyState('files', false);
      showToast('Folder created: Design Assets');
    });
  }
  const emptyUploadFilesBtn = document.getElementById('emptyUploadFilesBtn');
  if (emptyUploadFilesBtn) {
    emptyUploadFilesBtn.addEventListener('click', () => {
      setScreenEmptyState('files', false);
      showToast('Files uploaded: 3 items added');
    });
  }
  // Embedded Screen 1: Link Your Email interactivity & Multi-Account Switcher
  const embeddedEmailInput = document.getElementById('embeddedEmailInput');
  const embeddedContinueBtn = document.getElementById('embeddedContinueBtn');
  const mainActiveAccountEmail = document.getElementById('mainActiveAccountEmail');
  const embeddedProviders = document.querySelectorAll('[data-embedded-provider]');
  const mainAccountSwitcherTrigger = document.getElementById('mainAccountSwitcherTrigger');
  const mainAccountSwitcherModal = document.getElementById('mainAccountSwitcherModal');
  const closeMainSwitcherModal = document.getElementById('closeMainSwitcherModal');
  const mainAccountsListContainer = document.getElementById('mainAccountsListContainer');

  let embeddedSelectedProvider = 'Gmail';

  const DEFAULT_ACCOUNTS = [
    { email: 'varun.reddy@gmail.com', provider: 'Gmail', active: true, unread: 12 },
    { email: 'varun.work@outlook.com', provider: 'Outlook', active: false, unread: 5 }
  ];

  function getMainAccounts() {
    try {
      const raw = localStorage.getItem('vozx_connected_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    const savedSingle = localStorage.getItem('vozx_connected_email');
    if (savedSingle) {
      return [
        { email: savedSingle, provider: localStorage.getItem('vozx_connected_provider') || 'Gmail', active: true, unread: 12 },
        { email: 'varun.work@outlook.com', provider: 'Outlook', active: false, unread: 5 }
      ];
    }
    return [...DEFAULT_ACCOUNTS];
  }

  let mainAccounts = getMainAccounts();
  try {
    localStorage.setItem('vozx_connected_accounts', JSON.stringify(mainAccounts));
  } catch(e) {}

  function getActiveMainAccount() {
    return mainAccounts.find(a => a.active) || mainAccounts[0] || null;
  }

  function updateMainActiveAccountUI() {
    const active = getActiveMainAccount();
    if (!active) return;
    if (mainActiveAccountEmail) mainActiveAccountEmail.textContent = active.email;
    if (embeddedEmailInput) embeddedEmailInput.value = active.email;

    // Update unread tab pill or badge if present
    const inboxBadge = document.querySelector('.email-filter-badge');
    if (inboxBadge) inboxBadge.textContent = active.unread;
  }
  updateMainActiveAccountUI();

  function renderMainAccountsList() {
    if (!mainAccountsListContainer) return;
    mainAccountsListContainer.innerHTML = '';

    mainAccounts.forEach((acc, idx) => {
      const row = document.createElement('div');
      row.className = `account-item-row ${acc.active ? 'active' : ''}`;
      row.tabIndex = 0;
      row.setAttribute('role', 'button');

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
              <span class="account-unread-tag">${acc.unread || 0} unread</span>
            </div>
          </div>
        </div>
        <div class="account-item-right">
          ${acc.active ? `
            <span class="account-active-check" title="Active Account">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
          ` : ''}
          <button type="button" class="account-row-delete-btn" data-main-account-del="${idx}" title="Unlink this email">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      // Switch active account
      row.addEventListener('click', (e) => {
        if (e.target.closest('.account-row-delete-btn')) return;
        mainAccounts.forEach((a, i) => a.active = (i === idx));
        try {
          localStorage.setItem('vozx_connected_accounts', JSON.stringify(mainAccounts));
          localStorage.setItem('vozx_connected_email', acc.email);
          localStorage.setItem('vozx_connected_provider', acc.provider);
        } catch(e) {}
        updateMainActiveAccountUI();
        closeMainSwitcher();
        showToast(`✨ Switched active inbox to ${acc.email}`);
      });

      // Delete specific account
      const delBtn = row.querySelector('.account-row-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetDel = mainAccounts[idx];
          mainAccounts.splice(idx, 1);
          if (targetDel.active && mainAccounts.length > 0) {
            mainAccounts[0].active = true;
          }
          if (mainAccounts.length === 0) {
            closeMainSwitcher();
            try {
              localStorage.setItem('vozx_email_linked', 'false');
              localStorage.removeItem('vozx_connected_accounts');
              localStorage.removeItem('vozx_connected_email');
            } catch(e) {}
            if (embeddedEmailInput) embeddedEmailInput.value = '';
            setScreenEmptyState('email', true);
            showToast('🗑️ All email accounts removed. Connect an email to continue.');
            return;
          }
          try {
            localStorage.setItem('vozx_connected_accounts', JSON.stringify(mainAccounts));
            const newActive = getActiveMainAccount();
            if (newActive) {
              localStorage.setItem('vozx_connected_email', newActive.email);
              localStorage.setItem('vozx_connected_provider', newActive.provider);
            }
          } catch(e) {}
          updateMainActiveAccountUI();
          renderMainAccountsList();
          showToast(`🗑️ Removed ${targetDel.email}`);
        });
      }

      mainAccountsListContainer.appendChild(row);
    });
  }

  function openMainSwitcher() {
    mainAccounts = getMainAccounts();
    renderMainAccountsList();
    if (mainAccountSwitcherModal) mainAccountSwitcherModal.classList.add('active');
  }

  function closeMainSwitcher() {
    if (mainAccountSwitcherModal) mainAccountSwitcherModal.classList.remove('active');
  }

  if (mainAccountSwitcherTrigger) {
    mainAccountSwitcherTrigger.addEventListener('click', openMainSwitcher);
  }
  if (closeMainSwitcherModal) {
    closeMainSwitcherModal.addEventListener('click', closeMainSwitcher);
  }
  if (mainAccountSwitcherModal) {
    mainAccountSwitcherModal.addEventListener('click', (e) => {
      if (e.target === mainAccountSwitcherModal) closeMainSwitcher();
    });
  }

  embeddedProviders.forEach(pill => {
    pill.addEventListener('click', () => {
      embeddedProviders.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      embeddedSelectedProvider = pill.dataset.embeddedProvider || 'Gmail';

      if (embeddedEmailInput) {
        const val = embeddedEmailInput.value.trim();
        const username = val.includes('@') ? val.split('@')[0] : (val || 'varun.reddy');
        if (embeddedSelectedProvider === 'Gmail') {
          embeddedEmailInput.value = `${username}@gmail.com`;
        } else if (embeddedSelectedProvider === 'Outlook') {
          embeddedEmailInput.value = `${username}@outlook.com`;
        } else if (embeddedSelectedProvider === 'Yahoo') {
          embeddedEmailInput.value = `${username}@yahoo.com`;
        }
      }
    });
  });

  if (embeddedContinueBtn) {
    embeddedContinueBtn.addEventListener('click', () => {
      const emailVal = embeddedEmailInput ? embeddedEmailInput.value.trim() : '';
      if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
        showToast('⚠️ Please enter a valid email address');
        embeddedEmailInput?.focus();
        return;
      }
      mainAccounts = getMainAccounts();
      const existingIdx = mainAccounts.findIndex(a => a.email.toLowerCase() === emailVal.toLowerCase());
      if (existingIdx >= 0) {
        mainAccounts.forEach((a, i) => a.active = (i === existingIdx));
        mainAccounts[existingIdx].provider = embeddedSelectedProvider;
      } else {
        mainAccounts.forEach(a => a.active = false);
        mainAccounts.unshift({
          email: emailVal,
          provider: embeddedSelectedProvider,
          active: true,
          unread: 8
        });
      }
      try {
        localStorage.setItem('vozx_connected_accounts', JSON.stringify(mainAccounts));
        localStorage.setItem('vozx_connected_email', emailVal);
        localStorage.setItem('vozx_email_linked', 'true');
        localStorage.setItem('vozx_connected_provider', embeddedSelectedProvider);
      } catch(e) {}
      updateMainActiveAccountUI();
      setScreenEmptyState('email', false);
      showToast(`✨ Connected ${emailVal}! Inbox ready.`);
    });
  }

  // Bind Add Mail buttons to show the embedded Link Email interface
  const mainScreenAddMailBtn = document.getElementById('mainScreenAddMailBtn');
  const mainSwitcherAddAccountBtn = document.getElementById('mainSwitcherAddAccountBtn');

  if (mainScreenAddMailBtn) {
    mainScreenAddMailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setScreenEmptyState('email', true);
      embeddedEmailInput?.focus();
    });
  }

  if (mainSwitcherAddAccountBtn) {
    mainSwitcherAddAccountBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMainSwitcher();
      setScreenEmptyState('email', true);
      embeddedEmailInput?.focus();
    });
  }

  const emptyAddFirstMemoryBtn = document.getElementById('emptyAddFirstMemoryBtn');
  if (emptyAddFirstMemoryBtn) {
    emptyAddFirstMemoryBtn.addEventListener('click', () => {
      setScreenEmptyState('memory', false);
      showToast('Memory added: User preferences initialized');
    });
  }

  // Initial full-screen chat background check
  const initialActive = document.querySelector('.app-screen.active');
  const phoneViewportInit = document.querySelector('.phone-viewport-container');
  if (phoneViewportInit && initialActive) {
    phoneViewportInit.classList.toggle('chat-active', initialActive.dataset.screen === 'chat');
  }

  // =========================================================================
  // OFFLINE / NO INTERNET CONTROLLER & MULTI-LAYER RESILIENCE SYSTEM
  // =========================================================================
  const offlineRetryBtn = document.getElementById('offlineRetryBtn');
  const offlineRetryBtnText = document.getElementById('offlineRetryBtnText');
  const headerOfflinePill = document.getElementById('headerOfflinePill');
  const offlineGuidanceCard = document.querySelector('.offline-guidance-card');

  let isCheckingNetwork = false;

  // Active network probe with timeout & fallback (checks if real internet packets resolve)
  async function checkActualInternet(timeoutMs = 2200) {
    if (!navigator.onLine) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Primary: Google DNS query endpoint (resolves in ~100-200ms)
      await fetch('https://dns.google/resolve?name=example.com&type=A&_t=' + Date.now(), {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return true;
    } catch (err) {
      clearTimeout(timeoutId);
      // Secondary fallback probe: Google favicon
      try {
        const ctrl2 = new AbortController();
        const tm2 = setTimeout(() => ctrl2.abort(), 1500);
        await fetch('https://www.google.com/favicon.ico?_t=' + Date.now(), {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: ctrl2.signal
        });
        clearTimeout(tm2);
        return true;
      } catch (err2) {
        return false;
      }
    }
  }

  function updateOfflineState(isOffline, navigateIfOffline = false) {
    if (headerOfflinePill) {
      headerOfflinePill.style.display = isOffline ? 'inline-flex' : 'none';
    }

    if (isOffline) {
      isCurrentlyOffline = true;
      if (navigateIfOffline) {
        navigateToScreen('offline');
      }
    } else {
      isCurrentlyOffline = false;
      const currentActive = document.querySelector('.app-screen.active');
      if (currentActive && currentActive.dataset.screen === 'offline') {
        showToast('✨ Internet restored! You are back online.');
        const prevScreen = (navHistory.length > 1 && navHistory[navHistory.length - 1] !== 'offline')
          ? navHistory[navHistory.length - 1]
          : 'home';
        navigateToScreen(prevScreen, false);
      }
    }
  }

  async function syncNetworkStatus(forceNavigate = true) {
    if (isCheckingNetwork) return;
    isCheckingNetwork = true;
    try {
      const online = await checkActualInternet();
      if (!online) {
        if (!isCurrentlyOffline) {
          isCurrentlyOffline = true;
          updateOfflineState(true, forceNavigate);
          showToast('📡 Connection lost. Switched to offline mode.');
        } else if (forceNavigate) {
          const currentActive = document.querySelector('.app-screen.active');
          if (currentActive && currentActive.dataset.screen !== 'offline') {
            navigateToScreen('offline');
          }
        }
      } else {
        if (isCurrentlyOffline) {
          isCurrentlyOffline = false;
          updateOfflineState(false);
        }
      }
    } catch (e) {
    } finally {
      isCheckingNetwork = false;
    }
  }

  // Active continuous heartbeat probe (every 2.5s)
  // Essential for machines with VMware/WSL/VPN virtual adapters where navigator.onLine never turns false
  setInterval(() => {
    syncNetworkStatus(true);
  }, 2500);

  // Probe immediately on window focus or visibility change
  window.addEventListener('focus', () => syncNetworkStatus(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncNetworkStatus(true);
    }
  });

  // Native Browser Network Events
  window.addEventListener('offline', () => {
    isCurrentlyOffline = true;
    updateOfflineState(true, true);
    showToast('📡 Connection lost. Switched to offline mode.');
  });

  window.addEventListener('online', () => {
    syncNetworkStatus(false);
  });

  // Header Offline Pill opens diagnostics
  if (headerOfflinePill) {
    headerOfflinePill.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToScreen('offline');
    });
  }

  // Retry Connection Button
  if (offlineRetryBtn) {
    offlineRetryBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (offlineRetryBtn.classList.contains('checking')) return;

      offlineRetryBtn.classList.add('checking');
      if (offlineRetryBtnText) offlineRetryBtnText.textContent = 'Checking...';

      const connected = await checkActualInternet(3000);

      setTimeout(() => {
        offlineRetryBtn.classList.remove('checking');
        if (offlineRetryBtnText) offlineRetryBtnText.textContent = 'Try Again';

        if (connected) {
          showToast('✨ Connection restored! Welcome back.');
          isCurrentlyOffline = false;
          updateOfflineState(false);
          const prevScreen = (navHistory.length > 1 && navHistory[navHistory.length - 1] !== 'offline')
            ? navHistory[navHistory.length - 1]
            : 'home';
          navigateToScreen(prevScreen, false);
        } else {
          isCurrentlyOffline = true;
          if (offlineGuidanceCard) {
            offlineGuidanceCard.classList.remove('offline-shake');
            void offlineGuidanceCard.offsetWidth; // Trigger reflow
            offlineGuidanceCard.classList.add('offline-shake');
          }
          showToast('⚠️ Still offline. Please check your network connection.');
        }
      }, 600);
    });
  }

  // Check connectivity on startup:
  if (!navigator.onLine) {
    isCurrentlyOffline = true;
    updateOfflineState(true, true);
  } else {
    // Run probe immediately on startup
    syncNetworkStatus(true);
  }

  // Global developer & testing helpers
  window.simulateOffline = function(enable = true) {
    isCurrentlyOffline = enable;
    if (enable) {
      updateOfflineState(true, true);
      showToast('📡 Simulated Offline Mode');
    } else {
      updateOfflineState(false);
      showToast('✨ Simulated Online Mode: Connected');
    }
  };

  window.openOfflineScreen = function() {
    navigateToScreen('offline');
  };

  // =========================================================================
  // APPLICATION LAUNCH SPLASH & WORKSPACE LOADING SCREEN CONTROLLER
  // =========================================================================
  const appSplashScreen = document.getElementById('appSplashScreen');
  const bottomBarContainer = document.querySelector('.bottom-bar-container');

  function initAppSplashScreen() {
    if (!appSplashScreen) return;

    // Initially hide bottom floating input dock during splash loading
    if (bottomBarContainer) {
      bottomBarContainer.classList.add('bar-hidden');
      bottomBarContainer.classList.remove('bar-visible');
    }

    // Display splash for 2.2 seconds, then dissolve smoothly into Home Dashboard
    const SPLASH_DURATION_MS = 2200;
    const FADE_DURATION_MS = 600;

    setTimeout(() => {
      appSplashScreen.classList.add('splash-fade-out');

      setTimeout(() => {
        appSplashScreen.style.display = 'none';

        // Check if user is logged out or should be on home
        const isLoggedOut = localStorage.getItem('vozx_is_logged_in') === 'false';
        if (isLoggedOut) {
          navHistory = ['getstarted'];
          navigateToScreen('getstarted', false);
        } else {
          // Ensure Home screen is active and bottom dock is visible
          const screenHome = document.getElementById('screenHome');
          if (screenHome) {
            const activeScreen = document.querySelector('.app-screen.active');
            if (!activeScreen || activeScreen.id === 'screenHome') {
              appScreens.forEach(s => s.classList.remove('active'));
              screenHome.classList.add('active');
            }
          }
          if (bottomBarContainer) {
            bottomBarContainer.classList.remove('bar-hidden');
            bottomBarContainer.classList.add('bar-visible');
          }
        }
      }, FADE_DURATION_MS);
    }, SPLASH_DURATION_MS);
  }

  // Developer helper to replay the splash screen anytime
  window.showSplashScreen = function(durationMs = 2200) {
    if (!appSplashScreen) return;
    appSplashScreen.style.display = 'flex';
    appSplashScreen.classList.remove('splash-fade-out');
    if (bottomBarContainer) {
      bottomBarContainer.classList.add('bar-hidden');
      bottomBarContainer.classList.remove('bar-visible');
    }
    setTimeout(() => {
      appSplashScreen.classList.add('splash-fade-out');
      setTimeout(() => {
        appSplashScreen.style.display = 'none';
        if (bottomBarContainer) {
          bottomBarContainer.classList.remove('bar-hidden');
          bottomBarContainer.classList.add('bar-visible');
        }
      }, 600);
    }, durationMs);
  };

  initAppSplashScreen();
});

