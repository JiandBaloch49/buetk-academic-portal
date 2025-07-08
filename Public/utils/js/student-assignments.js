// utils/js/student-assignments.js

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  if (!token || role !== 'student') {
    window.location.href = 'login.html';
    return;
  }

  const headers = { 'Authorization': `Bearer ${token}` };
  const semesterSelect = document.getElementById('semesterSelect');
  const assignmentList = document.getElementById('assignmentList');
  let allAssignments = []; // store assignments globally for filtering

  // Fetch student assignments and populate semester filter
  async function loadAssignments() {
    assignmentList.innerHTML = '<p class="loading">Loading assignments...</p>';
    try {
      const res = await fetch('/api/student/assignments', { headers });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }

      const assignments = await res.json();
      if (!Array.isArray(assignments)) throw new Error('Invalid data format from server');

      allAssignments = assignments; // cache for filtering
      const semesters = [...new Set(assignments.map(a => a.semester))];
      populateSemesterFilter(semesters);
      renderAssignments(assignments);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      assignmentList.innerHTML = '<p class="error">Failed to load assignments. Please try again later.</p>';
    }
  }

  function populateSemesterFilter(semesters) {
    semesterSelect.innerHTML = '<option value="all">All Semesters</option>' +
      semesters.map(s => `<option value="${s}">${s}</option>`).join('');
    semesterSelect.addEventListener('change', filterAssignments);
  }

  function renderAssignments(assignments) {
    const selectedSemester = semesterSelect.value;
    const filtered = selectedSemester === 'all'
      ? assignments
      : assignments.filter(a => a.semester === selectedSemester);

    if (filtered.length === 0) {
      assignmentList.innerHTML = '<p>No assignments found for this semester.</p>';
      return;
    }

    assignmentList.innerHTML = '';
    filtered.forEach(a => {
      const div = document.createElement('div');
      div.className = 'assignment-item';
      div.innerHTML = `
        <h3>${a.title}</h3>
        <p>Due: ${new Date(a.dueDate).toLocaleDateString()}</p>
        <a href="/student/assignments/${a._id}" class="btn view-btn">View Details</a>
      `;
      assignmentList.append(div);
    });
  }

  function filterAssignments() {
    renderAssignments(allAssignments); // filter cached list instead of refetching
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
  });

  loadAssignments();
});
