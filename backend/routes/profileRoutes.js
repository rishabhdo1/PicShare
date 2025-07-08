const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

router.get('/pro', verifyToken, profileController.getProfile);
router.put('/', verifyToken, profileController.updateProfile);

module.exports = router;
