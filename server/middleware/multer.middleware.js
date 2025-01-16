import multer from 'multer';
import path from 'path';

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp'); // Save temporarily to 'temp' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
  },
});

// File size and type filters for Multer
export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});
