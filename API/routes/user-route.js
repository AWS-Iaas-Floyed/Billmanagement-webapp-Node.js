module.exports = function (app) {
    const userController = require('../controllers/user-controller');
    // User Routes for search and create.
    app.route('/v1/user/self') //all paths with /vi/user/self
        .get(userController.get) //listing the information
        .put(userController.put); //Modifying an existing User

    // based on id 
    app.route('/v1/user') //all paths for /vi/user/self along with id
        .post(userController.post); //creating a new user through post request
};