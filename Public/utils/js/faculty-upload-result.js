// Public/faculty-upload-result.js

document.addEventListener('DOMContentLoaded', () => {
  // API Base URL - Replace with your actual backend URL
  const API_BASE_URL = 'http://localhost:5000'; //  <-- Set your actual backend URL here

  // DOM Elements
  const semesterSelect = document.getElementById('semesterSelect');
  const subjectSelect = document.getElementById('subjectSelect');
  const studentsTableBody = document.getElementById('studentsTableBody'); // Corrected ID from 'studentsTable' to 'studentsTableBody'
  const resultForm = document.getElementById('resultForm');
  const resultHistory = document.getElementById('resultHistory');
  const exportBtn = document.getElementById('exportBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const messageDiv = document.getElementById('uploadResultMessage'); // Assuming a message display div


  // State variables
  let students = [];
  let authToken = null;
  let currentResults = []; // To store results for history display

  // Helper to show messages
    function showMessage(message, type = 'info') {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
        } else {
            console.warn('Message display div not found, logging:', message);
        }
    }


  // Initialize the page
  async function initPage() {
    // Check if user is authenticated
    authToken = localStorage.getItem('token');
    if (!authToken) {
      redirectToLogin();
      return;
    }

    // Load semesters and subjects
    try {
      await loadSemesters();
      // Only load subjects after semesters are loaded, as they might be linked
      // If a semester is pre-selected, load subjects for it
      if (semesterSelect.value) {
          await loadSubjects(semesterSelect.value);
      } else {
          // If no semester initially selected, load all courses for faculty without semester filter
          await loadSubjects();
      }

    } catch (error) {
      showMessage(`Failed to initialize page: ${error.message}`, 'error');
      console.error('Init page error:', error);
    }
  }

  // Load semesters from backend
  async function loadSemesters() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/batches`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load semesters');
      }

      const data = await response.json();
      semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
      if (data.length === 0) {
          showMessage('No semesters available. Create one first.', 'warning');
      }
      data.forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem._id;
        opt.textContent = sem.name;
        semesterSelect.appendChild(opt);
      });
      if (data.length > 0) {
          semesterSelect.value = data[0]._id; // Select first semester by default
      }
    } catch (error) {
      showMessage(`Error loading semesters: ${error.message}`, 'error');
      console.error('Error loading semesters:', error);
      semesterSelect.innerHTML = '<option disabled>Error loading semesters</option>';
    }
  }

  // Load subjects (courses) from backend
  async function loadSubjects(semesterId = '') { // Optional semesterId filter
    try {
      let url = `${API_BASE_URL}/api/faculty/my-courses`;
      if (semesterId) {
          url += `?semesterId=${semesterId}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load subjects');
      }

      const data = await response.json();
      subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
      if (data.length === 0) {
          showMessage('No subjects found for this semester. Assign courses or create new ones.', 'warning');
      }
      data.forEach(subject => {
        const opt = document.createElement('option');
        opt.value = subject._id;
        opt.textContent = `${subject.code} - ${subject.name}`;
        subjectSelect.appendChild(opt);
      });
    } catch (error) {
      showMessage(`Error loading subjects: ${error.message}`, 'error');
      console.error('Error loading subjects:', error);
      subjectSelect.innerHTML = '<option disabled>Error loading subjects</option>';
    }
  }

  // Load students for the selected semester (from backend)
  async function loadStudents(semesterId) {
    studentsTableBody.innerHTML = '<tr><td colspan="3"><div class="loader">Loading students...</div></td></tr>';
    students = []; // Clear previous students
    if (!semesterId) {
        studentsTableBody.innerHTML = '<tr><td colspan="3">Please select a semester.</td></tr>';
        return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/students?semesterId=${semesterId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load students');
      }

      const data = await response.json();
      students = data; // Store student data
      studentsTableBody.innerHTML = ''; // Clear loading

      if (students.length === 0) {
        studentsTableBody.innerHTML = '<tr><td colspan="3">No students found for this semester.</td></tr>';
        showMessage('No students available in the selected semester.', 'info');
        return;
      }

      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.rollNo || student.name}</td>
          <td>${student.name}</td>
          <td><input type="number" step="0.1" min="0" max="100" class="grade-input" data-student-id="${student._id}" placeholder="Enter Grade"></td>
        `;
        studentsTableBody.appendChild(row);
      });
      showMessage('Students loaded successfully.', 'success');
    } catch (error) {
      studentsTableBody.innerHTML = '<tr><td colspan="3" class="error-message">Failed to load students.</td></tr>';
      showMessage(`Error loading students: ${error.message}`, 'error');
      console.error('Error loading students:', error);
    }
  }

  // Load results history (from backend)
  async function loadResults(semesterId, subjectId) {
    resultHistory.innerHTML = '<p class="loader">Loading results history...</p>';
    currentResults = []; // Clear previous results
    if (!semesterId || !subjectId) {
        resultHistory.innerHTML = '<p>Select a semester and subject to view results history.</p>';
        return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/faculty/results?semesterId=${semesterId}&courseId=${subjectId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load results history');
      }

      const data = await response.json();
      currentResults = data; // Store results for export
      resultHistory.innerHTML = '';

      if (currentResults.length === 0) {
        resultHistory.innerHTML = '<p>No results found for this subject and semester.</p>';
        exportBtn.style.display = 'none';
        return;
      }

      // Display results in a table
      const table = document.createElement('table');
      table.className = 'history-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll No</th>
            <th>Grade</th>
            <th>Uploaded On</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      `;
      const tbody = table.querySelector('tbody');
      currentResults.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${result.student ? result.student.name : 'N/A'}</td>
          <td>${result.student ? result.student.rollNo : 'N/A'}</td>
          <td>${result.grade}</td>
          <td>${new Date(result.createdAt).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
      });
      resultHistory.appendChild(table);
      exportBtn.style.display = 'block'; // Show export button
      showMessage('Results history loaded.', 'success');
    } catch (error) {
      resultHistory.innerHTML = '<p class="error-message">Failed to load results history.</p>';
      showMessage(`Error loading results history: ${error.message}`, 'error');
      console.error('Error loading results history:', error);
      exportBtn.style.display = 'none';
    }
  }

  // Handle result submission
  resultForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const semesterId = semesterSelect.value;
    const courseId = subjectSelect.value;

    if (!semesterId || !courseId) {
      showMessage('Please select both semester and subject.', 'warning');
      return;
    }

    const resultsToUpload = [];
    document.querySelectorAll('.grade-input').forEach(input => {
      const studentId = input.dataset.studentId;
      const grade = input.value.trim();
      if (grade !== '') { // Only upload if a grade is entered
        resultsToUpload.push({
          student: studentId, // Backend expects student ObjectId
          course: courseId,   // Backend expects course ObjectId
          semester: semesterId, // Backend expects semester ObjectId
          grade: parseFloat(grade) // Assuming grades are numeric
        });
      }
    });

    if (resultsToUpload.length === 0) {
      showMessage('Please enter grades for at least one student.', 'warning');
      return;
    }

    showMessage('Uploading results...', 'info');
    try {
      // API endpoint for faculty to upload results (batch upload)
      const response = await fetch(`${API_BASE_URL}/api/faculty/upload-results`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultsToUpload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload results');
      }

      showMessage('Results uploaded successfully!', 'success');
      // Clear grade inputs after successful upload
      document.querySelectorAll('.grade-input').forEach(input => input.value = '');
      // Reload results history
      loadResults(semesterId, courseId);
    } catch (error) {
      showMessage(`Error uploading results: ${error.message}`, 'error');
      console.error('Error uploading results:', error);
    }
  });

  // Export to CSV
  exportBtn.addEventListener('click', () => {
    if (currentResults.length === 0) {
      showMessage('No results to export.', 'warning');
      return;
    }

    let csvContent = 'Student Name,Roll No,Grade,Semester,Course Code,Course Name,Uploaded On\n';
    currentResults.forEach(result => {
        const studentName = result.student ? result.student.name : 'N/A';
        const studentRollNo = result.student ? result.student.rollNo : 'N/A';
        const courseCode = result.course ? result.course.code : 'N/A';
        const courseName = result.course ? result.course.name : 'N/A';
        const semesterName = result.semester ? result.semester.name : 'N/A'; // Assuming semester is populated
        const uploadDate = new Date(result.createdAt).toLocaleDateString();

        csvContent += `"${studentName}","${studentRollNo}","${result.grade}","${semesterName}","${courseCode}","${courseName}","${uploadDate}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Dynamic filename based on selected semester and subject
    const selectedSemesterName = semesterSelect.options[semesterSelect.selectedIndex].textContent;
    const selectedSubjectName = subjectSelect.options[subjectSelect.selectedIndex].textContent;
    a.download = `${selectedSemesterName.replace(/[^a-z0-9]/gi, '_')}_${selectedSubjectName.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up
  });

  // Semester selection change
  semesterSelect.addEventListener('change', () => {
    const semesterId = semesterSelect.value;
    loadSubjects(semesterId); // Load subjects for the selected semester
    studentsTableBody.innerHTML = ''; // Clear students when semester changes
    resultHistory.innerHTML = ''; // Clear results history
    exportBtn.style.display = 'none';
  });

  // Subject selection change (after semester and subject are selected, load students and results)
  subjectSelect.addEventListener('change', () => {
    const semesterId = semesterSelect.value;
    const subjectId = subjectSelect.value;
    if (semesterId && subjectId) {
      loadStudents(semesterId); // Load students for the selected semester and subject
      loadResults(semesterId, subjectId); // Load results history
    } else {
      studentsTableBody.innerHTML = '';
      resultHistory.innerHTML = '';
      exportBtn.style.display = 'none';
    }
  });

  // Logout functionality
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    redirectToLogin();
  });

  function redirectToLogin() {
    window.location.href = 'faculty-login.html';
  }

  // Initial page load
  initPage();
});