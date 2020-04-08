const aws = require('aws-sdk');
const uuidv4 = require('uuid/v4');

var sns = new aws.SNS({});
var sqs = new aws.SQS({apiVersion: '2012-11-05'});

const logger = require('../config/winston-logger');


function snsSendBills(emailAddress, link) {

    let paramsTopic = {
        Name: 'BillDueEmailTopic'
    };

    sns.createTopic(paramsTopic, (err, data) => {
        if (err) logger.error("Email for ::" + emailAddress + " was not successfule error ::" + err);
        else {            

            logger.info("Sending the following link :: " + link
            + " to email :: " + emailAddress);
            
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

function receiveFromSQS() {

    var params = {
        QueueName: 'EmailQueue'
    };

    sqs.getQueueUrl(params, function (err, data) {
        if (err) {
            logger.error("Error", err);
        } else {

            let queueURL = data.QueueUrl;

            logger.info("Success", data.QueueUrl);

            var params = {
                QueueUrl: queueURL,
                MessageAttributeNames: ["All"]
            };
        
            sqs.receiveMessage(params, function (err, data) {
                if (err) {
                    logger.error("Receive Error", err);
                } else {
        
                    logger.info("Received this message :: " + JSON.stringify(data))
        
                    let email = data.Messages[0].MessageAttributes.Email.StringValue;
                    let link = data.Messages[0].MessageAttributes.link.StringValue;
                    
                    snsSendBills(email, link);

                    var deleteParams = {
                        QueueUrl: queueURL,
                        ReceiptHandle: data.Messages[0].ReceiptHandle
                    };
                    sqs.deleteMessage(deleteParams, function (err, data) {
                        if (err) {
                            logger.error("Delete Error", err);
                        } else {
                            logger.info("Message Deleted", data);
                        }
                    });
                }
            });

        }
    });
}

exports.sendToSQS = function (emailAddress, days) {

    var params = {
        QueueName: 'EmailQueue'
    };

    sqs.getQueueUrl(params, function (err, data) {
        if (err) {
            logger.error("Error", err);
        } else {

            let queueURL = data.QueueUrl;

            logger.info("Success", data.QueueUrl);

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
                    logger.error("Error while sending message to Email Queue", err);
                } else {
                    logger.info("Success while sending message id to Email Queue :: ", data);

                    receiveFromSQS();
                }
            });

        }
    });



}