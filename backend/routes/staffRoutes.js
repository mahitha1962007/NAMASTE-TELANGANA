const express = require('express');
const router = express.Router();
const { getAllStaff, createStaff, updateStaff, deactivateStaff, suggestStaff } = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validationMiddleware');

// All staff routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/suggest', suggestStaff);
router.get('/', getAllStaff);
router.post('/', validateCreateUser, createStaff);
router.put('/:id', validateUpdateUser, updateStaff);
router.patch('/:id/deactivate', deactivateStaff);

module.exports = router;
