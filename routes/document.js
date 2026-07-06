const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadDocument, getDocuments, getDocumentById, updateDocument, deleteDocument } = require('../controllers/documentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(authenticate);

router.post('/', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', upload.single('file'), updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
