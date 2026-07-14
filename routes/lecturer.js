const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats, getStudents, getScans, getReports, getProjects, getProjectById,
  getMonthlySubmissions, getPlagiarismDistribution,
  getSimilarityTrends, getNotifications, getMyStudents, getMyStudentsProjects,
} = require('../controllers/lecturerController');
const { markAsRead } = require('../controllers/notificationController');

router.use(authenticate, authorize('lecturer', 'admin'));

router.get('/stats', getStats);
router.get('/students', getStudents);
router.get('/scans', getScans);
router.get('/reports', getReports);
router.get('/my-students', getMyStudents);
router.get('/my-students/projects', getMyStudentsProjects);
router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);
router.get('/charts/monthly-submissions', getMonthlySubmissions);
router.get('/charts/plagiarism-distribution', getPlagiarismDistribution);
router.get('/charts/similarity-trends', getSimilarityTrends);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);

module.exports = router;
