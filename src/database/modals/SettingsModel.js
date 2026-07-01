const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../../config/database');

class Settings extends Model {}

Settings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'email_notifications',
    },
    plagiarismAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'plagiarism_alerts',
    },
    similarityThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      field: 'similarity_threshold',
    },
  },
  {
    sequelize,
    modelName: 'Settings',
    tableName: 'settings',
    timestamps: false,
  }
);

module.exports = Settings;
