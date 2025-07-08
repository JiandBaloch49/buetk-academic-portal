document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const msg = document.getElementById('formMessage');
      msg.textContent = 'Authenticating...';
      msg.style.color = 'blue';

      let endpoint;

      // ✅ Endpoint selection still fine
      if (email.includes('admin@')) {
        endpoint = 'http://localhost:5000/api/admin/login';
      } else if (email.includes('faculty@')) {
        endpoint = 'http://localhost:5000/api/faculty/login';
      } else {
        endpoint = 'http://localhost:5000/api/student/login';
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);  // ✅ Save actual role from backend

        msg.textContent = 'Login successful! Redirecting...';
        msg.style.color = 'green';

        setTimeout(() => {
          // ✅ Actual role-based redirect using backend response
          switch(data.role) {
            case 'admin':
              window.location.href = 'admin-dashboard.html';
              break;
            case 'faculty':
              window.location.href = 'faculty-dashboard.html';
              break;
            case 'student':
              window.location.href = 'dashboard.html';
              break;
            default:
              msg.textContent = 'Unknown role. Cannot redirect.';
          }
        }, 1000);
      } catch (error) {
        console.error('Login error:', error);
        msg.textContent = error.message || 'Network error. Please try again later.';
        msg.style.color = 'red';
      }
    });
  }
});
