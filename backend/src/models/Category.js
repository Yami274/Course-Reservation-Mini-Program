const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(32), allowNull: false },
  icon: { type: DataTypes.STRING(255), defaultValue: '' },
  sort: { type: DataTypes.INTEGER, defaultValue: 0 },
  parent_id: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Category;
