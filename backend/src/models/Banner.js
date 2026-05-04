const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  image: { type: DataTypes.STRING(512), allowNull: false },
  title: { type: DataTypes.STRING(255), defaultValue: '' },
  subtitle: { type: DataTypes.STRING(255), defaultValue: '' },
  link_url: { type: DataTypes.STRING(512), defaultValue: '' },
  sort: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
}, {
  tableName: 'banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Banner;
