const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getSettings, updateSettings, updateProfile, changePassword } = require('../controllers/settingsController');

router.use(authenticate);

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
