const fs = require('fs');

exports.deleteFile = (file_path) => {
    fs.unlink(file_path, (err)=>{
        if(err)
            throw err;
    })
}