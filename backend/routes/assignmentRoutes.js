const express = require('express');
const router = express.Router();
const {
  createAssignment, getAllAssignments, getMyAssignments,
  getAssignmentById, updateAssignment, updateStatus, deleteAssignment,
} = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateAssignment, validateStatus } = require('../middleware/validationMiddleware');

router.use(authMiddleware);

// Staff route — must be before /:id to avoid route conflicts
router.get('/my', getMyAssignments);

// Admin-only routes
router.post('/', roleMiddleware('admin'), validateAssignment, createAssignment);
router.get('/', roleMiddleware('admin'), getAllAssignments);
router.put('/:id', roleMiddleware('admin'), updateAssignment);
router.delete('/:id', roleMiddleware('admin'), deleteAssignment);

// Both admin and staff
router.get('/:id', getAssignmentById);
router.patch('/:id/status', validateStatus, updateStatus);

module.exports = router;
