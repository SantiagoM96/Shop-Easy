const multer = require('multer');

const folderMappings = {
  profiles: './src/public/img/profiles',
  products: './src/public/img/products',
  documents: './src/public/img/documents'
};

const storage = (type) => multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationFolder = folderMappings[type] || folderMappings.documents;
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const { uid } = req.params || req.body;
    const uniqueFileName = `${uid}_${file.originalname}`;
    cb(null, uniqueFileName);
  },
});

const uploader = (type) => multer({ storage: storage(type) });

module.exports = uploader;