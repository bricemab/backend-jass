// @ts-ignore
import nodemailer from "nodemailer";
import Utils from "../../utils/Utils";

export interface MailQueue {
  to: string | string[];
  subject: string;
  html: string;
  displayName: string;
}

export default class Mailer {
  public mailsQueue: MailQueue[] = [];

  constructor() {
    this.mailsQueue = [];
  }

  addMailQueue(
    to: string | string[],
    subject: string,
    html: string,
    displayName: string
  ) {
    this.mailsQueue.push({
      to,
      subject,
      html,
      displayName
    });
  }

  public async sendMailFromQueue() {
    if (this.mailsQueue && this.mailsQueue.length === 0) {
      return false;
    }
    const params = this.mailsQueue[0];
    const response = await Mailer.sendMail(
      params.to,
      params.subject,
      params.html,
      params.displayName
    );

    console.log(response)
    if (response.success) {
      this.mailsQueue.shift();
    }
    return response;
  }

  static async sendMail(
    to: string | string[],
    subject: string,
    html: string,
    displayName: string
  ) {

    const transporter = nodemailer.createTransport({
      sendmail: true,
      newLine: "unix",
      path: "/usr/sbin/sendmail",
      secure: true,
      dkim: {
        domainName: Utils.getDbSetting('mailerHost'),
        keySelector: "dkim",
        privateKey:  Utils.getDbSetting('mailerCertif')
      }
    });

    console.log(Utils.getDbSetting('mailerHost'))
    console.log(Utils.getDbSetting('mailerCertif'))
    console.log(Utils.getDbSetting('mailerUser'))

    try {
      const info = await transporter.sendMail({
        from: `"${displayName}" <${Utils.getDbSetting('mailerUser')}>`,
        to,
        subject,
        html
      });
      return {
        success: true,
        data: {
          info
        }
      };
    } catch (e) {
      return {
        success: false,
        error: e
      };
    }
  }
}
