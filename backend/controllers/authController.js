// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database.js');
const AWS = require('aws-sdk');

const JWT_SECRET = process.env.JWT_SECRET;
// AWS config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const bucketName = 'social-media4';

exports.register = async (req, res) => {
  const { name, username, password, email, bio } = req.body;

  try {
    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(400).send({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Upload avatar to S3
    let avatarUrl = null;
    if (req.file) {
      const params = {
        Bucket: bucketName,
        Key: `avatars/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        // ACL: 'public-read',
      };

      const s3Data = await s3.upload(params).promise();
      avatarUrl = s3Data.Location;
    }

    // Insert user into DB
    await db.query(
      'INSERT INTO users (name, username, password, email, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name, username, hashedPassword, email, bio, avatarUrl]
    );

    res.status(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    const user = rows[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid Password' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({ message: 'Login successful', accessToken: token });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
