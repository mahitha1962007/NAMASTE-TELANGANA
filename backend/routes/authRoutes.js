const express = require('express');
const router = express.Router();
const { login, register, getMe, updateProfile, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateLogin, validateCreateUser } = require('../middleware/validationMiddleware');

router.post('/login', validateLogin, login);
router.post('/register', validateCreateUser, register);
router.get('/me', authMiddleware, getMe);
router.put('/update-profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
