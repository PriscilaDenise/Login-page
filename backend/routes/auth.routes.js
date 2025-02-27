import express from 'express';
import authController from '../controllers/auth.controllers.js';

const router = express.Router();


// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
