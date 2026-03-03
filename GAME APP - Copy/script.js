// ✅ Backend URL
const BACKEND_URL = 'https://gameappbackend-i8zv.onrender.com';

// ✅ Run script only after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 🚀 Auto redirect if already logged in and session is still valid
  const savedUser = JSON.parse(localStorage.getItem('user'));
  const expiryTime = localStorage.getItem('sessionExpiry');

  if (savedUser && expiryTime && Date.now() < expiryTime) {
    redirectBasedOnRole(savedUser.role);
  } else {
    // Clear old session if expired
    clearSession();
  }

  // 🎯 DOM Elements
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const instituteForm = document.getElementById('instituteForm');
  const otpVerificationForm = document.getElementById('otpVerificationForm');

  const signInMessage = document.getElementById('signInMessage');
  const signUpMessage = document.getElementById('signUpMessage');
  const instituteMessage = document.getElementById('instituteMessage');
  const otpMessage = document.getElementById('otpMessage');

  const signInEmailInput = document.getElementById('signInEmail');
  const signInPasswordInput = document.getElementById('signInPassword');
  const signUpUsernameInput = document.getElementById('signUpUsername');
  const signUpEmailInput = document.getElementById('signUpEmail');
  const signUpPasswordInput = document.getElementById('signUpPassword');
  const instituteNameInput = document.getElementById('instituteName');
  const instituteEmailInput = document.getElementById('instituteEmail');
  const tneaCodeInput = document.getElementById('tneaCode');
  const institutePasswordInput = document.getElementById('institutePassword');
  const otpInput = document.getElementById('otpInput');
  const otpUserIdInput = document.getElementById('otpUserId');
  const otpEmailDisplay = document.getElementById('otpEmailDisplay');

  // ✅ Utility — show message
  function displayMessage(element, msg, type = 'info') {
    if (!element) return;
    element.textContent = msg;
    element.style.color =
      type === 'error' ? 'red' : type === 'success' ? 'green' : 'white';
  }

  // ✅ Helper — Redirect by Role
  function redirectBasedOnRole(role) {
    switch (role) {
      case 'admin':
        window.location.href = 'admin/adminhomepage.html';
        break;
      case 'teacher':
        window.location.href = 'teacher/teacherhomepage.html';
        break;
      case 'collegemanagement':
      case 'institute':
        window.location.href = 'college/collegemanagement.html';
        break;
      default:
        window.location.href = 'Home.html';
    }
  }

  // ✅ Helper — Clear session
  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sessionExpiry');
  }

  // ✅ User Registration (skip OTP, directly go to login)
  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = signUpUsernameInput.value;
      const email = signUpEmailInput.value;
      const password = signUpPasswordInput.value;

      displayMessage(signUpMessage, 'Registering...', 'info');

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role: 'user' }),
        });

        const data = await response.json();

        if (response.ok) {
          displayMessage(signUpMessage, 'Registration successful! Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          displayMessage(signUpMessage, data.message || 'Registration failed', 'error');
        }
      } catch (err) {
        displayMessage(signUpMessage, 'Network error.', 'error');
      }
    });
  }

  // ✅ Institute Registration (also skip OTP)
  if (instituteForm) {
    instituteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const collegeName = instituteNameInput.value;
      const email = instituteEmailInput.value;
      const tneaCode = tneaCodeInput.value;
      const password = institutePasswordInput.value;

      displayMessage(instituteMessage, 'Registering institute...', 'info');

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register-institute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeName,
            email,
            tneaCode,
            password,
            role: 'collegemanagement',
          }),
        });

        const data = await response.json();

        if (response.ok) {
          displayMessage(instituteMessage, 'Institute registered! Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          displayMessage(instituteMessage, data.message || 'Registration failed', 'error');
        }
      } catch (err) {
        displayMessage(instituteMessage, 'Network error.', 'error');
      }
    });
  }

  // ✅ Login
  if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = signInEmailInput.value;
      const password = signInPasswordInput.value;

      displayMessage(signInMessage, 'Authenticating...', 'info');

      // 🧑‍💼 Admin login (hardcoded)
      if (email === 'sakthivelv202222@gmail.com' && password === 'sakthivel@936') {
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('sessionExpiry', Date.now() + 24 * 60 * 60 * 1000);
        displayMessage(signInMessage, 'Admin login successful!', 'success');
        return setTimeout(() => redirectBasedOnRole('admin'), 1000);
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          displayMessage(signInMessage, 'Login successful!', 'success');

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('sessionExpiry', Date.now() + 24 * 60 * 60 * 1000);

          setTimeout(() => redirectBasedOnRole(data.user.role || 'user'), 1000);
        } else {
          displayMessage(signInMessage, data.message || 'Invalid credentials.', 'error');
        }
      } catch (err) {
        displayMessage(signInMessage, 'Network error.', 'error');
      }
    });
  }

  // ✅ (Optional) OTP Verification — only if used
  if (otpVerificationForm) {
    otpVerificationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = otpUserIdInput.value;
      const otp = otpInput.value;

      displayMessage(otpMessage, 'Verifying OTP...', 'info');

      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, otp }),
        });

        const data = await response.json();

        if (response.ok) {
          displayMessage(otpMessage, 'Account verified successfully! Please login.', 'success');
          setTimeout(() => (window.location.href = 'index.html'), 2000);
        } else {
          displayMessage(otpMessage, data.message || 'Invalid OTP.', 'error');
        }
      } catch (err) {
        displayMessage(otpMessage, 'Network error.', 'error');
      }
    });
  }

  // 🕒 Auto Logout & Session Cleanup after 24 hours
  setTimeout(() => {
    clearSession();
    alert('Session expired. Please log in again.');
    window.location.href = 'index.html';
  }, 24 * 60 * 60 * 1000);
});
