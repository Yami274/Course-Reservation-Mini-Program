const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseSchedule = sequelize.define('CourseSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_type_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  max_count: { type: DataTypes.INTEGER, defaultValue: 20 },
  booked_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'cancelled', 'full'), defaultValue: 'active' },
  check_in_code: { type: DataTypes.STRING(64), defaultValue: null },
  checked_in_at: { type: DataTypes.DATE, defaultValue: null }
}, {
  tableName: 'course_schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CourseSchedule;
