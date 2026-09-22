/**
 * VOZX AI — Futuristic Login Page Controller
 * Handles real-time validation, password strength calculation,
 * terms gating, avatar switching, ripple effects, and seamless dashboard redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const emailWrapper = document.getElementById('emailWrapper');
  const passwordWrapper = document.getElementById('passwordWrapper');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const strengthBarFill = document.getElementById('strengthBarFill');
  const strengthLevelText = document.getElementById('strengthLevelText');
  const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
  const termsCheckbox = document.getElementById('termsCheckbox');
  const signInSubmitBtn = document.getElementById('signInSubmitBtn');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginBtnLabel = document.getElementById('loginBtnLabel');
  const loginBackBtn = document.getElementById('loginBackBtn');
  const feedbackToast = document.getElementById('feedbackToast');
  const avatarClickTarget = document.getElementById('avatarClickTarget');
  const avatarRing = document.getElementById('avatarRing');
  const avatarImage = document.getElementById('avatarImage');
  const avatarDefaultIcon = document.getElementById('avatarDefaultIcon');

  // Forgot Password Modal Elements
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const forgotModal = document.getElementById('forgotModal');
  const closeForgotModal = document.getElementById('closeForgotModal');
  const sendResetLinkBtn = document.getElementById('sendResetLinkBtn');
  const resetEmailInput = document.getElementById('resetEmailInput');

  // Social Buttons
  const googleBtn = document.getElementById('googleLoginBtn');
  const appleBtn = document.getElementById('appleLoginBtn');

  // Avatar presets for switching
  const avatarPresets = [
    {
      type: 'default',
      html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>`
    },
    {
      type: 'initials',
      html: `<span style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;color:#38bdf8;letter-spacing:1px;text-shadow:0 0 10px rgba(56,189,248,0.7);">VR</span>`
    },
    {
      type: 'ai-core',
      html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.8">
               <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
               <polyline points="2 17 12 22 22 17"></polyline>
               <polyline points="2 12 12 17 22 12"></polyline>
             </svg>`
    },
    {
      type: 'cyber-neural',
      html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8">
               <circle cx="12" cy="12" r="3"></circle>
               <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
             </svg>`
    }
  ];

  let currentAvatarIdx = 0;

  // Avatar Click Switcher
  if (avatarClickTarget) {
    avatarClickTarget.addEventListener('click', () => {
      currentAvatarIdx = (currentAvatarIdx + 1) % avatarPresets.length;
      const preset = avatarPresets[currentAvatarIdx];
      avatarDefaultIcon.innerHTML = preset.html;
      
      // Pulse animation trigger
      avatarRing.style.transform = 'scale(1.15) rotate(15deg)';
      setTimeout(() => {
        avatarRing.style.transform = '';
      }, 250);

      showToast(`Avatar updated: ${preset.type.toUpperCase()}`, 'normal');
    });
  }

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail() {
    const val = loginEmail.value.trim();
    if (!val) {
      emailWrapper.classList.remove('is-valid');
      emailWrapper.classList.add('is-invalid');
      emailError.textContent = 'Email address is required.';
      return false;
    }
    if (!emailRegex.test(val)) {
      emailWrapper.classList.remove('is-valid');
      emailWrapper.classList.add('is-invalid');
      emailError.textContent = 'Please enter a valid email address.';
      return false;
    }
    emailWrapper.classList.remove('is-invalid');
    emailWrapper.classList.add('is-valid');
    return true;
  }

  // Password evaluation & strength meter
  function evaluatePasswordStrength(password) {
    if (!password) {
      strengthBarFill.className = 'strength-bar-fill';
      strengthBarFill.style.width = '0%';
      strengthLevelText.textContent = 'Empty';
      strengthLevelText.style.color = 'var(--text-muted)';
      return 0;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    strengthBarFill.className = 'strength-bar-fill';

    if (score <= 1 || password.length < 6) {
      strengthBarFill.classList.add('weak');
      strengthLevelText.textContent = 'Weak';
      strengthLevelText.style.color = 'var(--color-error)';
    } else if (score === 2 || score === 3) {
      strengthBarFill.classList.add('medium');
      strengthLevelText.textContent = 'Medium';
      strengthLevelText.style.color = 'var(--color-warning)';
    } else {
      strengthBarFill.classList.add('strong');
      strengthLevelText.textContent = 'Strong';
      strengthLevelText.style.color = 'var(--color-success)';
    }

    return score;
  }

  function validatePassword() {
    const val = loginPassword.value;
    evaluatePasswordStrength(val);

    if (!val) {
      passwordWrapper.classList.remove('is-valid');
      passwordWrapper.classList.add('is-invalid');
      passwordError.textContent = 'Password is required.';
      return false;
    }
    if (val.length < 8) {
      passwordWrapper.classList.remove('is-valid');
      passwordWrapper.classList.add('is-invalid');
      passwordError.textContent = 'Password must be at least 8 characters.';
      return false;
    }

    passwordWrapper.classList.remove('is-invalid');
    passwordWrapper.classList.add('is-valid');
    return true;
  }

  // Toggle Terms Checkbox Gating
  function updateTermsGating() {
    if (termsCheckbox) {
      if (termsCheckbox.checked) {
        signInSubmitBtn.removeAttribute('disabled');
      } else {
        signInSubmitBtn.setAttribute('disabled', 'true');
      }
    }
  }

  // Password visibility toggle
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = loginPassword.type === 'password';
      loginPassword.type = isPassword ? 'text' : 'password';

      const showIcon = togglePasswordBtn.querySelector('.eye-show');
      const hideIcon = togglePasswordBtn.querySelector('.eye-hide');

      if (isPassword) {
        showIcon.classList.add('hidden');
        hideIcon.classList.remove('hidden');
      } else {
        showIcon.classList.remove('hidden');
        hideIcon.classList.add('hidden');
      }
    });
  }

  // Real-time Input Listeners
  if (loginEmail) {
    loginEmail.addEventListener('input', () => {
      if (emailWrapper.classList.contains('is-invalid') || loginEmail.value.length > 3) {
        validateEmail();
      }
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', () => {
      evaluatePasswordStrength(loginPassword.value);
      if (passwordWrapper.classList.contains('is-invalid')) {
        validatePassword();
      }
    });
  }

  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', updateTermsGating);
  }

  // Initial validation setup
  if (loginEmail.value) validateEmail();
  if (loginPassword.value) validatePassword();
  updateTermsGating();

  // Toast Notification Helper
  let toastTimer;
  function showToast(message, type = 'normal') {
    if (!feedbackToast) return;
    clearTimeout(toastTimer);

    feedbackToast.textContent = message;
    feedbackToast.className = 'feedback-toast show';

    if (type === 'success') {
      feedbackToast.classList.add('success');
    } else if (type === 'error') {
      feedbackToast.classList.add('error');
    }

    toastTimer = setTimeout(() => {
      feedbackToast.className = 'feedback-toast';
    }, 3200);
  }

  // Button Ripple Effect
  function createRipple(event, button) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-bubble';
    
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    
    const x = event.clientX ? (event.clientX - rect.left - size / 2) : (rect.width / 2 - size / 2);
    const y = event.clientY ? (event.clientY - rect.top - size / 2) : (rect.height / 2 - size / 2);
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    const layer = button.querySelector('.btn-ripple-layer');
    if (layer) {
      layer.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    }
  }

  // Form Submit Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!termsCheckbox.checked) {
        showToast('Please accept the Terms & Privacy Policy to sign in.', 'error');
        return;
      }

      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();

      if (!isEmailValid || !isPasswordValid) {
        showToast('Please fix the errors before proceeding.', 'error');
        return;
      }

      // Trigger ripple
      createRipple(e, signInSubmitBtn);

      // Loading state
      signInSubmitBtn.setAttribute('disabled', 'true');
      loginSpinner.classList.remove('hidden');
      loginBtnLabel.textContent = 'Signing In...';

      // Avatar energetic pulse
      avatarRing.style.boxShadow = '0 0 35px rgba(34, 211, 238, 0.9), 0 0 60px rgba(56, 189, 248, 0.6)';

      // Real Supabase Authentication Call
      let authResult;
      try {
        if (window.VozxAuth && window.VozxAuth.signInWithSupabase) {
          authResult = await window.VozxAuth.signInWithSupabase(
            loginEmail.value.trim(), 
            loginPassword.value, 
            rememberMeCheckbox.checked
          );
        } else {
          authResult = { success: true };
        }
      } catch (err) {
        authResult = { success: false, error: err.message };
      }

      if (!authResult.success) {
        signInSubmitBtn.removeAttribute('disabled');
        loginSpinner.classList.add('hidden');
        loginBtnLabel.textContent = 'Sign In →';
        avatarRing.style.boxShadow = '';
        showToast(authResult.error || 'Authentication failed. Please check your credentials.', 'error');
        passwordWrapper.classList.add('is-invalid');
        passwordError.textContent = authResult.error || 'Invalid credentials.';
        return;
      }

      const userName = authResult.user?.user_metadata?.full_name || 'Varun';
      showToast(`Welcome back, ${userName}! Synchronizing neural core...`, 'success');

      // Save user session preference
      try {
        localStorage.setItem('vozx_is_logged_in', 'true');
        localStorage.setItem('vozx_user_logged_in', 'true');
        localStorage.setItem('vozx_user_email', loginEmail.value.trim());
        localStorage.setItem('vozx_user_name', userName);
        localStorage.setItem('vozx_remember_me', rememberMeCheckbox.checked ? 'true' : 'false');
      } catch (err) {
        // LocalStorage fallback
      }

      // Smooth transition to Dashboard (index.html)
      setTimeout(() => {
        const phoneFrame = document.getElementById('loginPhoneFrame');
        if (phoneFrame) {
          phoneFrame.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          phoneFrame.style.opacity = '0';
          phoneFrame.style.transform = 'scale(0.97) translateY(-10px)';
        }

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 450);

      }, 1100);
    });
  }

  // Back Button Navigation
  if (loginBackBtn) {
    loginBackBtn.addEventListener('click', () => {
      window.location.href = 'onboarding.html';
    });
  }

  // Social Login Mock
  [googleBtn, appleBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('title') || 'Provider';
      showToast(`Connecting via ${provider}...`, 'normal');

      setTimeout(() => {
        try {
          localStorage.setItem('vozx_is_logged_in', 'true');
          localStorage.setItem('vozx_user_logged_in', 'true');
        } catch (e) {}
        showToast(`Authenticated via ${provider}! Launching VOZX...`, 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 900);
      }, 700);
    });
  });

  // Forgot Password Modal
  if (forgotPasswordBtn && forgotModal) {
    forgotPasswordBtn.addEventListener('click', () => {
      forgotModal.classList.remove('hidden');
      if (resetEmailInput && loginEmail.value) {
        resetEmailInput.value = loginEmail.value;
      }
    });
  }

  if (closeForgotModal && forgotModal) {
    closeForgotModal.addEventListener('click', () => {
      forgotModal.classList.add('hidden');
    });
  }

  if (forgotModal) {
    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) {
        forgotModal.classList.add('hidden');
      }
    });
  }

  if (sendResetLinkBtn && forgotModal) {
    sendResetLinkBtn.addEventListener('click', async () => {
      const resetEmail = resetEmailInput ? resetEmailInput.value.trim() : '';
      if (!resetEmail || !emailRegex.test(resetEmail)) {
        showToast('Please enter a valid recovery email.', 'error');
        return;
      }

      const originalText = sendResetLinkBtn.innerHTML;
      sendResetLinkBtn.textContent = 'Sending...';
      sendResetLinkBtn.setAttribute('disabled', 'true');

      try {
        if (window.VozxAuth && window.VozxAuth.resetPasswordWithSupabase) {
          await window.VozxAuth.resetPasswordWithSupabase(resetEmail);
        }
        showToast(`Password reset link dispatched to ${resetEmail}`, 'success');
        forgotModal.classList.add('hidden');
      } catch (err) {
        showToast('Failed to dispatch recovery email.', 'error');
      } finally {
        sendResetLinkBtn.innerHTML = originalText;
        sendResetLinkBtn.removeAttribute('disabled');
      }
    });
  }
});
