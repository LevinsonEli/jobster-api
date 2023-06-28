import { EventSubscriber, On } from "event-dispatch";
import events from "./events";
import Container from "typedi";
import MailerService from "../services/mailer";
import IUser from "@/interfaces/IUser";


@EventSubscriber()
export default class UserSubscriber {
  @On(events.user.register)
  public async onUserRegister(data: { user: IUser, mailerInstance: MailerService }) {
    console.log('user registered event');
    await data.mailerInstance.sendWelcomeEmail(data.user);
  }

  @On(events.user.login)
  public async onUserLogin(user: IUser, mailerInstance: MailerService) {
    console.log('user login event');
  }
}
