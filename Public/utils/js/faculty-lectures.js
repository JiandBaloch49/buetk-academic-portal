// Public/faculty-lectures.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'faculty-login.html';

  const headers = { 'Authorization': `Bearer ${token}` };
  // Note: 'Content-Type' is not set for FormData, browser handles it.
  // Add 'Content-Type': 'application/json' for JSON payloads if needed elsewhere.

  const semesterSelect = document.getElementById('semesterSelect');
  const lectureForm = document.getElementById('lectureForm');
  const lectureList = document.getElementById('lectureList');
  const lectureTitle = document.getElementById('lectureTitle');
  const lectureFile = document.getElementById('lectureFile');
  const messageDiv = document.getElementById('lectureMessage'); // Assuming a message display div

    // Helper function to display messages
    function showMessage(message, type = 'info') {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
        } else {
            console.warn('Message display div not found, logging:', message);
        }
    }

  // Load semesters into dropdown
  async function loadSemesters() {
    try {
      // Corrected API path
      const res = await fetch('/api/faculty/batches', { headers });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load semesters');
      }
      const data = await res.json();
      semesterSelect.innerHTML = '<option value="">-- Select Semester --</option>';
      if (data.length === 0) {
          showMessage('No semesters available. Please create one.', 'warning');
      }
      data.forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem._id;
        opt.textContent = sem.name;
        semesterSelect.appendChild(opt);
      });
      // Automatically select the first semester if available and load lectures
      if (data.length > 0) {
          semesterSelect.value = data[0]._id;
          await loadLectures(data[0]._id);
      }
    } catch (err) {
      showMessage(`Error loading semesters: ${err.message}`, 'error');
      console.error('Error loading semesters:', err);
    }
  }

  // Load all lectures uploaded by faculty (filtered by semester)
  async function loadLectures(semesterId) {
    lectureList.innerHTML = '<div class="loader">Loading lectures...</div>';
    if (!semesterId) {
        lectureList.innerHTML = '<p>Please select a semester to view lectures.</p>';
        return;
    }
    try {
      // Corrected API path and added semester filter
      const res = await fetch(`/api/faculty/lectures?semesterId=${semesterId}`, { headers });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load lectures');
      }
      const lectures = await res.json();
      lectureList.innerHTML = '';

      if (!Array.isArray(lectures) || lectures.length === 0) {
        lectureList.innerHTML = '<p>No lectures uploaded for this semester yet.</p>';
        showMessage('No lectures found for the selected semester.', 'info');
        return;
      }

      lectures.forEach(lecture => {
        const lectureCard = document.createElement('div');
        lectureCard.className = 'lecture-card';
        lectureCard.innerHTML = `
          <h3>${lecture.title}</h3>
          <p>Uploaded: ${new Date(lecture.uploadDate).toLocaleDateString()}</p>
          <div class="lecture-actions">
            <a href="${lecture.fileUrl}" target="_blank" class="download-btn">Download</a>
            <button class="delete-btn" data-id="${lecture._id}">Delete</button>
          </div>
        `;
        lectureList.appendChild(lectureCard);
      });
      attachDeleteListeners();
      showMessage('Lectures loaded successfully.', 'success');
    } catch (err) {
      lectureList.innerHTML = '<p class="error-message">Failed to load lectures.</p>';
      showMessage(`Error loading lectures: ${err.message}`, 'error');
      console.error('Error loading lectures:', err);
    }
  }

  // Attach delete button listeners
  function attachDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this lecture?')) return;
        const id = btn.dataset.id;
        showMessage('Deleting lecture...', 'info');
        try {
          // Corrected API path
          const res = await fetch(`/api/faculty/lectures/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Delete failed');
          }
          showMessage('Lecture deleted successfully!', 'success');
          loadLectures(semesterSelect.value); // Reload lectures after deletion
        } catch (err) {
          showMessage(`Error deleting lecture: ${err.message}`, 'error');
          console.error('Error deleting lecture:', err);
        }
      });
    });
  }

  // Handle lecture upload form submission
  lectureForm.addEventListener('submit', async e => {
    e.preventDefault();
    const semId = semesterSelect.value;
    const title = lectureTitle.value.trim();
    const file = lectureFile.files[0];

    if (!semId || !title || !file) {
      showMessage('Please fill in all fields and select a file.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('semesterId', semId);
    formData.append('title', title);
    formData.append('file', file); // 'file' field name should match your multer config

    showMessage('Uploading lecture...', 'info');
    try {
      // Corrected API path
      const res = await fetch('/api/faculty/lectures', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Content-Type handled by FormData
        body: formData
      });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Upload failed');
      }
      showMessage('Lecture uploaded successfully!', 'success');
      lectureForm.reset();
      loadLectures(semId); // Reload lectures for the current semester
    } catch (err) {
      showMessage(`Failed to upload lecture: ${err.message}`, 'error');
      console.error('Error uploading lecture:', err);
    }
  });

  // Logout handler
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'faculty-login.html';
  });

  // Event listener for semester change to load lectures
  semesterSelect.addEventListener('change', () => {
      loadLectures(semesterSelect.value);
  });

  // Init
  loadSemesters();
});