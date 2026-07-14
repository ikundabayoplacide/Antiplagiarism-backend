const path = require('path');
const fs = require('fs');
const { generateReport } = require('../src/reportGenerator');
const { Scan } = require('../src/database/modals/index');

const getStats = async (req, res) => {
  try {
    const scans = await Scan.findAll({ where: { userId: req.user.id } });

    const total = scans.length;
    const flagged = scans.filter((s) => s.status === 'flagged').length;
    const original = scans.filter((s) => s.status === 'original').length;
    const avgSimilarity =
      total > 0 ? Math.round(scans.reduce((sum, s) => sum + parseFloat(s.plagiarismPercent), 0) / total) : 0;

    res.json({ total, original, flagged, reports: total, avgSimilarity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getScans = async (req, res) => {
  try {
    const scans = await Scan.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getScanById = async (req, res) => {
  try {
    const scan = await Scan.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!scan) return res.status(404).json({ message: 'Scan not found' });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createScan = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { originalname, size, mimetype, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    if (!allowed.includes(ext)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Unsupported file type. Allowed: pdf, doc, docx, txt' });
    }

    const buffer = fs.readFileSync(filePath);
    fs.unlinkSync(filePath);

    const fileType = ext.replace('.', '');
    const { docEmbedding, wordCount, plagiarismPercent, originalPercent, status, matchedSections } =
      await generateReport(buffer, fileType);

    const scan = await Scan.create({
      userId: req.user.id,
      fileName: originalname,
      fileSize: size,
      fileType,
      plagiarismPercent,
      originalPercent,
      wordCount,
      status,
      matchedSections,
      embedding: docEmbedding,
    });

    res.status(201).json(scan);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

const deleteScan = async (req, res) => {
  try {
    const deleted = await Scan.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Scan not found' });
    res.json({ message: 'Scan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getScans, getScanById, createScan, deleteScan };
