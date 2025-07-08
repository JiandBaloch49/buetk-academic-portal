// Public/faculty-courses.js

document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle (existing functionality)
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const icon = darkModeToggle.querySelector('i');
      if (document.body.classList.contains('dark')) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
      } else {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
      }
  });

  // Logout functionality (existing functionality)
  document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = 'faculty-login.html';
      }
  });

  // Add new course button (existing functionality)
  document.querySelector('.add-course-btn').addEventListener('click', () => {
      window.location.href = 'faculty-add-course.html';
  });

  // Get DOM elements
  const token = localStorage.getItem('token');
  const container = document.getElementById('facultyCoursesList');
  const messageDiv = document.getElementById('coursesMessage'); // Assuming a message display div

  // Redirect if not authenticated
  if (!token) {
      window.location.href = 'faculty-login.html';
      return;
  }

  // Set up API headers
  const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
  };

  // Helper function to display messages
  function showMessage(message, type = 'info') {
      if (messageDiv) {
          messageDiv.textContent = message;
          messageDiv.className = `message ${type}`;
      } else {
          console.warn('Message display div not found, logging:', message);
      }
  }

  // Load courses for the faculty
  async function loadCourses() {
      container.innerHTML = '<div class="loader">Loading courses...</div>';
      try {
          // API endpoint to fetch courses taught by the logged-in faculty
          const res = await fetch('/api/faculty/my-courses', { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load courses');
          }
          const courses = await res.json();
          renderCourses(courses);
      } catch (err) {
          container.innerHTML = '<p class="error-message">Failed to load courses.</p>';
          showMessage(`Error loading courses: ${err.message}`, 'error');
          console.error('Error loading courses:', err);
      }
  }

  // Render courses to the UI
  function renderCourses(courses) {
      container.innerHTML = '';
      if (!courses || courses.length === 0) {
          container.innerHTML = '<p>No courses assigned to you yet.</p>';
          showMessage('No courses found. You can add new courses.', 'info');
          return;
      }

      courses.forEach(course => {
          const courseCard = document.createElement('div');
          courseCard.className = 'course-card';
          courseCard.innerHTML = `
              <h3>${course.code} - ${course.name}</h3>
              <p>${course.description || 'No description provided.'}</p>
              <div class="course-details">
                  <span>Semester: ${course.semester || 'N/A'}</span>
                  <span>Credits: ${course.creditHours}</span>
              </div>
              <div class="card-actions">
                  <button class="edit-btn" data-id="${course._id}">Edit</button>
                  <button class="delete-btn" data-id="${course._id}">Delete</button>
              </div>
          `;
          container.appendChild(courseCard);
      });
      attachActionListeners();
      showMessage('Courses loaded successfully.', 'success');
  }

  // Attach event listeners for action buttons
  function attachActionListeners() {
      // Edit button - redirects to an edit page (assuming faculty-edit-course.html)
      document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              const id = btn.dataset.id;
              window.location.href = `faculty-edit-course.html?id=${id}`;
          });
      });

      // Delete button
      document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
              const id = btn.dataset.id;
              if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) {
                  return;
              }
              showMessage('Deleting course...', 'info');
              try {
                  // API endpoint to delete a course
                  const res = await fetch(`/api/faculty/courses/${id}`, {
                      method: 'DELETE',
                      headers
                  });
                  if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.error || 'Failed to delete course');
                  }
                  showMessage('Course deleted successfully!', 'success');
                  loadCourses(); // Reload courses after deletion
              } catch (err) {
                  showMessage(`Error deleting course: ${err.message}`, 'error');
                  console.error('Error deleting course:', err);
              }
          });
      });
  }

  // Initial load of courses
  loadCourses();
});