// utils/js/student-results.js

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
  
    const container = document.getElementById('resultsContainer');
  
    async function loadResults() {
      container.innerHTML = '<div class="loader">Loading your results...</div>';
      try {
        const res = await fetch('/api/student/results', { headers });
        const results = await res.json();
        if (!Array.isArray(results)) throw new Error('Invalid data');
    
        container.innerHTML = '';
        if (results.length === 0) {
          container.innerHTML = '<p>No results available.</p>';
          return;
        }
    
        results.forEach(r => {
          const card = document.createElement('div');
          card.className = 'result-card';
          card.innerHTML = `
            <h3>${r.course.code} - ${r.course.name}</h3>
            <p><strong>Grade:</strong> ${r.grade}</p>
            <p><strong>Semester:</strong> ${r.semester?.name || 'N/A'}</p> `;
          container.appendChild(card);
        });
      } catch (err) {
        console.error('Error loading results:', err);
        container.innerHTML = '<p class="error">Failed to load results</p>';
      }
    }
  
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = 'login.html';
    });
  
    loadResults();
  });
  