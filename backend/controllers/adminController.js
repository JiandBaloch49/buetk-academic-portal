const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const Result = require('../models/Result');
const User = require('../models/User');

exports.signupAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ name, email, password: hashedPassword, role: 'admin' });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, role: admin.role, userId: admin._id, name: admin.name, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const existing = await Course.findOne({ code: req.body.code });
    if (existing) return res.status(400).json({ error: 'Course already exists' });

    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create course' });
  }
};

exports.listCourses = async (_req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch {
    res.status(400).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch {
    res.status(400).json({ error: 'Failed to delete course' });
  }
};

exports.uploadResult = async (req, res) => {
  try {
    const exists = await Result.findOne({
      student: req.body.student,
      course: req.body.course,
      semester: req.body.semester
    });
    if (exists) return res.status(409).json({ error: 'Result already exists for this course and semester' });

    const result = new Result(req.body);
    await result.save();
    res.status(201).json({ message: 'Result uploaded', result });
  } catch {
    res.status(500).json({ error: 'Failed to upload result' });
  }
};

exports.listStudents = async (_req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch {
    res.status(400).json({ error: 'Failed to update student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch {
    res.status(400).json({ error: 'Failed to delete student' });
  }
};
