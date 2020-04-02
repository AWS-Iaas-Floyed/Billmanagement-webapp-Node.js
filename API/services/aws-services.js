const aws = require('aws-sdk');

var sns = new aws.SNS({});

const logger = require('../config/winston-logger');


exports.snsSendBills = function(bills, emailAddress, days){
    
    logger.info("Sending the following bills :: "+bills 
    + " to email :: "+ emailAddress);

    let paramsTopic = {
        Name: 'BillDueEmailTopic'
    };

    sns.createTopic(paramsTopic, (err, data) => {
        if (err) logger.error("Email for ::" + emailAddress +" was not successfule error ::"+ err);
        else {
            let link = 'http://'+process.env.DOMAIN_NAME+'/v1/bills/due/'+days+'/'+days;
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
                if (err){
                    logger.error("Email for ::" + emailAddress +" was not successfule error ::"+ err);
                } else {
                    logger.info('Email for ::'+ emailAddress + " sent successfully!");
                }
            })
        }
    });
}