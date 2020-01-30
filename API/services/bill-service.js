'use strict';

const bcrypt = require('bcrypt');
const Bill = require('../models/bill');
var emailValidator = require("email-validator");
var auth = require('basic-auth');


/**
 * Saving the new User
 */
exports.save = function (request, response, requestedUser) {

    const promise = Bill.create({
        created_ts: new Date().toString(),
        updated_ts: new Date().toString(),
        owner_id: requestedUser.id,
        vendor: request.body.vendor,
        bill_date: request.body.bill_date,
        due_date: request.body.due_date,
        amount_due: request.body.amount_due,
        categories: request.body.categories.join(", "),
        paymentStatus: request.body.paymentStatus,
    });

    return promise;
};

/**
 * Updating the User based on the id parameter passed
 */
exports.update = function (request, response, requestedUser) {

    const promise = Bill.update({
        vendor: (request.body.vendor !== undefined ? request.body.vendor : this.vendor),
        bill_date: (request.body.bill_date !== undefined ? request.body.bill_date : this.bill_date),
        due_date: (request.body.due_date !== undefined ? request.body.due_date : this.due_date),
        amount_due: (request.body.amount_due !== undefined ? request.body.amount_due : this.amount_due),
        categories: (request.body.categories !== undefined ? request.body.categories.join(", ") : this.categories),
        paymentStatus: (request.body.paymentStatus !== undefined ? request.body.paymentStatus : this.paymentStatus)
    }, {
        where: {
            owner_id: requestedUser.id,
            id: request.params.billId
        }
    });

    return promise;
};



exports.delete = function (request, response, requestedUser) {

    const promise = Bill.destroy({
        where: {
            owner_id: requestedUser.id,
            id: request.params.billId
        }
    });

    return promise;
};


exports.billCreateValidator = function (request, response) {

    if (request.body.vendor === undefined
        || request.body.bill_date === undefined
        || request.body.due_date === undefined
        || request.body.amount_due === undefined
        || request.body.categories === undefined
        || request.body.paymentStatus === undefined
    ) {
        //If any of these not present, reject the request
        return Promise.reject();
    }

    if (
        !parseFloat(Number(request.body.amount_due))
        || parseFloat(Number(request.body.amount_due)) < 0.01
    ) {
        return Promise.reject();
    }

    if (!Array.isArray(request.body.categories) 
        || request.body.categories.length <= 0
        || (new Set(request.body.categories)).size !== request.body.categories.length
        ) {
        return Promise.reject();
    }

    if (request.body.paymentStatus != "paid" &&
        request.body.paymentStatus != "due" &&
        request.body.paymentStatus != "past_due" &&
        request.body.paymentStatus != "no_payment_required"
    ) {
        return Promise.reject();
    }

    return Promise.resolve();
}


exports.billGetValidator = function (request, response) {
    return Promise.resolve();
}

exports.getBillsForUser = function (request, response, requestedUser) {

    return Bill.findAll({
        where: {
            owner_id: requestedUser.id
        }
    });

}

exports.getOneBillsForUser = function (request, response, requestedUser) {

    return Bill.findAll({
        where: {
            id: request.params.billId
        }
    });

}


exports.validateGetOne = function () {

    return Promise.resolve();

}

exports.billUpdateValidator = function (request, response, requestedUser) {

    if (request.body.vendor === undefined
        || request.body.bill_date === undefined
        || request.body.due_date === undefined
        || request.body.amount_due === undefined
        || request.body.categories === undefined
        || request.body.paymentStatus === undefined
    ) {
        //If any of these not present, reject the request
        return Promise.reject();
    }

    if (
        !parseFloat(Number(request.body.amount_due))
        || parseFloat(Number(request.body.amount_due)) < 0.01
    ) {
        return Promise.reject();
    }

    if (!Array.isArray(request.body.categories) 
        || request.body.categories.length <= 0
        || (new Set(request.body.categories)).size !== request.body.categories.length
        ) {
        return Promise.reject();
    }

    if (request.body.paymentStatus != "paid" &&
        request.body.paymentStatus != "due" &&
        request.body.paymentStatus != "past_due" &&
        request.body.paymentStatus != "no_payment_required"
    ) {
        return Promise.reject();
    }

    return this.isMyBill(request, response, requestedUser);

}

exports.isMyBill = function (request, response, requestedUser) {
    return Bill.findAll({
        where: {
            id: request.params.billId
        }
    });
}
