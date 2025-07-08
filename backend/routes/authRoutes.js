// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/register', upload.single('avatar'), authController.register);
// router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
