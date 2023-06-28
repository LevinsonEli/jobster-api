import { Inject, Service } from 'typedi';
import nodemailer from 'nodemailer';
import config from '@/config';
import IUser from '@/interfaces/IUser';

@Service()
export default class MailerService {
  @Inject('mailTransporter') transporter: nodemailer.Transporter;

  constructor(@Inject('mailTransporter') transporter: nodemailer.Transporter) {
    this.transporter = transporter;
  }

  public sendEmail = async (to: string, subject: string, html: string) => {
    let info = await this.transporter.sendMail({
      from: 'Demo Mailer <donotreply@demo.com>',
      to: to,
      subject: subject,
      html: html,
    });
    return info;
  };
  
  public sendWelcomeEmail = async (user: IUser) => {
    const welcomeHtml = '<h1>Welcome</h1>';
    return await this.sendEmail(user.email, 'Welcome', welcomeHtml);
  }
}
