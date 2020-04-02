'use strict';

const Bill = require('../models/bill');
const Sequelize = require('sequelize');
const db = require('../config/database');

const File = require('../models/file');

const logger = require('../config/winston-logger');


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

    const filePromise = File.destroy({
        where: {
            billId: request.params.billId
        }
    });

    const billPromise = Bill.destroy({
        where: {
            owner_id: requestedUser.id,
            id: request.params.billId
        }
    });


    return Promise.all([filePromise, billPromise]);
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

exports.getBillsWithFilesForUser = function (request, response, requestedUser) {

    let query = "SELECT b.*,f.id as fileId, f.file_name, f.url, f.upload_date FROM bill b "
        + "left join file f on f.billId = b.id "
        + "where b.owner_id = \"" + requestedUser.id + "\" ";

    return db.query(query
        , {
            type: Sequelize.QueryTypes.SELECT
        });

}

exports.getOneBillForUser = function (request, response, requestedUser) {

    return Bill.findAll({
        where: {
            id: request.params.billId
        }
    });
}

exports.getBillWithFile = function (request, response, requestedUser) {

    let query = "SELECT b.*,f.id as fileId, f.file_name, f.url, f.upload_date FROM bill b "
        + "left join file f on f.billId = b.id "
        + "where b.id = \"" + request.params.billId + "\" ";

    return db.query(query
        , {
            type: Sequelize.QueryTypes.SELECT
        });

}

let formatBill = (current) => {

    current.attachments = {};

    if (current.file_name && current.file_name != undefined && current.file_name != null) {
        current.attachments.file_name = current.file_name;
    }
    current.file_name = undefined;

    if (current.url && current.url != undefined && current.url != null) {
        current.attachments.url = current.url;
    }
    current.url = undefined;

    if (current.upload_date && current.upload_date != undefined && current.upload_date != null) {
        current.attachments.upload_date = current.upload_date;
    }
    current.upload_date = undefined;

    if (current.fileId && current.fileId != undefined && current.fileId != null) {
        current.attachments.id = current.fileId;
    }
    current.fileId = undefined;

    current.categories = current.categories.split(", ");
}

exports.formatSingleBill = function (current) {

    formatBill(current);
}

exports.formatFileInfoInBill = function (bills) {

    bills.forEach(function (part, index) {
        formatBill(this[index]);
    }, bills);
}

exports.filterDueBills = function (bills, days) {

    var index = bills.length;

    while (index--) {
        
        let dueInDays = getDueDays(bills[index].due_date);

        logger.info("Bill is due on " + bills[index].due_date + " which is in " +
            + dueInDays
            + " days.");

        if ((dueInDays > 0 && dueInDays > days ) || dueInDays < 0 ) {
            bills.splice(index, 1);
        }
    }
}

var getDueDays = function (d1) {
    return (new Date(d1).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
};

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
