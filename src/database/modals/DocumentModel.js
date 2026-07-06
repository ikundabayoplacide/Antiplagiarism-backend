const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../../config/database');

class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size',
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: false,
  }
);

module.exports = Document;
