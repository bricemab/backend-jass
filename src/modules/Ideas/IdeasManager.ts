import {ApplicationResponsePromise, UserSession} from "../../utils/Types";
import GlobalStore from "../../utils/GlobalStore";
import Mailer from "../../services/Mailer/Mailer";
import Translator from "../../utils/Transalator";
import path from "path";
import * as fs from "fs";
import {IdeaErrors} from "../../Global/BackendErrors";
import IdeaEntity from "./IdeaEntity";
import {UploadedFile} from "express-fileupload";
import Utils from "../../utils/Utils";

export default class IdeasManager {
  public static async newIdeaSendMail(user: UserSession, idea: IdeaEntity) {
    const mailContent = await IdeasManager.prepareNewIdeaFile(user, idea);
    if (!mailContent.success) {
      console.log("no mail content");
      console.log(mailContent);
      return;
    }
    const mailer = GlobalStore.getItem('mailer') as Mailer;
    mailer.addMailQueue(user.email, Translator.t("idea.newIdeaSubject", user.language), mailContent.data.content, "E-Jass", true)
  }

  public static async prepareNewIdeaFile (
    user: UserSession,
    idea: IdeaEntity
  ): ApplicationResponsePromise<{content: string}> {
    const location = path.join(
      __dirname,
      `../../../data/mails/${user.language}/ideas/new-idea`
    );

    return new Promise(resolve => {
      fs.readFile(location, "utf8", (err, data) => {
        if (err) {
          console.log("Fichier peut-être pas créer dans la langue")
          resolve({
            success: false,
            error: {
              code: IdeaErrors.IDEA_PREPARE_NEW_IDEA,
              details: err,
              message: location
            }
          })
        } else {
          data = data.replace("#username#", user.pseudo);
          data = data.replace("#object#", idea.object);
          data = data.replace("#content#", idea.content);
          data = Utils.replaceAllString(data, "#display#", idea.mailFeedback ? 'block' : 'none');
          resolve({
            success: true,
            data: {
              content: data
            }
          })
        }
      })
    })
  }
}
