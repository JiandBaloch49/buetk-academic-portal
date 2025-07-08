require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Course = require('./models/Course');

const seedCourses = async () => {
  await connectDB();

  const courses = [
    { name: 'Introduction to AI', code: 'CS101', creditHours: 3 },
    { name: 'Operating Systems', code: 'CS102', creditHours: 3 },
    { name: 'Database Systems', code: 'CS103', creditHours: 3 },
    { name: 'Computer Networks', code: 'CS104', creditHours: 3 }
  ];

  try {
    await Course.deleteMany({});
    await Course.insertMany(courses);
    console.log('✅ Dummy courses seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding courses:', err);
    process.exit(1);
  }
};

seedCourses();
