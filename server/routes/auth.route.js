import express from 'express';
import { signin, signout, signup, google , forgotPassword, resetPassword} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgot-password',forgotPassword)
router.post('/reset-password/:token',resetPassword)
router.post('/google',google);
router.get('/signout', signout);

export default router;