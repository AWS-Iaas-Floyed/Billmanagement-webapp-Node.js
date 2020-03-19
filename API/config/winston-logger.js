var appRoot = require('app-root-path');
var winston = require('winston');

let logLevel = 'debug';

if(process.env.APPLICATION_ENV != undefined && process.env.APPLICATION_ENV == 'prod'){
    logLevel = 'info';
}

var options = {
    file: {
        level: logLevel,
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 2,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(
        info => `TIMESTAMP: ${info.timestamp}, LEVEL: ${info.level}, MESSAGE: ${info.message}`
    ),
);

var logger = new winston.createLogger({
    format : logFormat,
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

logger.info("Log level selected :: " + logLevel);

module.exports = logger;