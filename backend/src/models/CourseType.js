const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseType = sequelize.define('CourseType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(64), allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 20 },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
}, {
  tableName: 'course_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CourseType;
