const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const postController = require('../controllers/postController');
const multer = require('multer');

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/createPosts',authenticateToken, upload.single('image'), postController.createPost);
router.get('/getPosts', postController.getAllPosts);
router.get('/getp', postController.getPostById);
router.put('/:id',authenticateToken, postController.updatePostById);
router.delete('/:id',authenticateToken, postController.deletePostById);

module.exports = router;
