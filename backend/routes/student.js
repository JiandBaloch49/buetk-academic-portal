const express = require('express');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

const router = express.Router();

// 🟢 Auth
router.post('/signup', studentController.signup);
router.post('/login', studentController.login);

// 🔐 Protected Student Routes
router.use(auth);

// 🟢 Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// 🟢 Courses
router.get('/courses', studentController.getCourses);
router.post('/courses/register', studentController.registerCourse);
router.delete('/courses/drop/:id', studentController.dropCourse);

// 🟢 Results
router.get('/results', studentController.getResults);
router.get('/cgpa', studentController.getCGPA);

// 🟢 Schedule
router.get('/schedule', studentController.getSchedule);

// 🟢 Assignments
router.get('/assignments', studentController.getAssignments);

// 🟢 Lectures
router.get('/lectures', studentController.getLectureMaterials);

// 🟢 Attendance
router.get('/attendance', studentController.viewAttendance);

// 🔧 Test route (can remove)
router.get('/', (req, res) => {
  res.send('Student API base path is working ✅');
});

module.exports = router;
