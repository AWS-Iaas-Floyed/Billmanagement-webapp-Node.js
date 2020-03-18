const userService = require('../services/user-service');

const statsClient = require('statsd-client');

const stats = new statsClient({host: 'localhost', port: 8125});

const logger = require('../config/winston-logger');

/**
 * Listing the user information
 */
exports.get = function (request, response) {

    stats.increment('GET User');
    
    logger.info("GET request for user");

    const resolve = (user) => {
        response.status(200);
        delete user.dataValues.password;//deleting the password in the response
        response.json(user);
    };

    userService.validateCredentials(request, response)
        .then(resolve)
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));

};


/**
 * Creating a new User
 */
exports.post = function (request, response) {

    stats.increment('POST User');

    logger.info("POST request for user");

    const resolve = (user) => {
        response.status(201);       
        delete user.dataValues.password;//deleting the password in the response
        response.json(user);
    };

    const resolveSave = () => {
        userService.save(request, response)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    };

    const resolveDupCheck = () => {
        userService.emailDuplicateCheck(request, response)
            .then(resolveSave)
            .catch(renderErrorResponse(response, 400, "Duplicate Email"));
    };


    userService.userCreateValidator(request, response)
        .then(resolveDupCheck)
        .catch(renderErrorResponse(response, 400, "Incorrect paramters"));


};

/**
 * updating based on id
 */
exports.put = function (request, response) {

    stats.increment('PUT User');

    logger.info("PUT request for user");

    const resolve = () => {
        response.status(204);
        response.json({});
    };

    const resolveUpdateValidate = () => {
        userService.update(request, response)
            .then(resolve)
            .catch(renderErrorResponse(response, 500));
    }

    const credentialResolve = () => {
        userService.userUpdateValidator(request, response)
            .then(resolveUpdateValidate)
            .catch(renderErrorResponse(response, 400, "Incorrect Parameters"));
    }
    
    userService.validateCredentials(request, response)
        .then(credentialResolve)
        .catch(renderErrorResponse(response, 401, "Invalid user credentials"));
    
};



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