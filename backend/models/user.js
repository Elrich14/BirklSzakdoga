const { DataTypes } = require('sequelize');
const {sequelize} = require('../dataBase');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      
    },
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']],
    },
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  twoFactorRecoveryCodes: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
  paranoid: true,
});
// User.init()
module.exports = User;
