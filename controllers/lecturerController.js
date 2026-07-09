const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { User, Scan, LecturerStudent, Document } = require('../src/database/modals/index');

const getStats = async (req, res) => {
  try {
    const studentCount = await User.count({ where: { role: 'student' } });
    const projectCount = await Scan.count();
    const highSimCount = await Scan.count({ where: { plagiarismPercent: { [Op.gte]: 70 } } });

    res.json({
      supervisedStudents: { count: studentCount, trend: '+2 this month' },
      totalProjects: { count: projectCount, trend: '+5 this week' },
      reportsGenerated: { count: projectCount, trend: '+3 this week' },
      highSimilarityProjects: { count: highSimCount, trend: 'Needs attention' },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const assignments = await LecturerStudent.findAll({
      where: { lecturerId: req.user.id },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'fullName', 'email', 'phoneNumber', 'department', 'createdAt'],
        include: [{ model: Scan, as: 'scans', attributes: [] }],
      }],
    });

    res.json(assignments.map((a) => ({
      ...a.student.toJSON(),
      submissionsCount: a.student.scans?.length ?? 0,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const scans = await Scan.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }],
      order: [['created_at', 'DESC']],
    });

    res.json(
      scans.map((s) => ({
        id: s.id,
        title: s.fileName,
        studentName: s.user.fullName,
        studentId: s.user.id,
        dateSubmitted: s.created_at,
        similarityPercent: parseFloat(s.plagiarismPercent),
        wordCount: s.wordCount,
        status:
          s.plagiarismPercent < 30 ? 'Low' : s.plagiarismPercent < 70 ? 'Medium' : 'High',
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const scan = await Scan.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }],
    });

    if (!scan) return res.status(404).json({ message: 'Project not found' });

    const matchedDocs = (scan.matchedSections || []).map((m) => ({
      source: m.source,
      similarity: m.similarity,
      matchedText: m.text,
    }));

    res.json({
      id: scan.id,
      title: scan.fileName,
      studentName: scan.user.fullName,
      studentId: scan.user.id,
      dateSubmitted: scan.created_at,
      similarityPercent: parseFloat(scan.plagiarismPercent),
      wordCount: scan.wordCount,
      matchedSections: scan.matchedSections,
      matchedDocs,
      status: scan.plagiarismPercent < 30 ? 'Low' : scan.plagiarismPercent < 70 ? 'Medium' : 'High',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMonthlySubmissions = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS submissions
      FROM scans
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(result.map((r) => ({ month: r.month, submissions: parseInt(r.submissions) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlagiarismDistribution = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (WHERE plagiarism_percent < 30) AS low,
        COUNT(*) FILTER (WHERE plagiarism_percent >= 30 AND plagiarism_percent < 70) AS medium,
        COUNT(*) FILTER (WHERE plagiarism_percent >= 70) AS high
      FROM scans
    `, { type: sequelize.QueryTypes.SELECT });

    const row = result[0];
    res.json([
      { name: 'Low', value: parseInt(row.low), color: '#22c55e' },
      { name: 'Medium', value: parseInt(row.medium), color: '#f59e0b' },
      { name: 'High', value: parseInt(row.high), color: '#ef4444' },
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSimilarityTrends = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT TO_CHAR(created_at, 'Mon') AS month, ROUND(AVG(plagiarism_percent), 2) AS "avgSimilarity"
      FROM scans
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(result.map((r) => ({ month: r.month, avgSimilarity: parseFloat(r.avgSimilarity) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const scans = await Scan.findAll({
      where: { plagiarismPercent: { [Op.gte]: 30 } },
      include: [{ model: User, as: 'user', attributes: ['fullName'] }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    res.json(
      scans.map((s, i) => ({
        id: s.id,
        title: 'High Similarity Detected',
        message: `${s.user.fullName} submitted a document with ${s.plagiarismPercent}% similarity`,
        time: s.created_at,
        read: i > 2,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyStudentsProjects = async (req, res) => {
  try {
    const assignments = await LecturerStudent.findAll({
      where: { lecturerId: req.user.id },
      attributes: ['studentId'],
    });

    const studentIds = assignments.map((a) => a.studentId);
    if (studentIds.length === 0) return res.json([]);

    const documents = await Document.findAll({
      where: { userId: studentIds },
      attributes: ['id', 'fileName', 'fileSize', 'createdAt', 'userId'],
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    res.json(
      documents.map((d) => ({
        id: d.id,
        title: d.fileName,
        fileSize: d.fileSize,
        studentName: d.user.fullName,
        studentId: d.user.id,
        studentEmail: d.user.email,
        dateSubmitted: d.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const assignments = await LecturerStudent.findAll({
      where: { lecturerId: req.user.id },
      include: [{ model: User, as: 'student', attributes: ['id', 'fullName', 'email', 'phoneNumber'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(assignments.map((a) => a.student));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats, getStudents, getProjects, getProjectById,
  getMonthlySubmissions, getPlagiarismDistribution,
  getSimilarityTrends, getNotifications, getMyStudents, getMyStudentsProjects,
};
