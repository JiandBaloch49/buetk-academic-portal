const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { // Added type to distinguish assignments, quizzes, tests
    type: String,
    enum: ['assignment', 'quiz', 'test'],
    default: 'assignment',
    required: true
  },
  dueDate: { type: Date, required: true },
  // Added course reference
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: { // Good, keep this
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  createdBy: { // Good, keeps track of faculty
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: for attachments to the assignment itself
  // attachmentUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);