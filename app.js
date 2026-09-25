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

  // Helper to ensure all authentication inputs are empty with placeholders showing for new users
  function resetAuthFormInputs() {
    const signInEmail = document.getElementById('spaSignInEmail');
    const signInPass = document.getElementById('spaSignInPassword');
    const signInRemember = document.getElementById('spaSignInRemember');
    if (signInEmail) signInEmail.value = '';
    if (signInPass) signInPass.value = '';
    if (signInRemember) signInRemember.checked = false;

    const signUpName = document.getElementById('spaSignUpName');
    const signUpEmail = document.getElementById('spaSignUpEmail');
    const signUpPass = document.getElementById('spaSignUpPassword');
    const signUpConfirm = document.getElementById('spaSignUpConfirm');
    const signUpTerms = document.getElementById('spaSignUpTerms');
    if (signUpName) signUpName.value = '';
    if (signUpEmail) signUpEmail.value = '';
    if (signUpPass) signUpPass.value = '';
    if (signUpConfirm) signUpConfirm.value = '';
    if (signUpTerms) signUpTerms.checked = true;

    const embeddedEmail = document.getElementById('embeddedEmailInput');
    if (embeddedEmail) embeddedEmail.value = '';

    ['spaSignInEmailErr', 'spaSignInPassErr', 'spaSignUpNameErr', 'spaSignUpEmailErr', 'spaSignUpPassErr', 'spaSignUpConfirmErr'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '';
        el.classList.remove('visible');
      }
    });

    ['spaSignInEmailWrap', 'spaSignInPassWrap', 'spaSignUpNameWrap', 'spaSignUpEmailWrap', 'spaSignUpPassWrap', 'spaSignUpConfirmWrap'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-invalid');
    });
  }

  // Clear inputs on page boot and when page is shown from bfcache
  try {
    resetAuthFormInputs();
  } catch (e) {}
  window.addEventListener('pageshow', () => {
    try {
      resetAuthFormInputs();
    } catch (e) {}
  });

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

    // If navigating to an auth screen, guarantee clean empty inputs with placeholder text
    if (targetScreenId === 'signin' || targetScreenId === 'signup' || targetScreenId === 'getstarted') {
      resetAuthFormInputs();
    }

    // Transition screens
    appScreens.forEach(screen => {
      screen.classList.remove('active');
    });
    targetScreen.classList.add('active');

    // Track active screen in localStorage and toggle Get Started document class
    try {
      localStorage.setItem('vozx_current_screen', targetScreenId);
      if (targetScreenId === 'getstarted') {
        document.documentElement.classList.add('on-getstarted-screen');
      } else {
        document.documentElement.classList.remove('on-getstarted-screen');
      }
    } catch (e) {}

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

    // Scroll to top of screen view smoothly (or bottom if opening chat)
    if (targetScreenId === 'chat') {
      setTimeout(() => {
        scrollChatToBottom(false);
      }, 50);
    } else {
      screensContainer?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Expose on window for global triggers and integration tests
  window.navigateToScreen = navigateToScreen;
  window.resetAuthFormInputs = resetAuthFormInputs;

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
      localStorage.setItem('vozx_current_screen', 'getstarted');
      document.documentElement.classList.add('on-getstarted-screen');
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
  // SCREEN 7: VOZX AI NEURAL CHAT CONTROLLER (OPENAI INTEGRATION)
  // =========================================================================
  const chatMessagesList = document.getElementById('chatMessagesList');
  const chatNewBtn = document.getElementById('chatNewBtn');
  const chatClearBtn = document.getElementById('chatClearBtn');

  // Chat state
  let chatSessionHistory = [];
  let isAiResponding = false;
  let lastUserMessageText = '';

  // Storage key for session chat history
  const CHAT_STORAGE_KEY = 'vozx_neural_chat_history_v1';

  // Format timestamp (e.g. "9:41 AM")
  function getChatTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Parse Markdown for AI messages
  function formatAiMarkdown(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);

    // Code blocks ```lang\ncode\n```
    escaped = escaped.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    // Bold **text**
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Split paragraphs and lists
    const lines = escaped.split('\n');
    let formatted = '';
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          formatted += '<ul>';
          inList = true;
        }
        formatted += `<li>${trimmed.substring(2)}</li>`;
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (!inList) {
          formatted += '<ol>';
          inList = true;
        }
        const itemContent = trimmed.replace(/^\d+\.\s/, '');
        formatted += `<li>${itemContent}</li>`;
      } else {
        if (inList) {
          formatted += '</ul>';
          inList = false;
        }
        if (trimmed) {
          formatted += `<p>${trimmed}</p>`;
        }
      }
    });

    if (inList) formatted += '</ul>';
    return formatted || `<p>${escaped}</p>`;
  }

  // Smooth scroll chat container to latest message
  function scrollChatToBottom(smooth = true) {
    if (!chatMessagesList) return;
    const activeScreen = document.querySelector('.app-screen.active');
    if (!activeScreen || activeScreen.id !== 'screenChat') return;
    const container = document.getElementById('screensContainer');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    const lastRow = chatMessagesList.lastElementChild;
    if (lastRow) {
      lastRow.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    }
  }

  // Save conversation to sessionStorage
  function saveChatHistory() {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatSessionHistory));
    } catch (e) {}
  }

  // Load conversation from sessionStorage
  function loadChatHistory() {
    if (!chatMessagesList) return;
    chatMessagesList.innerHTML = '';

    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          chatSessionHistory = parsed;
          chatSessionHistory.forEach(item => {
            if (item.role === 'user') {
              renderUserBubble(item.text, item.time, false, item.id, item.isEdited);
            } else if (item.role === 'ai') {
              renderAiBubble(item.text, item.time, false, item.isError, item.errorCode);
            }
          });
          scrollChatToBottom(false);
          return;
        }
      }
    } catch (e) {}

    // Initial greeting if empty
    startNewChat(false);
  }

  // Copy text to clipboard with fallback and visual feedback
  function copyTextToClipboard(text, btnElement, successLabel = 'Copied!') {
    const origHtml = btnElement.innerHTML;
    const performSuccess = () => {
      btnElement.classList.add('copied');
      btnElement.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${successLabel}</span>
      `;
      showToast('Copied to clipboard');
      setTimeout(() => {
        btnElement.classList.remove('copied');
        btnElement.innerHTML = origHtml;
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(performSuccess).catch(() => {
        fallbackCopyText(text);
        performSuccess();
      });
    } else {
      fallbackCopyText(text);
      performSuccess();
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    ta.remove();
  }

  // Open inline editor inside the user message bubble
  function openInlineEditor(bubble, textDiv, footer, row, msgId) {
    if (bubble.classList.contains('is-editing')) return;
    bubble.classList.add('is-editing');

    const currentText = textDiv.textContent;

    textDiv.style.display = 'none';
    footer.style.display = 'none';

    const editor = document.createElement('div');
    editor.className = 'chat-bubble-editor';
    editor.innerHTML = `
      <textarea class="chat-edit-textarea" rows="2" aria-label="Edit message">${escapeHtml(currentText)}</textarea>
      <div class="chat-edit-controls">
        <span class="chat-edit-shortcut-hint">Enter to send &bull; Esc to cancel</span>
        <div class="chat-edit-btns">
          <button class="chat-edit-cancel-btn" type="button">Cancel</button>
          <button class="chat-edit-save-btn" type="button">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Save &amp; Send</span>
          </button>
        </div>
      </div>
    `;

    bubble.appendChild(editor);

    const textarea = editor.querySelector('.chat-edit-textarea');
    const cancelBtn = editor.querySelector('.chat-edit-cancel-btn');
    const saveBtn = editor.querySelector('.chat-edit-save-btn');

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(200, textarea.scrollHeight) + 'px';
    };
    textarea.addEventListener('input', adjustHeight);
    adjustHeight();

    const closeEditor = () => {
      editor.remove();
      textDiv.style.display = '';
      footer.style.display = '';
      bubble.classList.remove('is-editing');
    };

    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeEditor();
    });

    const submitEdit = () => {
      const newText = textarea.value.trim();
      if (!newText) {
        showToast('Message cannot be empty');
        return;
      }
      if (newText === currentText) {
        closeEditor();
        return;
      }

      closeEditor();
      textDiv.textContent = newText;

      const meta = footer.querySelector('.chat-bubble-meta');
      if (meta && !meta.querySelector('.chat-meta-edited')) {
        const ed = document.createElement('span');
        ed.className = 'chat-meta-edited';
        ed.textContent = '(edited)';
        meta.appendChild(ed);
      }

      // Update in chatSessionHistory
      const msgIndex = chatSessionHistory.findIndex(m => m.id === msgId || (m.role === 'user' && m.text === currentText));
      if (msgIndex !== -1) {
        chatSessionHistory[msgIndex].text = newText;
        chatSessionHistory[msgIndex].isEdited = true;
        chatSessionHistory[msgIndex].time = getChatTimestamp();

        // Remove subsequent messages in chatMessagesList and chatSessionHistory
        const allRows = Array.from(chatMessagesList.children);
        const currentRowIndex = allRows.indexOf(row);
        if (currentRowIndex !== -1) {
          while (chatMessagesList.children.length > currentRowIndex + 1) {
            chatMessagesList.lastElementChild.remove();
          }
        }
        chatSessionHistory = chatSessionHistory.slice(0, msgIndex + 1);
        saveChatHistory();

        if (typeof executeAiQuery === 'function') {
          executeAiQuery(newText);
        }
      } else {
        if (typeof executeAiQuery === 'function') {
          executeAiQuery(newText);
        }
      }
    };

    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      submitEdit();
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeEditor();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitEdit();
      }
    });
  }

  // Render User Message Bubble with Edit & Copy actions
  function renderUserBubble(text, time = null, animate = true, msgId = null, isEdited = false) {
    if (!chatMessagesList) return;

    const id = msgId || ('user-msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));

    const row = document.createElement('div');
    row.className = 'chat-message-row user' + (animate ? '' : ' no-anim');
    row.dataset.msgId = id;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';

    const textDiv = document.createElement('div');
    textDiv.className = 'chat-bubble-text';
    textDiv.textContent = text;

    const footer = document.createElement('div');
    footer.className = 'chat-bubble-footer';

    const actions = document.createElement('div');
    actions.className = 'chat-bubble-actions';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.className = 'chat-action-btn chat-edit-btn';
    editBtn.title = 'Edit message (or double-click)';
    editBtn.setAttribute('aria-label', 'Edit message');
    editBtn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
      <span>Edit</span>
    `;

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'chat-action-btn chat-copy-btn';
    copyBtn.title = 'Copy message';
    copyBtn.setAttribute('aria-label', 'Copy message');
    copyBtn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>Copy</span>
    `;

    actions.appendChild(editBtn);
    actions.appendChild(copyBtn);

    const meta = document.createElement('div');
    meta.className = 'chat-bubble-meta';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-meta-time';
    timeSpan.textContent = time || getChatTimestamp();
    meta.appendChild(timeSpan);

    if (isEdited) {
      const ed = document.createElement('span');
      ed.className = 'chat-meta-edited';
      ed.textContent = '(edited)';
      meta.appendChild(ed);
    }

    footer.appendChild(actions);
    footer.appendChild(meta);

    bubble.appendChild(textDiv);
    bubble.appendChild(footer);
    row.appendChild(bubble);
    chatMessagesList.appendChild(row);

    // Copy Action Handler
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentContent = textDiv.textContent || text;
      copyTextToClipboard(currentContent, copyBtn, 'Copied!');
    });

    // Edit Action Handler
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openInlineEditor(bubble, textDiv, footer, row, id);
    });

    // Double-click text to quick edit
    textDiv.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openInlineEditor(bubble, textDiv, footer, row, id);
    });

    if (animate) {
      scrollChatToBottom(true);
    }

    return id;
  }

  // Render AI Message Bubble with Glowing Avatar & Copy Button
  function renderAiBubble(text, time = null, animate = true, isError = false, errorCode = null) {
    if (!chatMessagesList) return;
    const row = document.createElement('div');
    row.className = 'chat-message-row ai' + (animate ? '' : ' no-anim');

    // Glowing Avatar
    const avatar = document.createElement('div');
    avatar.className = 'chat-ai-avatar';
    avatar.innerHTML = `<img src="assets/vozx-logo-icon.png" alt="VOZX" class="chat-avatar-img">`;

    // Bubble
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai' + (isError ? ' error-bubble' : '');

    const bubbleHeader = document.createElement('div');
    bubbleHeader.className = 'chat-bubble-header';
    bubbleHeader.innerHTML = `
      <span class="chat-ai-name">VOZX AI</span>
      <button class="chat-copy-btn" title="Copy Message" aria-label="Copy AI Message">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      </button>
    `;

    // Copy action
    const copyBtn = bubbleHeader.querySelector('.chat-copy-btn');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyTextToClipboard(text, copyBtn, 'Copied!');
    });

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-bubble-text';

    if (isError) {
      contentDiv.innerHTML = `
        <div class="chat-error-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>${escapeHtml(text)}</span>
        </div>
        <div class="chat-error-msg">
          ${errorCode === 'missing_api_key' 
            ? 'OpenAI API key is missing or not configured on the server.' 
            : 'Neural stream encountered a service interruption.'}
        </div>
        ${lastUserMessageText ? `
          <button class="chat-retry-btn" title="Retry sending message">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span>Retry</span>
          </button>
        ` : ''}
      `;

      const retryBtn = contentDiv.querySelector('.chat-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (lastUserMessageText) {
            handleSendMessage(lastUserMessageText);
          }
        });
      }
    } else {
      contentDiv.innerHTML = formatAiMarkdown(text);
    }

    const meta = document.createElement('div');
    meta.className = 'chat-bubble-meta';
    meta.textContent = time || getChatTimestamp();

    bubble.appendChild(bubbleHeader);
    bubble.appendChild(contentDiv);
    bubble.appendChild(meta);

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatMessagesList.appendChild(row);

    if (animate) {
      scrollChatToBottom(true);
    }
  }

  // Show "VOZX is thinking..." loading state with animated dots
  function showThinkingState() {
    hideThinkingState();
    if (!chatMessagesList) return;

    const row = document.createElement('div');
    row.id = 'chatThinkingRow';
    row.className = 'chat-message-row ai thinking-row';

    row.innerHTML = `
      <div class="chat-ai-avatar">
        <img src="assets/vozx-logo-icon.png" alt="VOZX" class="chat-avatar-img avatar-pulsing">
      </div>
      <div class="chat-bubble ai thinking-bubble">
        <div class="thinking-inner">
          <span class="thinking-text">VOZX is thinking</span>
          <span class="thinking-dots">
            <span class="tdot d1"></span>
            <span class="tdot d2"></span>
            <span class="tdot d3"></span>
          </span>
        </div>
      </div>
    `;

    chatMessagesList.appendChild(row);
    scrollChatToBottom(true);
  }

  // Hide thinking state
  function hideThinkingState() {
    const existing = document.getElementById('chatThinkingRow');
    if (existing) {
      existing.remove();
    }
  }

  // Create New Chat
  function startNewChat(showNotification = true) {
    chatSessionHistory = [];
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    if (!chatMessagesList) return;

    chatMessagesList.innerHTML = '';
    const welcome = `Hello ${currentUserName || 'Varun'}! VOZX neural stream is active. What would you like to build, analyze, or execute today?`;
    const time = getChatTimestamp();
    chatSessionHistory.push({ role: 'ai', text: welcome, time: time });
    saveChatHistory();
    renderAiBubble(welcome, time, false);

    if (showNotification) {
      showToast('Started a new chat session');
    }
    chatInput?.focus();
  }

  // Delete Conversation
  function clearConversation() {
    chatSessionHistory = [];
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    if (!chatMessagesList) return;

    chatMessagesList.innerHTML = '';
    const freshNotice = `Conversation cleared. Ready for your next query.`;
    const time = getChatTimestamp();
    chatSessionHistory.push({ role: 'ai', text: freshNotice, time: time });
    saveChatHistory();
    renderAiBubble(freshNotice, time, false);
    showToast('Conversation cleared');
    chatInput?.focus();
  }

  // Real-Time World Knowledge Retrieval via Wikipedia Engine
  async function queryClientKnowledgeEngine(query) {
    const cleanQ = (query || '')
      .replace(/^(who is|who was|who are|what is|what are|what was|tell me about|tell me regarding|explain|describe|define|where is|when was|when did|history of)\s+/i, '')
      .replace(/[?."'`]/g, '')
      .trim();

    if (!cleanQ || cleanQ.length < 2) return null;

    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQ)}&format=json&utf8=1&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) return null;
      const sdata = await searchRes.json();
      const search = sdata?.query?.search || [];
      if (!search.length) return null;

      const topTitle = search[0].title;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`;
      const sumRes = await fetch(summaryUrl);
      if (!sumRes.ok) return null;
      const sumData = await sumRes.json();

      const extract = sumData.extract;
      if (!extract || extract.trim().length < 15) return null;

      const title = sumData.title || cleanQ;
      const desc = sumData.description ? ` *(${sumData.description})*` : '';

      const sentences = extract.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      const lead = sentences[0] || extract;
      const bodyPoints = sentences.slice(1, 6);

      let resp = `### **${title}**${desc}\n\n${lead}\n\n`;
      if (bodyPoints.length > 0) {
        resp += `### Key Details:\n`;
        bodyPoints.forEach(pt => {
          resp += `• ${pt}\n`;
        });
        resp += `\n`;
      }
      resp += `Would you like to explore deeper into **${title}**, analyze specific details, or examine practical applications?`;
      return resp;
    } catch (e) {
      return null;
    }
  }

  // Client-Side VOZX Autonomous Intelligence Fallback
  async function generateClientVozxReply(userMessage, history = [], userName = 'Varun') {
    const msg = (userMessage || '').trim();
    const lower = msg.toLowerCase();
    const clean = lower.replace(/[^\w\s]/g, '').trim();

    if (/^(hi|hello|hey|yo|sup|greetings|howdy|namaste|hola|bonjour)\b/.test(lower) || ['hi', 'hello', 'hey', 'yo', 'sup'].includes(clean)) {
      return `Hello ${userName}! I'm **VOZX AI**, your intelligent personal assistant. My neural stream is active and ready.

Here are a few things I can assist you with right now:
• **Knowledge & Research**: Ask about any topic, person, company, concept, or technology.
• **Code & Debugging**: Write functions, scripts, or debug in Python, JavaScript, HTML/CSS, SQL, and more.
• **Productivity**: Draft emails, summarize topics, outline plans, or organize your schedule.
• **System Controls**: Switch to Voice Mode, configure Settings, or view Workspace Analytics.

What would you like to build or explore today?`;
    }

    if (/\b(how are you|how is it going|how are things|how do you feel|hows it going)\b/.test(lower)) {
      return `I'm operating at peak performance, ${userName}! All VOZX neural pathways are online, low-latency, and ready to assist you. How has your day been, and what can we accomplish together?`;
    }

    if (/\b(who are you|what is vozx|what are you|tell me about yourself|your name)\b/.test(lower)) {
      return `I am **VOZX AI** — an advanced neural personal assistant and intelligent workspace companion.

### Core Capabilities:
1. **Adaptive Chat Stream**: Natural conversational intelligence, technical problem solving, and contextual reasoning.
2. **Voice Mode**: Real-time auditory synthesis with interactive audio visualization and instant voice transcription.
3. **Workspace Intelligence**: Email automation, scheduling, note synthesis, and multi-device cloud synchronization.
4. **Developer Engine**: Code generation, architecture planning, bug diagnostics, and refactoring.`;
    }

    if (/\b(what can you do|help|capabilities|features|commands|guide|menu)\b/.test(lower)) {
      return `### VOZX AI Capabilities & Commands

You can ask me to do any of the following:

| Feature | Examples |
| :--- | :--- |
| **Knowledge & Answers** | *"Who is the CEO of Apple?"*, *"Tell me about AI"*, *"What is quantum computing?"* |
| **Code Generation** | *"Write a JavaScript function to debounce input"*, *"Create a Python Flask REST API"* |
| **Writing & Drafting** | *"Draft a follow-up email to a client"*, *"Write a product launch announcement"* |
| **Calculations & Logic** | *"Calculate 15% tip on $148"*, *"Solve compound interest for $5,000 at 7% over 5 years"* |
| **App Controls** | *"Switch to Voice Mode"*, *"Open Settings"*, *"Clear conversation"* |

Just type your request naturally, and I will handle it!`;
    }

    if (/(\d+(?:\.\d+)?)\s*([\+\-\*\/xX\^%]|times|divided by|plus|minus)\s*(\d+(?:\.\d+)?)/.test(lower) || /\b(calculate|solve|what is \d+)\b/.test(lower)) {
      try {
        const sanitized = lower
          .replace(/times/g, '*')
          .replace(/divided by/g, '/')
          .replace(/plus/g, '+')
          .replace(/minus/g, '-')
          .replace(/x/g, '*')
          .replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
        if (sanitized && /[\+\-\*\/]/.test(sanitized)) {
          const result = Function(`'use strict'; return (${sanitized})`)();
          if (typeof result === 'number' && !isNaN(result)) {
            return `The result of **${sanitized}** is **${result.toLocaleString()}**.`;
          }
        }
      } catch (e) {}
    }

    if (/\b(code|function|script|program|python|javascript|typescript|react|html|css|sql|api|debug|algorithm|reverse|sort|loop|regex)\b/.test(lower)) {
      if (lower.includes('reverse') && (lower.includes('string') || lower.includes('word') || lower.includes('text'))) {
        return `Here is how to reverse a string in both Python and JavaScript:

### Python
\`\`\`python
def reverse_string(text: str) -> str:
    return text[::-1]

# Example:
print(reverse_string('VOZX AI'))  # Output: IA XZOV
\`\`\`

### JavaScript
\`\`\`javascript
function reverseString(text) {
    return text.split('').reverse().join('');
}

// Modern ES6+ / Unicode-safe:
const reverseSafe = (str) => [...str].reverse().join('');
console.log(reverseSafe('VOZX AI')); // 'IA XZOV'
\`\`\`

Both solutions operate in **O(n)** time complexity.`;
      }

      if (lower.includes('prime')) {
        return `Here is an efficient Prime Number checker in Python:

\`\`\`python
import math

def is_prime(n: int) -> bool:
    if n <= 1:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    for i in range(5, int(math.isqrt(n)) + 1, 6):
        if n % i == 0 or n % (i + 2) == 0:
            return False
    return True

# Test:
print([x for x in range(30) if is_prime(x)])
# Output: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
\`\`\`

**Time Complexity**: \`O(sqrt(n))\` with a 3x speedup from the \`6k ± 1\` rule.`;
      }

      return `Here is a recommended architectural solution for your request:

\`\`\`javascript
// VOZX Neural Engine - Implementation
async function executeTask(payload) {
    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
        return await response.json();
    } catch (err) {\n        console.error('Execution failure:', err);\n        throw err;\n    }\n}\n\`\`\`\n\n### Key Highlights:\n1. **Robust Error Handling**: Wraps the async routine in a clean \`try/catch\` with descriptive status logging.\n2. **Type Compatibility**: Easily adapts into TypeScript interfaces or Python asynchronous coroutines.\n3. **Scalability**: Can be plugged into your existing VOZX backend service seamlessly.\n\nWould you like me to tailor this for a specific framework or database?`;
    }

    if (/\b(email|draft|write an? (email|letter|announcement|proposal))\b/.test(lower)) {
      return `Here is a polished, professional email draft:

---
**Subject**: Update Regarding Our Project Milestone & Next Steps

Hi Team / Client,

I hope you're having a productive week.

I am reaching out to share a quick update on our recent progress. We have successfully completed the core objectives for this milestone and are now preparing for the next phase of deployment.

**Key Highlights:**
• Completed implementation and initial testing verification.
• Performance optimizations applied across all active endpoints.
• Ready for stakeholder review and feedback.

Please review the attached notes and let me know your thoughts or availability for a brief sync later this week.

Best regards,
${userName}
---

Feel free to let me know if you would like me to adjust the tone, add specific details, or shorten it!`;
    }

    if (/\b(time|date|day|what time is it|today\'s date)\b/.test(lower)) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `The current local date is **${dateStr}** and the time is **${timeStr}**.`;
    }

    if (/\b(voice mode|voice|microphone|talk|listen)\b/.test(lower)) {
      return `You can activate **Voice Mode** at any time by tapping the microphone icon in the bottom floating dock, or by selecting **Voice Mode** from the Home dashboard action grid. In Voice Mode, you can speak naturally with interactive soundwave visualizers and real-time auditory synthesis.`;
    }

    // 10. REAL-TIME WORLD KNOWLEDGE RETRIEVAL (Wikipedia World Knowledge Search)
    const knowledgeRes = await queryClientKnowledgeEngine(msg);
    if (knowledgeRes) {
      return knowledgeRes;
    }

    return `I've analyzed your query regarding **"${msg}"**.

### Key Insights & Analysis:
1. **Core Concept**: Your request touches on key aspects of workflow optimization and AI reasoning. VOZX AI can assist you in breaking this down into actionable, structured steps.
2. **Recommended Approach**: Depending on your specific goal, we can either write an automated script, structure a detailed plan, or analyze existing parameters.
3. **Implementation**: I can generate tailored code, documentation, or step-by-step guidance right here.

Would you like me to generate a complete solution, provide code examples, or explore a specific detail?`;
  }

  // Send Message Controller
  async function handleSendMessage(overrideText = null) {
    if (isAiResponding) return;

    const query = overrideText !== null 
      ? overrideText.trim() 
      : (chatInput ? chatInput.value.trim() : '');

    if (!query) return;

    // Check offline state
    if (typeof isCurrentlyOffline !== 'undefined' && isCurrentlyOffline) {
      navigateToScreen('offline');
      showToast('📡 You are currently offline. Reconnect to chat with VOZX AI.');
      return;
    }

    lastUserMessageText = query;

    // Reset input
    if (overrideText === null && chatInput) {
      chatInput.value = '';
      chatInput.style.height = 'auto';
      sendBtn?.classList.remove('active-ready');
    }

    // Ensure on Chat screen
    navigateToScreen('chat');

    // Append user message
    const userTime = getChatTimestamp();
    const msgId = 'user-msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    chatSessionHistory.push({ id: msgId, role: 'user', text: query, time: userTime });
    saveChatHistory();
    renderUserBubble(query, userTime, true, msgId, false);

    await executeAiQuery(query);
  }

  // Execute AI query with OpenAI backend or client Neural Core fallback
  async function executeAiQuery(query) {
    if (isAiResponding) return;
    isAiResponding = true;
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.classList.add('btn-disabled');
    }

    // Show thinking animation ("VOZX is thinking...")
    showThinkingState();

    // Prepare API call
    const endpoint = window.location.protocol.startsWith('http') 
      ? '/api/chat' 
      : 'http://localhost:5000/api/chat';

    const historyPayload = chatSessionHistory.slice(0, -1).map(item => ({
      role: item.role === 'ai' ? 'assistant' : 'user',
      content: item.text
    }));

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          userName: currentUserName || 'Varun'
        })
      });

      const data = await res.json().catch(() => ({}));
      hideThinkingState();

      if (res.ok && data && data.reply) {
        const aiTime = getChatTimestamp();
        chatSessionHistory.push({ role: 'ai', text: data.reply, time: aiTime });
        saveChatHistory();
        renderAiBubble(data.reply, aiTime, true);
      } else {
        // Fallback to VOZX Autonomous Neural Core if OpenAI quota or backend fails
        console.warn('[VOZX AI] Using Autonomous Neural Core response:', data);
        const fallbackReply = await generateClientVozxReply(query, historyPayload, currentUserName || 'Varun');
        const aiTime = getChatTimestamp();
        chatSessionHistory.push({ role: 'ai', text: fallbackReply, time: aiTime });
        saveChatHistory();
        renderAiBubble(fallbackReply, aiTime, true);
      }
    } catch (err) {
      hideThinkingState();
      console.warn('[VOZX AI Network Offline] Using client Neural Core:', err);
      const fallbackReply = await generateClientVozxReply(query, historyPayload, currentUserName || 'Varun');
      const aiTime = getChatTimestamp();
      chatSessionHistory.push({ role: 'ai', text: fallbackReply, time: aiTime });
      saveChatHistory();
      renderAiBubble(fallbackReply, aiTime, true);
    } finally {
      isAiResponding = false;
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.classList.remove('btn-disabled');
        if (chatInput && chatInput.value.trim().length > 0) {
          sendBtn.classList.add('active-ready');
        }
      }
    }
  }

  // Wire Chat Header buttons (New Chat & Clear)
  chatNewBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    startNewChat(true);
  });

  chatClearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearConversation();
  });

  // Global references for programmatic access & developer console
  window.handleSendMessage = handleSendMessage;
  window.startNewChat = startNewChat;
  window.clearConversation = clearConversation;

  // Auto-growing textarea & Send on Enter (Shift + Enter for new line)
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      const scrollH = chatInput.scrollHeight;
      chatInput.style.height = (scrollH > 24 ? Math.min(scrollH, 110) : 24) + 'px';

      if (chatInput.value.trim().length > 0 && !isAiResponding) {
        sendBtn?.classList.add('active-ready');
      } else {
        sendBtn?.classList.remove('active-ready');
      }
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Allow Shift + Enter for new line
          return;
        }
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

  // Initialize chat history on boot
  loadChatHistory();

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

  // Brand Header Logo Click -> Refresh Page
  document.querySelectorAll('.brand-header-logo').forEach((logo) => {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.reload();
    });
    logo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.reload();
      }
    });
  });

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
      localStorage.setItem('vozx_current_screen', 'home');
      document.documentElement.classList.remove('on-getstarted-screen');
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
  async function handleGoogleSignIn() {
    showToast('Redirecting to Google Sign-In...');
    try {
      if (window.VozxAuth && window.VozxAuth.signInWithGoogleOAuth) {
        const res = await window.VozxAuth.signInWithGoogleOAuth();
        if (res && res.url && res.url !== 'https://accounts.google.com/signin') {
          window.location.href = res.url;
          return;
        }
      }
    } catch (e) {}
    setTimeout(() => {
      window.location.href = 'https://accounts.google.com/signin';
    }, 250);
  }

  ['spaSignInGoogleBtn', 'spaSignUpGoogleBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      handleGoogleSignIn();
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
        } else if (localStorage.getItem('vozx_is_logged_in') === 'false' || localStorage.getItem('vozx_current_screen') === 'getstarted') {
          navHistory = ['getstarted'];
          navigateToScreen('getstarted', false);
        }
      });
    } else {
      const isLoggedOut = localStorage.getItem('vozx_is_logged_in') === 'false';
      const currentScreen = localStorage.getItem('vozx_current_screen');
      if (isLoggedOut || currentScreen === 'getstarted') {
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
  // Stage 1: Brand Intro Screen (#appBrandIntroScreen) - ~1.8s
  // Stage 2: Workspace Loading Screen (#appSplashScreen) - ~2.0s
  // Stage 3: Smooth Flight of V Logo to Home Screen Top Header Logo
  // =========================================================================
  const appBrandIntroScreen = document.getElementById('appBrandIntroScreen');
  const appSplashScreen = document.getElementById('appSplashScreen');
  const bottomBarContainer = document.querySelector('.bottom-bar-container');

  function animateLogoToHomeHeader(onComplete) {
    const splashEmblem = document.querySelector('.splash-v-emblem-wrap') || document.querySelector('.splash-emblem-img');
    const screenHome = document.getElementById('screenHome');
    const targetLogo = document.querySelector('#screenHome .brand-header-logo');

    // Ensure screenHome is in active DOM tree so target element has accurate layout
    if (screenHome) {
      const activeScreen = document.querySelector('.app-screen.active');
      if (!activeScreen || activeScreen.id === 'screenHome') {
        appScreens.forEach(s => s.classList.remove('active'));
        screenHome.classList.add('active');
      }
    }

    if (!splashEmblem) {
      if (appSplashScreen) appSplashScreen.classList.add('splash-fade-out');
      revealHomeScreen();
      setTimeout(() => {
        if (appSplashScreen) appSplashScreen.style.display = 'none';
        if (typeof onComplete === 'function') onComplete();
      }, 500);
      return;
    }

    // Stop pulsing scale on splash emblem momentarily for exact unskewed measurement
    splashEmblem.style.animation = 'none';
    const sRect = splashEmblem.getBoundingClientRect();

    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth > 640 && window.innerWidth < 1024;
    const defaultEmblemSize = isMobile ? 84 : (isTablet ? 92 : 100);

    const startLeft = sRect.width > 0 ? sRect.left : (window.innerWidth - defaultEmblemSize) / 2;
    const startTop = sRect.height > 0 ? sRect.top : (window.innerHeight - defaultEmblemSize) / 2;
    const startWidth = sRect.width > 0 ? sRect.width : defaultEmblemSize;
    const startHeight = sRect.height > 0 ? sRect.height : defaultEmblemSize;

    // Measure target header logo on screenHome
    let targetLeft = 0;
    let targetTop = 0;
    let targetWidth = 0;

    if (targetLogo) {
      const tRect = targetLogo.getBoundingClientRect();
      targetLeft = tRect.left;
      targetTop = tRect.top;
      targetWidth = tRect.width;
    }

    // Reliable layout fallback for mobile/tablet if not yet computed
    if (!targetWidth || targetWidth === 0) {
      if (isMobile) {
        targetLeft = 20;
        targetTop = 24;
        targetWidth = 32;
      } else if (isTablet) {
        targetLeft = 24;
        targetTop = 28;
        targetWidth = 34;
      } else {
        const viewportContainer = document.querySelector('.phone-viewport-container') || document.body;
        const vRect = viewportContainer.getBoundingClientRect();
        targetLeft = (vRect && vRect.width > 0 ? vRect.left : 0) + 32;
        targetTop = 32;
        targetWidth = 38;
      }
    }

    // Create high-precision flying proxy emblem attached to document.body
    const flyingEl = document.createElement('div');
    flyingEl.className = 'splash-flying-logo';
    flyingEl.setAttribute('aria-hidden', 'true');
    flyingEl.innerHTML = '<img src="assets/vozx-logo-icon.png" alt="" />';
    flyingEl.style.top = `${startTop}px`;
    flyingEl.style.left = `${startLeft}px`;
    flyingEl.style.width = `${startWidth}px`;
    flyingEl.style.height = `${startHeight}px`;

    document.body.appendChild(flyingEl);

    // Hide the static splash emblem and destination logo so there are no duplicates
    splashEmblem.style.visibility = 'hidden';
    if (targetLogo) {
      targetLogo.style.opacity = '0';
    }

    // Softly dissolve splash inner ring and texts while keeping the dark splash background covering the home screen
    const splashInner = appSplashScreen ? appSplashScreen.querySelector('.splash-inner-content') : null;
    if (splashInner) {
      splashInner.classList.add('splash-content-dissolve');
    }

    // Vector calculations for hardware-accelerated transform
    const deltaX = targetLeft - startLeft;
    const deltaY = targetTop - startTop;
    const scale = targetWidth / startWidth;

    let hasLanded = false;
    const FLIGHT_MS = 720;

    function onFlightLanded() {
      if (hasLanded) return;
      hasLanded = true;

      // Remove flying proxy
      if (flyingEl.parentNode) {
        flyingEl.parentNode.removeChild(flyingEl);
      }

      // Restore static emblem for subsequent replays
      splashEmblem.style.visibility = '';
      splashEmblem.style.animation = '';

      // Reveal destination header logo with docking pulse
      if (targetLogo) {
        targetLogo.style.opacity = '1';
        targetLogo.classList.remove('logo-docked');
        void targetLogo.offsetWidth;
        targetLogo.classList.add('logo-docked');
        setTimeout(() => targetLogo.classList.remove('logo-docked'), 800);
      }

      // REQUIREMENT: "after logo reaching the top of the home screen then home screen should come"
      // Splash screen fades out NOW, revealing the active home screen underneath
      if (appSplashScreen) {
        appSplashScreen.classList.add('splash-fade-out');
      }
      revealHomeScreen();

      setTimeout(() => {
        if (appSplashScreen) {
          appSplashScreen.style.display = 'none';
          if (splashInner) {
            splashInner.classList.remove('splash-content-dissolve');
          }
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 500);
    }

    // Use Web Animations API for 100% frame reliability on mobile Safari, Android Chrome, and Tablet
    if (typeof flyingEl.animate === 'function') {
      const anim = flyingEl.animate([
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          boxShadow: '0 0 24px rgba(0, 240, 255, 0.75), 0 0 45px rgba(138, 43, 226, 0.4)',
          filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.9))'
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
          boxShadow: '0 0 12px rgba(0, 240, 255, 0.85), 0 0 22px rgba(56, 189, 248, 0.5)',
          filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.95))'
        }
      ], {
        duration: FLIGHT_MS,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      });

      anim.onfinish = onFlightLanded;
      // Fallback timer in case onfinish is deferred by browser
      setTimeout(onFlightLanded, FLIGHT_MS + 40);
    } else {
      // CSS transition fallback
      requestAnimationFrame(() => {
        flyingEl.classList.add('flying-active');
        flyingEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
      });
      setTimeout(onFlightLanded, FLIGHT_MS);
    }
  }

  function initAppSplashScreen() {
    const isLoggedOut = localStorage.getItem('vozx_is_logged_in') === 'false';
    const currentScreen = localStorage.getItem('vozx_current_screen');
    const isGetStarted = (currentScreen === 'getstarted' || (isLoggedOut && (!currentScreen || currentScreen === 'getstarted')));

    // REQUIREMENT: If user is on Get Started page and reloads, bypass "Loading Your Workspace"
    // and Brand Intro screens completely on all devices (Desktop, Tablet, Mobile)
    if (isGetStarted) {
      if (appBrandIntroScreen) {
        appBrandIntroScreen.style.display = 'none';
        appBrandIntroScreen.classList.add('brand-intro-fade-out');
      }
      if (appSplashScreen) {
        appSplashScreen.style.display = 'none';
        appSplashScreen.classList.add('splash-fade-out');
      }
      if (bottomBarContainer) {
        bottomBarContainer.classList.add('bar-hidden');
        bottomBarContainer.classList.remove('bar-visible');
      }
      navHistory = ['getstarted'];
      navigateToScreen('getstarted', false);
      return;
    }

    // Initially hide bottom floating input dock during splash loading
    if (bottomBarContainer) {
      bottomBarContainer.classList.add('bar-hidden');
      bottomBarContainer.classList.remove('bar-visible');
    }

    const BRAND_INTRO_DURATION_MS = 1800;
    const BRAND_FADE_DURATION_MS = 500;
    const WORKSPACE_DURATION_MS = 2000;

    if (appBrandIntroScreen) {
      // Stage 1: Show Brand Intro Logo Screen
      appBrandIntroScreen.style.display = 'flex';
      appBrandIntroScreen.classList.remove('brand-intro-fade-out');

      // Ensure Workspace Loading screen is ready behind it
      if (appSplashScreen) {
        appSplashScreen.style.display = 'flex';
        appSplashScreen.classList.remove('splash-fade-out');
        const splashEmblem = document.querySelector('.splash-v-emblem-wrap');
        if (splashEmblem) splashEmblem.style.visibility = '';
      }

      setTimeout(() => {
        // Dissolve Brand Intro Screen into Workspace Loading Screen
        appBrandIntroScreen.classList.add('brand-intro-fade-out');

        setTimeout(() => {
          appBrandIntroScreen.style.display = 'none';

          // Stage 2: Workspace Loading Screen runs, then Logo flies to top header
          setTimeout(() => {
            if (appSplashScreen) {
              animateLogoToHomeHeader(() => {
                revealHomeScreen();
              });
            } else {
              revealHomeScreen();
            }
          }, WORKSPACE_DURATION_MS);
        }, BRAND_FADE_DURATION_MS);
      }, BRAND_INTRO_DURATION_MS);
    } else if (appSplashScreen) {
      // Fallback if Brand Intro is not in DOM
      appSplashScreen.style.display = 'flex';
      appSplashScreen.classList.remove('splash-fade-out');
      const splashEmblem = document.querySelector('.splash-v-emblem-wrap');
      if (splashEmblem) splashEmblem.style.visibility = '';
      setTimeout(() => {
        animateLogoToHomeHeader(() => {
          revealHomeScreen();
        });
      }, WORKSPACE_DURATION_MS);
    } else {
      revealHomeScreen();
    }
  }

  function revealHomeScreen() {
    // Check if user is logged out or should be on getstarted
    const isLoggedOut = localStorage.getItem('vozx_is_logged_in') === 'false';
    const currentScreen = localStorage.getItem('vozx_current_screen');
    if (isLoggedOut || currentScreen === 'getstarted') {
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
  }

  // Developer helpers to replay screens anytime in console
  window.showBrandIntro = function(durationMs = 1800) {
    document.documentElement.classList.remove('on-getstarted-screen');
    if (!appBrandIntroScreen) return;
    appBrandIntroScreen.style.display = 'flex';
    appBrandIntroScreen.classList.remove('brand-intro-fade-out');
    setTimeout(() => {
      appBrandIntroScreen.classList.add('brand-intro-fade-out');
      setTimeout(() => {
        appBrandIntroScreen.style.display = 'none';
      }, 500);
    }, durationMs);
  };

  window.showSplashScreen = function(durationMs = 2000) {
    document.documentElement.classList.remove('on-getstarted-screen');
    if (!appSplashScreen) return;
    appSplashScreen.style.display = 'flex';
    appSplashScreen.classList.remove('splash-fade-out');
    const splashEmblem = document.querySelector('.splash-v-emblem-wrap');
    if (splashEmblem) splashEmblem.style.visibility = '';
    if (bottomBarContainer) {
      bottomBarContainer.classList.add('bar-hidden');
      bottomBarContainer.classList.remove('bar-visible');
    }
    setTimeout(() => {
      animateLogoToHomeHeader(() => {
        revealHomeScreen();
      });
    }, durationMs);
  };

  window.showFullLaunchSequence = function() {
    document.documentElement.classList.remove('on-getstarted-screen');
    initAppSplashScreen();
  };

  initAppSplashScreen();
});


