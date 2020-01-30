const billService = require('../services/bill-service');
const userService = require('../services/user-service');


/**
 * Listing the bill information
 */
exports.get = function (request, response) {

    let requestedUser;

    const getBillsForUserResolve = (bills) => {
        response.status(200);
        response.json(bills);
    };


    const credentialResolve = () => {
        billService.getBillsForUser(request, response, requestedUser)
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

    let requestedUser;

    const getBillsForUserResolve = (bills) => {
        if (bills.length == 0)
            response.status(404);
        else
            response.status(200);

        response.json(bills);
    };

    const validateGetOneResolve = () => {
        billService.getOneBillsForUser(request, response, requestedUser)
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
 * Creating a new User
 */
exports.post = function (request, response) {

    let requestedUser;

    const resolve = (bill) => {
        response.status(201);
        response.json(bill);
    };

    const resolveBillCreateValidator = () => {
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

    let requestedUser;

    const resolve = () => {
        response.status(200);
        response.json({});
    };

    const resolveBillUpdateValidator = () => {
        billService.update(request, response,requestedUser)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    }

    const isMyBill = (bills) => {
        if (bills.length == 0){
            response.status(404);
            response.json({
                message: "Bill not found"
            });
        } else
            resolveBillUpdateValidator();
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

    let requestedUser;

    const resolve = () => {
        response.status(204);
        response.json({});
    };

    const resolveBillUpdateValidator = () => {
        billService.delete(request, response,requestedUser)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    }

    const isMyBill = (bills) => {
        if (bills.length == 0){
            response.status(404);
            response.json({
                message: "Bill not found"
            });
        } else
            resolveBillUpdateValidator();
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


