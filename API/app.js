module.exports = function (app) {
    require('./models/user');

    // initializing the routes
    let userRoutes = require('./routes/user-route');
    userRoutes(app);

    let billRoutes = require('./routes/bill-route');
    billRoutes(app);

    let fileRoutes = require('./routes/file-route');
    fileRoutes(app);
};