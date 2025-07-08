const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Semester = require('../models/Semester');
const Batch = require('../models/Batch');
const LectureMaterial = require('../models/LectureMaterial'); // Correct import name
const Schedule = require('../models/Schedule'); // Import Schedule model

// 🔒 Faculty Signup
exports.signupFaculty = async (req, res) => {
  const { name, email, password, department } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'faculty',
      department
      // teachingSemesters will be added when they create/are assigned semesters
    });

    res.status(201).json({ message: 'Faculty account created successfully!', facultyId: faculty._id });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Faculty signup failed: ' + err.message });
  }
};

// 🔑 Faculty Login
exports.loginFaculty = async (req, res) => {
  const { email, password } = req.body;
  try {
    const faculty = await User.findOne({ email, role: 'faculty' });
    if (!faculty) return res.status(404).json({ error: 'Faculty account not found' });

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: faculty._id, role: faculty.role, department: faculty.department },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({
      token,
      userId: faculty._id,
      name: faculty.name,
      email: faculty.email,
      role: faculty.role,
      department: faculty.department
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Faculty login failed: ' + err.message });
  }
};

// 📄 Get Faculty Profile
exports.getFacultyProfile = async (req, res) => {
  try {
    // Populate the 'batches' field to show which semesters/batches the faculty is teaching
    const faculty = await User.findById(req.user.id)
                              .select('-password')
                              .populate('batches'); // Assuming 'batches' array on User model for faculty
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    console.error('Get Faculty Profile Error:', err);
    res.status(500).json({ error: 'Failed to fetch faculty profile' });
  }
};

// ✏️ Update Faculty Profile
exports.updateFacultyProfile = async (req, res) => {
  try {
    const { name, email, department } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, department },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'Profile updated', faculty: updated });
  } catch (err) {
    console.error('Update Faculty Profile Error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// 🗓 Create Semester
exports.createSemester = async (req, res) => {
  try {
    const { name, department, level, academicYear, batchId } = req.body; // Added academicYear and batchId

    // Validate if batchId is provided and exists if being linked
    if (batchId) {
      const existingBatch = await Batch.findById(batchId);
      if (!existingBatch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
    }

    const semester = await Semester.create({
      name,
      department,
      level,
      academicYear, // Store academic year
      createdBy: req.user.id, // Link semester to the faculty who created it
      batch: batchId || null // Link to batch if provided
    });

    // Add this semester to the faculty's teaching batches/semesters
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { batches: semester._id } }, // Use 'batches' field for faculty's teaching assignments
      { new: true }
    );

    res.status(201).json({ message: 'Semester created', semester });
  } catch (err) {
    console.error('Create Semester Error:', err);
    res.status(500).json({ error: 'Failed to create semester: ' + err.message });
  }
};

// ❌ Delete Semester
exports.deleteSemester = async (req, res) => {
  try {
    // Find and delete the semester. Ensure only the creator or an admin can delete if needed.
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) {
      return res.status(404).json({ error: 'Semester not found' });
    }

    // Remove this semester from any faculty's 'batches' array
    await User.updateMany(
      { batches: req.params.id },
      { $pull: { batches: req.params.id } }
    );

    // Optionally, handle related data (assignments, lectures, results, attendance, schedules)
    // You might want to delete them or reassign them. For simplicity, we're not cascading deletes here.
    // await Assignment.deleteMany({ semester: req.params.id });
    // await LectureMaterial.deleteMany({ semester: req.params.id });
    // await Result.deleteMany({ semester: req.params.id });
    // await Attendance.deleteMany({ semester: req.params.id });
    // await Schedule.deleteMany({ semester: req.params.id });


    res.json({ message: 'Semester deleted successfully' });
  } catch (err) {
    console.error('Delete Semester Error:', err);
    res.status(500).json({ error: 'Failed to delete semester: ' + err.message });
  }
};

// 📚 Get Teaching Semesters
exports.getTeachingSemesters = async (req, res) => {
  try {
    // Find the faculty user to get their assigned batches/semesters
    const faculty = await User.findById(req.user.id).select('batches');
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Find all semesters whose IDs are in the faculty's 'batches' array
    const semesters = await Semester.find({ _id: { $in: faculty.batches } });
    res.json(semesters);
  } catch (err) {
    console.error('Get Teaching Semesters Error:', err);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
};

// 👩‍🎓 Get Students in Semester
exports.getStudentsInSemester = async (req, res) => {
  try {
    const { semesterId } = req.query; // Changed from params to query based on frontend usage

    // Optional: Verify faculty is authorized to view students in this semester
    const faculty = await User.findById(req.user.id).select('batches');
    if (!faculty || !faculty.batches.map(b => b.toString()).includes(semesterId)) { // Convert to string for comparison
        return res.status(403).json({ error: 'Unauthorized to view students in this semester.' });
    }

    const students = await User.find({
      semester: semesterId, // Students have a single 'semester' field
      role: 'student'
    }).select('-password'); // Exclude password from results

    res.json(students);
  } catch (err) {
    console.error('Get Students In Semester Error:', err);
    res.status(500).json({ error: 'Failed to fetch students in semester: ' + err.message });
  }
};

// 👩‍🎓 Get Students in Course and Semester (New endpoint for faculty-attendance.js)
exports.getStudentsInCourseAndSemester = async (req, res) => {
  try {
    const { semesterId, courseId } = req.query;

    if (!semesterId || !courseId) {
      return res.status(400).json({ error: 'Semester ID and Course ID are required.' });
    }

    // Verify faculty is authorized to view students in this course/semester
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to view students for this course.' });
    }

    const students = await User.find({
      role: 'student',
      courses: courseId, // Assuming student model has a 'courses' array of IDs
      semester: semesterId // Assuming student model has a 'semester' ID
    }).select('-password name rollNo'); // Select relevant student fields

    res.json(students);
  } catch (err) {
    console.error('Get Students In Course And Semester Error:', err);
    res.status(500).json({ error: 'Failed to fetch students for the specified course and semester: ' + err.message });
  }
};


// 📝 Create Assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId, semesterId, type } = req.body; // Added courseId and type

    // Basic validation
    if (!title || !dueDate || !courseId || !semesterId) {
      return res.status(400).json({ error: 'Missing required assignment fields: title, dueDate, courseId, semesterId' });
    }

    // Optional: Verify faculty is authorized for this course and semester
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
        return res.status(403).json({ error: 'Unauthorized to create assignments for this course.' });
    }
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return res.status(404).json({ error: 'Semester not found.' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      type, // Assign type
      course: courseId, // Link to Course
      semester: semesterId, // Link to Semester
      createdBy: req.user.id
    });

    await assignment.save();

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (err) {
    console.error('Create Assignment Error:', err);
    res.status(500).json({ error: 'Failed to create assignment: ' + err.message });
  }
};

// 📝 Upload Lecture
exports.uploadLecture = async (req, res) => {
  try {
    const { courseId, semesterId, title, content, fileUrl, lectureDate } = req.body; // Added semesterId, fileUrl, lectureDate

    // Basic validation
    if (!title || !fileUrl || !courseId || !semesterId) {
      return res.status(400).json({ error: 'Missing required lecture material fields: title, fileUrl, courseId, semesterId' });
    }

    // Optional: Verify faculty is authorized for this course and semester
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
        return res.status(403).json({ error: 'Unauthorized to upload lectures for this course.' });
    }
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return res.status(404).json({ error: 'Semester not found.' });
    }

    const lectureMaterial = new LectureMaterial({
      title,
      content,
      fileUrl,
      course: courseId,
      semester: semesterId,
      uploadedBy: req.user.id,
      lectureDate: lectureDate || Date.now() // Use provided date or current date
    });

    await lectureMaterial.save();
    res.status(201).json({ message: 'Lecture material uploaded successfully', lectureMaterial });
  } catch (err) {
    console.error('Upload Lecture Error:', err);
    res.status(500).json({ error: 'Failed to upload lecture material: ' + err.message });
  }
};

// ❌ Delete Lecture (New endpoint for faculty-lectures.js)
exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await LectureMaterial.findOneAndDelete({
      _id: req.params.id,
      uploadedBy: req.user.id // Ensure only the uploader can delete
    });

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found or unauthorized' });
    }

    res.json({ message: 'Lecture deleted successfully' });
  } catch (err) {
    console.error('Delete Lecture Error:', err);
    res.status(500).json({ error: 'Failed to delete lecture: ' + err.message });
  }
};

// 📚 Get Faculty Lectures (Modified for faculty-lectures.js to filter by semesterId)
exports.getFacultyLectures = async (req, res) => {
  try {
    const { semesterId } = req.query;
    const query = { uploadedBy: req.user.id };

    if (semesterId) {
      query.semester = semesterId;
    }

    const lectures = await LectureMaterial.find(query).populate('course').populate('semester');
    res.json(lectures);
  } catch (err) {
    console.error('Get Faculty Lectures Error:', err);
    res.status(500).json({ error: 'Failed to fetch faculty lectures: ' + err.message });
  }
};


// 📈 Attendance Insights - Assuming 'faculty' field in Attendance model
exports.getAttendanceStats = async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      { $match: { recordedBy: req.user.id } }, // Use recordedBy field on Attendance model
      {
        $group: {
          _id: "$course",
          total: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
        }
      },
      {
        $lookup: { // Join with Course to get course name
          from: 'courses', // Collection name in MongoDB (usually lowercase, plural)
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$courseDetails' // Deconstruct the array
      },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          courseName: "$courseDetails.name",
          totalDays: "$total",
          presentDays: "$presentCount",
          attendanceRate: { $round: [{ $multiply: [{ $divide: ["$presentCount", "$total"] }, 100] }, 2] } // Percentage
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Get Attendance Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance stats: ' + err.message });
  }
};

// 📚 Get Faculty Courses
exports.getFacultyCourses = async (req, res) => {
  try {
    const { semesterId } = req.query;
    const query = { taughtBy: req.user.id };

    if (semesterId) {
      query.semester = semesterId;
    }

    // Find courses where the faculty's ID is in the 'taughtBy' array
    const courses = await Course.find(query).populate('semester');
    res.json(courses);
  } catch (err) {
    console.error('Get Faculty Courses Error:', err);
    res.status(500).json({ error: 'Failed to fetch faculty courses: ' + err.message });
  }
};

// Get My Courses (Alias for Get Faculty Courses)
exports.getMyCourses = exports.getFacultyCourses;

// ✏️ Update Course by Faculty (New endpoint for faculty-courses.js)
exports.updateCourseByFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the course and ensure the logged-in faculty is assigned to teach it
    const course = await Course.findOneAndUpdate(
      { _id: id, taughtBy: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found or unauthorized to update.' });
    }

    res.json({ message: 'Course updated successfully', course });
  } catch (err) {
    console.error('Update Course Error:', err);
    res.status(500).json({ error: 'Failed to update course: ' + err.message });
  }
};

// ❌ Delete Course by Faculty (New endpoint for faculty-courses.js)
exports.deleteCourseByFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the course and ensure the logged-in faculty is assigned to teach it
    const course = await Course.findOneAndDelete({
      _id: id,
      taughtBy: req.user.id
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found or unauthorized to delete.' });
    }

    // Optionally, handle related data (assignments, results, attendance, schedules) linked to this course
    // await Assignment.deleteMany({ course: id });
    // await Result.deleteMany({ course: id });
    // await Attendance.deleteMany({ course: id });
    // await Schedule.deleteMany({ course: id });

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete Course Error:', err);
    res.status(500).json({ error: 'Failed to delete course: ' + err.message });
  }
};


// 📝 Upload Result for Single Student
exports.uploadResult = async (req, res) => {
  try {
    const { studentId, courseId, grade, semesterId } = req.body; // Added semesterId

    // Basic validation
    if (!studentId || !courseId || !grade || !semesterId) {
      return res.status(400).json({ error: 'Missing required result fields: studentId, courseId, grade, semesterId' });
    }

    // Optional: Verify faculty is authorized to upload results for this course/semester
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
        return res.status(403).json({ error: 'Unauthorized to upload results for this course.' });
    }
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return res.status(404).json({ error: 'Semester not found.' });
    }

    const result = new Result({
      student: studentId,
      course: courseId,
      grade,
      semester: semesterId, // Link to the specific semester
      uploadedBy: req.user.id
    });

    await result.save();
    res.status(201).json({ message: 'Result uploaded successfully', result });
  } catch (err) {
    console.error('Upload Result Error:', err);
    res.status(500).json({ error: 'Failed to upload result: ' + err.message });
  }
};

// 📝 Upload Result for Entire Semester (Array of results)
exports.uploadResultForSemester = async (req, res) => {
  try {
    const { semesterId, results } = req.body; // results is an array of { studentId, courseId, grade }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'Results array is empty or invalid.' });
    }
    if (!semesterId) {
      return res.status(400).json({ error: 'Semester ID is required.' });
    }

    const savedResults = await Promise.all(
      results.map(async (r) => {
        // Optional: Verify faculty is authorized for each course if needed, or assume authorization for semesterId is enough
        const course = await Course.findById(r.courseId);
        if (!course || !course.taughtBy.includes(req.user.id)) {
            console.warn(`Faculty ${req.user.id} not authorized for course ${r.courseId}. Skipping result.`);
            return null; // Skip if unauthorized, or return an error for this specific result
        }

        return await Result.create({
          student: r.studentId,
          course: r.courseId,
          grade: r.grade,
          semester: semesterId, // Link to the specific semester
          uploadedBy: req.user.id
        });
      })
    );

    // Filter out any nulls from skipped unauthorized results
    const filteredSavedResults = savedResults.filter(Boolean);

    res.status(201).json({ message: 'Results uploaded for semester', savedResults: filteredSavedResults });
  } catch (err) {
    console.error('Upload Result for Semester Error:', err);
    res.status(500).json({ error: 'Failed to upload results for semester: ' + err.message });
  }
};

// 📊 Get Results by Course and Semester (New endpoint for faculty-upload-result.js)
exports.getResultsByCourseAndSemester = async (req, res) => {
  try {
    const { semesterId, courseId } = req.query;

    if (!semesterId || !courseId) {
      return res.status(400).json({ error: 'Semester ID and Course ID are required.' });
    }

    // Verify faculty is authorized for this course
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to view results for this course.' });
    }

    const results = await Result.find({
      semester: semesterId,
      course: courseId
    })
    .populate('student', 'name rollNo') // Populate student name and roll number
    .populate('course', 'name code') // Populate course name and code
    .populate('semester', 'name'); // Populate semester name

    res.json(results);
  } catch (err) {
    console.error('Get Results By Course And Semester Error:', err);
    res.status(500).json({ error: 'Failed to fetch results: ' + err.message });
  }
};


// 📆 Mark Attendance (Single student or multiple students for a specific course and date)
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, semesterId, date, studentId, status, presentStudents } = req.body;

    // Ensure semesterId is provided
    if (!semesterId) {
      return res.status(400).json({ error: 'Semester ID is required for attendance records.' });
    }

    // Optional: Verify faculty is authorized for this course and semester
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
        return res.status(403).json({ error: 'Unauthorized to mark attendance for this course.' });
    }
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return res.status(404).json({ error: 'Semester not found.' });
    }

    let attendanceRecords = [];

    if (studentId && status) { // Single student attendance
      attendanceRecords.push({
        student: studentId,
        course: courseId,
        date,
        status,
        semester: semesterId,
        recordedBy: req.user.id // Faculty who recorded it
      });
    } else if (Array.isArray(presentStudents) && presentStudents.length > 0) { // Multiple students present
      attendanceRecords = presentStudents.map(sId => ({
        student: sId,
        course: courseId,
        date,
        status: 'present', // All listed are present
        semester: semesterId,
        recordedBy: req.user.id
      }));
    } else {
      return res.status(400).json({ error: 'Invalid attendance data. Provide studentId and status, or an array of presentStudents.' });
    }

    await Attendance.insertMany(attendanceRecords);
    res.status(201).json({ message: 'Attendance marked successfully', records: attendanceRecords.length });
  } catch (err) {
    console.error('Mark Attendance Error:', err);
    res.status(500).json({ error: 'Failed to mark attendance: ' + err.message });
  }
};

// Alias for markAttendance, based on your routes
exports.takeAttendance = exports.markAttendance;


// ✅ Create Batch
exports.createBatch = async (req, res) => {
  try {
    const { name, department } = req.body; // Department can be explicitly passed or derived from faculty
    // If department is not provided, use faculty's department from JWT
    const batchDepartment = department || req.user.department;

    if (!name || !batchDepartment) {
      return res.status(400).json({ error: 'Batch name and department are required' });
    }

    // Check if batch already exists in the department
    const existingBatch = await Batch.findOne({ name, department: batchDepartment });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch with this name already exists in this department' });
    }

    const batch = await Batch.create({
      name,
      department: batchDepartment,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (err) {
    console.error('Create Batch Error:', err);
    res.status(500).json({ error: 'Failed to create batch: ' + err.message });
  }
};

// ✅ Delete Batch
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id // Ensure only creator faculty can delete
    });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or unauthorized' });
    }

    // Optional: You might want to prevent deleting a batch if semesters are still linked to it.
    const linkedSemesters = await Semester.find({ batch: req.params.id });
    if (linkedSemesters.length > 0) {
      // You can either return an error or delete cascade.
      // For now, let's return an error to prevent accidental data loss.
      return res.status(400).json({ error: 'Cannot delete batch: Semesters are still linked to it. Please delete linked semesters first.' });
    }


    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    console.error('Delete Batch Error:', err);
    res.status(500).json({ error: 'Failed to delete batch: ' + err.message });
  }
};

// ✅ Get Batches
exports.getBatches = async (req, res) => {
  try {
    // Faculty can get batches within their department, or all batches if admin
    const query = req.user.role === 'admin' ? {} : { department: req.user.department };
    const batches = await Batch.find(query);
    res.json(batches);
  } catch (err) {
    console.error('Get Batches Error:', err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

// ✅ Get Faculty Schedule (Modified for faculty-schedule.js to filter by week, semesterId, courseId)
exports.getFacultySchedule = async (req, res) => {
  try {
    const { week, semesterId, courseId } = req.query;
    const query = { faculty: req.user.id };

    if (week) {
      // Assuming 'week' parameter is a number representing the week of the year
      // This would require date range calculations on the 'date' field of Schedule model
      // For simplicity, this example does not fully implement week filtering
      // You might need a more sophisticated date library or aggregate pipeline for this.
      console.warn("Week filtering for schedule is not fully implemented in this example.");
    }

    if (semesterId) {
      query.semester = semesterId;
    }

    if (courseId) {
      query.course = courseId;
    }

    // Find all schedule entries where this faculty is assigned
    const schedule = await Schedule.find(query)
                                   .populate('course') // Populate course details
                                   .populate('semester'); // Populate semester details
    if (!schedule || schedule.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this faculty with the given filters' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    console.error('Get Faculty Schedule Error:', error);
    res.status(500).json({ message: 'Server error fetching faculty schedule: ' + error.message });
  }
};

// ❌ Delete Schedule Entry (New endpoint for faculty-schedule.js)
exports.deleteScheduleEntry = async (req, res) => {
  try {
    const scheduleEntry = await Schedule.findOneAndDelete({
      _id: req.params.id,
      faculty: req.user.id // Ensure only the assigned faculty can delete
    });

    if (!scheduleEntry) {
      return res.status(404).json({ error: 'Schedule entry not found or unauthorized' });
    }

    res.json({ message: 'Schedule entry deleted successfully' });
  } catch (err) {
    console.error('Delete Schedule Entry Error:', err);
    res.status(500).json({ error: 'Failed to delete schedule entry: ' + err.message });
  }
};

// ➕ Create Schedule Entry (New endpoint for faculty-add-schedule.html)
exports.createScheduleEntry = async (req, res) => {
  try {
    const { courseId, semesterId, day, time, room } = req.body;

    if (!courseId || !semesterId || !day || !time || !room) {
      return res.status(400).json({ error: 'Missing required schedule fields.' });
    }

    // Verify faculty is authorized to teach this course and in this semester
    const course = await Course.findById(courseId);
    if (!course || !course.taughtBy.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized to create schedule for this course.' });
    }
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ error: 'Semester not found.' });
    }

    const scheduleEntry = await Schedule.create({
      faculty: req.user.id,
      course: courseId,
      semester: semesterId,
      day,
      time,
      room
    });

    res.status(201).json({ message: 'Schedule entry created successfully', scheduleEntry });
  } catch (err) {
    console.error('Create Schedule Entry Error:', err);
    res.status(500).json({ error: 'Failed to create schedule entry: ' + err.message });
  }
};

// 🔄 Update Schedule Entry (New endpoint for faculty-edit-schedule.html)
exports.updateScheduleEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find and update the schedule entry, ensuring the faculty is authorized
    const scheduleEntry = await Schedule.findOneAndUpdate(
      { _id: id, faculty: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!scheduleEntry) {
      return res.status(404).json({ error: 'Schedule entry not found or unauthorized to update.' });
    }

    res.json({ message: 'Schedule entry updated successfully', scheduleEntry });
  } catch (err) {
    console.error('Update Schedule Entry Error:', err);
    res.status(500).json({ error: 'Failed to update schedule entry: ' + err.message });
  }
};