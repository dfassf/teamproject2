'use strict';
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const User=require('./user'); //클래스 관련 녀석들은 초록이로 표현됨
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.User=User;
User.init(sequelize); // user.js 안의 sequelize 안의 init 부분



db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
