// Public/faculty-schedule.js

document.addEventListener('DOMContentLoaded', async () => {
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

  // Get DOM elements
  const token = localStorage.getItem('token');
  const semesterSelect = document.getElementById('semesterFilter');
  const weekSelect = document.getElementById('weekFilter');
  const courseFilterSelect = document.getElementById('courseFilter'); // New: for course filtering
  const tableBody = document.getElementById('scheduleTableBody');
  const logoutBtn = document.getElementById('logoutBtn');
  const messageDiv = document.getElementById('scheduleMessage'); // Assuming a message div

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

  // Logout functionality (existing functionality)
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = 'faculty-login.html';
    }
  });

  // Load semesters
  async function loadSemesters() {
    try {
      const res = await fetch('/api/faculty/batches', { headers });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load semesters');
      }
      const data = await res.json();
      semesterSelect.innerHTML = '<option value="">All Semesters</option>'; // Option to view all
      if (data.length === 0) {
          showMessage('No semesters available.', 'warning');
      }
      data.forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem._id;
        opt.textContent = sem.name;
        semesterSelect.appendChild(opt);
      });
      // Optionally select the first semester by default
      if (data.length > 0) {
          semesterSelect.value = data[0]._id;
      }
    } catch (err) {
      showMessage(`Error loading semesters: ${err.message}`, 'error');
      console.error('Error loading semesters:', err);
    }
  }

  // Load courses for filtering (new function)
  async function loadCoursesForFilter() {
      try {
          // Fetch courses taught by the faculty
          const res = await fetch('/api/faculty/my-courses', { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load courses for filter');
          }
          const courses = await res.json();
          courseFilterSelect.innerHTML = '<option value="">All Courses</option>';
          if (courses.length === 0) {
              showMessage('No courses found to filter by.', 'info');
          }
          courses.forEach(course => {
              const opt = document.createElement('option');
              opt.value = course._id;
              opt.textContent = `${course.code} - ${course.name}`;
              courseFilterSelect.appendChild(opt);
          });
      } catch (err) {
          showMessage(`Error loading courses for filter: ${err.message}`, 'error');
          console.error('Error loading courses for filter:', err);
      }
  }

  // Load and render the schedule
  async function loadSchedule() {
    tableBody.innerHTML = '<tr><td colspan="5"><div class="loader">Loading schedule...</div></td></tr>';
    showMessage(''); // Clear previous messages

    const semesterId = semesterSelect.value;
    const week = weekSelect.value;
    const courseId = courseFilterSelect.value; // Get selected course for filter

    let url = `/api/faculty/schedule?week=${week}`;
    if (semesterId) {
        url += `&semesterId=${semesterId}`;
    }
    if (courseId) {
        url += `&courseId=${courseId}`;
    }

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load schedule');
      }
      const schedule = await res.json();
      tableBody.innerHTML = ''; // Clear loading message

      if (!Array.isArray(schedule) || schedule.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No classes scheduled for the selected criteria.</td></tr>';
        showMessage('No schedule entries found.', 'info');
        return;
      }

      schedule.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.day || 'N/A'}</td>
          <td>${item.time || 'N/A'}</td>
          <td>${item.course ? item.course.code : 'N/A'}</td>
          <td>${item.course ? item.course.name : 'N/A'}</td>
          <td>${item.room || 'N/A'}</td>
          <td>
            <button class="edit-btn" data-id="${item._id}">Edit</button>
            <button class="delete-btn" data-id="${item._id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
      attachActionHandlers();
      showMessage('Schedule loaded successfully.', 'success');
    } catch (err) {
      console.error('Error loading schedule:', err);
      tableBody.innerHTML = '<tr><td colspan="5" class="error-message">Error loading schedule. Please try again later.</td></tr>';
      showMessage(`Error loading schedule: ${err.message}`, 'error');
    }
  }

  // Attach action handlers
  function attachActionHandlers() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.location.href = `faculty-add-schedule.html?id=${id}`; // Use same form for edit
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this schedule entry?')) return;

        const id = btn.dataset.id;
        showMessage('Deleting schedule entry...', 'info');
        try {
          const res = await fetch(`/api/faculty/schedule/${id}`, {
            method: 'DELETE',
            headers
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Delete failed');
          }

          showMessage('Schedule entry deleted successfully!', 'success');
          loadSchedule(); // Reload schedule after deletion
        } catch (err) {
          showMessage(`Failed to delete entry: ${err.message}`, 'error');
          console.error('Delete schedule entry error:', err);
        }
      });
    });
  }

  // Add new schedule button
  document.querySelector('.add-schedule-btn').addEventListener('click', () => {
    window.location.href = 'faculty-add-schedule.html';
  });

  // Event listeners for filters
  semesterSelect.addEventListener('change', loadSchedule);
  weekSelect.addEventListener('change', loadSchedule);
  courseFilterSelect.addEventListener('change', loadSchedule); // Listen for course filter change

  // Initial load
  await loadSemesters();
  await loadCoursesForFilter(); // Load courses
  loadSchedule();
});