const jwt = require('jsonwebtoken');
const common = require("../config/common")
const JWT_SECRET = common.config()["JWT_SECRET"]

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token is missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Access token expired' });
      }
      return res.status(403).json({ message: 'Invalid access token' });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
};