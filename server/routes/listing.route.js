import express from 'express';
import { createListing, imageUpload } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js'; // User verification middleware
import { upload } from '../middleware/multer.middleware.js'; // Multer upload handling

const router = express.Router();

// Route for creating a listing (requires authentication)
router.post('/create', verifyToken, createListing);

// Route for uploading images (requires authentication)
router.post('/upload', verifyToken, upload.array('images', 6), imageUpload); // Upload up to 6 images

export default router;
