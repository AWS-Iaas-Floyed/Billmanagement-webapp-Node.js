const billService = require('../services/bill-service');
const userService = require('../services/user-service');
const fileService = require('../services/file-service');

const statsClient = require('statsd-client');

const stats = new statsClient({ host: 'localhost', port: 8125 });

const logger = require('../config/winston-logger');

const awsServices = require('../services/aws-service');
/**
 * Listing the bill information
 */
exports.get = function (request, response) {

    var timer = new Date();

    stats.increment('GET Bill');

    logger.info("GET request for bill");

    let requestedUser;

    const getBillsForUserResolve = (bills) => {
        response.status(200);

        billService.formatFileInfoInBill(bills);

        response.json(bills);

        stats.timing('GET Bill Time', timer);

    };


    const credentialResolve = () => {
        billService.getBillsWithFilesForUser(request, response, requestedUser)
            .then(getBillsForUserResolve)
            .catch(renderErrorResponse(response, 500));
    }

    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};



/**
 * Listing the bill information
 */
exports.getAndEmail = function (request, response) {

    var timer = new Date();

    stats.increment('GET and Email Due Bills');

    logger.info("GET and Email Due Bill Request");

    let requestedUser;

    const getBillsForUserResolve = (bills) => {

        billService.formatFileInfoInBill(bills);

        billService.filterDueBills(bills, request.params.days);

        awsServices.snsSendBills(bills,requestedUser.email_address, request.params.days);

        stats.timing('GET and Email Due Bills', timer);

    };

    const credentialResolve = () => {
        billService.getBillsWithFilesForUser(request, response, requestedUser)
            .then(getBillsForUserResolve)
            .catch(renderErrorResponse(response, 500));

        //sending response immediately
        response.status(201);
        response.json({ message: "Email sent successfully!" });
    }

    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};


/**
 * Listing the bill information
 */
exports.getDueBillsViaEmailLink = function (request, response) {

    var timer = new Date();

    stats.increment('GET Due Bills via Email Link');

    logger.info("GET Due Bills via Email Link");

    let requestedUser;

    const getBillsForUserResolve = (bills) => {

        billService.formatFileInfoInBill(bills);

        billService.filterDueBills(bills, request.params.days);

        response.status(200);
        response.json(bills);

        stats.timing('GET Due Bills via Email Link', timer);

    };

    const credentialResolve = () => {
        billService.getBillsWithFilesForUser(request, response, requestedUser)
            .then(getBillsForUserResolve)
            .catch(renderErrorResponse(response, 500));
    }

    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};


/**
 * Listing the bill information
 */
exports.getOne = function (request, response) {

    var timer = new Date();

    stats.increment('GET One Bill');

    logger.info("GET ONE request for bill");

    let requestedUser;

    const getBillsForUserResolve = (bills) => {
        if (bills.length == 0) {
            response.status(404);
            response.json({ message: "Bill not found" });
        } else if (bills[0].owner_id != requestedUser.id) {
            response.status(401);
            response.json({ message: "UnAuthorized" });
        } else {
            response.status(200);
            billService.formatFileInfoInBill(bills);
            response.json(bills);
        }

        stats.timing('GET One Bill Time', timer);

    };

    const validateGetOneResolve = () => {
        billService.getBillWithFile(request, response, requestedUser)
            .then(getBillsForUserResolve)
            .catch(renderErrorResponse(response, 500));
    }

    const credentialResolve = () => {
        billService.validateGetOne(request, response, requestedUser)
            .then(validateGetOneResolve)
            .catch(renderErrorResponse(response, 404));
    }

    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};



/**
 * Creating a new Bill
 */
exports.post = function (request, response) {

    var timer = new Date();
    var createQueryTime;

    stats.increment('POST Bill');

    logger.info("POST request for bill");

    let requestedUser;

    const resolve = (bill) => {
        stats.timing('Create Bill Query Time', createQueryTime);

        response.status(201);
        billService.formatSingleBill(bill.dataValues);
        response.json(bill);

        stats.timing('POST Bill Time', timer);

    };

    const resolveBillCreateValidator = () => {
        createQueryTime = new Date();
        billService.save(request, response, requestedUser)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    };

    const credentialResolve = () => {
        billService.billCreateValidator(request, response)
            .then(resolveBillCreateValidator)
            .catch(renderErrorResponse(response, 400, "Incorrect paramters"));
    };

    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};

/**
 * updating based on id
 */
exports.put = function (request, response) {

    var timer = new Date();

    stats.increment('PUT Bill');

    logger.info("PUT request for bill");

    let requestedUser;

    const resolve = () => {
        response.status(200);
        response.json({});

        stats.timing('PUT Bill Time', timer);
    };

    const resolveBillUpdateValidator = () => {
        billService.update(request, response, requestedUser)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    }

    const isMyBill = (bills) => {

        if (bills.length == 0) {
            response.status(404);
            response.json({
                message: "Bill not found"
            });
        } else if (bills[0].owner_id != requestedUser.id) {
            response.status(401);
            response.json({ message: "UnAuthorized" });
        } else {
            resolveBillUpdateValidator();
        }
    };


    const credentialResolve = () => {
        billService.billUpdateValidator(request, response, requestedUser)
            .then(isMyBill)
            .catch(renderErrorResponse(response, 400, "Bad request"));
    }


    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};


exports.deleteOne = function (request, response) {

    var timer = new Date();

    stats.increment('DELETE Bill');

    logger.info("DELETE request for bill");

    let requestedUser, requestedFile;

    const resolve = () => {
        response.status(204);
        response.json({});

        stats.timing('DELETE Bill Time', timer);
    };

    const resolveBillUpdateValidator = (file) => {

        if (file.length > 0)
            fileService.deleteAttachment(file[0]);

        billService.delete(request, response, requestedUser)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    }

    const getFile = (bill) => {
        fileService.getFileForBillId(bill.id)
            .then(resolveBillUpdateValidator)
            .catch(renderErrorResponse(response, 500));
    }

    const isMyBill = (bills) => {
        if (bills.length == 0) {
            response.status(404);
            response.json({
                message: "Bill not found"
            });
        } else if (bills[0].owner_id != requestedUser.id) {
            response.status(401);
            response.json({ message: "UnAuthorized" });
        } else {
            getFile(bills[0]);
        }
    };


    const credentialResolve = () => {
        billService.isMyBill(request, response, requestedUser)
            .then(isMyBill)
            .catch(renderErrorResponse(response, 400, "Bad request"));
    }


    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            credentialResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};


//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
/**
 * Function for rendering the error on the screen
 */
let renderErrorResponse = (response, code, message) => {

    const errorCallback = (error) => {
        console.log(error);
        if (error) {
            response.status(code);
            response.json({
                message: error.message
            });
        } else {
            response.status(code);
            response.json({
                message: message ? message : ""
            });
        }
    }
    return errorCallback;
};


