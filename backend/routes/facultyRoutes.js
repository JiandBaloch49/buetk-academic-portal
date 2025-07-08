const express = require('express');
const auth = require('../middleware/auth'); // 🛡 Protect routes
const facultyController = require('../controllers/facultyController');

const router = express.Router();

// 📝 Faculty Signup/Login (Public)
router.post('/signup', facultyController.signupFaculty);
router.post('/login', facultyController.loginFaculty);

// 🔐 Protect all routes below (Faculty only)
router.use(auth, (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied: Faculty only' });
  }
  next();
});

// 📄 Profile
router.get('/profile', facultyController.getFacultyProfile);
router.put('/profile', facultyController.updateFacultyProfile);

// 📚 Semesters
router.get('/semesters', facultyController.getTeachingSemesters);
router.post('/semesters', facultyController.createSemester);
router.delete('/semesters/:id', facultyController.deleteSemester);

// 👨‍🎓 Students in Semester
router.get('/semesters/:id/students', facultyController.getStudentsInSemester);

// 🗂️ Batches
router.get('/batches', facultyController.getBatches);
router.post('/batches', facultyController.createBatch);
router.delete('/batches/:id', facultyController.deleteBatch);

// 📖 Courses
router.get('/courses', facultyController.getFacultyCourses);
router.get('/my-courses', facultyController.getMyCourses);

// 📅 Schedule
router.get('/schedule', facultyController.getFacultySchedule);

// ✅ Assignments
router.post('/assignments', facultyController.createAssignment);

// 📚 Lecture Materials
router.post('/lectures', facultyController.uploadLecture);

// 📊 Results
router.post('/results', facultyController.uploadResult);
router.post('/results/semester', facultyController.uploadResultForSemester);

// 📆 Attendance
router.post('/attendance', facultyController.takeAttendance);
router.post('/attendance/mark', facultyController.markAttendance);

// 📈 Attendance Insights
router.get('/attendance-stats', facultyController.getAttendanceStats);

module.exports = router;
