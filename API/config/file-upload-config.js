
let multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
    }
});

exports.upload = multer({
    storage: storage, fileFilter: function (req, file, cb) {
        // if (file.mimetype == 'image/png' 
        // || file.mimetype == 'image/jpg' 
        // || file.mimetype == 'image/jpeg'
        // || file.mimetype == 'application/pdf')
            return cb(null, true);
        // else
        //     return cb(new Error('Unsupported File Format'), false);
    }
});
