module.exports = function (app) {
    const billController = require('../controllers/bill-controller');
    // User Routes for search and create.
    app.route('/v1/bill') //all paths with /vi/user/self
        .post(billController.post) //listing the information

    // getting all bills
    app.route('/v1/bills') 
        .get(billController.get); 

    // getting all bills
    app.route('/v1/bills/due/:days') 
        .get(billController.getAndEmail);

    // getting all bills
    app.route('/v1/bills/due/:days/:tokenId') 
        .get(billController.sendTestEmail);
    
    // based on id 
    app.route('/v1/test') //all paths for /vi/user/self along with id
        .post(billController.post); //creating a new user through post request

    app.route('/v1/bill/:billId')
        .get(billController.getOne)
        .put(billController.put)
        .delete(billController.deleteOne);


};