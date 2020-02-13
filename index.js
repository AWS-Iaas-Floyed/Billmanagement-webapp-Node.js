//Entry class for the server
const express = require('express');
//Parser class used to parse and display information on the screen
let bodyParser = require('body-parser');
//mysql to connect to the database

const db = require('./API/config/database');

db.authenticate()
    .then(() => console.log('Connected to the MySQl database!'))
    .catch(err =>  console.log('error: '+err))


//startign express
const app = express();

const port = process.env.EXPRESS_PORT || 3000;

//Adding body parser for handling request and response objects.
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Enabling cross reference
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,DELETE,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Access-Control-Allow-Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

//Initialize app
let initApp = require('./API/app');
initApp(app);

//Start the server on the port variable
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = server;

console.log('User login app started Successfully');
console.log('User login app for RESTful API server started on: ' + port);
console.log(process.cwd());
console.log(new Date().toISOString().split('T')[0]);