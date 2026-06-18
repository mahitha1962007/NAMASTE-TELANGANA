const express = require('express');
const router = express.Router();
const { getSummary, getStatusCount, getCategoryCount, getStaffWorkload, getDeadlines } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/summary', getSummary);
router.get('/status-count', getStatusCount);
router.get('/category-count', getCategoryCount);
router.get('/staff-workload', getStaffWorkload);
router.get('/deadlines', getDeadlines);

module.exports = router;
