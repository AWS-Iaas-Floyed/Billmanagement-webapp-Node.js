
let multer = require('multer');
var path = require('path');
const multerS3 = require('multer-s3');

const bucket = process.env.S3_BUCKET_ADDRESS;

let upload;

if(process.env.NODE_ENV == 'prod'){

    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: bucket,
            acl: 'private',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        })
        // ,
        // fileFilter: function (req, file, cb) {
        //     if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
        //         return cb(null, true);
        //     else
        //         return cb(new Error('Unsupported File Format'), false);
        // }
    });

} else {

    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname))
        }
    });
    
    upload = multer({
        storage: storage, fileFilter: function (req, file, cb) {
            return cb(null, true);
        }
    });
}



module.exports = upload;
