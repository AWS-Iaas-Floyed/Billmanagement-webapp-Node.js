
const Sequelize = require('sequelize');

module.exports = new Sequelize('userinformation', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

