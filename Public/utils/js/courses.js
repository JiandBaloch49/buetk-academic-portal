document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return location.href = 'login.html';
  
    try {
      const res = await fetch('/api/student/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      const courses = data.courses;
      const container = document.getElementById('coursesList');
      container.innerHTML = '';
  
      if (courses.length === 0) {
        container.innerHTML = '<p>No courses registered.</p>';
      } else {
        courses.forEach(course => {
          container.innerHTML += `
            <div class="course-card">
              <h3>${course.code} - ${course.name}</h3>
              <p>Credit Hours: ${course.creditHours}</p>
            </div>`;
        });
      }
    } catch (err) {
      console.error(err);
      document.getElementById('coursesList').innerHTML = 'Error loading courses.';
    }
  });
  