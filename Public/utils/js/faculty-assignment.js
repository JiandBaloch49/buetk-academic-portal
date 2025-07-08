// Simulated data for demonstration
        const assignments = [
            {
                id: 1,
                title: "Linear Algebra Problem Set",
                description: "Solve the matrix equations and vector operations problems. Submit as PDF.",
                dueDate: "2023-12-15T23:59:00",
                status: "pending",
                course: "Mathematics 301"
            },
            {
                id: 2,
                title: "Database Design Project",
                description: "Design a relational database schema for a library management system. Include ER diagram and normalization steps.",
                dueDate: "2023-12-10T23:59:00",
                status: "submitted",
                course: "Computer Science 420"
            },
            {
                id: 3,
                title: "European History Essay",
                description: "Write a 2000-word essay on the impact of the Industrial Revolution on European society.",
                dueDate: "2023-12-20T23:59:00",
                status: "pending",
                course: "History 205"
            },
            {
                id: 4,
                title: "Organic Chemistry Lab Report",
                description: "Complete lab report for Experiment 7: Synthesis of Aspirin. Include methodology, results, and analysis.",
                dueDate: "2023-12-05T23:59:00",
                status: "submitted",
                course: "Chemistry 210"
            },
            {
                id: 5,
                title: "Mobile App Prototype",
                description: "Create a high-fidelity prototype for a campus navigation app using Figma. Include at least 5 screens.",
                dueDate: "2023-12-18T23:59:00",
                status: "pending",
                course: "Design 350"
            },
            {
                id: 6,
                title: "Microeconomics Case Study",
                description: "Analyze the market structure of the smartphone industry using concepts from Chapters 8-10.",
                dueDate: "2023-11-30T23:59:00",
                status: "overdue",
                course: "Economics 101"
            }
        ];

        document.addEventListener('DOMContentLoaded', () => {
            const msg = document.getElementById('assignmentsMessage');
            const assignmentsList = document.getElementById('assignmentsList');
            
            // Simulate API call delay
            setTimeout(() => {
                msg.textContent = '';
                
                if (assignments.length === 0) {
                    assignmentsList.innerHTML = `
                        <div class="no-assignments">
                            <i class="fas fa-clipboard-list"></i>
                            <h3>No assignments found</h3>
                            <p>You currently have no assignments. Check back later or contact your instructor.</p>
                        </div>
                    `;
                    return;
                }
                
                assignments.forEach(assignment => {
                    const assignmentItem = document.createElement('div');
                    assignmentItem.classList.add('assignment-item');
                    
                    // Determine status display
                    let statusClass, statusText;
                    if (assignment.status === "pending") {
                        statusClass = "status-pending";
                        statusText = "Pending";
                    } else if (assignment.status === "submitted") {
                        statusClass = "status-submitted";
                        statusText = "Submitted";
                    } else {
                        statusClass = "status-pending";
                        statusText = "Overdue";
                    }
                    
                    assignmentItem.innerHTML = `
                        <h3>${assignment.title}</h3>
                        <p><strong>Course:</strong> ${assignment.course}</p>
                        <p>${assignment.description}</p>
                        <div class="assignment-meta">
                            <div class="due-date">
                                <i class="far fa-clock"></i> Due: ${new Date(assignment.dueDate).toLocaleDateString()} 
                            </div>
                            <div class="assignment-status ${statusClass}">
                                ${statusText}
                            </div>
                        </div>
                    `;
                    assignmentsList.appendChild(assignmentItem);
                });
            }, 1500);
            // Simulated data for demonstration
        const assignments = [
          {
              id: 1,
              title: "Linear Algebra Problem Set",
              description: "Solve the matrix equations and vector operations problems. Submit as PDF.",
              dueDate: "2023-12-15T23:59:00",
              status: "pending",
              course: "Mathematics 301"
          },
          {
              id: 2,
              title: "Database Design Project",
              description: "Design a relational database schema for a library management system. Include ER diagram and normalization steps.",
              dueDate: "2023-12-10T23:59:00",
              status: "submitted",
              course: "Computer Science 420"
          },
          {
              id: 3,
              title: "European History Essay",
              description: "Write a 2000-word essay on the impact of the Industrial Revolution on European society.",
              dueDate: "2023-12-20T23:59:00",
              status: "pending",
              course: "History 205"
          },
          {
              id: 4,
              title: "Organic Chemistry Lab Report",
              description: "Complete lab report for Experiment 7: Synthesis of Aspirin. Include methodology, results, and analysis.",
              dueDate: "2023-12-05T23:59:00",
              status: "submitted",
              course: "Chemistry 210"
          },
          {
              id: 5,
              title: "Mobile App Prototype",
              description: "Create a high-fidelity prototype for a campus navigation app using Figma. Include at least 5 screens.",
              dueDate: "2023-12-18T23:59:00",
              status: "pending",
              course: "Design 350"
          },
          {
              id: 6,
              title: "Microeconomics Case Study",
              description: "Analyze the market structure of the smartphone industry using concepts from Chapters 8-10.",
              dueDate: "2023-11-30T23:59:00",
              status: "overdue",
              course: "Economics 101"
          }
      ];

      document.addEventListener('DOMContentLoaded', () => {
          const msg = document.getElementById('assignmentsMessage');
          const assignmentsList = document.getElementById('assignmentsList');
          
          // Simulate API call delay
          setTimeout(() => {
              msg.textContent = '';
              
              if (assignments.length === 0) {
                  assignmentsList.innerHTML = `
                      <div class="no-assignments">
                          <i class="fas fa-clipboard-list"></i>
                          <h3>No assignments found</h3>
                          <p>You currently have no assignments. Check back later or contact your instructor.</p>
                      </div>
                  `;
                  return;
              }
              
              assignments.forEach(assignment => {
                  const assignmentItem = document.createElement('div');
                  assignmentItem.classList.add('assignment-item');
                  
                  // Determine status display
                  let statusClass, statusText;
                  if (assignment.status === "pending") {
                      statusClass = "status-pending";
                      statusText = "Pending";
                  } else if (assignment.status === "submitted") {
                      statusClass = "status-submitted";
                      statusText = "Submitted";
                  } else {
                      statusClass = "status-pending";
                      statusText = "Overdue";
                  }
                  
                  assignmentItem.innerHTML = `
                      <h3>${assignment.title}</h3>
                      <p><strong>Course:</strong> ${assignment.course}</p>
                      <p>${assignment.description}</p>
                      <div class="assignment-meta">
                          <div class="due-date">
                              <i class="far fa-clock"></i> Due: ${new Date(assignment.dueDate).toLocaleDateString()} 
                          </div>
                          <div class="assignment-status ${statusClass}">
                              ${statusText}
                          </div>
                      </div>
                  `;
                  assignmentsList.appendChild(assignmentItem);
              });
          }, 1500);
      });
        });