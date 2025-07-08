// Public/faculty-batches.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const batchList = document.getElementById('batchList');
  const createBtn = document.getElementById('createBatchBtn');
  const batchNameInput = document.getElementById('newBatchName');
  const messageDiv = document.getElementById('batchMessage'); // Assuming a message div

  if (!token) {
      window.location.href = 'faculty-login.html';
      return;
  }

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

  // Load batches
  const loadBatches = async () => {
      batchList.innerHTML = '<p class="loader">Loading batches...</p>';
      try {
          const res = await fetch('/api/faculty/batches', { headers });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to load batches');
          }
          const data = await res.json();

          batchList.innerHTML = '';
          if (data.length === 0) {
              batchList.innerHTML = '<p>No batches created yet.</p>';
              showMessage('No batches available. Create a new batch to get started!', 'info');
              return;
          }

          data.forEach(batch => {
              const div = document.createElement('div');
              div.className = 'batch-card';
              div.innerHTML = `
                  <span class="batch-name">${batch.name}</span>
                  <div class="batch-actions">
                      <button class="delete-btn" data-id="${batch._id}">Delete</button>
                  </div>
              `;
              batchList.appendChild(div);
          });
          showMessage('Batches loaded successfully.', 'success');
      } catch (err) {
          batchList.innerHTML = '<p class="error-message">Error loading batches</p>';
          showMessage(`Error loading batches: ${err.message}`, 'error');
          console.error('Load Batches Error:', err);
      }
  };

  // Create new batch
  createBtn.addEventListener('click', async () => {
      const name = batchNameInput.value.trim();
      if (!name) {
          showMessage('Batch name cannot be empty.', 'warning');
          return;
      }

      createBtn.disabled = true;
      showMessage('Creating batch...', 'info');
      try {
          // Decode token to get department
          const payload = JSON.parse(atob(token.split('.')[1]));
          const department = payload.department; // Assuming 'department' is in the JWT payload

          if (!department) {
              throw new Error('Department information missing in token. Cannot create batch.');
          }

          const res = await fetch('/api/faculty/batches', {
              method: 'POST',
              headers,
              body: JSON.stringify({ name, department })
          });

          const result = await res.json();

          if (res.ok) {
              showMessage('Batch created successfully!', 'success');
              batchNameInput.value = '';
              loadBatches();
          } else {
              throw new Error(result.error || 'Error creating batch.');
          }
      } catch (err) {
          showMessage(`Error creating batch: ${err.message}`, 'error');
          console.error('Create Batch Error:', err);
      } finally {
          createBtn.disabled = false;
      }
  });

  // Delete batch using delegation
  batchList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-btn')) {
          const id = e.target.dataset.id;
          if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) return;
          showMessage('Deleting batch...', 'info');
          try {
              const res = await fetch(`/api/faculty/batches/${id}`, {
                  method: 'DELETE',
                  headers
              });

              const result = await res.json();
              if (res.ok) {
                  showMessage('Batch deleted successfully!', 'success');
                  loadBatches();
              } else {
                  throw new Error(result.error || 'Error deleting batch.');
              }
          } catch (err) {
              showMessage(`Error deleting batch: ${err.message}`, 'error');
              console.error('Delete Batch Error:', err);
          }
      }
  });

  // Logout handler
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = 'faculty-login.html';
  });

  // Initial load
  loadBatches();
});