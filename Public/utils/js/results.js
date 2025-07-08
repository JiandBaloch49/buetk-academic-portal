document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const container = document.getElementById('resultsList');
  container.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading your results...</p>
  `;

  try {
    const res = await fetch('/api/student/results', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
    }

    const results = await res.json();
    container.innerHTML = '';

    if (!results || results.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <img src="images/no-data.svg" alt="No results">
          <p>No results found for this semester.</p>
        </div>`;
      return;
    }

    // Create results table
    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Name</th>
          <th>Grade</th> // Removed 'Marks' column as it's not in the model
          <th>Semester</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    results.forEach(result => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${result.course?.code || 'N/A'}</td>
        <td>${result.course?.name || 'Course not found'}</td>
        <td class="grade-${(result.grade || 'na').toLowerCase()}">${result.grade || '--'}</td>
        <td>${result.semester?.name || 'N/A'}</td> `;
      tbody.appendChild(row);
    });

    container.appendChild(table);

    // Add semester filter if multiple semesters exist
    // Changed to result.semester?.name for filtering
    const semesters = [...new Set(results.map(r => r.semester?.name).filter(Boolean))];
    if (semesters.length > 1) {
      const filterDiv = document.createElement('div');
      filterDiv.className = 'semester-filter';
      filterDiv.innerHTML = `
        <label for="semesterSelect">Filter by semester:</label>
        <select id="semesterSelect">
          <option value="all">All Semesters</option>
          ${semesters.map(sem => `<option value="${sem}">${sem}</option>`).join('')}
        </select>
      `;
      container.prepend(filterDiv);

      document.getElementById('semesterSelect').addEventListener('change', (e) => {
        const selectedSemester = e.target.value;
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
          const rowSemester = row.cells[3].textContent; // Adjusted index due to removed 'Marks' column
          row.style.display = (selectedSemester === 'all' || rowSemester === selectedSemester)
            ? ''
            : 'none';
        });
      });
    }

  } catch (err) {
    console.error('Results loading error:', err);
    container.innerHTML = `
      <div class="error-message">
        <i class="error-icon">⚠️</i>
        <h3>Error Loading Results</h3>
        <p>${err.message || 'Please try again later.'}</p>
        <button onclick="location.reload()">Retry</button>
      </div>`;
  }
   // Dark mode toggle
   document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    const icon = this.querySelector('i');
    if (document.body.classList.contains('dark')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });

  // Semester selection
  const semesterButtons = document.querySelectorAll('.semester-btn');
  semesterButtons.forEach(button => {
    button.addEventListener('click', function() {
      semesterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // In a real app, this would load the selected semester's results
      document.querySelector('.page-header h1').textContent = `Your Academic Results - ${this.textContent}`;
    });
  });

  // Simulate loading
  document.addEventListener('DOMContentLoaded', function() {
    // In a real app, you would fetch results from an API
    setTimeout(() => {
      document.querySelector('#resultsList p').style.display = 'none';
    }, 1500);
  });
});