// Public/faculty-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
      window.location.href = 'faculty-login.html';
      return;
  }

  const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
  };

  let selectedSemesterId = null;

  // Helper to show messages
  function showSectionMessage(sectionId, message, type = 'info') {
      const container = document.getElementById(sectionId);
      if (container) {
          container.innerHTML = `<p class="message ${type}">${message}</p>`;
      }
  }


  fetchProfile();
  // fetchCourses(); // If you want to show faculty courses on dashboard
  loadSemesters(); // load semesters and set default for assignments
  fetchSchedule();
  fetchAttendanceStats(); // you can later filter this by semester too

  // ✅ Profile
  async function fetchProfile() {
      try {
          const res = await fetch('/api/faculty/profile', { headers });
          const data = await res.json();
          if (!res.ok) {
              throw new Error(data.error || 'Failed to load profile');
          }
          document.getElementById('facultyName').textContent = data.name;
          document.getElementById('facultyDept').textContent = data.department || '—';
      } catch (err) {
          console.error('Profile error:', err.message);
          showSectionMessage('profileInfo', `Error loading profile: ${err.message}`, 'error');
      }
  }

  // ✅ Teaching Schedule
  async function fetchSchedule() {
      const container = document.getElementById('schedule');
      container.innerHTML = '<div class="loader">Loading schedule...</div>';
      try {
          const res = await fetch('/api/faculty/schedule', { headers });
          const schedule = await res.json();
          if (!Array.isArray(schedule)) {
              throw new Error('Invalid schedule data');
          }

          container.innerHTML = '';
          if (schedule.length === 0) {
              container.innerHTML = '<p>No teaching schedule found.</p>';
              return;
          }

          // Group by day for better display
          const scheduleByDay = schedule.reduce((acc, item) => {
              const day = item.day || 'Unknown Day';
              if (!acc[day]) {
                  acc[day] = [];
              }
              acc[day].push(item);
              return acc;
          }, {});

          for (const day in scheduleByDay) {
              const daySection = document.createElement('div');
              daySection.className = 'schedule-day-section';
              daySection.innerHTML = `<h4>${day}</h4>`;

              scheduleByDay[day].forEach(item => {
                  const div = document.createElement('div');
                  div.className = 'schedule-item';
                  // Corrected: Access course details from populated 'course' object
                  div.innerHTML = `<strong>${item.course ? item.course.code : 'N/A'}</strong> - ${item.course ? item.course.name : 'N/A'}<br>
                                   ${item.time || 'N/A'} @ ${item.room || 'N/A'}`;
                  daySection.appendChild(div);
              });
              container.appendChild(daySection);
          }
      } catch (err) {
          console.error('Schedule error:', err.message);
          showSectionMessage('schedule', `Failed to load schedule: ${err.message}`, 'error');
      }
  }

  // ✅ Semesters for Assignments (copied from faculty-assignment.js, simplified)
  async function loadSemesters() {
      const semesterSelect = document.getElementById('assignmentSemesterSelect'); // New select element for dashboard
      if (!semesterSelect) return; // Exit if element not found

      try {
          const res = await fetch('/api/faculty/batches', { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load semesters');
          }
          const data = await res.json();
          semesterSelect.innerHTML = '';
          if (data.length === 0) {
              semesterSelect.innerHTML = '<option disabled>No semesters found</option>';
              return;
          }
          data.forEach(sem => {
              const opt = document.createElement('option');
              opt.value = sem._id;
              opt.textContent = sem.name;
              semesterSelect.append(opt);
          });
          selectedSemesterId = data[0]._id; // Set default
          semesterSelect.value = selectedSemesterId;
          fetchAssignments(); // Load assignments for default semester
          semesterSelect.addEventListener('change', (e) => {
              selectedSemesterId = e.target.value;
              fetchAssignments();
          });
      } catch (err) {
          console.error('Error loading semesters for assignments:', err);
          showSectionMessage('assignmentList', `Error loading semesters for assignments: ${err.message}`, 'error');
          semesterSelect.innerHTML = '<option disabled>Error loading semesters</option>';
      }
  }

  // ✅ Assignments
  async function fetchAssignments() {
      const container = document.getElementById('assignmentList');
      container.innerHTML = '<div class="loader">Loading assignments...</div>';
      if (!selectedSemesterId) {
          container.innerHTML = '<p>Select a semester to view assignments.</p>';
          return;
      }
      try {
          const res = await fetch(`/api/faculty/assignments?semester=${selectedSemesterId}`, { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load assignments');
          }
          const assignments = await res.json();
          if (!Array.isArray(assignments)) {
              throw new Error('Invalid assignments data');
          }

          container.innerHTML = '';
          if (assignments.length === 0) {
              container.innerHTML = '<p>No assignments found for this semester.</p>';
              return;
          }

          // Display only pending assignments for dashboard summary
          const pendingAssignments = assignments.filter(assign => !assign.completed);

          if (pendingAssignments.length === 0) {
               container.innerHTML = '<p>No pending assignments for this semester.</p>';
               return;
          }

          pendingAssignments.forEach(assignment => {
              const item = document.createElement('div');
              item.classList.add('assignment-item');

              const title = document.createElement('div');
              title.classList.add('assignment-title');
              title.textContent = assignment.title;

              const due = document.createElement('div');
              due.classList.add('assignment-due');
              due.textContent = `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`;

              const status = document.createElement('div');
              status.classList.add('assignment-status', 'status-pending');
              status.textContent = 'Pending'; // Always pending here

              item.appendChild(title);
              item.appendChild(due);
              item.appendChild(status);
              container.appendChild(item);
          });
      } catch (err) {
          console.error('Assignments error:', err);
          showSectionMessage('assignmentList', `Failed to load assignments: ${err.message}`, 'error');
      }
  }

  // ✅ Attendance Stats (New API call)
  async function fetchAttendanceStats() {
      const container = document.getElementById('attendanceStats');
      container.innerHTML = '<div class="loader">Loading attendance stats...</div>';
      try {
          // This endpoint needs to be implemented in facultyController.js
          const res = await fetch('/api/faculty/attendance/stats', { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load attendance stats');
          }
          const stats = await res.json(); // Expected: { totalClasses, conductedClasses, avgAttendance }

          container.innerHTML = `
              <div class="stat-card">
                  <h4>Total Classes:</h4>
                  <p>${stats.totalClasses || 0}</p>
              </div>
              <div class="stat-card">
                  <h4>Classes Conducted:</h4>
                  <p>${stats.conductedClasses || 0}</p>
              </div>
              <div class="stat-card">
                  <h4>Avg. Attendance:</h4>
                  <p>${stats.avgAttendance ? stats.avgAttendance.toFixed(2) : 0}%</p>
              </div>
          `;
      } catch (err) {
          console.error('Attendance stats error:', err);
          showSectionMessage('attendanceStats', `Failed to load attendance stats: ${err.message}`, 'error');
      }
  }


  // ✅ Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = 'faculty-login.html';
  });
});