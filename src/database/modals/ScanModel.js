const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../../config/database');

class Scan extends Model {}

Scan.init(
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
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'file_type',
    },
    plagiarismPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'plagiarism_percent',
    },
    originalPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'original_percent',
    },
    wordCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'word_count',
    },
    status: {
      type: DataTypes.ENUM('original', 'flagged'),
      allowNull: false,
    },
    matchedSections: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'matched_sections',
    },
    embedding: {
      type: 'vector(384)',
      allowNull: true,
      field: 'embedding',
      get() {
        const val = this.getDataValue('embedding');
        if (!val) return null;
        if (Array.isArray(val)) return val;
        return val.replace(/[\[\]]/g, '').split(',').map(Number);
      },
      set(val) {
        this.setDataValue('embedding', val ? `[${val.join(',')}]` : null);
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Scan',
    tableName: 'scans',
    timestamps: false,
  }
);

module.exports = Scan;
