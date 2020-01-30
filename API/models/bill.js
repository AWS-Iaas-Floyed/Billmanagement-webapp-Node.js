const Sequelize = require('sequelize');
const db = require('../config/database');

const bill = db.define( 'bill', {
    id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    created_ts: {
        type: Sequelize.STRING
    },
    updated_ts: {
        type: Sequelize.STRING
    },
    owner_id: {
        type: Sequelize.STRING
    },
    vendor: {
        type: Sequelize.STRING
    },
    bill_date: {
        type: Sequelize.STRING
    },
    due_date: {
        type: Sequelize.STRING
    },
    amount_due: {
        type: Sequelize.INTEGER  
    },
    categories: {
        type: Sequelize.STRING
    },
    paymentStatus: {
        type: Sequelize.STRING
    },
},{
    freezeTableName: true,
    timestamps: false
});

module.exports = bill;  


