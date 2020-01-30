const Sequelize = require('sequelize');
const db = require('../config/database');
const uuid = require('uuid/v4');


const user = db.define( 'user', {
    id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    email_address: {
        type: Sequelize.STRING
    },
    account_created: {
        type: Sequelize.STRING
    },
    account_updated: {
        type: Sequelize.STRING
    },
},{
    freezeTableName: true,
    timestamps: false
});

module.exports = user;  


