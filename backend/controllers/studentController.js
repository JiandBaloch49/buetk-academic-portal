const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Result = require('../models/Result');
const Course = require('../models/Course');
const Schedule = require('../models/Schedule');
const Assignment = require('../models/Assignment');
const LectureMaterial = require('../models/LectureMaterial'); // Correct import name
const Attendance = require('../models/Attendance');
const Semester = require('../models/Semester'); // Import Semester model

// Sign Up
exports.signup = async (req, res) => {
  const { name, email, password, role, semesterId } = req.body; // Changed 'semester' to 'semesterId' for clarity
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Optional: Verify if the provided semesterId exists
    if (semesterId) {
      const existingSemester = await Semester.findById(semesterId);
      if (!existingSemester) {
        return res.status(404).json({ error: 'Provided semester not found.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      semester: semesterId || null // Store semester ID
    });

    res.status(201).json({ message: 'User registered successfully!', userId: user._id });
  } catch (err) {
    console.error('Student Signup Error:', err);
    res.status(400).json({ error: 'Email already in use or registration failed: ' + err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, semester: user.semester }, // Include semester in token
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({ token, role: user.role, userId: user._id, semester: user.semester });
  } catch (err) {
    console.error('Student Login Error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    // Populate enrolled courses and the current semester
    const user = await User.findById(req.user.id)
                           .select('-password')
                           .populate('courses') // Assuming User model has 'courses' array for students
                           .populate('semester') // Populate the current semester details
                           .lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get Student Profile Error:', err);
    res.status(500).json({ error: 'Failed to get profile: ' + err.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Update Student Profile Error:', err);
    res.status(400).json({ error: 'Update failed: ' + err.message });
  }
};

// Register for Course
exports.registerCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const student = await User.findById(req.user.id);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!courseId) return res.status(400).json({ error: 'Course ID is required.' });

    // Ensure the course exists and belongs to the student's current semester (optional but recommended)
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (student.semester && course.semester.toString() !== student.semester.toString()) {
      return res.status(400).json({ error: 'Cannot register for courses outside your current semester.' });
    }

    if (student.courses.includes(courseId)) {
      return res.status(400).json({ error: 'Already registered for this course' });
    }

    student.courses.push(courseId);
    await student.save();

    res.json({ message: 'Course registered successfully' });
  } catch (err) {
    console.error('Register course failed:', err);
    res.status(500).json({ error: 'Failed to register course: ' + err.message });
  }
};

// Drop Course
exports.dropCourse = async (req, res) => {
  const courseId = req.params.id;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Student not found.' });

    // Check if the course is actually in the student's enrolled courses
    if (!user.courses.includes(courseId)) {
        return res.status(400).json({ error: 'Student is not registered for this course.' });
    }

    user.courses.pull(courseId); // Remove the course ID from the array
    await user.save();
    res.json({ message: 'Course dropped successfully' });
  } catch (err) {
    console.error('Drop course failed:', err);
    res.status(400).json({ error: 'Failed to drop course: ' + err.message });
  }
};

// Get Courses (enrolled by the student)
exports.getCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
                              .populate({
                                path: 'courses',
                                populate: {
                                  path: 'semester' // Also populate the semester details for each course
                                }
                              });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ courses: student.courses });
  } catch (err) {
    console.error('Get Student Courses Error:', err);
    res.status(500).json({ error: 'Failed to fetch courses: ' + err.message });
  }
};

// Get Results (for the student's current semester)
// Get Results (for the student's current semester)
exports.getResults = async (req, res) => {
  try {
    // Student's current semester ID is expected in the JWT (req.user.semester)
    if (!req.user.semester) {
      return res.status(400).json({ error: 'Student is not assigned to a semester.' });
    }

    const results = await Result.find({
      student: req.user.id,
      semester: req.user.semester // Filter by the student's current semester
    })
    .populate('course')     // Keep populating course details
    .populate('semester');  // <<< ADD THIS LINE TO POPULATE SEMESTER DETAILS <<<

    res.json(results);
  } catch (err) {
    console.error('Get Results Error:', err);
    res.status(500).json({ error: 'Failed to fetch results: ' + err.message });
  }
};

// Get CGPA (across all results)
exports.getCGPA = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id }).populate('course'); // Populate course to get credit hours
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0
    };

    let totalPoints = 0;
    let totalCredits = 0;

    for (const result of results) {
      if (result.course && gradePoints[result.grade] !== undefined) {
        totalPoints += gradePoints[result.grade] * result.course.creditHours;
        totalCredits += result.course.creditHours;
      }
    }

    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    res.json({ cgpa });
  } catch (err) {
    console.error('CGPA Calculation Error:', err);
    res.status(500).json({ error: 'CGPA calculation failed: ' + err.message });
  }
};

// Get Assignments (for the student's current semester and enrolled courses)
exports.getAssignments = async (req, res) => {
  try {
    if (!req.user.semester) {
      return res.status(400).json({ error: 'Student is not assigned to a semester.' });
    }

    const student = await User.findById(req.user.id).select('courses'); // Get enrolled courses
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const assignments = await Assignment.find({
      semester: req.user.semester,
      course: { $in: student.courses } // Only assignments for enrolled courses
    }).populate('course'); // Populate course details

    res.json(assignments);
  } catch (err) {
    console.error('Get Assignments Error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments: ' + err.message });
  }
};

// Get Lecture Materials (for the student's current semester and enrolled courses)
exports.getLectureMaterials = async (req, res) => {
  try {
    if (!req.user.semester) {
      return res.status(400).json({ error: 'Student is not assigned to a semester.' });
    }

    const student = await User.findById(req.user.id).select('courses'); // Get enrolled courses
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const lectures = await LectureMaterial.find({
      semester: req.user.semester,
      course: { $in: student.courses } // Only lectures for enrolled courses
    }).populate('course'); // Populate course details

    res.json(lectures);
  } catch (err) {
    console.error('Get Lecture Materials Error:', err);
    res.status(500).json({ error: 'Failed to fetch lecture materials: ' + err.message });
  }
};

// View Attendance
exports.viewAttendance = async (req, res) => {
  try {
    const attendances = await Attendance.find({ student: req.user.id })
                                        .populate('course')
                                        .populate('semester'); // Populate semester for context
    const report = {};

    attendances.forEach(att => {
      const courseId = att.course._id.toString(); // Ensure string comparison
      if (!report[courseId]) {
        report[courseId] = { courseName: att.course.name, totalDays: 0, presentDays: 0, attendancePercentage: 0 };
      }
      report[courseId].totalDays += 1;
      if (att.status === 'present') report[courseId].presentDays += 1;
    });

    // Calculate percentage
    Object.values(report).forEach(item => {
        if (item.totalDays > 0) {
            item.attendancePercentage = ((item.presentDays / item.totalDays) * 100).toFixed(2);
        }
    });

    res.json(Object.values(report));
  } catch (err) {
    console.error('View Attendance Error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance: ' + err.message });
  }
};

// Get Schedule (for the student's current semester and enrolled courses)
exports.getSchedule = async (req, res) => {
  try {
    if (!req.user.semester) {
      return res.status(400).json({ error: 'Student is not assigned to a semester.' });
    }

    const student = await User.findById(req.user.id).select('courses');
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Find schedule entries for the student's current semester and enrolled courses
    const schedule = await Schedule.find({
      semester: req.user.semester,
      course: { $in: student.courses }
    })
    .populate('course') // Populate course details
    .populate('faculty'); // Populate faculty details (who teaches it)

    if (!schedule || schedule.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this student for the current semester and enrolled courses.' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    console.error('Get Student Schedule Error:', error);
    res.status(500).json({ message: 'Server error fetching student schedule: ' + error.message });
  }
};