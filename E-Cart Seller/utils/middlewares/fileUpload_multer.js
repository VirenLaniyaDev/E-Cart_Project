const multer = require('multer');   // For parsing files
const { v4: uuidv4 } = require('uuid'); // For generating unique identifier

exports.fileUpload = (fieldName, dirName) => {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, callback) {
            callback(null, './data/uploads/' + dirName + '/');
        },
        filename: (req, file, callback) => {
            callback(null, uuidv4() + '_-_' + file.originalname);
        }
    });

    const fileFilter = (req, file, callback) =>{
        if(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/webp' || file.mimetype == 'image/png'){
            callback(null, true);
        }
        callback(null, false);
    }

    return multer({
        storage: storage,
        fileFilter: fileFilter
    }).single(fieldName);

};
