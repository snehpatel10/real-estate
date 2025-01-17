import express from 'express';
import { updateUser, deleteUser, getUserListing, getUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../middleware/multer.middleware.js';

const router = express.Router();

router.post('/update/:id', verifyToken, upload.single('avatar'), updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id',verifyToken, getUserListing)
router.get('/:userRef',verifyToken, getUser)

export default router;
