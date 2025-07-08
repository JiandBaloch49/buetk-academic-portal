const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: { // Crucial for filtering results by semester
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  grade: {
    type: String, // Or Number, depending on your grading scale (e.g., "A+", "B", "85")
    required: true
  },
  uploadedBy: { // The faculty member who uploaded the result
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User model with role 'faculty'
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);