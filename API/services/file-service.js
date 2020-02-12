'use strict';

const bcrypt = require('bcrypt');
const File = require('../models/file');
var emailValidator = require("email-validator");
var auth = require('basic-auth');
const multer = require('multer');


var formidable = require('formidable');

var fs = require('fs');

let upload;

exports.getFileName = function(request, response){

    let form = new formidable.IncomingForm();

    form.parse(request, function (err, fields, files) {
        return files.file.name;
    });
};

exports.fileCreateValidator = function (request, response) {

    // let form = new formidable.IncomingForm();
    
    // let fileName, url;

    // form.parse(request, function (err, fields, files) {

    //     fileName = files.file.name;
    //     url = process.cwd()+'/uploads/' + files.file.name;

    //     console.log(fileName + "<-->" + url);

    // });

    // return Promise.all([Promise.resolve(), url]);

    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, '/home/floyed/FP/Projects/Cloud/Assignments/Assignment4/webapp/upload');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    upload = multer({
        storage: storage, fileFilter: function (req, file, cb) {
            if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
                return cb(null, true);
            else
                return cb(new Error('Unsupported File Format'), false);
        }
    });

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



exports.delete = function (request, response, requestedUser) {

    const promise = File.destroy({
        where: {
            owner_id: requestedUser.id,
            id: request.params.billId
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

exports.getOneBillsForUser = function (request, response, requestedUser) {

    return File.findAll({
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
    return File.findAll({
        where: {
            id: request.params.billId
        }
    });
}
