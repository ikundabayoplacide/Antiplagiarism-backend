const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getStats, getScans, getScanById, createScan, deleteScan } = require('../controllers/studentController');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

router.use(authenticate);

router.get('/stats', getStats);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);
router.get('/scans', getScans);
router.get('/scans/:id', getScanById);
router.post('/scans', upload.single('file'), createScan);
router.delete('/scans/:id', deleteScan);

module.exports = router;
