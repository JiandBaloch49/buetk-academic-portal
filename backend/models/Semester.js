const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // e.g., "Fall 2024", "Spring 2025", "5th Semester BESE"
  },
  academicYear: {
    type: String, // e.g., "2024-2025"
    required: true
  },
  department: {
    type: String // e.g., "Software Engineering", "Computer Science"
  },
  level: {
    type: String, // e.g., "5th Semester", "7th Semester" - this is good, keep it
    required: true
  },
  // We will link faculty to semesters they teach via the User model's 'batches' field.
  // Students will be linked to semesters via their 'semester' field in User model.
  isActive: { // Optional: for administrative purposes
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);