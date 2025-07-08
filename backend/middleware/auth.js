const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔒 Check if Authorization header exists and is formatted correctly
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🔍 Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 Fetch user details from DB (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token: user not found' });
    }

    // ✅ Attach user details to req for downstream controllers
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      semester: user.semester || null,            // For students
      department: user.department || null,        // For faculty/admin
      teachingSemesters: user.teachingSemesters || [] // For faculty
    };

    // 🔥 Add semester filter for controllers that use it
    req.semesterFilter = { semester: user.semester }; 
    if (user.role === 'faculty') {
      req.semesterFilter = {
        semester: { $in: user.teachingSemesters }
      };
    }

    next(); // ➡ Proceed to route/controller
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
