module.exports = function (app) {
    const billController = require('../controllers/bill-controller');
    // User Routes for search and create.
    app.route('/v1/bill') //all paths with /vi/user/self
        .post(billController.post) //listing the information

    // getting all bills
    app.route('/v1/bills') 
        .get(billController.get); 

    app.route('/v1/bill/:billId')
        .get(billController.getOne)
        .put(billController.put)
        .delete(billController.deleteOne);


};