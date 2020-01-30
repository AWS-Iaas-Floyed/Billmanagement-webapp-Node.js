'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/user');
var emailValidator = require("email-validator");
var auth = require('basic-auth');

/**
 * Validating the credentials mentioned in the header
 */
exports.validateCredentials = function (request, response) {

    var credentials = auth(request); //getting the name and password from basic auth

    if(!credentials){
        return Promise.reject();
    }

    return this.findUser(request, response); //finding the user from the db
};

/**
 * Finding the user based on the name
 */
exports.findUser = (request, response) => {
   
    var credentials = auth(request);

    return User.findOne({
        where: {
            email_address: credentials.name,
        }
    }).then((user) =>{

        if(!user){
            console.log("User does not exist!");
            return Promise.reject();
        } 

        if (bcrypt.compareSync(credentials.pass, user.password)) {
            console.log("Correct credentials!");
            return user;
        }
        
        console.log("Incorrect passwords");
        return Promise.reject();
    });

}


/**
 * Saving the new User
 */
exports.save = function (request, response) {

    const promise = User.create({
        first_name: request.body.first_name,
        last_name: request.body.last_name,
        password: bcrypt.hashSync(request.body.password, 10),
        email_address: request.body.email_address,
        account_created: new Date().toString(),
        account_updated: new Date().toString()
    });

    return promise;
};

/**
 * Updating the User based on the id parameter passed
 */
exports.update = function (request, response) {

    const promise = User.update({
        first_name: (request.body.first_name !== undefined ? request.body.first_name : this.first_name),
        last_name: (request.body.last_name !== undefined ? request.body.last_name : this.last_name),
        password:(request.body.password !== undefined ? bcrypt.hashSync(request.body.password, 10) : this.password),
        account_updated: new Date().toString()
    }, {
        where: {
            email_address: auth(request).name
        }
    });

    return promise;
};


//Check if email exists
exports.emailDuplicateCheck = function(request, response){
    return User.count({ where: { email_address: request.body.email_address }})
        .then(count => {
            
            if (count > 0) 
                return Promise.reject();
            else 
                return Promise.resolve();
        })
}

//Create Validator
exports.userCreateValidator = function (request, response){
    
    if(request.body.first_name === undefined
        || request.body.last_name === undefined
        || request.body.email_address === undefined
        || request.body.password === undefined){
            console.log("Some field missing!");
            return Promise.reject();
    }

    
    if(!emailValidator.validate(request.body.email_address)){
        console.log("Incorrect email format!");
        return Promise.reject();
    }

    if(!this.passwordLengthCheck(request, response)){
        console.log("Password length less than= 10!");
        return Promise.reject();
    }


    return Promise.resolve();
}

exports.passwordLengthCheck = function (request, response){
    
    if(request.body.password.length <= 10){
        return false;
    }

    return true;
}


exports.userUpdateValidator = function (request, response){
    
    if(request.body.account_updated != undefined
        || request.body.account_created != undefined
        || request.body.email_address != undefined){
            //If any of these mentioned reject the request
            return Promise.reject();
    }

    if(request.body.password !== undefined && !this.passwordLengthCheck(request,response)){
        return Promise.reject();
    }

    return Promise.resolve();
}