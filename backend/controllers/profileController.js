const db = require('../config/database');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
SELECT 
  users.username,
  users.email,
  users.avatar,
  users.bio,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'image_url', photos.image_url,
      'caption', photos.caption
    )
  ) AS photos
FROM users
LEFT JOIN photos ON users.id = photos.user_id
WHERE users.id = ?
GROUP BY users.id;

    `, [userId]);
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Profile not found' });
    }
    res.status(200).send(rows[0]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { profile_pic, bio } = req.body;
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM photos WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      await db.query('INSERT INTO user_profiles (user_id, profile_pic, bio) VALUES (?, ?, ?)', [userId, profile_pic, bio]);
    } else {
      await db.query('UPDATE photos SET profile_pic = ?, bio = ? WHERE user_id = ?', [profile_pic, bio, userId]);
    }
    res.status(200).send({ message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
