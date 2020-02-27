
const Sequelize = require('sequelize');

let seq;

console.log("Current environment: " + process.env.APPLICATION_ENV);

if (process.env.APPLICATION_ENV === 'prod') {
    seq = new Sequelize('', process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
        host: process.env.RDS_HOSTNAME,
        dialect: 'mysql'
    });
} else {
    seq = new Sequelize('', 'root', 'password', {
        host: 'localhost',
        dialect: 'mysql'
    });
}

module.exports = seq;