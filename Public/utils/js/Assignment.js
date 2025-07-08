document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const msg = document.getElementById('assignmentsMessage');
    const assignmentsList = document.getElementById('assignmentsList');
  
    if (!token) {
      msg.textContent = 'You are not logged in.';
      return;
    }
  
    msg.textContent = 'Loading your assignments...';
  
    try {
      const res = await fetch('/api/student/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        msg.textContent = errorData.error || 'Failed to load assignments';
        return;
      }
  
      const assignments = await res.json();
      msg.textContent = '';
  
      if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p>No assignments found.</p>';
        return;
      }
  
      assignments.forEach(assignment => {
        const assignmentItem = document.createElement('div');
        assignmentItem.classList.add('assignment-item');
        assignmentItem.innerHTML = `
          <h3>${assignment.title}</h3>
          <p>${assignment.description}</p>
          <p>Due Date: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
        `;
        assignmentsList.appendChild(assignmentItem);
      });
    } catch (error) {
      console.error('Error loading assignments:', error);
      msg.textContent = 'Network error while loading assignments.';
    }
  });
  