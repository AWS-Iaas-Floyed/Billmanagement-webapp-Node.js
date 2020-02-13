'use strict';

const bcrypt = require('bcrypt');
const File = require('../models/file');
var emailValidator = require("email-validator");
var auth = require('basic-auth');

var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '~/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname
            //  + '-' + Date.now()
             )
    }
});

var upload = multer({
    storage: storage, fileFilter: function (req, file, cb) {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
            return cb(null, true);
        else
            return cb(new Error('Unsupported File Format'), false);
    }
});

let allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

exports.fileCreateValidator = function (request, response, file) {

    if (file.length != 0) {
        response.status(400);
        response.json({ message: "File already exists for bill" });

        return Promise.reject();
    }

    if(!request.file) {
        response.status(400);
        response.json({ message: "File does not exist in request" });
        
        return Promise.reject();
    }


    if (!allowedFileTypes.includes(request.file.contentType) 
        && !allowedFileTypes.includes(request.file.mimetype)) {

        response.status(400);
        response.json({ message: "Invalid File type" });

        return Promise.reject();
    }

    return Promise.resolve();    
}

/**
 * Saving the new File
 */
exports.save = function (request, response, requestedBill, requestedUser) {

    console.log("File name :" + request.file.destination);

    let fileName = request.file.filename;
    let url = request.file.destination + fileName;

    const promise = File.create({
        file_name: fileName,
        url: url,
        bill_id: requestedBill.id,
        owner_id: requestedUser.id,
        upload_date: new Date().toISOString().split('T')[0]
    });

    return promise;
};



exports.deleteOne = function (request, response, requestedUser) {
    return File.destroy({
        where: {
            id: request.params.fileId
        }
    });
};


exports.billGetValidator = function (request, response) {
    return Promise.resolve();
}

exports.getAllFilesofUser = function (request, response, requestedUser) {
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


