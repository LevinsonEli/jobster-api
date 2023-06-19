import { Request } from 'express';

export default interface IAuthRequest extends Request {
  user?: {
    id: string;
    name?: string | undefined;
    email?: string | undefined;
    testUser: boolean;
  };
}
