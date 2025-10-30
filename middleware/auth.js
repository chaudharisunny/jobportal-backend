require("dotenv").config();
const jwt = require('jsonwebtoken');
function Auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   console.log(decoded)

    // Check for userId instead of id
    if (!decoded.userId) return res.status(401).json({ message: 'Token does not contain user ID' });

    // Assign user info in req.user
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { Auth };
