import express from 'express';
import { createListing, imageUpload, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js'; // User verification middleware
import { upload } from '../middleware/multer.middleware.js'; // Multer upload handling

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.post('/upload', verifyToken, upload.array('images', 6), imageUpload); 
router.delete('/delete/:id', verifyToken, deleteListing)
router.post('/update/:id', verifyToken, updateListing)
router.get('/get/:id', getListing)
router.get('/get',getListings);

export default router;
