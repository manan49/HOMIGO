const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
}

module.exports = { authRequired };




