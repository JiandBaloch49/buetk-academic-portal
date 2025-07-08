// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  studentId: { type: String, unique: true, sparse: true },
  facultyId: { type: String, unique: true, sparse: true },
  department: { type: String },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester'
  },
  batches: [{  // For faculty
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester'
  }],
  // ADD THIS NEW FIELD FOR STUDENT'S REGISTERED COURSES
  courses: [{ // This array will store the ObjectId of courses the student is registered for
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course' // 'Course' must match the model name you used for your Course schema
  }]

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);