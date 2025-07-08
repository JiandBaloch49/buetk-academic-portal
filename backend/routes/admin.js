const express = require('express');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// 🟢 Admin Signup/Login (public)
router.post('/signup', adminController.signupAdmin);
router.post('/login', adminController.loginAdmin);

// 🔐 Protect all routes below
router.use(auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
});

// 🟢 Course Management
router.post('/courses', adminController.createCourse);
router.get('/courses', adminController.listCourses);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// 🟢 Result Upload
router.post('/results', adminController.uploadResult);

// 🟢 Student Management
router.get('/students', adminController.listStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

module.exports = router;
