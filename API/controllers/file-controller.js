const fileService = require('../services/file-service');
const billService = require('../services/bill-service');

const userService = require('../services/user-service');

var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './serveruploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage })


/**
 * Creating a new FIle
 */
exports.post = function (request, response, next) {

    let requestedUser, url, fileName;

    const resolve = (bill) => {
        response.status(201);
        response.json(bill);
    };

    const resolveFileCreateValidator = () => {

        // fileName = fileService.getFileName();

        // let url = process.cwd()+'/uploads/' + fileName;

        fileService.save(request, response, url, url)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    };

    const credentialResolve = () => {

        fileService.fileCreateValidator(request, response)
            .then(resolveFileCreateValidator)
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
 * Listing the bill information
 */
exports.get = function (request, response) {

    let requestedUser;

    const getBillsForUserResolve = (bills) => {
        response.status(200);

        bills.forEach(function (part, index) {
            this[index].categories = this[index].categories.split(", ");
        }, bills);

        response.json(bills);
    };


    const credentialResolve = () => {
        fileService.getBillsForUser(request, response, requestedUser)
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

    let requestedUser, requestedBill, requestedFile;

    const billValidate = () => {
        
    }

    const getBillsForUserResolve = (bills) => {
        if (bills.length == 0) {
            response.status(404);
            response.json(bills);
        } else if (bills[0].owner_id != requestedUser.id) {
            response.status(401);
            response.json({ message: "UnAuthorized" });
        } else {
            requestedBill = bills[0];
            billValidate();
        }
    };

    const validateGetOneResolve = () => {
        fileService.getOneBillsForUser(request, response, requestedUser)
            .then(getBillsForUserResolve)
            .catch(renderErrorResponse(response, 500));
    }

    userService.validateCredentials(request, response)
        .then((user) => {
            requestedUser = user;
            validateGetOneResolve();
        })
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};


/**
 * updating based on id
 */
exports.put = function (request, response) {

    let requestedUser;

    const resolve = () => {
        response.status(200);
        response.json({});
    };

    const resolveBillUpdateValidator = () => {
        fileService.update(request, response, requestedUser)
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
        fileService.billUpdateValidator(request, response, requestedUser)
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

    let requestedUser;

    const resolve = () => {
        response.status(204);
        response.json({});
    };

    const resolveBillUpdateValidator = () => {
        fileService.delete(request, response, requestedUser)
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
        fileService.isMyBill(request, response, requestedUser)
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


