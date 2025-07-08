document.addEventListener('DOMContentLoaded', async () => {
    // Check user role and redirect if needed
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  
    // Load admin profile
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.name) {
        document.getElementById('adminName').textContent = userData.name;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  
    // Load admin stats
    try {
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        document.getElementById('totalStudents').textContent = statsData.totalStudents;
        document.getElementById('activeCourses').textContent = statsData.activeCourses;
        document.getElementById('facultyCount').textContent = statsData.facultyCount;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  
    // Setup logout listener
    document.getElementById('logoutBtn').addEventListener('click', logout);
  });
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = 'index1.html';
  }