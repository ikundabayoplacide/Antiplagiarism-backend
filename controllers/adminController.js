const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { User, Scan, Settings, LecturerStudent, Notification } = require('../src/database/modals/index');
const { notify } = require('../src/notificationService');

const getStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const docCount = await Scan.count();

    res.json({
      totalUsers: userCount,
      totalDocuments: docCount,
      totalChecks: docCount,
      totalReports: docCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const scans = await Scan.findAll({
      attributes: ['id', 'fileName', 'fileType', 'fileSize', 'userId', 'createdAt'],
      order: [['created_at', 'DESC']],
    });

    // Fetch user names separately to avoid join issues
    const userIds = [...new Set(scans.map((s) => s.userId))];
    const users = userIds.length
      ? await User.findAll({ where: { id: userIds }, attributes: ['id', 'fullName'] })
      : [];
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.fullName]));

    res.json(
      scans.map((s) => ({
        id: s.id,
        fileName: s.fileName,
        fileType: s.fileType || 'unknown',
        fileSize: s.fileSize || 0,
        uploadedBy: userMap[s.userId] ?? null,
        createdAt: s.createdAt,
      }))
    );
  } catch (err) {
    console.error('getDocuments error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getSimilarity = async (req, res) => {
  try {
    const scans = await Scan.findAll({ order: [['plagiarism_percent', 'DESC']] });

    res.json(
      scans.map((s) => {
        const matched = s.matchedSections || [];
        return {
          id: s.id,
          documentName: s.fileName,
          comparedWith: matched.length > 0 ? matched[0].source : 'No matches found',
          similarityPercent: parseFloat(s.plagiarismPercent),
        };
      })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber, department } = req.body;
    if (!fullName || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role, phoneNumber: phoneNumber || null, department: department || null });

    const nameParts = fullName.split(' ');
    await Settings.create({
      userId: user.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email,
    });

    res.status(201).json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, phoneNumber: user.phoneNumber, department: user.department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { fullName, email, role, phoneNumber, department } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
    }

    await user.update({
      fullName: fullName ?? user.fullName,
      email: email ?? user.email,
      role: role ?? user.role,
      phoneNumber: phoneNumber ?? user.phoneNumber,
      department: department ?? user.department,
    });

    res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, phoneNumber: user.phoneNumber, department: user.department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDocumentsPerMonth = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS value
      FROM scans
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(result.map((r) => ({ month: r.month, value: parseInt(r.value) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlagiarismStats = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT TO_CHAR(created_at, 'Mon') AS name,
             COUNT(*) FILTER (WHERE plagiarism_percent < 30) AS low,
             COUNT(*) FILTER (WHERE plagiarism_percent >= 30 AND plagiarism_percent < 70) AS medium,
             COUNT(*) FILTER (WHERE plagiarism_percent >= 70) AS high
      FROM scans
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(result.map((r) => ({ name: r.name, low: parseInt(r.low), medium: parseInt(r.medium), high: parseInt(r.high) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT TO_CHAR(s.created_at, 'Dy') AS day,
             COUNT(*) FILTER (WHERE u.role = 'student') AS students,
             COUNT(*) FILTER (WHERE u.role = 'lecturer') AS lecturers,
             COUNT(*) FILTER (WHERE u.role = 'admin') AS admins
      FROM scans s
      JOIN users u ON u.id = s.user_id
      WHERE s.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(s.created_at, 'Dy'), DATE_TRUNC('day', s.created_at)
      ORDER BY DATE_TRUNC('day', s.created_at)
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(result.map((r) => ({
      day: r.day,
      students: parseInt(r.students),
      lecturers: parseInt(r.lecturers),
      admins: parseInt(r.admins),
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignStudent = async (req, res) => {
  try {
    const { lecturerId, studentId } = req.body;
    if (!lecturerId || !studentId)
      return res.status(400).json({ message: 'lecturerId and studentId are required' });

    const lecturer = await User.findOne({ where: { id: lecturerId, role: 'lecturer' } });
    if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });

    const student = await User.findOne({ where: { id: studentId, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [assignment, created] = await LecturerStudent.findOrCreate({
      where: { lecturerId, studentId },
      defaults: { lecturerId, studentId },
    });

    if (!created) return res.status(409).json({ message: 'Student already assigned to this lecturer' });

    // Notify lecturer, student, and all admins
    const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
    const adminIds = admins.map((a) => a.id);
    await notify(
      [lecturerId],
      'assignment',
      'New Student Assigned',
      `Student "${student.fullName}" has been assigned to you.`
    );
    await notify(
      [studentId],
      'assignment',
      'Lecturer Assigned',
      `You have been assigned to lecturer "${lecturer.fullName}".`
    );
    if (adminIds.length) {
      await notify(
        adminIds,
        'assignment',
        'Student Assignment',
        `Student "${student.fullName}" was assigned to lecturer "${lecturer.fullName}".`
      );
    }

    res.status(201).json({ id: assignment.id, lecturerId, studentId, createdAt: assignment.createdAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unassignStudent = async (req, res) => {
  try {
    const assignment = await LecturerStudent.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'lecturer', attributes: ['id', 'fullName'] },
        { model: User, as: 'student', attributes: ['id', 'fullName'] },
      ],
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const { lecturerId, studentId } = assignment;
    const lecturerName = assignment.lecturer.fullName;
    const studentName = assignment.student.fullName;

    await assignment.destroy();

    const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
    const adminIds = admins.map((a) => a.id);
    await notify(
      [lecturerId],
      'assignment',
      'Student Unassigned',
      `Student "${studentName}" has been removed from your supervision.`
    );
    await notify(
      [studentId],
      'assignment',
      'Lecturer Unassigned',
      `You have been unassigned from lecturer "${lecturerName}".`
    );
    if (adminIds.length) {
      await notify(
        adminIds,
        'assignment',
        'Student Unassignment',
        `Student "${studentName}" was removed from lecturer "${lecturerName}".`
      );
    }

    res.json({ message: 'Student unassigned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    const assignments = await LecturerStudent.findAll({
      include: [
        { model: User, as: 'lecturer', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentsByLecturer = async (req, res) => {
  try {
    const assignments = await LecturerStudent.findAll({
      where: { lecturerId: req.params.lecturerId },
      include: [{ model: User, as: 'student', attributes: ['id', 'fullName', 'email', 'phoneNumber'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(assignments.map((a) => a.student));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats, getDocuments, getSimilarity, getUsers,
  createUser, updateUser, deleteUser, getDocumentsPerMonth,
  getPlagiarismStats, getUserActivity, getNotifications,
  assignStudent, unassignStudent, getAssignments, getStudentsByLecturer,
};
