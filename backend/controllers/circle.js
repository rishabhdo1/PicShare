const db = require('../config/database.js');

// Create a new circle
exports.createCircle = async (req, res) => {
  const { name } = req.body;
  const user_id = req.user.id;

  try {
    const [result] = await db.execute(
      'INSERT INTO circles (name, created_by) VALUES (?, ?)',
      [name, user_id]
    );
    res.status(201).json({ message: 'Circle created', circleId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
};

// Add a member to a circle
exports.addMemberToCircle = async (req, res) => {
  const { circle_id, user_id } = req.body;
  const requester_id = req.user.id;

  try {
    // Verify that the requester owns the circle
    const [rows] = await db.execute(
      'SELECT * FROM circles WHERE id = ? AND created_by = ?',
      [circle_id, requester_id]
    );
    if (rows.length === 0) return res.status(403).json({ error: 'Not authorized' });

    await db.execute(
      'INSERT IGNORE INTO circle_members (circle_id, user_id) VALUES (?, ?)',
      [circle_id, user_id]
    );

    res.json({ message: 'User added to circle' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
};
// GET /circles
exports.getMyCircles = async (req, res) => {
  const userId = req.user.id;
  const [circles] = await db.query('SELECT * FROM circles WHERE created_by = ?', [userId]);
  res.send(circles);
};

// GET /circles/:circleId/members
exports.getMembers = async (req, res) => {
  const { circleId } = req.params;
    const [members] = await db.query(
    'SELECT users.id, users.username FROM circle_members JOIN users ON users.id = circle_members.user_id WHERE circle_members.circle_id = ?',
    [circleId]
  );
  res.send(members);
};