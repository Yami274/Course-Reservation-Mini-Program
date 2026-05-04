const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(32), allowNull: false },
  avatar: { type: DataTypes.STRING(512), defaultValue: '' },
  title: { type: DataTypes.STRING(64), defaultValue: '' },
  intro: { type: DataTypes.TEXT, defaultValue: '' }
}, {
  tableName: 'teachers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Teacher;
