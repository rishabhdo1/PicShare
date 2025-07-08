const AWS = require('aws-sdk');
const db = require('../config/database');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const s3 = new AWS.S3();
const bucketName = 'social-media4';

// Create post
exports.createPost = async (req, res) => {
  const { username,caption, image } = req.body;
  const userId = req.user.id;

  // Upload image to AWS S3
  const params = {
    Bucket:bucketName,
    Key: `posts/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    const s3Data = await s3.upload(params).promise();


    // Save post to database
    const [result] = await db.query('INSERT INTO photos (user_id, caption, image_url) VALUES (?, ?, ?)', [userId,caption, s3Data.Location]);

    console.log('Database result:', result);

    res.status(201).send({ message: 'Post created successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ message: 'Failed to create post' });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT photos.*, users.username ,users.avatar FROM users LEFT JOIN photos ON users.id = photos.user_id');
    res.status(200).send(rows)
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to fetch posts' });
  }
};


// Get post by ID
exports.getPostById = async (req, res) => {
  const user_Id = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM photos WHERE id = ?', [user_Id]);
    if (rows.length === 0) {
      return res.status(404).send({ message: 'Post not found' });
    }
    res.status(200).send(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to fetch post' });
  }
};

// Update post by ID
exports.updatePostById = async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  try {
    await db.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, postId]);
    res.status(200).send({ message: 'Post updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to update post' });
  }
};

// Delete post by ID
exports.deletePostById = async (req, res) => {
  const postId = req.params.id;
  try {
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.status(200).send({ message: 'Post deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to delete post' });
  }
};
