const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../../config/database');

class LecturerStudent extends Model {}

LecturerStudent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lecturerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'lecturer_id',
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'student_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'LecturerStudent',
    tableName: 'lecturer_students',
    timestamps: false,
  }
);

module.exports = LecturerStudent;
