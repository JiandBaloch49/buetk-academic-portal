// Public/faculty-attendance.js

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

  // Set today's date as default
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  document.getElementById('attendanceDate').value = formattedDate;

  // Get DOM elements
  const token = localStorage.getItem('token');
  const semesterSelect = document.getElementById('semesterSelect');
  const courseSelect = document.getElementById('courseSelect');
  const loadStudentsBtn = document.getElementById('loadStudentsBtn');
  const studentListSection = document.getElementById('studentListSection');
  const studentsTableBody = document.getElementById('studentsTableBody');
  const attendanceForm = document.getElementById('attendanceForm');
  const messageDiv = document.getElementById('attendanceMessage'); // Assuming a message display div

  // Redirect if not authenticated
  if (!token) {
      window.location.href = 'faculty-login.html';
      return;
  }

  const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
  };

  let studentsData = []; // To store student data fetched from API

  // Helper function to display messages
  function showMessage(message, type = 'info') {
      if (messageDiv) {
          messageDiv.textContent = message;
          messageDiv.className = `message ${type}`;
      } else {
          console.warn('Message display div not found, logging:', message);
      }
  }

  // Load semesters from backend
  async function loadSemesters() {
      try {
          const res = await fetch('/api/faculty/batches', { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load semesters');
          }
          const data = await res.json();
          semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
          if (data.length === 0) {
              showMessage('No semesters available. Please create one first.', 'warning');
          }
          data.forEach(sem => {
              const opt = document.createElement('option');
              opt.value = sem._id;
              opt.textContent = sem.name;
              semesterSelect.appendChild(opt);
          });
      } catch (err) {
          showMessage(`Error loading semesters: ${err.message}`, 'error');
          console.error('Error loading semesters:', err);
      }
  }

  // Load courses for the selected semester from backend
  async function loadCourses(semesterId) {
      courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
      if (!semesterId) {
          return;
      }
      try {
          // Assuming an endpoint to get faculty's courses filtered by semester
          const res = await fetch(`/api/faculty/my-courses?semesterId=${semesterId}`, { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load courses');
          }
          const data = await res.json();
          if (data.length === 0) {
              showMessage('No courses found for this semester. Assign courses or create new ones.', 'warning');
          }
          data.forEach(course => {
              const opt = document.createElement('option');
              opt.value = course._id;
              opt.textContent = `${course.code} - ${course.name}`;
              courseSelect.appendChild(opt);
          });
      } catch (err) {
          showMessage(`Error loading courses: ${err.message}`, 'error');
          console.error('Error loading courses:', err);
      }
  }

  // Load students based on selected semester and course
  async function loadStudents(semesterId, courseId) {
      studentsTableBody.innerHTML = '<tr><td colspan="3"><div class="loader">Loading students...</div></td></tr>';
      studentsData = []; // Clear previous student data
      if (!semesterId || !courseId) {
          studentsTableBody.innerHTML = '<tr><td colspan="3">Please select a semester and a course.</td></tr>';
          return;
      }

      try {
          // Assuming an endpoint to get students enrolled in a specific course for a semester
          const res = await fetch(`/api/faculty/students?semesterId=${semesterId}&courseId=${courseId}`, { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load students');
          }
          const data = await res.json();
          studentsData = data; // Store fetched student data
          studentsTableBody.innerHTML = ''; // Clear loading message

          if (studentsData.length === 0) {
              studentsTableBody.innerHTML = '<tr><td colspan="3">No students found for this course.</td></tr>';
              showMessage('No students enrolled in this course for the selected semester.', 'warning');
              return;
          }

          studentsData.forEach(student => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${student.rollNo || student.name}</td>
                  <td>${student.name}</td>
                  <td>
                      <input type="checkbox" class="attendance-checkbox" data-student-id="${student._id}" checked>
                  </td>
              `;
              studentsTableBody.appendChild(row);
          });
          studentListSection.style.display = 'block'; // Show the table
          showMessage('Students loaded successfully.', 'success');
      } catch (err) {
          studentsTableBody.innerHTML = '<tr><td colspan="3" class="error-message">Failed to load students.</td></tr>';
          showMessage(`Error loading students: ${err.message}`, 'error');
          console.error('Error loading students:', err);
      }
  }

  // Event listener for semester selection change
  semesterSelect.addEventListener('change', () => {
      const selectedSemesterId = semesterSelect.value;
      loadCourses(selectedSemesterId); // Load courses relevant to the semester
      studentListSection.style.display = 'none'; // Hide student list on semester change
  });

  // Event listener for "Load Students" button
  loadStudentsBtn.addEventListener('click', () => {
      const semester = semesterSelect.value;
      const course = courseSelect.value;

      if (!semester) {
          showMessage('Please select a semester.', 'warning');
          return;
      }
      if (!course) {
          showMessage('Please select a course.', 'warning');
          return;
      }

      loadStudents(semester, course);
  });

  // Handle form submission for attendance
  attendanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const semesterId = semesterSelect.value;
      const courseId = courseSelect.value;
      const date = document.getElementById('attendanceDate').value;

      if (!semesterId || !courseId || !date) {
          showMessage('Please select semester, course, and date.', 'warning');
          return;
      }

      const attendanceRecords = [];
      document.querySelectorAll('.attendance-checkbox').forEach(checkbox => {
          const studentId = checkbox.dataset.studentId;
          const status = checkbox.checked ? 'present' : 'absent';
          attendanceRecords.push({ studentId, status });
      });

      if (attendanceRecords.length === 0) {
          showMessage('No students to record attendance for.', 'warning');
          return;
      }

      showMessage('Recording attendance...', 'info');
      try {
          const res = await fetch('/api/faculty/attendance', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                  semesterId,
                  courseId,
                  date,
                  attendanceRecords
              })
          });

          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to record attendance');
          }

          showMessage('Attendance successfully recorded!', 'success');
          // Optionally, clear table or re-load students if needed
          studentsTableBody.innerHTML = '';
          studentListSection.style.display = 'none';
          semesterSelect.value = ''; // Reset dropdowns
          courseSelect.innerHTML = '<option value="">-- Select Course --</option>'; // Clear courses
          attendanceForm.reset();
      } catch (err) {
          showMessage(`Error recording attendance: ${err.message}`, 'error');
          console.error('Attendance recording error:', err);
      }
  });

  // Initial load
  loadSemesters();
});