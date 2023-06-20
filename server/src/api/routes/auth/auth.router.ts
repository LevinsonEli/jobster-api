import express, { Application } from 'express';
const router = express.Router();
import authenticateUser from '../../middlewares/authentication';
import testUser from '../../middlewares/testUser';
import AuthController from './auth.controller';
import config from '../../../config';
import { Service, Inject } from 'typedi';

@Service()
export default class AuthRouter {
  @Inject() authController: AuthController;

  constructor(@Inject() authController: AuthController) {
    this.authController = authController;
  }
  public addAuthRoutes = (app: Application): void => {
    app.use(config.api.prefix + "/auth", router);

    router.post('/register', this.authController.register);
    router.post('/login', this.authController.login);
    router.patch(
      '/updateUser',
      authenticateUser,
      testUser,
      this.authController.updateUser
    );
  }
};