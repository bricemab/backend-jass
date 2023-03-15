// @ts-ignore
import nodemailer from "nodemailer";
import Utils from "../../utils/Utils";
import config from "../../config/config";
import path from "path";
import moment from "moment";
import fs from "fs";

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
    displayName: string,
    sendToJassAdmin = false
  ) {
    this.mailsQueue.push({
      to,
      subject,
      html,
      displayName
    });
    if (sendToJassAdmin) {
      this.mailsQueue.push({
        to: "ejass.adm@gmail.com",
        subject,
        html,
        displayName
      });
    }
  }

  public async sendMailFromQueue() {
    if (this.mailsQueue && this.mailsQueue.length === 0) {
      return false;
    }
    if (config.isDevModeEnabled) {
      const location = path.join(
        __dirname,
        `../../../logs/mails/${moment().unix()}`
      );
      let content = "to: " + this.mailsQueue[0].to + "\r\n";
      content += "subject: " + this.mailsQueue[0].subject + "\r\n"
      content += "content: " + this.mailsQueue[0].html + "\r\n"
      const self = this;
      fs.appendFile(location, content, function (err) {
        if (err) throw err;
        console.log('Saved!');
        self.mailsQueue.shift();
        return {
          success: true
        }
      });
    } else {
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
