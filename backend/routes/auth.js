const express = require('express');
const adminController = require('../controllers/adminController');
const facultyController = require('../controllers/facultyController');
const studentController = require('../controllers/studentController');

const router = express.Router();

// ✅ Unified Signup Routes
router.post('/signup/student', studentController.signup);
router.post('/signup/faculty', facultyController.signupFaculty);
router.post('/signup/admin', adminController.signupAdmin);

// ✅ Unified Login Routes
router.post('/login/student', studentController.login);
router.post('/login/faculty', facultyController.loginFaculty);
router.post('/login/admin', adminController.loginAdmin);

module.exports = router;
