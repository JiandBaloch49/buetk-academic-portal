// Public/faculty-upload-assignment.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'faculty-login.html';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const assignmentForm = document.getElementById('assignmentForm');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description'); // Corrected from descInput
  const dueDateInput = document.getElementById('dueDate'); // Corrected from dateInput
  const courseSelect = document.getElementById('courseSelect');
  const messageEl = document.getElementById('formMessage');

  // Load faculty courses
  async function loadCourses() {
    try {
      // Corrected API path
      const res = await fetch('/api/faculty/my-courses', { headers });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load courses');
      }
      const courses = await res.json();
      courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
      if (courses.length === 0) {
          messageEl.textContent = '⚠️ No courses assigned to you. Cannot create assignment.';
          messageEl.style.color = 'red';
          return;
      }
      courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c._id;
        opt.textContent = `${c.code} - ${c.name}`; // Assuming 'name' field for course title
        courseSelect.append(opt);
      });
      messageEl.textContent = ''; // Clear previous messages
    } catch (err) {
      console.error('Error loading courses:', err);
      messageEl.textContent = `⚠️ Failed to load courses: ${err.message}`;
      messageEl.style.color = 'red';
    }
  }

  // Handle submission
  assignmentForm.addEventListener('submit', async e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const dueDate = dueDateInput.value;
    const courseId = courseSelect.value;

    if (!title || !description || !dueDate || !courseId) {
      messageEl.textContent = '⚠️ Please fill all fields.';
      messageEl.style.color = 'red';
      return;
    }

    messageEl.textContent = '⏳ Uploading assignment...';
    messageEl.style.color = 'blue';

    try {
      const payload = { title, description, dueDate, courseId };
      // Corrected API path
      const res = await fetch('/api/faculty/assignments', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      messageEl.textContent = '✅ Assignment created successfully!';
      messageEl.style.color = 'green';
      assignmentForm.reset();
    } catch (err) {
      console.error('Error uploading assignment:', err);
      messageEl.textContent = `❌ ${err.message || 'Failed to create assignment'}`;
      messageEl.style.color = 'red';
    }
  });

  // Logout handler
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'faculty-login.html';
  });

  // Initial load
  loadCourses();
});