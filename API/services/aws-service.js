const aws = require('aws-sdk');
const uuidv4 = require('uuid/v4');


var sns = new aws.SNS({});
var sqs = new aws.SQS();

const logger = require('../config/winston-logger');


exports.snsSendBills = function (bills, emailAddress, days) {

    logger.info("Sending the following bills :: " + bills
        + " to email :: " + emailAddress);

    let paramsTopic = {
        Name: 'BillDueEmailTopic'
    };

    sns.createTopic(paramsTopic, (err, data) => {
        if (err) logger.error("Email for ::" + emailAddress + " was not successfule error ::" + err);
        else {
            let link = 'http://' + process.env.DOMAIN_NAME + '/v1/bills/due/' + days + '/' + uuidv4();
            let payload = {
                data: {
                    Email: emailAddress,
                    link: link
                }
            };

            payload.data = JSON.stringify(payload.data);
            payload = JSON.stringify(payload);

            let params = {
                Message: payload,
                TopicArn: data.TopicArn
            }

            sns.publish(params, (err, data) => {
                if (err) {
                    logger.error("Email for ::" + emailAddress + " was not successfule error ::" + err);
                } else {
                    logger.info('Email for ::' + emailAddress + " sent successfully!");
                }
            })
        }
    });
}

exports.receiveFromSQS = function () {

    var params = {
        QueueName: 'EmailQueue'
    };

    sqs.getQueueUrl(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {

            let queueURL = data.QueueUrl;

            console.log("Success", data.QueueUrl);

            var params = {
                QueueUrl: queueURL
            };
        
            sqs.receiveMessage(params, function (err, data) {
                if (err) {
                    console.log("Receive Error", err);
                } else {
        
                    console.log("Received this message :: " + data)
        
                    var deleteParams = {
                        QueueUrl: queueURL,
                        ReceiptHandle: data.Messages[0].ReceiptHandle
                    };
                    sqs.deleteMessage(deleteParams, function (err, data) {
                        if (err) {
                            console.log("Delete Error", err);
                        } else {
                            console.log("Message Deleted", data);
                        }
                    });
                }
            });

        }
    });
}

receiveFromSQS();

exports.sendToSQS = function (emailAddress, days) {

    var params = {
        QueueName: 'EmailQueue'
    };

    sqs.getQueueUrl(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {

            let queueURL = data.QueueUrl;

            console.log("Success", data.QueueUrl);

            let link = 'http://' + process.env.DOMAIN_NAME + '/v1/bills/due/' + days + '/' + uuidv4();

            logger.info("Sending email to Queue :: " + queueURL + ", email :: " + emailAddress + ", link :: " + link);

            var params = {
                QueueUrl: queueURL,
                MessageAttributes: {
                    "link": {
                        DataType: "String",
                        StringValue: link
                    },
                    "Email": {
                        DataType: "String",
                        StringValue: emailAddress
                    }
                },
                MessageBody: 'Message to Email Queue'
            };

            sqs.sendMessage(params, function (err, data) {
                if (err) {
                    console.log("Error while sending message to Email Queue", err);
                } else {
                    console.log("Success while sending message id to Email Queue :: ", data.MessageId);
                }
            });

        }
    });



}