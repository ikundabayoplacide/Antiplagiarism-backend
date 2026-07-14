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
router.get('/documents-per-month', getDocumentsPerMonth);
router.get('/plagiarism-stats', getPlagiarismStats);
router.get('/user-activity', getUserActivity);
router.get('/notifications', getNotifications);
router.post('/assign', assignStudent);
router.delete('/unassign/:id', unassignStudent);
router.get('/assignments', getAssignments);
router.get('/assignments/:lecturerId/students', getStudentsByLecturer);

module.exports = router;
