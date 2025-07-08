const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  course: { // Changed from courseId for consistency, refs Course
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: { // Link to the semester this schedule entry is for
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  faculty: { // Link to the faculty teaching this class
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming 'User' with role 'faculty'
    required: true
  },
  day: { type: String, required: true },
  time: { type: String, required: true }, // e.g., "10:00 AM - 11:30 AM"
  room: { type: String, required: true },
  type: { // Optional: to indicate if it's a regular class, lab, etc.
    type: String,
    enum: ['class', 'lab', 'tutorial'],
    default: 'class'
  }
}, { timestamps: true }); // Added timestamps for better tracking

module.exports = mongoose.model('Schedule', scheduleSchema);