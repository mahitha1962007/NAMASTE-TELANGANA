const express = require('express');
const router = express.Router();
const { getAllAuditLogs, getAuditLogsByAssignment } = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', getAllAuditLogs);
router.get('/:assignmentId', getAuditLogsByAssignment);

module.exports = router;
