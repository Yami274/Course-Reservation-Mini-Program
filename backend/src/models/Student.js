const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(32), allowNull: false },
  age: { type: DataTypes.INTEGER, defaultValue: 0 },
  phone: { type: DataTypes.STRING(20), defaultValue: '' },
  notes: { type: DataTypes.STRING(255), defaultValue: '' }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Student;
