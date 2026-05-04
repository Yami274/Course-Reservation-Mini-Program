const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  openid: { type: DataTypes.STRING(64), unique: true, allowNull: false },
  nickname: { type: DataTypes.STRING(64), defaultValue: '' },
  avatar: { type: DataTypes.STRING(512), defaultValue: '' },
  phone: { type: DataTypes.STRING(20), defaultValue: '' },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = User;
