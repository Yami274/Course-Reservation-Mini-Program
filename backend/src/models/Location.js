const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(64), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 6), defaultValue: 0 },
  longitude: { type: DataTypes.DECIMAL(10, 6), defaultValue: 0 },
  contact: { type: DataTypes.STRING(20), defaultValue: '' }
}, {
  tableName: 'locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Location;
