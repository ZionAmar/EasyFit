const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/avatars/',
    filename: function(req, file, cb){
        console.log('--- DEBUG: Multer is trying to generate a filename.');
        if (!req.user || !req.user.id) {
            console.error('--- DEBUG: CRITICAL ERROR! req.user is not available in multer!');
            return cb(new Error('Authentication error: User not found for file upload.'), null);
        }
        const uniqueName = `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        console.log(`--- DEBUG: Generated filename: ${uniqueName}`);
        cb(null, uniqueName);
    }
});

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        console.error(`--- DEBUG: File type check failed! Mimetype: ${file.mimetype}, Ext: ${path.extname(file.originalname)}`);
        cb('Error: Images Only!');
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
});

module.exports = upload;