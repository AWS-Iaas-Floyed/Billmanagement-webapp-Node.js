'use strict';

const bcrypt = require('bcrypt');
const File = require('../models/file');
var emailValidator = require("email-validator");
var auth = require('basic-auth');


var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './serveruploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({
    storage: storage, fileFilter: function (req, file, cb) {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
            return cb(null, true);
        else
            return cb(new Error('Unsupported File Format'), false);
    }
});


exports.fileCreateValidator = function (request, response) {

    if (req.file.contentType == 'image/jpeg' || req.file.contentType == 'image/png' || req.file.contentType == 'image/jpg' || req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/jpg' || req.file.mimetype == 'image/png') {


    return Promise.resolve();    
}

/**
 * Saving the new File
 */
exports.save = function (request, response, file_name, url) {



    const promise = File.create({
        file_name: file_name,
        url: url,
        upload_date: new Date().toISOString().split('T')[0]
    });

    return promise;
};





/**
 * Updating the User based on the id parameter passed
 */
exports.update = function (request, response, requestedUser) {

    const promise = File.update({
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



exports.deleteOne = function (request, response, requestedUser) {

    const promise = File.destroy({
        where: {
            id: request.params.fileId
        }
    });

    return promise;
};




exports.billGetValidator = function (request, response) {
    return Promise.resolve();
}

exports.getBillsForUser = function (request, response, requestedUser) {

    return File.findAll({
        where: {
            owner_id: requestedUser.id
        }
    });

}

exports.getOneFile = function (request, response) {

    return File.findAll({
        where: {
            id: request.params.fileId
        }
    });

}

exports.getFileForBill = function (request, response) {

    return File.findAll({
        where: {
            bill_id: request.params.billId
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
    return File.findAll({
        where: {
            id: request.params.billId
        }
    });
}
