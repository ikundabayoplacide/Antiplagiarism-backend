const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats, getDocuments, getSimilarity, getUsers,
  createUser, deleteUser, getDocumentsPerMonth,
  getPlagiarismStats, getUserActivity, getNotifications,
  assignStudent, unassignStudent, getAssignments, getStudentsByLecturer,
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);
router.get('/documents', getDocuments);
router.get('/similarity', getSimilarity);
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.get('/charts/documents-per-month', getDocumentsPerMonth);
router.get('/charts/plagiarism-stats', getPlagiarismStats);
router.get('/charts/user-activity', getUserActivity);
router.get('/notifications', getNotifications);
router.post('/assignments', assignStudent);
router.delete('/assignments/:id', unassignStudent);
router.get('/assignments', getAssignments);
router.get('/assignments/lecturer/:lecturerId', getStudentsByLecturer);

module.exports = router;
