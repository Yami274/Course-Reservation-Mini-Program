const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_openid: { type: DataTypes.STRING(64), allowNull: false },
  template_id: { type: DataTypes.STRING(64), allowNull: false },
  type: { type: DataTypes.STRING(32), defaultValue: '' },
  student_name: { type: DataTypes.STRING(32), defaultValue: '' },
  course_title: { type: DataTypes.STRING(128), defaultValue: '' },
  status: { type: DataTypes.ENUM('success', 'failed', 'pending'), defaultValue: 'success' },
  error_msg: { type: DataTypes.STRING(255), defaultValue: '' }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Message;
