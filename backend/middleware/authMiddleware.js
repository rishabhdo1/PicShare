// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/database.js');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).send({ message: 'No user found!' });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized!' });
  }
};

module.exports = verifyToken;
