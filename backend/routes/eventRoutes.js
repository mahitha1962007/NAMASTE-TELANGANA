const express = require('express');
const router = express.Router();
const { getAllEvents, getMyEvents, createEvent, updateEventStatus } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/my', getMyEvents);
router.get('/', roleMiddleware('admin'), getAllEvents);
router.post('/', roleMiddleware('admin'), createEvent);
router.patch('/:id/status', updateEventStatus);

module.exports = router;
