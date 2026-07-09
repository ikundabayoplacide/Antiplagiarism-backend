const User = require('./UserModel');
const Scan = require('./ScanModel');
const Settings = require('./SettingsModel');
const Document = require('./DocumentModel');
const LecturerStudent = require('./LecturerStudentModel');

// Associations
User.hasMany(Scan, { foreignKey: 'userId', as: 'scans', onDelete: 'CASCADE' });
Scan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Settings, { foreignKey: 'userId', as: 'settings', onDelete: 'CASCADE' });
Settings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Document, { foreignKey: 'userId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(LecturerStudent, { foreignKey: 'lecturerId', as: 'assignedStudents', onDelete: 'CASCADE' });
User.hasMany(LecturerStudent, { foreignKey: 'studentId', as: 'assignedLecturers', onDelete: 'CASCADE' });
LecturerStudent.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
LecturerStudent.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = { User, Scan, Settings, Document, LecturerStudent };
