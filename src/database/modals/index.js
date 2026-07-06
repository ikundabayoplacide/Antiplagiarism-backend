const User = require('./UserModel');
const Scan = require('./ScanModel');
const Settings = require('./SettingsModel');
const Document = require('./DocumentModel');

// Associations
User.hasMany(Scan, { foreignKey: 'userId', as: 'scans', onDelete: 'CASCADE' });
Scan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Settings, { foreignKey: 'userId', as: 'settings', onDelete: 'CASCADE' });
Settings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Document, { foreignKey: 'userId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Scan, Settings, Document };
