document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    darkModeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });
  
  // View toggle
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const timetableGrid = document.getElementById('timetableGrid');
  const scheduleList = document.getElementById('scheduleList');
  
  gridViewBtn.addEventListener('click', () => {
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    timetableGrid.style.display = 'block';
    scheduleList.style.display = 'none';
  });
  
  listViewBtn.addEventListener('click', () => {
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    timetableGrid.style.display = 'none';
    scheduleList.style.display = 'block';
  });
  
  // Week navigation
  const prevWeekBtn = document.getElementById('prevWeekBtn');
  const currentWeekBtn = document.getElementById('currentWeekBtn');
  const nextWeekBtn = document.getElementById('nextWeekBtn');
  
  let currentWeek = 0; // 0 = current week
  
  function updateWeekDisplay() {
    const weekText = currentWeek === 0 
      ? "Current Week" 
      : currentWeek > 0 
        ? `Week +${currentWeek}` 
        : `Week ${currentWeek}`;
        
    document.querySelector('.timetable-header h1').textContent = 
      `Your Weekly Timetable (${weekText})`;
  }
  
  prevWeekBtn.addEventListener('click', () => {
    currentWeek--;
    updateWeekDisplay();
    loadTimetable();
  });
  
  nextWeekBtn.addEventListener('click', () => {
    currentWeek++;
    updateWeekDisplay();
    loadTimetable();
  });
  
  currentWeekBtn.addEventListener('click', () => {
    currentWeek = 0;
    updateWeekDisplay();
    loadTimetable();
  });
  
  // Timetable data
  const timetableData = [
    // Monday
    {
      day: "Monday",
      classes: [
        { time: "9:00 AM", course: "CS101", name: "Introduction to Programming", type: "Lecture", location: "Building A, Room 101", duration: 2 },
        { time: "2:00 PM", course: "MATH201", name: "Calculus II", type: "Tutorial", location: "Building C, Room 305", duration: 1 }
      ]
    },
    // Tuesday
    {
      day: "Tuesday",
      classes: [
        { time: "10:00 AM", course: "PHYS101", name: "Physics Fundamentals", type: "Lecture", location: "Building B, Room 201", duration: 2 },
        { time: "1:00 PM", course: "CS101", name: "Introduction to Programming", type: "Lab", location: "Computer Lab 3", duration: 3 }
      ]
    },
    // Wednesday
    {
      day: "Wednesday",
      classes: [
        { time: "11:00 AM", course: "ENG101", name: "English Composition", type: "Lecture", location: "Building D, Room 102", duration: 1.5 },
        { time: "3:00 PM", course: "HIST202", name: "Modern World History", type: "Seminar", location: "Building E, Room 401", duration: 2 }
      ]
    },
    // Thursday
    {
      day: "Thursday",
      classes: [
        { time: "9:30 AM", course: "MATH201", name: "Calculus II", type: "Lecture", location: "Building C, Room 302", duration: 2 },
        { time: "2:30 PM", course: "PHYS101", name: "Physics Fundamentals", type: "Lab", location: "Physics Lab 2", duration: 2 }
      ]
    },
    // Friday
    {
      day: "Friday",
      classes: [
        { time: "10:00 AM", course: "CS202", name: "Data Structures", type: "Lecture", location: "Building A, Room 105", duration: 2 },
        { time: "1:00 PM", course: "ART105", name: "Digital Art Fundamentals", type: "Workshop", location: "Arts Building, Room 10", duration: 3 }
      ]
    }
  ];
  
  // Time slots
  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];
  
  function loadTimetable() {
    const timetableBody = document.getElementById('timetableBody');
    const scheduleList = document.getElementById('scheduleList');
    const scheduleMessage = document.getElementById('scheduleMessage');
    
    // Clear existing content
    timetableBody.innerHTML = '';
    scheduleList.innerHTML = '<div class="list-header"><div>Day & Time</div><div>Course</div><div>Type</div><div>Location</div></div>';
    
    // Show loading message
    scheduleMessage.textContent = "Loading timetable...";
    scheduleMessage.className = "loading-message";
    
    // Simulate loading delay
    setTimeout(() => {
      // Create time slots
      timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        timetableBody.appendChild(timeSlot);
        
        // Add class slots for each day
        for (let i = 0; i < 5; i++) {
          const classSlot = document.createElement('div');
          classSlot.className = 'class-slot';
          classSlot.id = `slot-${time.replace(/\s+/g, '-')}-${i}`;
          timetableBody.appendChild(classSlot);
        }
      });
      
      // Populate timetable
      timetableData.forEach(dayData => {
        dayData.classes.forEach(cls => {
          const timeIndex = timeSlots.indexOf(cls.time);
          if (timeIndex !== -1) {
            const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(dayData.day);
            const slotIndex = timeIndex * 6 + dayIndex + 1; // +1 because first column is time
            
            const classSlot = timetableBody.children[slotIndex];
            const duration = cls.duration;
            
            // Create class card
            const classCard = document.createElement('div');
            classCard.className = `class-card ${cls.type.toLowerCase()}`;
            classCard.innerHTML = `
              <div class="course-code">${cls.course}</div>
              <div class="course-name">${cls.name}</div>
              <div class="class-meta">
                <span>📚 ${cls.type}</span>
                <span>📍 ${cls.location}</span>
                <span>⏱️ ${duration} hour${duration > 1 ? 's' : ''}</span>
              </div>
            `;
            classSlot.appendChild(classCard);
            
            // Add to list view
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
              <div><strong>${dayData.day}</strong><br>${cls.time}</div>
              <div><strong>${cls.course}</strong><br>${cls.name}</div>
              <div>${cls.type}</div>
              <div>${cls.location}</div>
            `;
            scheduleList.appendChild(listItem);
          }
        });
      });
      
      // Update message
      scheduleMessage.textContent = `Timetable loaded for ${currentWeek === 0 ? "current week" : "week " + currentWeek}`;
      scheduleMessage.className = "success-message";
      
    }, 1000); // Simulate network delay
  }
  
  // Initial load
  loadTimetable();
});