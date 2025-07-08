const mongoose = require('mongoose');

const lectureMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, // Can be description or URL
  fileUrl: { // Explicit field for the uploaded file URL
    type: String,
    required: true
  },
  // Link to the specific course this lecture is for
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // Link to the specific semester this lecture is relevant to
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  uploadedBy: { // The faculty member who uploaded it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User model with role 'faculty'
    required: true
  },
  lectureDate: { // When the lecture was given/uploaded
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('LectureMaterial', lectureMaterialSchema);