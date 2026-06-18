const express = require('express');
const router = express.Router();
const { addNote, getNotes } = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateNote } = require('../middleware/validationMiddleware');

router.use(authMiddleware);

router.post('/:id/notes', validateNote, addNote);
router.get('/:id/notes', getNotes);

module.exports = router;
