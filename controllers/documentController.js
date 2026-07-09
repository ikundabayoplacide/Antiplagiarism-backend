const { Document, User } = require('../src/database/modals/index');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ field: 'file', message: 'No file uploaded' });

    const { originalname, size, buffer } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx', 'txt'].includes(ext))
      return res.status(400).json({ field: 'file', message: 'Unsupported file type. Allowed: pdf, doc, docx, txt' });

    const base64Content = buffer.toString('base64');

    const document = await Document.create({
      userId: req.user.id,
      fileName: originalname,
      fileSize: size,
      content: base64Content,
    });

    res.status(201).json({
      id: document.id,
      fileName: document.fileName,
      fileSize: document.fileSize,
      createdAt: document.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const isPrivileged = ['lecturer', 'admin'].includes(req.user.role);
    const where = isPrivileged ? {} : { userId: req.user.id };
    const documents = await Document.findAll({
      where,
      attributes: ['id', 'fileName', 'fileSize', 'createdAt', 'userId'],
      include: [{ model: User, as: 'user', attributes: ['fullName'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const isPrivileged = ['lecturer', 'admin'].includes(req.user.role);
    const where = isPrivileged ? { id: req.params.id } : { id: req.params.id, userId: req.user.id };
    const document = await Document.findOne({ where });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (req.file) {
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx', 'txt'].includes(ext))
        return res.status(400).json({ field: 'file', message: 'Unsupported file type. Allowed: pdf, doc, docx, txt' });
      document.content = req.file.buffer.toString('base64');
      document.fileSize = req.file.size;
      if (!req.body.fileName) document.fileName = req.file.originalname;
    }

    if (req.body.fileName) document.fileName = req.body.fileName;

    await document.save();
    res.json({ id: document.id, fileName: document.fileName, fileSize: document.fileSize, createdAt: document.createdAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteDocument = async (req, res) => {
  try {
    const deleted = await Document.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadDocument, getDocuments, getDocumentById, updateDocument, deleteDocument };
