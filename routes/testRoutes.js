import express from 'express';
import { testPostController } from '../controller/testController.js';
import userAuth from '../middlewares/authMiddleware.js';

//ROUTER OBJECT
const router = express.Router();

router.post('/test-post', userAuth, testPostController);

export default router;
