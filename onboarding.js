/* ==========================================================================
   VOZX AI - Onboarding Flow & Step-by-Step Mobile Walkthrough Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mode switcher elements
  const btnBoardMode = document.getElementById('btnBoardMode');
  const btnInteractiveMode = document.getElementById('btnInteractiveMode');
  const boardPresentationLayout = document.getElementById('boardPresentationLayout');
  const interactiveFlowLayout = document.getElementById('interactiveFlowLayout');
  const stepStepperBar = document.getElementById('stepStepperBar');

  // Interactive flow container
  const interactivePhoneFrame = document.getElementById('interactivePhoneFrame');
  const interactiveCanvas = document.getElementById('interactiveCanvas');
  const prevStepBtn = document.getElementById('prevStepBtn');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const stepCounterLabel = document.getElementById('stepCounterLabel');

  let currentStep = 1;
  const totalSteps = 8;
  let splashTimer = null;
  let splashClickHandler = null;

  const stepTitles = [
    'Splash Screen',
    'Welcome Screen',
    'Create Your Account',
    'Welcome Back (Login)',
    'Verify Your Email',
    'Setup Your Profile',
    'Choose Preferences',
    'All Set!'
  ];

  // Toast notification helper for Onboarding
  let toastTimer = null;
  function showOnboardingToast(message, type = 'info') {
    let toast = document.getElementById('onboardingToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'onboardingToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '28px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.padding = '10px 22px';
      toast.style.borderRadius = '999px';
      toast.style.fontSize = '12px';
      toast.style.fontWeight = '600';
      toast.style.zIndex = '9999';
      toast.style.backdropFilter = 'blur(16px)';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '8px';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      document.body.appendChild(toast);
    }

    clearTimeout(toastTimer);
    toast.textContent = message;

    if (type === 'success') {
      toast.style.background = 'rgba(15, 23, 42, 0.95)';
      toast.style.border = '1.2px solid rgba(16, 185, 129, 0.6)';
      toast.style.color = '#34d399';
      toast.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.4)';
    } else if (type === 'error') {
      toast.style.background = 'rgba(15, 23, 42, 0.95)';
      toast.style.border = '1.2px solid rgba(239, 68, 68, 0.6)';
      toast.style.color = '#f87171';
      toast.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.4)';
    } else {
      toast.style.background = 'rgba(15, 23, 42, 0.95)';
      toast.style.border = '1.2px solid rgba(34, 211, 238, 0.6)';
      toast.style.color = '#38bdf8';
      toast.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.4)';
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

  // Mode Switch Handlers
  function setMode(mode) {
    if (mode === 'board') {
      btnBoardMode?.classList.add('active');
      btnInteractiveMode?.classList.remove('active');
      boardPresentationLayout?.classList.remove('hidden');
      interactiveFlowLayout?.classList.remove('active');
      clearTimeout(splashTimer);
      setTimeout(updateSerpentineConnector, 80);
    } else {
      // Default: One-by-One Walkthrough
      btnInteractiveMode?.classList.add('active');
      btnBoardMode?.classList.remove('active');
      boardPresentationLayout?.classList.add('hidden');
      interactiveFlowLayout?.classList.add('active');
      renderInteractiveStep(currentStep, 'none');
    }
  }

  btnBoardMode?.addEventListener('click', () => setMode('board'));
  btnInteractiveMode?.addEventListener('click', () => setMode('interactive'));

  // Clicking any phone in the 2x4 Board switches to interactive mode on that specific screen
  const screenUnits = document.querySelectorAll('.screen-card-unit');
  screenUnits.forEach(unit => {
    unit.addEventListener('click', () => {
      const stepNum = parseInt(unit.dataset.stepIndex, 10) || 1;
      currentStep = stepNum;
      setMode('interactive');
    });
  });

  // Render Interactive Step Content One-by-One
  function renderInteractiveStep(step, direction = 'forward') {
    clearTimeout(splashTimer);
    if (splashClickHandler && interactiveCanvas) {
      interactiveCanvas.removeEventListener('click', splashClickHandler);
      splashClickHandler = null;
    }
    const prev = currentStep;
    currentStep = step;

    // Update step dots
    const dots = document.querySelectorAll('.step-indicator-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === step);
    });

    // Update Navigation Controls
    if (stepCounterLabel) {
      stepCounterLabel.textContent = `Screen ${step} of ${totalSteps}: ${stepTitles[step - 1]}`;
    }
    if (prevStepBtn) {
      prevStepBtn.disabled = (step === 1);
    }
    if (nextStepBtn) {
      nextStepBtn.disabled = (step === totalSteps);
    }

    // Grab content from the corresponding board screen
    const sourceScreen = document.querySelector(`.screen-card-unit[data-step-index="${step}"] .phone-canvas`);
    if (sourceScreen && interactiveCanvas) {
      interactiveCanvas.innerHTML = sourceScreen.innerHTML;

      // Apply slide animation
      interactiveCanvas.classList.remove('step-anim-forward', 'step-anim-backward');
      void interactiveCanvas.offsetWidth; // Force reflow
      if (direction === 'forward') {
        interactiveCanvas.classList.add('step-anim-forward');
      } else if (direction === 'backward') {
        interactiveCanvas.classList.add('step-anim-backward');
      }

      interactiveCanvas.scrollTop = 0;
      bindInteractiveScreenEvents(interactiveCanvas, step);
    }
  }

  // Generate stepper indicator dots (1 to 8)
  if (stepStepperBar) {
    stepStepperBar.innerHTML = '';
    for (let i = 1; i <= totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = `step-indicator-dot ${i === 1 ? 'active' : ''}`;
      dot.title = `Go to Screen ${i}: ${stepTitles[i - 1]}`;
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = i > currentStep ? 'forward' : 'backward';
        renderInteractiveStep(i, dir);
      });
      stepStepperBar.appendChild(dot);
    }
  }

  // Prev / Next Navigation Buttons
  prevStepBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 1) {
      renderInteractiveStep(currentStep - 1, 'backward');
    }
  });

  nextStepBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < totalSteps) {
      renderInteractiveStep(currentStep + 1, 'forward');
    }
  });

  // Bind Actions for Active Step
  function bindInteractiveScreenEvents(container, step) {
    // Universal Back Button inside phone header
    const backBtn = container.querySelector('.mock-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (step > 1) {
          renderInteractiveStep(step - 1, 'backward');
        } else {
          setMode('board');
        }
      });
    }

    // Screen 1: Splash Screen
    if (step === 1) {
      splashClickHandler = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        clearTimeout(splashTimer);
        if (splashClickHandler && container) {
          container.removeEventListener('click', splashClickHandler);
          splashClickHandler = null;
        }
        renderInteractiveStep(2, 'forward');
      };

      splashTimer = setTimeout(() => {
        if (splashClickHandler && container) {
          container.removeEventListener('click', splashClickHandler);
          splashClickHandler = null;
        }
        if (currentStep === 1) {
          renderInteractiveStep(2, 'forward');
        }
      }, 2400);

      container.addEventListener('click', splashClickHandler);
    }

    // Screen 2: Welcome Screen
    if (step === 2) {
      const getStartedBtn = container.querySelector('.cyan-action-btn, #getStartedActionBtn, .get-started-primary-btn');
      const signInLink = container.querySelector('.bottom-auth-link span, .link-accent, #getStartedSignInLink');

      getStartedBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        renderInteractiveStep(3, 'forward');
      });

      signInLink?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        renderInteractiveStep(4, 'forward');
      });
    }

    // Screen 3: Sign Up Screen (Supabase Auth Integration)
    if (step === 3) {
      const form = container.querySelector('#boardSignupForm') || container.querySelector('form');
      const createAccountBtn = container.querySelector('.cyan-action-btn');
      const signInLink = container.querySelector('.bottom-auth-link span');

      const nameInput = container.querySelector('#s3InputFullName') || container.querySelectorAll('input')[0];
      const emailInput = container.querySelector('#s3InputEmail') || container.querySelectorAll('input')[1];
      const passInput = container.querySelector('#s3InputPassword') || container.querySelectorAll('input')[2];
      const confirmInput = container.querySelector('#s3InputConfirm') || container.querySelectorAll('input')[3];

      const errName = container.querySelector('#s3ErrFullName');
      const errEmail = container.querySelector('#s3ErrEmail');
      const errPass = container.querySelector('#s3ErrPassword');
      const errConfirm = container.querySelector('#s3ErrConfirm');

      const nameWrap = container.querySelector('#s3FieldFullNameWrap') || nameInput?.parentElement;
      const emailWrap = container.querySelector('#s3FieldEmailWrap') || emailInput?.parentElement;
      const passWrap = container.querySelector('#s3FieldPassWrap') || passInput?.parentElement;
      const confirmWrap = container.querySelector('#s3FieldConfirmWrap') || confirmInput?.parentElement;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const validate = () => {
        let valid = true;
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const passVal = passInput ? passInput.value : '';
        const confirmVal = confirmInput ? confirmInput.value : '';

        // Full Name
        if (!nameVal || nameVal.length < 2) {
          valid = false;
          if (errName) { errName.textContent = 'Full Name must be at least 2 characters.'; errName.classList.add('show'); }
          nameWrap?.classList.add('is-invalid');
          nameWrap?.classList.remove('is-valid');
        } else {
          if (errName) { errName.textContent = ''; errName.classList.remove('show'); }
          nameWrap?.classList.remove('is-invalid');
          nameWrap?.classList.add('is-valid');
        }

        // Email
        if (!emailVal || !emailRegex.test(emailVal)) {
          valid = false;
          if (errEmail) { errEmail.textContent = 'Please enter a valid email address.'; errEmail.classList.add('show'); }
          emailWrap?.classList.add('is-invalid');
          emailWrap?.classList.remove('is-valid');
        } else {
          if (errEmail) { errEmail.textContent = ''; errEmail.classList.remove('show'); }
          emailWrap?.classList.remove('is-invalid');
          emailWrap?.classList.add('is-valid');
        }

        // Password >= 8
        if (!passVal || passVal.length < 8) {
          valid = false;
          if (errPass) { errPass.textContent = 'Password must be at least 8 characters.'; errPass.classList.add('show'); }
          passWrap?.classList.add('is-invalid');
          passWrap?.classList.remove('is-valid');
        } else {
          if (errPass) { errPass.textContent = ''; errPass.classList.remove('show'); }
          passWrap?.classList.remove('is-invalid');
          passWrap?.classList.add('is-valid');
        }

        // Confirm Password matches
        if (!confirmVal || confirmVal !== passVal) {
          valid = false;
          if (errConfirm) { errConfirm.textContent = 'Passwords do not match.'; errConfirm.classList.add('show'); }
          confirmWrap?.classList.add('is-invalid');
          confirmWrap?.classList.remove('is-valid');
        } else {
          if (errConfirm) { errConfirm.textContent = ''; errConfirm.classList.remove('show'); }
          confirmWrap?.classList.remove('is-invalid');
          confirmWrap?.classList.add('is-valid');
        }

        return { valid, nameVal, emailVal, passVal };
      };

      [nameInput, emailInput, passInput, confirmInput].forEach((inp) => {
        inp?.addEventListener('input', () => {
          if (inp.value.length > 1) validate();
        });
      });

      const handleSignupSubmit = async (e) => {
        if (e) e.preventDefault();
        const { valid, nameVal, emailVal, passVal } = validate();
        if (!valid) {
          showOnboardingToast('Please fix the highlighted errors before submitting.', 'error');
          return;
        }

        if (createAccountBtn) {
          createAccountBtn.disabled = true;
          createAccountBtn.innerHTML = '<span>Creating Supabase Account...</span>';
        }
        showOnboardingToast('Connecting to Supabase Neural Core...', 'info');

        try {
          let res;
          if (window.VozxAuth && window.VozxAuth.signUpWithSupabase) {
            res = await window.VozxAuth.signUpWithSupabase(nameVal, emailVal, passVal);
          } else {
            res = { success: true };
          }

          if (!res.success) {
            if (createAccountBtn) {
              createAccountBtn.disabled = false;
              createAccountBtn.innerHTML = '<span>Create Account</span><span>&rarr;</span>';
            }
            showOnboardingToast(res.error || 'Failed to create account.', 'error');
            return;
          }

          showOnboardingToast('Account created successfully! Redirecting to Login...', 'success');
          setTimeout(() => {
            if (createAccountBtn) {
              createAccountBtn.disabled = false;
              createAccountBtn.innerHTML = '<span>Create Account</span><span>&rarr;</span>';
            }
            renderInteractiveStep(4, 'forward');
          }, 1100);

        } catch (err) {
          if (createAccountBtn) {
            createAccountBtn.disabled = false;
            createAccountBtn.innerHTML = '<span>Create Account</span><span>&rarr;</span>';
          }
          showOnboardingToast(err.message || 'Signup failed', 'error');
        }
      };

      createAccountBtn?.addEventListener('click', handleSignupSubmit);
      form?.addEventListener('submit', handleSignupSubmit);

      signInLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderInteractiveStep(4, 'forward');
      });
    }

    // Screen 4: Login Screen
    if (step === 4) {
      const signInBtn = container.querySelector('.cyan-action-btn');
      const signUpLink = container.querySelector('.bottom-auth-link span');
      const emailInput = container.querySelectorAll('input')[0];
      const passwordInput = container.querySelectorAll('input')[1];

      signInBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value.trim() : 'varun.reddy@gmail.com';
        const password = passwordInput ? passwordInput.value : 'VozxAI#2026';

        signInBtn.disabled = true;
        signInBtn.innerHTML = '<span>Signing In with Supabase...</span>';
        showOnboardingToast('Authenticating with Supabase...', 'info');

        try {
          let res;
          if (window.VozxAuth && window.VozxAuth.signInWithSupabase) {
            res = await window.VozxAuth.signInWithSupabase(email, password, true);
          } else {
            res = { success: true };
          }

          if (!res.success) {
            signInBtn.disabled = false;
            signInBtn.innerHTML = '<span>Sign In</span><span>&rarr;</span>';
            showOnboardingToast(res.error || 'Invalid credentials.', 'error');
            return;
          }

          showOnboardingToast('Signed in successfully! Launching VOZX AI...', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 900);
        } catch (err) {
          signInBtn.disabled = false;
          signInBtn.innerHTML = '<span>Sign In</span><span>&rarr;</span>';
          showOnboardingToast(err.message || 'Login failed', 'error');
        }
      });

      signUpLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderInteractiveStep(3, 'backward');
      });
    }

    // Screen 5: Email Verification
    if (step === 5) {
      const openEmailBtn = container.querySelector('.outlined-glass-btn');
      const resendLink = container.querySelector('.verify-screen-body span[style*="cursor"]');

      openEmailBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        renderInteractiveStep(6, 'forward');
      });

      resendLink?.addEventListener('click', () => {
        alert('Verification code resent to your email.');
      });
    }

    // Screen 6: Profile Setup
    if (step === 6) {
      const continueBtn = container.querySelector('.cyan-action-btn');
      const interestPills = container.querySelectorAll('.interest-pill');

      interestPills.forEach(pill => {
        pill.addEventListener('click', () => {
          pill.classList.toggle('selected');
        });
      });

      continueBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        renderInteractiveStep(7, 'forward');
      });
    }

    // Screen 7: Choose Preferences
    if (step === 7) {
      const continueBtn = container.querySelector('.cyan-action-btn');
      const prefCards = container.querySelectorAll('.pref-card');

      prefCards.forEach(card => {
        card.addEventListener('click', () => {
          card.classList.toggle('selected');
        });
      });

      continueBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        renderInteractiveStep(8, 'forward');
      });
    }

    // Screen 8: All Set!
    if (step === 8) {
      const goToHomeBtn = container.querySelector('.cyan-action-btn');
      goToHomeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          localStorage.setItem('vozx_is_logged_in', 'true');
          localStorage.setItem('vozx_current_screen', 'home');
        } catch (err) {}
        window.location.href = 'index.html';
      });
    }
  }

  // Bind Board View Buttons for interactive clicks inside 2x4 mockups
  const boardPillButtons = document.querySelectorAll('#boardPresentationLayout .interest-pill');
  boardPillButtons.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      pill.classList.toggle('selected');
    });
  });

  const boardPrefCards = document.querySelectorAll('#boardPresentationLayout .pref-card');
  boardPrefCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.toggle('selected');
    });
  });

  const boardGoHomeBtn = document.querySelector('.screen-card-unit[data-step-index="8"] .cyan-action-btn');
  boardGoHomeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    try {
      localStorage.setItem('vozx_is_logged_in', 'true');
      localStorage.setItem('vozx_current_screen', 'home');
    } catch (err) {}
    window.location.href = 'index.html';
  });

  const boardSignInBtn = document.querySelector('.screen-card-unit[data-step-index="4"] .cyan-action-btn');
  boardSignInBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    try {
      localStorage.setItem('vozx_is_logged_in', 'true');
      localStorage.setItem('vozx_current_screen', 'home');
    } catch (err) {}
    window.location.href = 'index.html';
  });

  const backToHomeLinks = document.querySelectorAll('.back-to-home-link');
  backToHomeLinks.forEach(link => {
    link.addEventListener('click', () => {
      try {
        localStorage.setItem('vozx_is_logged_in', 'true');
        localStorage.setItem('vozx_current_screen', 'home');
      } catch (err) {}
    });
  });

  // Dynamic Serpentine Flow Connector from Screen 4 to Screen 5
  function updateSerpentineConnector() {
    const wrapper = document.querySelector('.board-grid-wrapper');
    const screen4 = document.querySelector('.screen-card-unit[data-step-index="4"] .mockup-phone-frame');
    const screen5 = document.querySelector('.screen-card-unit[data-step-index="5"] .mockup-phone-frame');
    const svg = document.getElementById('serpentineConnectorSvg');
    const path = document.getElementById('serpentinePath');

    if (!wrapper || !screen4 || !screen5 || !svg || !path) return;

    const wRect = wrapper.getBoundingClientRect();
    const r4 = screen4.getBoundingClientRect();
    const r5 = screen5.getBoundingClientRect();

    if (wRect.width === 0 || r4.width === 0) return;

    svg.setAttribute('viewBox', `0 0 ${wRect.width} ${wRect.height}`);

    const startX = r4.right - wRect.left;
    const startY = r4.top + r4.height * 0.48 - wRect.top;
    const cornerX = Math.min(wRect.width - 4, startX + 16);
    const midY = (r4.bottom - wRect.top + (r5.top - wRect.top)) / 2;
    const endX = r5.left + r5.width * 0.5 - wRect.left;
    const endY = r5.top - 6 - wRect.top;

    path.setAttribute('d', `M ${startX} ${startY} H ${cornerX} V ${midY} H ${endX} V ${endY}`);
  }

  window.addEventListener('resize', updateSerpentineConnector);

  // Global hooks for testing & external controllers
  window.renderInteractiveStep = renderInteractiveStep;
  window.setMode = setMode;

  // Support URL parameters: e.g. onboarding.html?step=2 or ?mode=board
  const urlParams = new URLSearchParams(window.location.search);
  const stepParam = parseInt(urlParams.get('step'), 10);
  if (stepParam >= 1 && stepParam <= totalSteps) {
    currentStep = stepParam;
  }
  const modeParam = urlParams.get('mode');
  if (modeParam === 'board') {
    setMode('board');
  } else {
    // Default: Start in One-by-One Walkthrough Mode
    setMode('interactive');
  }
});
