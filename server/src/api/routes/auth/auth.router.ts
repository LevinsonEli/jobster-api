import express from 'express';
const router = express.Router();
import authenticateUser from '../../middlewares/authentication';
import testUser from '../../middlewares/testUser';
import AuthController from './auth.controller';

router.post('/register', AuthController.getInstance().register);
router.post('/login', AuthController.getInstance().login);
router.patch(
  '/updateUser',
  authenticateUser,
  testUser,
  AuthController.getInstance().updateUser
);

export default router;