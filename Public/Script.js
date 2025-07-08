// =====================
// COMMON FUNCTIONALITY
// =====================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileNav = document.getElementById('mobileNav');
  
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('show');
      document.body.classList.toggle('mobile-nav-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#mobileNav') && 
          !e.target.closest('#mobileNavToggle') &&
          mobileNav.classList.contains('show')) {
        mobileNav.classList.remove('show');
        document.body.classList.remove('mobile-nav-open');
      }
    });
  }
  
  // Dark Mode Toggle
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      
      // Update button icon
      const icon = darkToggle.querySelector('i');
      if (document.body.classList.contains('dark')) {
        icon.classList.replace('fa-moon', 'fa-sun');
      } else {
        icon.classList.replace('fa-sun', 'fa-moon');
      }
    });
    
    // Apply saved preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
      const icon = darkToggle.querySelector('i');
      if (icon) {
        icon.classList.replace('fa-moon', 'fa-sun');
      }
    }
  }
  
  // Auth Links Management
  updateAuthLinks();
  
  // Logout functionality
  initLogout();
  
  // Password visibility toggle for signup page
  setupPasswordToggle('passwordToggle', 'password');
  
  // Password visibility toggle for login page
  setupPasswordToggle('loginPasswordToggle', 'loginPassword');
  
  // Initialize signup page if form exists
  if (document.getElementById('signupForm')) {
    initSignupPage();
  }
  
  // Initialize login page if form exists
  if (document.getElementById('loginForm')) {
    initLoginPage();
  }
});

// Update authentication links
function updateAuthLinks() {
  const authLinks = document.getElementById('authLinks');
  const token = localStorage.getItem('token');
  
  if (!authLinks) return;
  
  if (token) {
    authLinks.innerHTML = `
      <a href="dashboard.html" class="btn">Dashboard</a>
      <a href="#" id="logoutLink" class="btn" style="margin-left: 10px;">Logout</a>
    `;
  } else {
    authLinks.innerHTML = `
      <a href="login.html" class="btn" id="loginLink">Login</a>
      <a href="signup.html" class="btn" id="signupLink" style="margin-left: 10px;">Signup</a>
    `;
  }
}

// Initialize logout functionality
function initLogout() {
  document.addEventListener('click', e => {
    if (e.target && (e.target.id === 'logoutLink' || e.target.id === 'adminLogoutBtn' || e.target.id === 'logoutBtn')) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      updateAuthLinks();
      window.location.href = 'index.html';
    }
  });
}

// Password visibility toggle (common function)
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  
  if (toggle && input) {
    toggle.addEventListener('click', () => {
      const icon = toggle.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  }
}

// =====================
// SIGNUP PAGE FUNCTIONALITY
// =====================
function initSignupPage() {
  const signupForm = document.getElementById('signupForm');
  
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('formMessage');
      msg.textContent = 'Creating your account...';
      msg.style.color = 'var(--primary)';
      
      // Simulate account creation
      setTimeout(() => {
        msg.innerHTML = 'Account created successfully! <i class="fas fa-check-circle"></i>';
        msg.style.color = 'green';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }, 1500);
    });
  }
}
function displayProfile(profile) {
  document.getElementById('studentName').textContent = profile.name;
  document.getElementById('profileName').textContent = profile.name;
  document.getElementById('profileEmail').textContent = profile.email;

  // Safely handle _id
  if (profile._id && typeof profile._id === 'string') {
    document.getElementById('profileId').textContent = profile._id.slice(-6).toUpperCase();
  } else {
    console.warn('Invalid or missing profile._id:', profile._id);
    document.getElementById('profileId').textContent = 'UNKNOWN';
  }

  document.getElementById('profileDept').textContent = profile.department || 'Computer Science';

  document.getElementById('editName').value = profile.name;
  document.getElementById('editEmail').value = profile.email;
  document.getElementById('editDepartment').value = profile.department || 'Computer Science';
}

// =====================
// LOGIN PAGE FUNCTIONALITY
// =====================
function initLoginPage() {
  const emailInput = document.getElementById('loginEmail');
  const loginForm = document.getElementById('loginForm');
  
  // Role indicator based on email
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const email = emailInput.value;
      const roleIndicator = document.getElementById('roleIndicator');
      
      if (email.includes('@admin.buetk.edu.pk')) {
        roleIndicator.textContent = 'Logging in as: Administrator';
        roleIndicator.style.color = '#cc0066';
      } else if (email.includes('@faculty.buetk.edu.pk')) {
        roleIndicator.textContent = 'Logging in as: Faculty Member';
        roleIndicator.style.color = '#009900';
      } else {
        roleIndicator.textContent = 'Logging in as: Student';
        roleIndicator.style.color = '#004080';
      }
    });
  }
  
  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('loginFormMessage');
      msg.textContent = 'Authenticating...';
      msg.style.color = 'var(--primary)';
      
      // Simulate authentication
      setTimeout(() => {
        const email = document.getElementById('loginEmail').value;
        
        if (email.includes('@admin')) {
          msg.innerHTML = 'Redirecting to Admin Dashboard...';
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 1000);
        } else {
          msg.innerHTML = 'Redirecting to Student Dashboard...';
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        }
      }, 1500);
    });
  }
}