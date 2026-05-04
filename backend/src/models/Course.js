const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(128), allowNull: false },
  cover: { type: DataTypes.STRING(512), defaultValue: '' },
  intro: { type: DataTypes.TEXT, defaultValue: '' },
  teacher_ids: { type: DataTypes.JSON, defaultValue: [] },
  location_ids: { type: DataTypes.JSON, defaultValue: [] },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' }
}, {
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Course;
