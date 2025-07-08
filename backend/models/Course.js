const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  creditHours: { type: Number, required: true },
  // Changed to ObjectId reference
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true // A course must belong to a specific semester
  },
  department: { type: String },
  // Link course to the faculty who teaches it (can be multiple)
  taughtBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming 'User' model includes faculty
  }]
}, { timestamps: true }); // Added timestamps for consistency

module.exports = mongoose.model('Course', courseSchema);