const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.use(authenticate);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
