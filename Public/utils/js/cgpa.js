document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return location.href = 'login.html';
  
    try {
      const res = await fetch('/api/student/cgpa', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      document.getElementById('cgpaValue').innerHTML = `
        <div class="cgpa-card">
          <h2>CGPA: ${data.cgpa}</h2>
        </div>`;
    } catch (err) {
      console.error(err);
      document.getElementById('cgpaValue').innerHTML = 'Error loading CGPA.';
    }
  });
  