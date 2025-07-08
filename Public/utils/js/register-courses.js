// utils/js/register-courses.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'student') {
      window.location.href = 'login.html';
      return;
    }
  
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const availableContainer = document.getElementById('availableCourses');
    const msgEl = document.getElementById('courseMessage');
  
    let registeredIds = new Set();
  
    // Fetch student's registered courses
    async function loadRegistered() {
      try {
        const res = await fetch('/api/student/courses', { headers });
        const courses = await res.json();
        courses.forEach(c => registeredIds.add(c._id));
      } catch (err) {
        console.error('Error loading registered courses:', err);
      }
    }
  
    // Fetch all courses
    async function loadAvailable() {
      availableContainer.innerHTML = '<div class="loader">Loading courses...</div>';
      try {
        const res = await fetch('/api/admin/courses', { headers });
        const courses = await res.json();
        renderCourses(courses);
      } catch (err) {
        console.error('Error loading available courses:', err);
        availableContainer.innerHTML = '<p class="error">Failed to load courses</p>';
      }
    }
  
    // Render courses with register buttons
    function renderCourses(courses) {
      availableContainer.innerHTML = '';
      if (!courses.length) {
        availableContainer.innerHTML = '<p>No courses available.</p>';
        return;
      }
      courses.forEach(c => {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        const isReg = registeredIds.has(c._id);
        card.innerHTML = `
          <div class="card-header">
            <h2><i class="fas fa-book"></i> ${c.code} - ${c.title || c.name}</h2>
          </div>
          <div class="card-body">
            <p>${c.description || ''}</p>
            <button class="btn register-btn" data-id="${c._id}" ${isReg ? 'disabled' : ''}>
              ${isReg ? 'Registered' : 'Register'}
            </button>
          </div>
        `;
        availableContainer.appendChild(card);
      });
      attachButtons();
    }
  
    // Attach event listeners
    function attachButtons() {
      document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          btn.disabled = true;
          msgEl.textContent = 'Registering...';
          try {
            const res = await fetch('/api/student/courses/register', {
              method: 'POST', headers,
              body: JSON.stringify({ courseId: id })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Registration failed');
            }
            registeredIds.add(id);
            btn.textContent = 'Registered';
            msgEl.textContent = 'Course registered successfully';
            msgEl.style.color = 'green';
          } catch (err) {
            console.error('Registration error:', err);
            btn.disabled = false;
            msgEl.textContent = err.message;
            msgEl.style.color = 'red';
          }
        });
      });
    }
  
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = 'login.html';
    });
  
    // Initialize
    await loadRegistered();
    loadAvailable();
  });
  